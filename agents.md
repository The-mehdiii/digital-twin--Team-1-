# AI Agent Instructions for Digital Twin II

**Version:** 2.0 (Solo Developer Edition)  
**Last Updated:** January 30, 2026  
**Current Phase:** Weeks 1-5 Course Submission + Weeks 6-18 Production Build

---

## 📋 Project Context

You are assisting with **Digital Twin II** — an AI-powered conversational chatbot that:
- Acts as an intelligent digital representation of a person
- Uses RAG (Retrieval-Augmented Generation) for context-aware responses
- Captures leads and personalizes interactions
- Deploys on Vercel with Postgres + AI SDK integration

**Dual Timeline:**
- **Weeks 1-5:** Course submission (MVP with interactive chatbot)
- **Weeks 6-18:** Production-grade system (RAG, personalization, security, testing)

---

## 📚 Critical Reference Documents

**ALWAYS consult these before suggesting changes:**

1. **[PRD (Product Requirements)](./docs/prd.md)**
   - User stories, acceptance criteria
   - Feature prioritization (P0/P1/P2)
   - Success metrics

2. **[Technical Design](./docs/technical-design.md)**
   - Architecture patterns
   - Component structure
   - API design
   - Security considerations

3. **[Implementation Plan](./docs/implementation-plan.md)**
   - Phase-by-phase breakdown
   - Effort estimates
   - Risk mitigation strategies
   - Sustainability guidelines

4. **agents.md (this file)**
   - AI behavior rules
   - Week-specific instructions
   - MCP integration guidance

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 with App Router
- TypeScript + ESLint
- Tailwind CSS + shadcn/ui

**AI & LLM:**
- Vercel AI SDK v6
- Groq (Llama 3.3 LLM)
- MCP (Model Context Protocol) for tool routing
- Upstash Vector DB (RAG)

**Data & Infrastructure:**
- Neon Postgres (Vercel)
- Prisma 7 ORM with @prisma/adapter-pg
- Vercel hosting

**Testing & Quality:**
- GitHub Actions (CI/CD)
- Jest + React Testing Library
- Playwright (E2E)
- ESLint + TypeScript

---

## 📁 Repository Structure

```
digital-twin-[team-name]/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Auth flows
│   │   ├── (dashboard)/     # Protected routes
│   │   └── api/             # API endpoints
│   ├── components/          # React components
│   ├── lib/
│   │   ├── ai/              # Agent, prompts, tools
│   │   ├── db/              # Database queries
│   │   ├── vector/          # Vector DB integration
│   │   ├── documents/       # Document processing
│   │   └── utils/           # Utilities
│   └── mcp-server/          # MCP implementation
│       ├── tools.ts         # MCP tool definitions
│       ├── handlers.ts      # Tool handlers
│       └── README.md        # MCP documentation
├── docs/
│   ├── prd.md               # Product requirements
│   ├── technical-design.md  # Architecture
│   ├── design.md            # Final design (reference)
│   ├── implementation-plan.md # Development roadmap
│   └── clickup-tasks-weeks1-5.md # Task template
├── prisma/
│   └── schema.prisma        # Database schema
├── .github/
│   └── workflows/           # CI/CD pipelines
├── agents.md                # AI instructions (this file)
└── README.md                # Project overview
```

---

## 🤖 AI Behavior Rules (Universal)

### Core Principles
1. **Align with PRD:** Every suggestion must trace back to the PRD
2. **Follow Design:** Respect the technical design patterns
3. **Sustainability First:** Never suggest 80h/week work or burnout patterns
4. **Quality Over Speed:** Production-grade code, even if slower
5. **Solo Developer Focus:** One person, full-stack, realistic estimates

### Code Generation Rules
- ✅ **Generate:** TypeScript types, API endpoints, component structure, tests
- ❌ **Avoid:** Overengineering, unnecessary abstractions, premature optimization
- ✅ **Explain:** Why this approach, trade-offs, alternatives
- ❌ **Ignore:** Scope creep, P2 features during Weeks 1-5

### Documentation
- Update README after significant changes
- Comment complex logic, not obvious code
- Maintain this agents.md as the source of truth
- Link to relevant documentation frequently

---

## 📅 Week-by-Week AI Instructions

### **Weeks 1-2: Foundation**
**Goal:** Setup, documentation, repository structure  
**AI Focus:** Planning, architecture review, documentation clarity

- Help refine PRD and design documents
- Scaffold project structure (folders, configs, basic components)
- Assist with environment setup (.env, dependencies)
- Review technical decisions (no implementation yet)
- Generate comprehensive README

**AI Constraints:**
- Do NOT write production features yet
- Prefer templates and structure over implementation
- Ask for clarification on ambiguous requirements

---

### **Week 3: Interactive Chatbot**
**Goal:** Chat interface working, LLM responding  
**AI Focus:** Chat UI, agent wiring, streaming responses

**Milestones:**
1. Next.js project boots on localhost ✅
2. Chat UI (input + message list) working ✅
3. Connected to Vercel AI SDK agent runtime ✅
4. User types → AI responds → UI updates in real-time ✅
5. Simple personality prompt in place ✅
6. Messages stored in local state (DB persistence in Week 4)

**AI Tasks This Week:**
- Generate chat components (UI)
- Wire useChat hook from Vercel AI SDK
- Create basic system prompts for personality
- Test streaming responses locally
- Generate commit messages referencing AI assistance

**AI Constraints:**
- No database writes yet (local state only)
- No RAG or vector DB integration
- Keep personality simple (avoid over-engineering)

---

### **Week 4: Production Deployment**
**Goal:** Live on Vercel with performance optimizations  
**AI Focus:** Database persistence, performance, deployment configuration

**Milestones:**
1. Database schema designed and deployed ✅
2. Chat messages persist in Postgres ✅
3. Conversation history loads on page reload ✅
4. Deployed to Vercel (publicly accessible) ✅
5. Performance optimized (Lighthouse > 85) ✅
6. Environment variables configured for production ✅

**AI Tasks This Week:**
- Design database schema (users, sessions, messages tables)
- Generate Prisma models and migrations
- Implement message persistence API routes
- Optimize bundle size (code splitting, lazy loading)
- Generate performance documentation

**AI Constraints:**
- No RAG system yet
- No advanced personalization
- Focus on core chat reliability

---

### **Week 5: Polish & Presentation**
**Goal:** Final touches, presentation-ready demo  
**AI Focus:** Bug fixes, UX polish, presentation outline

**Milestones:**
1. All bugs fixed (error handling, edge cases) ✅
2. Mobile design responsive ✅
3. Loading states and error messages clear ✅
4. Contact/lead capture flow working ✅
5. Presentation outline complete ✅
6. Repository clean and documented ✅

**AI Tasks This Week:**
- Fix remaining bugs (console errors, type issues)
- Improve error handling and user feedback
- Polish mobile experience
- Generate presentation outline
- Review code quality (TypeScript, ESLint)
- Prepare demo script

**AI Constraints:**
- Only bug fixes and polish
- No new features
- Focus on demo-readiness

---

### **Weeks 6-18: Production Build (After Course)**
**Goal:** RAG, personalization, security, production-grade  
**AI Focus:** Advanced features, testing, optimization

**Expanded AI Capabilities:**
- RAG system (document upload, vector search, retrieval)
- Advanced personalization (multiple personality profiles)
- Comprehensive testing (unit, integration, E2E)
- Security audit and hardening
- Performance monitoring and optimization
- Voice agent integration (optional)

**AI Constraints:**
- Maintain sustainability (45-50h/week)
- No scope creep beyond PRD P0+P1
- Quality is non-negotiable
- Keep code maintainable for future developers

---

## 🔌 MCP (Model Context Protocol) Integration

### What is MCP?
MCP is a protocol that allows AI agents to use external tools and data sources safely.

### MCP Structure in Digital Twin

**File:** `src/mcp-server/tools.ts`
```typescript
// Define tools the AI agent can use
- getChatHistory(conversationId) → retrieve past messages
- storeChatMessage(message) → persist new message
- getUserProfile(userId) → fetch user preferences
- searchDocuments(query) → find relevant documents (RAG)
- captureLead(contactInfo) → store lead data
```

**File:** `src/mcp-server/handlers.ts`
```typescript
// Implement safe handlers for each tool
- Validate inputs (security)
- Execute database operations
- Return formatted responses
- Handle errors gracefully
```

### How AI Should Use MCP
1. **Reference existing tools:** Check `src/mcp-server/tools.ts` before suggesting new functionality
2. **Suggest tool extensions:** If a needed capability is missing, propose it in the MCP tools
3. **Validate tool usage:** Ensure AI responses use MCP tools appropriately
4. **Document tools:** Keep the MCP README updated with all available tools

---

## ✅ AI Behavior Checklist

Before committing code, verify:

- [ ] Aligns with current PRD and design documents
- [ ] Follows week-specific goals and constraints
- [ ] Commit messages reference AI assistance
- [ ] Code is production-ready (not scaffolding)
- [ ] TypeScript with zero errors
- [ ] ESLint passing (minimal warnings)
- [ ] Tests added for critical paths
- [ ] Documented (code comments + README)
- [ ] Sustainability maintained (no all-nighters suggested)

---

## 🚀 Quick Reference: When to Do What

| Situation | AI Should |
|-----------|----------|
| "Generate component for chat UI" | Create TypeScript component with shadcn/ui + tests |
| "Fix TypeScript error" | Show exact error + fix with explanation |
| "How to implement RAG?" | Reference implementation-plan.md Phase 4 |
| "Should I add voice?" | Check PRD (P2 feature) → optional post-launch |
| "I'm stuck on X" | Suggest debugging approach + offer pair programming |
| "Review my code" | Check against design patterns + suggest improvements |
| "How many hours will this take?" | Reference implementation-plan.md estimates |
| "Should I work 60h this week?" | NO. Maintain 45-50h/week. Extend timeline if needed. |

---

## 📞 Emergency Escalation

If you encounter:
- **Burnout signs:** Reduce scope immediately. Defer P2 features.
- **Ambiguous requirements:** STOP. Ask for clarification before proceeding.
- **Major architecture questions:** Reference technical-design.md first, then discuss.
- **Timeline pressure:** Extend timeline. Never sacrifice code quality or health.

---

## 📝 Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-20 | Initial AI instructions |
| 2.0 | 2026-01-30 | Solo developer edition + MCP + weekly guidance |

---

**Last Updated:** January 30, 2026  
**Maintained By:** Claude Opus 4.5 (Copilot)  
**Status:** ✅ Ready for Week 3 Development
