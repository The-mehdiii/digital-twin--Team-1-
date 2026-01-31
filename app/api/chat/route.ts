/**
 * Chat API Route - Week 4 Implementation
 * Now integrated with Prisma database + Groq API
 */

import { NextRequest, NextResponse } from "next/server";
import { addMessage, getRecentMessages } from "@/lib/db";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationId, system } = await request.json();

    if (!conversationId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing conversationId or messages" },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // Save user message to database
    await addMessage(conversationId, "user", lastUserMessage.content);

    // Get Groq API key
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured");
    }

    // Get recent conversation context (last 5 messages for context)
    const recentMessages = await getRecentMessages(conversationId, 5);
    const chatHistory = recentMessages
      .reverse()
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    // Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            { role: "system", content: system || SYSTEM_PROMPT },
            ...chatHistory,
            { role: "user", content: lastUserMessage.content },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq API error:", error);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent =
      data.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    // Save AI response to database
    const aiMessage = await addMessage(conversationId, "assistant", aiContent);

    return NextResponse.json({
      id: aiMessage.id,
      role: aiMessage.role,
      content: aiMessage.content,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process chat",
      },
      { status: 500 }
    );
  }
}
