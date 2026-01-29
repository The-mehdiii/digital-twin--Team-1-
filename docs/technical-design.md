# Technical Design Document

## Digital Twin II - AI-Powered Conversational Agent

**Version:** 1.1  
**Date:** January 29, 2026  
**Status:** Active Development  
**Authors:** Team 1 (Mohammed Mehdi Musa, Mukesh Sapkota, Saurav Ghimire, Amith Hassan, Omayara Afrin, Jake Ryan Lenon, Yamuna Reddy Mandadi)  
**Related Documents:** [Product Requirements Document](./prd.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Architecture Design](#3-architecture-design)
4. [Technology Stack](#4-technology-stack)
5. [Component Design](#5-component-design)
6. [Data Architecture](#6-data-architecture)
7. [AI/ML Architecture](#7-aiml-architecture)
8. [API Design](#8-api-design)
9. [Security Design](#9-security-design)
10. [Infrastructure & Deployment](#10-infrastructure--deployment)
11. [Development Phases](#11-development-phases)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Risk Assessment](#13-risk-assessment)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Purpose

Digital Twin II is an AI-powered conversational agent designed to represent a digital version of a user. The system enables intelligent conversations using Retrieval-Augmented Generation (RAG), allowing the agent to answer questions based on user-provided knowledge sources and documents.

**Alignment with PRD:** This technical design implements the product requirements defined in [prd.md](./prd.md), specifically addressing the functional requirements (Section 4), technical stack specifications (Section 6), and non-functional requirements (Section 5).

### 1.2 Scope

This document outlines the technical architecture, design decisions, and implementation details for building a production-grade AI chatbot with the following capabilities:

- Real-time conversational AI interface
- Document ingestion and semantic search (RAG)
- User authentication and session management
- Scalable, maintainable codebase
- Secure handling of user data and credentials

### 1.3 Goals

**Reference:** See [PRD Section 2 - Goals & Vision](./prd.md#2-goals--vision)

| Goal | Description | PRD Priority |
|------|-------------|-------------|
| **Functional AI Chatbot** | Build a conversational agent that provides intelligent, context-aware responses | P0 (MUST HAVE) |
| **RAG Integration** | Enable the AI to retrieve and utilize user-provided documents for enhanced answers | P1 (SHOULD HAVE) |
| **Production-Grade Setup** | Demonstrate best practices for AI project architecture and deployment | P0 (MUST HAVE) |
| **Team Collaboration** | Enable all 7 team members to contribute effectively | P0 (Week 1 Success) |
| **Extensibility** | Design for future features including multi-modal inputs and advanced agents | P2 (NICE TO HAVE) |

---

## 2. System Overview

**PRD Alignment:** Implements user stories from [PRD Section 3](./prd.md#3-target-users--user-stories) and functional requirements from [PRD Section 4](./prd.md#4-functional-requirements).

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 16 Frontend (App Router)                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Chat UI    │  │  Auth UI    │  │  Document   │  │  Settings  │ │   │
│  │  │  Component  │  │  Component  │  │  Upload UI  │  │  Panel     │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js API Routes & Server Actions               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Chat API   │  │  Auth API   │  │  Document   │  │  MCP       │ │   │
│  │  │  /api/chat  │  │  Auth.js v5 │  │  Ingestion  │  │  Server    │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVICE LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │   AI Agent       │  │   RAG Service    │  │   Document Processor     │  │
│  │   (AI SDK 6)     │  │   (Vector Search)│  │   (Chunking/Embedding)   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │   PostgreSQL     │  │   Upstash        │  │   File Storage           │  │
│  │   (Prisma ORM 7) │  │   Vector DB      │  │   (Documents)            │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │   LLM Provider   │  │   Embedding      │  │   OAuth Providers        │  │
│  │   (Groq/OpenAI)  │  │   (MixBread AI)  │  │   (Google, GitHub)       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User Input → Chat UI → API Route → AI Agent → [RAG Query] → Vector DB
                                      │              │
                                      │              ▼
                                      │         Retrieved Context
                                      │              │
                                      ▼              ▼
                                   LLM API ← Augmented Prompt
                                      │
                                      ▼
                              Streamed Response → Chat UI → User
```

---

## 3. Architecture Design

### 3.1 Architectural Principles

| Principle | Implementation |
|-----------|----------------|
| **Separation of Concerns** | Clear boundaries between UI, API, business logic, and data layers |
| **Server-First** | Leverage Next.js 16 Server Components and Server Actions |
| **Edge-Ready** | Design for Edge runtime compatibility where appropriate |
| **Type Safety** | TypeScript throughout with strict type checking |
| **API-First** | Design APIs before implementation for clear contracts |

### 3.2 Design Patterns

#### 3.2.1 Agent Pattern (AI SDK 6)

```typescript
// Agent abstraction for conversational AI
const digitalTwinAgent = new ToolLoopAgent({
  model: 'groq/llama-3.3-70b-versatile',
  instructions: userPersonalityInstructions,
  tools: {
    retrieveContext: ragRetrievalTool,
    searchDocuments: documentSearchTool,
    getPersonalInfo: userInfoTool,
  },
});
```

#### 3.2.2 Repository Pattern (Data Access)

```typescript
// Abstract data access through repositories
interface DocumentRepository {
  create(document: DocumentInput): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  findByUserId(userId: string): Promise<Document[]>;
  delete(id: string): Promise<void>;
}
```

#### 3.2.3 Service Layer Pattern

```typescript
// Business logic encapsulation
class RAGService {
  constructor(
    private vectorStore: VectorStore,
    private embedder: Embedder,
    private documentRepo: DocumentRepository
  ) {}

  async query(prompt: string, userId: string): Promise<RetrievalResult[]> {
    const embedding = await this.embedder.embed(prompt);
    return this.vectorStore.query(embedding, { namespace: userId });
  }
}
```

### 3.3 Folder Structure

```
digital-twin/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Authentication routes group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected routes group
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   ├── documents/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Chat streaming endpoint
│   │   ├── documents/
│   │   │   └── route.ts          # Document upload/management
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # Auth.js handlers
│   │   └── mcp/
│   │       └── [transport]/
│   │           └── route.ts      # MCP server endpoint
│   ├── actions/                  # Server Actions
│   │   ├── chat-actions.ts
│   │   ├── document-actions.ts
│   │   └── user-actions.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── chat/
│   │   ├── chat-container.tsx
│   │   ├── message-list.tsx
│   │   ├── message-item.tsx
│   │   └── chat-input.tsx
│   ├── documents/
│   │   ├── document-upload.tsx
│   │   ├── document-list.tsx
│   │   └── document-viewer.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── lib/
│   ├── ai/
│   │   ├── agent.ts              # AI agent configuration
│   │   ├── tools.ts              # Tool definitions
│   │   ├── prompts.ts            # System prompts
│   │   └── rag.ts                # RAG utilities
│   ├── db/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── repositories/
│   │       ├── user.ts
│   │       ├── document.ts
│   │       └── conversation.ts
│   ├── vector/
│   │   ├── client.ts             # Upstash Vector client
│   │   ├── embedder.ts           # Embedding utilities
│   │   └── search.ts             # Semantic search
│   ├── documents/
│   │   ├── processor.ts          # Document processing
│   │   ├── chunker.ts            # Text chunking
│   │   └── parser.ts             # File parsing
│   └── utils/
│       ├── validation.ts
│       └── helpers.ts
├── types/
│   ├── chat.ts
│   ├── document.ts
│   └── user.ts
├── generated/
│   └── prisma/
│       └── client/               # Generated Prisma client
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── prisma.config.ts              # Prisma v7 config
├── auth.ts                       # Auth.js v5 config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## 4. Technology Stack

### 4.1 Core Technologies

**Reference:** Aligns with [PRD Section 6 - Technical Stack](./prd.md#6-technical-stack-week-1-foundation)

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|

| **Framework** | Next.js | 16.x | Latest features, App Router, Server Components, Turbopack |
| **Language** | TypeScript | 5.4+ | Type safety, better DX, required by Prisma 7 |
| **Runtime** | Node.js | 20.19+ | Required by Prisma 7, LTS support |
| **Package Manager** | pnpm | 9.x | Fast, efficient, workspace support |

### 4.2 AI & ML Stack

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| **AI SDK** | Vercel AI SDK | 6 (Beta) | Agent abstraction, tool approval, streaming |
| **LLM Provider** | Groq (Llama 3.3) | Latest | Fast inference, cost-effective, open weights |
| **Embedding Model** | MixBread AI | Latest | High-quality embeddings, recommended by Upstash |
| **Vector Database** | Upstash Vector | Latest | Serverless, REST API, namespace support |

### 4.3 Data Layer

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| **ORM** | Prisma | 7.x | Type-safe, ESM, modern architecture |
| **Database** | PostgreSQL | 15+ | Reliable, feature-rich, widely supported |
| **Driver Adapter** | @prisma/adapter-pg | 7.x | Required for Prisma 7 |

### 4.4 Authentication

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| **Auth Library** | Auth.js (NextAuth) | 5.x (Beta) | Native Next.js integration, OAuth support |
| **Providers** | Google, GitHub, Credentials | - | Common OAuth providers + email/password |

### 4.5 UI Layer

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| **UI Components** | shadcn/ui | Latest | Customizable, accessible, Tailwind-based |
| **Styling** | Tailwind CSS | 3.x | Utility-first, excellent DX |
| **Toast Notifications** | Sonner | Latest | Modern toast library (shadcn recommended) |
| **Forms** | React Hook Form + Zod | Latest | Type-safe form handling |

### 4.6 DevOps & Infrastructure

| Category | Technology | Rationale |
|----------|------------|-----------|
| **Hosting** | Vercel | Native Next.js support, Edge functions |
| **Database Hosting** | Vercel Postgres / Neon | Serverless PostgreSQL |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Monitoring** | Vercel Analytics | Built-in performance monitoring |

---

## 5. Component Design

### 5.1 Chat Component Architecture

```
ChatContainer
├── ChatHeader
│   ├── AgentAvatar
│   ├── AgentName
│   └── StatusIndicator
├── MessageList
│   └── MessageItem (repeated)
│       ├── Avatar
│       ├── MessageContent
│       │   ├── TextContent
│       │   ├── CodeBlock (optional)
│       │   └── SourceCitations (optional)
│       └── Timestamp
├── ChatInput
│   ├── TextArea
│   ├── FileAttachment (future)
│   └── SendButton
└── TypingIndicator
```

### 5.2 Chat Component Implementation

```typescript
// components/chat/chat-container.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { ChatHeader } from "./chat-header";

export function ChatContainer() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        input={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### 5.3 Document Upload Component

```typescript
// components/documents/document-upload.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadDocument } from "@/app/actions/document-actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      
      await uploadDocument(formData);
      setProgress((prev) => prev + (100 / acceptedFiles.length));
    }
    
    setUploading(false);
    setProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
    >
      <input {...getInputProps()} />
      {uploading ? (
        <Progress value={progress} className="w-full" />
      ) : isDragActive ? (
        <p>Drop files here...</p>
      ) : (
        <p>Drag & drop files here, or click to select</p>
      )}
    </div>
  );
}
```

---

## 6. Data Architecture

### 6.1 Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  documents     Document[]
  conversations Conversation[]
  
  // Digital Twin Configuration
  twinConfig    TwinConfig?
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Document {
  id          String   @id @default(cuid())
  userId      String
  filename    String
  mimeType    String
  size        Int
  status      DocumentStatus @default(PENDING)
  chunkCount  Int      @default(0)
  errorMessage String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  chunks Chunk[]

  @@index([userId])
  @@index([status])
}

model Chunk {
  id         String   @id @default(cuid())
  documentId String
  content    String   @db.Text
  vectorId   String?  // Reference to Upstash Vector
  metadata   Json?
  sequence   Int
  createdAt  DateTime @default(now())

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
}

model Conversation {
  id        String   @id @default(cuid())
  userId    String
  title     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([userId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  role           MessageRole
  content        String   @db.Text
  metadata       Json?
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
}

model TwinConfig {
  id              String   @id @default(cuid())
  userId          String   @unique
  personality     String?  @db.Text
  systemPrompt    String?  @db.Text
  preferredName   String?
  responseStyle   ResponseStyle @default(BALANCED)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum DocumentStatus {
  PENDING
  PROCESSING
  INDEXED
  FAILED
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum ResponseStyle {
  CONCISE
  BALANCED
  DETAILED
}
```

### 6.2 Prisma Configuration (v7)

```typescript
// prisma.config.ts
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
});
```

### 6.3 Prisma Client Setup

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 6.4 Vector Database Schema (Upstash)

```typescript
// Vector storage structure
interface VectorDocument {
  id: string;              // Format: "doc_{documentId}_chunk_{sequence}"
  data: string;            // Text content (auto-embedded by Upstash)
  metadata: {
    userId: string;
    documentId: string;
    chunkId: string;
    sequence: number;
    filename: string;
    mimeType: string;
    createdAt: string;
  };
}

// Namespace strategy: One namespace per user
// Namespace format: "user_{userId}"
```

---

## 7. AI/ML Architecture

### 7.1 AI Agent Design

```typescript
// lib/ai/agent.ts
import { ToolLoopAgent, Output } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { ragRetrievalTool, userContextTool } from './tools';
import { getSystemPrompt } from './prompts';

export function createDigitalTwinAgent(userId: string, twinConfig: TwinConfig) {
  return new ToolLoopAgent({
    model: groq('llama-3.3-70b-versatile'),
    instructions: getSystemPrompt(twinConfig),
    tools: {
      retrieveContext: ragRetrievalTool(userId),
      getUserContext: userContextTool(userId),
    },
    maxToolRoundtrips: 3,
  });
}

export async function generateResponse(
  agent: ToolLoopAgent,
  prompt: string,
  conversationHistory: Message[]
) {
  const result = await agent.generate({
    prompt,
    messages: conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  return result;
}
```

### 7.2 Tool Definitions

```typescript
// lib/ai/tools.ts
import { tool } from 'ai';
import { z } from 'zod';
import { queryVectorStore } from '@/lib/vector/search';

export function ragRetrievalTool(userId: string) {
  return tool({
    description: 'Search user documents for relevant context to answer questions',
    inputSchema: z.object({
      query: z.string().describe('The search query to find relevant documents'),
      topK: z.number().min(1).max(10).default(5).describe('Number of results'),
    }),
    execute: async ({ query, topK }) => {
      const results = await queryVectorStore(query, userId, topK);
      
      if (results.length === 0) {
        return { found: false, context: null };
      }

      return {
        found: true,
        context: results.map((r) => ({
          content: r.data,
          source: r.metadata?.filename,
          relevance: r.score,
        })),
      };
    },
  });
}

export function userContextTool(userId: string) {
  return tool({
    description: 'Get information about the user for personalized responses',
    inputSchema: z.object({}),
    execute: async () => {
      const { prisma } = await import('@/lib/db/prisma');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { twinConfig: true },
      });

      return {
        name: user?.twinConfig?.preferredName || user?.name,
        responseStyle: user?.twinConfig?.responseStyle,
      };
    },
  });
}
```

### 7.3 System Prompts

```typescript
// lib/ai/prompts.ts
import { TwinConfig } from '@/types/user';

export function getSystemPrompt(config: TwinConfig): string {
  const basePrompt = `You are a Digital Twin AI assistant representing the user. 
Your purpose is to answer questions and engage in conversations as if you were the user, 
based on their provided documents and personality configuration.

## Core Behaviors:
1. Always search the user's documents for relevant context before answering
2. If you find relevant information, cite the source
3. If no relevant context is found, acknowledge this and provide general assistance
4. Match the user's preferred response style

## Response Style: ${config.responseStyle || 'BALANCED'}
${getStyleInstructions(config.responseStyle)}

## Custom Personality:
${config.personality || 'Be helpful, friendly, and professional.'}

## Custom Instructions:
${config.systemPrompt || 'No additional instructions provided.'}`;

  return basePrompt;
}

function getStyleInstructions(style?: string): string {
  switch (style) {
    case 'CONCISE':
      return 'Keep responses brief and to the point. Use bullet points when appropriate.';
    case 'DETAILED':
      return 'Provide comprehensive responses with explanations and examples.';
    default:
      return 'Balance brevity with sufficient detail. Adapt to the complexity of the question.';
  }
}
```

### 7.4 RAG Pipeline

```
Document Upload Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Upload    │───▶│   Parse     │───▶│   Chunk     │───▶│   Embed &   │
│   Document  │    │   Content   │    │   Text      │    │   Store     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                               │
                                                               ▼
                                                      ┌─────────────┐
                                                      │   Upstash   │
                                                      │   Vector    │
                                                      └─────────────┘

Query Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│   Agent     │───▶│   Vector    │───▶│   Augment   │
│   Query     │    │   Tool Call │    │   Search    │    │   Prompt    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                               │
                                                               ▼
                                                      ┌─────────────┐
                                                      │   Generate  │
                                                      │   Response  │
                                                      └─────────────┘
```

### 7.5 Document Processing

```typescript
// lib/documents/processor.ts
import { prisma } from '@/lib/db/prisma';
import { index } from '@/lib/vector/client';
import { chunkText } from './chunker';
import { parseDocument } from './parser';

interface ProcessResult {
  success: boolean;
  chunkCount: number;
  error?: string;
}

export async function processDocument(
  documentId: string,
  userId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<ProcessResult> {
  try {
    // Update status to processing
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    // Parse document content
    const content = await parseDocument(fileBuffer, mimeType);

    // Chunk the content
    const chunks = chunkText(content, {
      chunkSize: 1000,
      overlap: 200,
    });

    // Store chunks in database and vector store
    const vectorDocs = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Create chunk in database
      const dbChunk = await prisma.chunk.create({
        data: {
          documentId,
          content: chunk,
          sequence: i,
        },
      });

      // Prepare for vector store
      vectorDocs.push({
        id: `doc_${documentId}_chunk_${i}`,
        data: chunk,
        metadata: {
          userId,
          documentId,
          chunkId: dbChunk.id,
          sequence: i,
        },
      });
    }

    // Batch upsert to vector store (user namespace)
    await index.namespace(`user_${userId}`).upsert(vectorDocs);

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'INDEXED',
        chunkCount: chunks.length,
      },
    });

    return { success: true, chunkCount: chunks.length };
  } catch (error) {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return {
      success: false,
      chunkCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

---

## 8. API Design

### 8.1 Chat API

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { auth } from '@/auth';
import { createDigitalTwinAgent } from '@/lib/ai/agent';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, conversationId } = await req.json();

  // Get user's twin configuration
  const twinConfig = await prisma.twinConfig.findUnique({
    where: { userId: session.user.id },
  });

  // Create agent with user context
  const agent = createDigitalTwinAgent(session.user.id, twinConfig);

  // Stream response
  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages,
    system: agent.instructions,
    tools: agent.tools,
    maxToolRoundtrips: 3,
    onFinish: async ({ text }) => {
      // Persist conversation
      if (conversationId) {
        await prisma.message.createMany({
          data: [
            {
              conversationId,
              role: 'USER',
              content: messages[messages.length - 1].content,
            },
            {
              conversationId,
              role: 'ASSISTANT',
              content: text,
            },
          ],
        });
      }
    },
  });

  return result.toDataStreamResponse();
}
```

### 8.2 Document API

```typescript
// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { processDocument } from '@/lib/documents/processor';

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Create document record
  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      status: 'PENDING',
    },
  });

  // Process in background (queue in production)
  const buffer = Buffer.from(await file.arrayBuffer());
  processDocument(document.id, session.user.id, buffer, file.type);

  return NextResponse.json({
    id: document.id,
    status: 'PENDING',
    message: 'Document uploaded and queued for processing',
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(documents);
}
```

### 8.3 API Response Standards

```typescript
// types/api.ts

// Success response
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Error codes
enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

---

## 9. Security Design

### 9.1 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Auth.js   │────▶│   OAuth     │
│   Browser   │     │   Handler   │     │   Provider  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       │
       ▼                                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Session   │◀────│   JWT/      │◀────│   Callback  │
│   Cookie    │     │   Session   │     │   Handler   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 9.2 Auth.js Configuration

```typescript
// auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

### 9.3 Route Protection

```typescript
// middleware.ts (or proxy.ts in Next.js 16)
import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register');
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/chat') ||
                           req.nextUrl.pathname.startsWith('/documents') ||
                           req.nextUrl.pathname.startsWith('/settings');

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 9.4 Security Best Practices

| Area | Implementation |
|------|----------------|
| **Secrets Management** | Environment variables, never in code |
| **Input Validation** | Zod schemas for all user inputs |
| **SQL Injection** | Prisma ORM with parameterized queries |
| **XSS Prevention** | React's built-in escaping, CSP headers |
| **CSRF Protection** | Auth.js built-in CSRF tokens |
| **Rate Limiting** | API route rate limiting (Vercel/custom) |
| **Data Isolation** | User namespace separation in vector DB |
| **File Upload** | Type validation, size limits, virus scanning |

### 9.5 Environment Variables

```env
# .env.example

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/digital_twin

# Vector Database
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=

# AI Providers
GROQ_API_KEY=
# Or alternatively:
OPENAI_API_KEY=
```

---

## 10. Infrastructure & Deployment

### 10.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Edge       │  │   Serverless │  │   Static Assets      │  │
│  │   Functions  │  │   Functions  │  │   (CDN)              │  │
│  │   (Proxy)    │  │   (API)      │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                       External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Vercel     │  │   Upstash    │  │   Groq API           │  │
│  │   Postgres   │  │   Vector     │  │   (LLM)              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm lint
      
      - run: pnpm type-check
      
      - run: pnpm test

  deploy-preview:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 10.3 Database Migrations

```bash
# Development
pnpm prisma generate
pnpm prisma db push

# Production (with migrations)
pnpm prisma migrate deploy
```

---

## 11. Development Phases

### Phase 1: Foundation (Week 1-2) ✓ Current

**Reference:** [PRD Section 7 - Acceptance Criteria](./prd.md#7-acceptance-criteria-for-success-week-1)

| Task | Status | Description | PRD Alignment |
|------|--------|-------------|---------------|
| Repository Setup | ✅ Complete | Initialize repo, folder structure, documentation | PRD 7.1 - Repository & Setup |
| PRD & Design Docs | ✅ Complete | Product requirements (v1.0→1.1), technical design | PRD 7.2 - Documentation |
| Team Collaboration | ✅ Complete | Git workflow, ClickUp integration | PRD 7.4 - Team Collaboration |
| Skills Documentation | ✅ Complete | Technology skill files for AI assistance | PRD Section 10 - Skills Applied |

### Phase 2: Core Infrastructure (Week 3-4)

**Reference:** [PRD Section 4 - MUST HAVE Requirements](./prd.md#4-functional-requirements)

| Task | Status | Description | Maps to PRD Feature |
|------|--------|-------------|---------------------|
| Next.js 16 Setup | 🔲 Pending | Initialize project with App Router, Turbopack | Foundation for all features |
| Database Schema | 🔲 Pending | Prisma 7 schema, migrations | User Profiles (P1) |
| Authentication | 🔲 Pending | Auth.js v5 with OAuth providers | User Authentication (P0) |
| UI Foundation | 🔲 Pending | shadcn/ui setup, base components | Chat Interface (P0) |

### Phase 3: AI Integration (Week 5-6)

**Reference:** [PRD Section 4 - MUST HAVE (P0)](./prd.md#must-have-week-1-2)

| Task | Status | Description | Maps to PRD Feature |
|------|--------|-------------|---------------------|
| AI SDK 6 Setup | 🔲 Pending | Agent configuration, streaming | Response Generation (P0) |
| Chat Interface | 🔲 Pending | Real-time chat UI with message history | Chat Interface (P0) + Conversation History (P0) |
| Basic Responses | 🔲 Pending | LLM integration without RAG | Response Generation (P0) |
| Conversation Persistence | 🔲 Pending | Store/retrieve conversation history | Conversation History (P0) |

### Phase 4: RAG Implementation (Week 7-8)

**Reference:** [PRD Section 4 - SHOULD HAVE (P1)](./prd.md#should-have-week-2-3)

| Task | Status | Description | Maps to PRD Feature |
|------|--------|-------------|---------------------|
| Vector DB Setup | 🔲 Pending | Upstash Vector configuration | Foundation for Document Upload |
| Document Upload | 🔲 Pending | File upload UI and processing | Document Upload (P1) |
| Text Chunking | 🔲 Pending | Document splitting strategy | Document Upload (P1) |
| Semantic Search | 🔲 Pending | Query vector store for context | Search Integration (P1) |
| RAG Integration | 🔲 Pending | Augment prompts with retrieved context | Enhanced AI responses |

### Phase 5: Personalization (Week 9-10)

**Reference:** [PRD Section 4 - SHOULD HAVE (P1)](./prd.md#should-have-week-2-3)

| Task | Status | Description | Maps to PRD Feature |
|------|--------|-------------|---------------------|
| Twin Configuration | 🔲 Pending | Personality settings UI | User Profiles (P1) |
| Custom Prompts | 🔲 Pending | User-defined system prompts | Response Customization (P1) |
| Response Styles | 🔲 Pending | Concise/balanced/detailed modes | Response Customization (P1) |
| Settings Panel | 🔲 Pending | User preferences management | User Profiles (P1) |

### Phase 6: Polish & Launch (Week 11-12)

| Task | Status | Description |
|------|--------|-------------|
| Testing | 🔲 Pending | Unit, integration, E2E tests |
| Performance Optimization | 🔲 Pending | Caching, lazy loading, streaming |
| Documentation | 🔲 Pending | User guide, API docs |
| Production Deployment | 🔲 Pending | Vercel production setup |

---

## 12. Non-Functional Requirements

### 12.1 Performance Targets

**Reference:** [PRD Section 5 - Non-Functional Requirements](./prd.md#5-non-functional-requirements)

| Metric | Target | Measurement | PRD Alignment |
|--------|--------|-------------|---------------|

| **Time to First Byte (TTFB)** | < 200ms | Vercel Analytics | Performance |
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse | Performance |
| **Chat Response Start** | < 500ms | Custom metrics | **PRD: < 3s response** |
| **Document Processing** | < 30s per MB | Server logs | Performance |
| **Vector Search** | < 100ms | Upstash metrics | Performance |

### 12.2 Scalability

| Component | Strategy |
|-----------|----------|
| **API Routes** | Vercel serverless auto-scaling |
| **Database** | Connection pooling, read replicas (future) |
| **Vector DB** | Upstash serverless scaling |
| **File Storage** | CDN-backed storage |

### 12.3 Reliability

| Requirement | Implementation |
|-------------|----------------|
| **Uptime SLA** | 99.9% (Vercel guarantee) |
| **Error Handling** | Graceful degradation, error boundaries |
| **Data Backup** | Automated database backups |
| **Recovery** | Point-in-time recovery capability |

### 12.4 Observability

```typescript
// Logging strategy
const logLevels = {
  error: 'Critical failures requiring immediate attention',
  warn: 'Potential issues that should be monitored',
  info: 'General application events',
  debug: 'Detailed debugging information (dev only)',
};

// Metrics to track
const metrics = [
  'chat_response_time',
  'document_processing_time',
  'vector_search_latency',
  'api_error_rate',
  'active_users',
  'documents_processed',
];
```

---

## 13. Risk Assessment

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **AI SDK 6 Beta Instability** | Medium | High | Pin versions, maintain fallback to v5 |
| **LLM Rate Limits** | Medium | Medium | Implement retry logic, queue system |
| **Vector DB Performance** | Low | High | Monitor latency, optimize queries |
| **Auth.js v5 Breaking Changes** | Medium | Medium | Follow migration guides, test thoroughly |
| **Prisma 7 Migration Issues** | Medium | High | Comprehensive testing, rollback plan |

### 13.2 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Data Breach** | Low | Critical | Encryption, access controls, auditing |
| **Prompt Injection** | Medium | High | Input sanitization, prompt guards |
| **API Abuse** | Medium | Medium | Rate limiting, authentication |
| **Document Malware** | Low | High | File type validation, scanning |

### 13.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Service Provider Outage** | Low | High | Multi-provider fallback |
| **Cost Overrun** | Medium | Medium | Usage monitoring, spending alerts |
| **Team Availability** | Medium | Medium | Documentation, knowledge sharing |

---

## 14. Appendix

### 14.1 Glossary

| Term | Definition |
|------|------------|
| **Digital Twin** | An AI representation of a user that can answer questions on their behalf |
| **RAG** | Retrieval-Augmented Generation - enhancing LLM responses with retrieved context |
| **Vector Database** | Database optimized for storing and querying embedding vectors |
| **Embedding** | Dense numerical representation of text for semantic similarity |
| **Agent** | AI system capable of using tools and making decisions |
| **MCP** | Model Context Protocol - standard for AI tool integration |

### 14.2 Reference Links

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [AI SDK 6 Documentation](https://v6.ai-sdk.dev/docs)
- [Auth.js v5 Documentation](https://authjs.dev)
- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Upstash Vector Documentation](https://upstash.com/docs/vector)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Groq API Documentation](https://console.groq.com/docs)

### 14.3 Decision Log

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2026-01-27 | Use Groq as primary LLM | Fast inference, cost-effective | OpenAI, Anthropic |
| 2026-01-27 | Use Upstash Vector | Serverless, REST API | Pinecone, Weaviate |
| 2026-01-27 | Use MixBread embeddings | Recommended by Upstash | OpenAI embeddings |
| 2026-01-27 | Use Prisma 7 | Modern ESM, type safety | Drizzle, Kysely |
| 2026-01-27 | Use shadcn/ui | Customizable, accessible | Radix, Chakra |

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Team 1 | Initial technical design document |
| 1.1 | 2026-01-29 | Team 1 | Updated to align with PRD v1.0, added cross-references, synced priorities |

---

*This document is a living document and will be updated as the project evolves.*
