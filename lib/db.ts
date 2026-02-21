import { prisma } from "./prisma";

/**
 * Create a new conversation for a specific user
 */
export async function createConversation(title: string = "New Chat", userId?: string) {
  return prisma.conversation.create({
    data: { title, userId: userId ?? null },
  });
}

/**
 * Get conversation with all messages (scoped to userId if provided)
 */
export async function getConversation(conversationId: string, userId?: string) {
  return prisma.conversation.findUnique({
    where: {
      id: conversationId,
      ...(userId ? { userId } : {}),
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/**
 * Get conversations for a specific user only
 */
export async function getConversations(userId: string, limit: number = 50) {
  return prisma.conversation.findMany({
    where: { userId },
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
 * Delete a conversation (only if it belongs to the user)
 */
export async function deleteConversation(conversationId: string, userId?: string) {
  return prisma.conversation.delete({
    where: {
      id: conversationId,
      ...(userId ? { userId } : {}),
    },
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
