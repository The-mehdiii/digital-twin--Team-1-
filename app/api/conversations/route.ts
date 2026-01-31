import { NextRequest, NextResponse } from "next/server";
import { createConversation, getConversations } from "@/lib/db";

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    const conversation = await createConversation(title || "New Chat");

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations
 * Get all conversations
 */
export async function GET() {
  try {
    const conversations = await getConversations();

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
