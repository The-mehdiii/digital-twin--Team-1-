/**
 * Chat API Route (Stub for Week 2)
 * Full implementation in Week 3-4 with MCP tools and persistence
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Placeholder response for Week 2
    // Real MCP integration happens in Week 3
    return NextResponse.json({
      reply: "Chat API is ready. Week 3 implementation coming soon.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
