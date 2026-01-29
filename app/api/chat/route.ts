/**
 * Chat API Route - Week 3 Implementation
 * Streams AI responses using Vercel AI SDK + Groq LLM
 * System prompt from lib/system-prompt.ts
 */

import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { messages, system } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY not set");
      return new Response("LLM API key not configured", { status: 500 });
    }

    const result = streamText({
      model: groq("llama-3.1-70b-versatile"), // Using Groq's free model
      system: system || "You are a helpful assistant.",
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 1024,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
