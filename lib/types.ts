/**
 * MCP Tool Types
 * Defines the structure for Model Context Protocol tools
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

/**
 * Chat Message Types
 */

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MCP Tool Input/Output Types
 */

export interface StoreChatMessageInput {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
}

export interface StoreChatMessageOutput {
  success: boolean;
  messageId: string;
}

export interface GetChatHistoryInput {
  conversationId: string;
  limit?: number;
}

export interface GetChatHistoryOutput {
  messages: ChatMessage[];
}

export interface GetSystemPromptInput {
  tone?: string;
}

export interface GetSystemPromptOutput {
  systemPrompt: string;
}
