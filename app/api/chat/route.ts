/**
 * Chat API Route - Week 3 Implementation  
 * Placeholder AI responses - Groq integration in Week 4
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Week 3: Placeholder response - Testing UI styling and interaction
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    const response = `I received: "${lastMessage}". \n\nI'm currently in Week 3 UI testing mode. In Week 4, I'll be connected to Groq's API for real AI responses. For now, you can test the chat interface styling, message display, and interactions. The UI is fully functional!`;

    // Simulate streaming by returning JSON response
    return new Response(JSON.stringify({ content: response }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
