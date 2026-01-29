# Technical Design Document

## Digital Twin II - AI-Powered Conversational Agent

**Version:** 1.1  
**Date:** January 29, 2026  
**Status:** Final - Ready for Implementation  
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

*For complete technical details on Data Architecture, AI/ML Architecture, API Design, Security Design, Infrastructure, Development Phases, Performance Requirements, and Risk Assessment, please refer to the full sections 6-14 in this document.*

---

**Document Status:** ✅ Final - Approved for Implementation  
**Next Steps:** Proceed to Phase 2 (Core Infrastructure Setup)

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Team 1 | Initial technical design document |
| 1.1 | 2026-01-29 | Team 1 | Updated to align with PRD v1.0, added cross-references, synced priorities, finalized for implementation |

---

*This is the final design document ready for implementation. All architectural decisions have been reviewed and approved.*
