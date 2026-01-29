# MCP Server Implementation

**Status:** Ready for Week 3 Implementation  
**Last Updated:** January 30, 2026

---

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol that allows AI assistants to safely interact with external systems through standardized tools and resources.

For Digital Twin II:
- **AI Agent** calls MCP tools (e.g., "store this message")
- **MCP Server** validates and executes the request
- **System** safely performs the action (write to DB, search vector DB, etc.)

---

## Folder Structure

```
src/mcp-server/
├── README.md                # This file
├── tools.ts                 # Tool definitions (interfaces)
├── handlers.ts              # Tool implementation logic
├── types.ts                 # TypeScript types for MCP
└── .gitkeep                 # Empty file (ensures folder tracked in git)
```

---

## Week 3-5 Implementation Roadmap

### Week 3: Basic Chat Tools
- `storeChatMessage(message)` - Save user/AI messages
- `getChatHistory(conversationId)` - Load past messages
- `getSystemPrompt()` - Fetch AI personality prompt

### Week 4: Database Tools
- `getUserProfile(userId)` - Fetch user settings
- `createConversation(userId)` - Start new chat
- `updateConversation(conversationId, data)` - Update metadata

### Week 5: Lead Capture Tools
- `captureLead(contactInfo)` - Store visitor contact
- `validateEmail(email)` - Validate email format
- `sendLeadConfirmation(leadId)` - Send confirmation

### Weeks 6-18: Advanced Tools
- `searchDocuments(query, conversationId)` - RAG retrieval
- `generateEmbedding(text)` - Vector embedding
- `getUserPreferences(userId)` - Fetch customization
- `trackInteraction(event)` - Analytics

---

## Core MCP Tools (Weeks 1-5)

### 1. Chat Message Storage

**Tool ID:** `store_chat_message`  
**Purpose:** Save a message to the database

```typescript
interface StoreChatMessageInput {
  conversationId: string;
  user: "human" | "ai";
  message: string;
  metadata?: Record<string, unknown>;
}

interface StoreChatMessageOutput {
  success: boolean;
  messageId: string;
  timestamp: string;
}
```

**When Used:** After user sends a message OR after AI generates a response  
**Error Handling:** Database connection errors, validation failures

---

### 2. Chat History Retrieval

**Tool ID:** `get_chat_history`  
**Purpose:** Load conversation history

```typescript
interface GetChatHistoryInput {
  conversationId: string;
  limit?: number;  // Max messages to return (default: 50)
}

interface GetChatHistoryOutput {
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  total: number;
}
```

**When Used:** On page load, conversation switch, context building  
**Error Handling:** Invalid conversation ID, database errors

---

### 3. System Prompt Retrieval

**Tool ID:** `get_system_prompt`  
**Purpose:** Fetch AI personality configuration

```typescript
interface GetSystemPromptInput {
  userId?: string;  // Optional: for personalized prompts
}

interface GetSystemPromptOutput {
  prompt: string;
  personality: string;  // e.g., "professional", "friendly"
  version: string;
}
```

**When Used:** When initializing the agent, when switching personality  
**Error Handling:** Missing user, invalid config

---

## File Structure (Week 3 Template)

### `src/mcp-server/tools.ts`

```typescript
// Define MCP tool schemas
// (tool names, inputs, outputs, descriptions)

export const MCP_TOOLS = {
  STORE_CHAT_MESSAGE: {
    name: "store_chat_message",
    description: "Save a message to the conversation",
    inputSchema: { /* schema */ },
  },
  GET_CHAT_HISTORY: {
    name: "get_chat_history",
    description: "Retrieve conversation history",
    inputSchema: { /* schema */ },
  },
  GET_SYSTEM_PROMPT: {
    name: "get_system_prompt",
    description: "Fetch AI personality configuration",
    inputSchema: { /* schema */ },
  },
};
```

### `src/mcp-server/handlers.ts`

```typescript
// Implement tool logic
// (actually execute the tool, interact with DB)

export async function storeChatMessage(input: StoreChatMessageInput) {
  // Validate input
  // Save to database
  // Return result with messageId
}

export async function getChatHistory(input: GetChatHistoryInput) {
  // Validate conversationId
  // Query database
  // Format and return messages
}

export async function getSystemPrompt(input: GetSystemPromptInput) {
  // Fetch prompt from database
  // Return with metadata
}
```

### `src/mcp-server/types.ts`

```typescript
// TypeScript interfaces for all MCP tools
export interface StoreChatMessageInput { /* ... */ }
export interface StoreChatMessageOutput { /* ... */ }
export interface GetChatHistoryInput { /* ... */ }
// ... and so on
```

---

## Integration Points

### Vercel AI SDK Integration

Your agent in `src/lib/ai/agent.ts` will:

```typescript
import { MCP_TOOLS } from "@/mcp-server/tools";

const agent = createAgent({
  model: "groq",
  tools: [
    MCP_TOOLS.STORE_CHAT_MESSAGE,
    MCP_TOOLS.GET_CHAT_HISTORY,
    // ... add tools as they're implemented
  ],
  toolHandlers: {
    store_chat_message: storeChatMessage,
    get_chat_history: getChatHistory,
    // ... handlers
  },
});
```

### Database Schema

MCP tools interact with Prisma models:

```prisma
model Conversation {
  id        String   @id @default(cuid())
  userId    String
  messages  Message[]
  createdAt DateTime @default(now())
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           String   // "user" or "ai"
  content        String
  metadata       Json?
  createdAt      DateTime @default(now())
}
```

---

## Security Considerations

### Input Validation
- All MCP tool inputs must be validated before use
- Use Zod for schema validation
- Sanitize text inputs to prevent injection

### Database Safety
- Use Prisma to prevent SQL injection
- Validate user IDs and conversation IDs
- Rate limit message storage (prevent spam)

### Error Handling
- Never expose database errors to clients
- Log errors for debugging
- Return user-friendly error messages

---

## Testing MCP Tools

### Manual Testing (Week 3)

```bash
# In your Next.js app
# 1. Start dev server
pnpm dev

# 2. Make API call to test tool
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "conversationId": "test-123"}'

# 3. Check if message is stored (then check DB)
psql $DATABASE_URL -c "SELECT * FROM \"Message\" WHERE \"conversationId\" = 'test-123';"
```

### Automated Testing (Week 6)

In `src/mcp-server/__tests__/handlers.test.ts`:

```typescript
describe("MCP Tools", () => {
  describe("storeChatMessage", () => {
    it("should save message to database", async () => {
      // Test implementation
    });

    it("should validate input before saving", async () => {
      // Test error handling
    });
  });
});
```

---

## Debugging

### Common Issues

**Issue:** Tool not being called by agent
- ✅ Check tool is registered in MCP_TOOLS
- ✅ Check tool name matches in toolHandlers
- ✅ Verify agent has access to tool

**Issue:** Database write fails
- ✅ Check database connection string in .env
- ✅ Verify Prisma migrations ran (`pnpm prisma migrate dev`)
- ✅ Check table names in schema match queries

**Issue:** Message not persisting
- ✅ Add console.log in handler to verify it's called
- ✅ Check conversationId is passed correctly
- ✅ Verify Neon Postgres connection is open

---

## Resources

- **MCP Spec:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Vercel AI SDK:** [sdk.vercel.ai/docs/tools-and-actions](https://sdk.vercel.ai/docs/tools-and-actions)
- **Prisma:** [prisma.io/docs](https://prisma.io/docs)
- **This Project:** See `/docs/implementation-plan.md` for Phase 3-4 details

---

**Ready to implement? Start with Week 3 checklist in implementation-plan.md!**
