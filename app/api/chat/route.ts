/**
 * Chat API Route - Week 4 Implementation
 * Now integrated with Prisma database + Groq API
 * With error handling, retry logic, rate limiting, and RAG
 */

import { NextRequest, NextResponse } from "next/server";
import { addMessage, getRecentMessages, getConversation } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limiter";
import { auth } from "@/lib/auth";
import { searchDocuments, formatContextForAI } from "@/lib/vector/search";

export const runtime = "nodejs";

// Error messages for users
const ERROR_MESSAGES = {
  RATE_LIMITED: "You're sending messages too quickly. Please wait a moment and try again.",
  API_ERROR: "Our AI service is temporarily unavailable. Please try again in a few seconds.",
  TIMEOUT: "The request took too long. Please try again with a shorter message.",
  INVALID_REQUEST: "Invalid request. Please refresh the page and try again.",
  SERVER_ERROR: "Something went wrong on our end. We're working on it!",
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 5000,
};

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Call Groq API with retry logic
 */
async function callGroqWithRetry(
  groqApiKey: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      }

      // Handle specific error codes
      if (response.status === 429) {
        // Rate limited by Groq - wait and retry
        console.warn(`Groq rate limited, attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries}`);
        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          await sleep(getRetryDelay(attempt));
          continue;
        }
      }

      if (response.status >= 500) {
        // Server error - retry
        console.warn(`Groq server error ${response.status}, attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries}`);
        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          await sleep(getRetryDelay(attempt));
          continue;
        }
      }

      // Client error (4xx except 429) - don't retry
      const errorText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errorText}`);

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Handle timeout/abort
      if (lastError.name === "AbortError") {
        throw new Error("TIMEOUT");
      }

      // Network error - retry
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`Network error, attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries}:`, lastError.message);
        await sleep(getRetryDelay(attempt));
        continue;
      }
    }
  }

  throw lastError || new Error("Failed after all retries");
}

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting (IP address or forwarded header)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0].trim() || "unknown";
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(`chat:${clientIp}`, RATE_LIMITS.chat);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: ERROR_MESSAGES.RATE_LIMITED,
          retryAfter: rateLimitResult.resetIn,
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { messages, conversationId, system } = await request.json();

    if (!conversationId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== "user") {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST },
        { status: 400 }
      );
    }

    // Create conversation if it doesn't exist
    const existingConversation = await getConversation(conversationId);
    if (!existingConversation) {
      await prisma.conversation.create({
        data: {
          id: conversationId,
          title: lastUserMessage.content.substring(0, 50),
        },
      });
    }

    // Save user message to database
    await addMessage(conversationId, "user", lastUserMessage.content);

    // Get Groq API key
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error("GROQ_API_KEY not configured");
      return NextResponse.json(
        { error: ERROR_MESSAGES.SERVER_ERROR },
        { status: 500 }
      );
    }

    // Get authenticated user for RAG search
    const session = await auth();
    const userId = session?.user?.id;

    // Load user preferences (custom prompt / style)
    let userPrefs: any = null;
    if (userId) {
      try {
        userPrefs = await prisma.userPreferences.findUnique({ where: { userId } });
      } catch (err) {
        console.warn("Failed to load user preferences:", err);
      }
    }

    // Search for relevant documents (RAG)
    let ragContext = "";
    if (userId) {
      try {
        const searchResults = await searchDocuments(
          lastUserMessage.content,
          userId,
          { topK: 3, minScore: 0.6 }
        );
        ragContext = formatContextForAI(searchResults);
      } catch (error) {
        console.warn("RAG search failed, continuing without context:", error);
        // Continue without RAG context if search fails
      }
    }

    // Build enhanced system prompt with user custom prompt, style, and RAG context
    const userCustom = userPrefs?.customPrompt ? `${userPrefs.customPrompt}\n\n` : "";
    const styleInstr = userPrefs
      ? `Please respond in a ${String(userPrefs.responseStyle || "BALANCED").toLowerCase()} style and adopt a ${String(userPrefs.personality || "NEUTRAL").toLowerCase()} tone.`
      : "";

    const baseSystem = system || SYSTEM_PROMPT;

    const enhancedSystemPrompt = ragContext
      ? `${userCustom}${baseSystem}\n\n${styleInstr}\n\n${ragContext}`
      : `${userCustom}${baseSystem}\n\n${styleInstr}`;

    // Get recent conversation context (last 5 messages for context)
    const recentMessages = await getRecentMessages(conversationId, 5);
    const chatHistory = recentMessages
      .reverse()
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    // Call Groq API with retry logic
    let aiContent: string;
    try {
      aiContent = await callGroqWithRetry(
        groqApiKey,
        [...chatHistory, { role: "user", content: lastUserMessage.content }],
        enhancedSystemPrompt
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Groq API failed after retries:", errorMessage);

      if (errorMessage === "TIMEOUT") {
        return NextResponse.json(
          { error: ERROR_MESSAGES.TIMEOUT },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: ERROR_MESSAGES.API_ERROR },
        { status: 503 }
      );
    }

    // Save AI response to database
    const aiMessage = await addMessage(conversationId, "assistant", aiContent);

    return NextResponse.json(
      {
        id: aiMessage.id,
        role: aiMessage.role,
        content: aiMessage.content,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
