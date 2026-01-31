import { prisma } from "./prisma";

/**
 * Create a new conversation
 */
export async function createConversation(title: string = "New Chat") {
  return prisma.conversation.create({
    data: { title },
  });
}

/**
 * Get conversation with all messages
 */
export async function getConversation(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/**
 * Get all conversations (sorted by newest first)
 */
export async function getConversations(limit: number = 50) {
  return prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      role,
      content,
    },
  });

  // Update conversation updatedAt timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string) {
  return prisma.conversation.delete({
    where: { id: conversationId },
  });
}

/**
 * Get recent messages from a conversation (for context)
 */
export async function getRecentMessages(conversationId: string, limit: number = 10) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
