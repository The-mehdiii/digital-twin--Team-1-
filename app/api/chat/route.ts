/**
 * Chat API Route - Streaming Edition
 * Uses AI SDK streamText with Groq provider for real-time token streaming.
 * Also handles RAG context, user preferences, rate limiting, and DB persistence.
 */

import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { addMessage, getRecentMessages, getConversation } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limiter";
import { auth } from "@/lib/auth";
import { searchDocuments, formatContextForAI } from "@/lib/vector/search";

export const runtime = "nodejs";

const ERROR_MESSAGES = {
  RATE_LIMITED: "You're sending messages too quickly. Please wait a moment and try again.",
  API_ERROR: "Our AI service is temporarily unavailable. Please try again in a few seconds.",
  INVALID_REQUEST: "Invalid request. Please refresh the page and try again.",
  SERVER_ERROR: "Something went wrong on our end. We're working on it!",
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0].trim() || "unknown";
    const rateLimitResult = checkRateLimit(`chat:${clientIp}`, RATE_LIMITS.chat);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMITED, retryAfter: rateLimitResult.resetIn },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const { messages, conversationId, system } = await request.json();

    if (!conversationId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: ERROR_MESSAGES.INVALID_REQUEST }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== "user") {
      return NextResponse.json({ error: ERROR_MESSAGES.INVALID_REQUEST }, { status: 400 });
    }

    // Ensure conversation exists in DB
    const existingConversation = await getConversation(conversationId);
    if (!existingConversation) {
      await prisma.conversation.create({
        data: { id: conversationId, title: lastUserMessage.content.substring(0, 50) },
      });
    }

    // Save user message
    await addMessage(conversationId, "user", lastUserMessage.content);

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: ERROR_MESSAGES.SERVER_ERROR }, { status: 500 });
    }

    // Auth + RAG + Prefs
    const session = await auth();
    const userId = session?.user?.id;

    let userPrefs: any = null;
    if (userId) {
      try {
        userPrefs = await prisma.userPreferences.findUnique({ where: { userId } });
      } catch {}
    }

    // RAG: search documents and build sources list
    let ragContext = "";
    let ragSources: { filename: string; score: number }[] = [];
    if (userId) {
      try {
        const searchResults = await searchDocuments(lastUserMessage.content, userId, {
          topK: 3,
          minScore: 0.6,
        });
        ragContext = formatContextForAI(searchResults);
        ragSources = searchResults.map((r) => ({
          filename: r.metadata.filename,
          score: Math.round(r.score * 100),
        }));
      } catch {
        // Continue without RAG if unavailable
      }
    }

    // Build enhanced system prompt
    const userCustom = userPrefs?.customPrompt ? `${userPrefs.customPrompt}\n\n` : "";
    const styleInstr = userPrefs
      ? `Please respond in a ${String(userPrefs.responseStyle || "BALANCED").toLowerCase()} style and adopt a ${String(userPrefs.personality || "NEUTRAL").toLowerCase()} tone.`
      : "";
    const baseSystem = system || SYSTEM_PROMPT;
    const enhancedSystemPrompt = ragContext
      ? `${userCustom}${baseSystem}\n\n${styleInstr}\n\n${ragContext}`
      : `${userCustom}${baseSystem}\n\n${styleInstr}`;

    // Load recent chat history from DB
    const recentMessages = await getRecentMessages(conversationId, 5);
    const chatHistory = recentMessages
      .reverse()
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    // Initialize Groq provider via AI SDK
    const groq = createGroq({ apiKey: groqApiKey });

    // Stream response
    const result = streamText({
      model: groq("llama-3.3-70b-versatile") as any,
      system: enhancedSystemPrompt,
      messages: [
        ...chatHistory,
        { role: "user", content: lastUserMessage.content },
      ],
      temperature: 0.7,
      maxTokens: 1024,
      onFinish: async ({ text }) => {
        // Persist the full assistant reply once streaming is complete
        try {
          await addMessage(conversationId, "assistant", text);
        } catch (err) {
          console.error("Failed to save assistant message:", err);
        }
      },
    });

    // Return streaming response; attach sources as a custom header so the UI can display them
    const response = result.toDataStreamResponse();
    const headers = new Headers(response.headers);
    getRateLimitHeaders(rateLimitResult);
    if (ragSources.length > 0) {
      headers.set("X-RAG-Sources", JSON.stringify(ragSources));
    }
    headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    headers.set("X-RateLimit-Reset", rateLimitResult.resetIn.toString());

    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.SERVER_ERROR }, { status: 500 });
  }
}
