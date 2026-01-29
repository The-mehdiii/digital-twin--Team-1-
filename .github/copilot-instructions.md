# Copilot Instructions - Digital Twin II Project

You are assisting with **Digital Twin II**, an AI-powered conversational chatbot project.

## Project Context
- **Phase**: Week 1 – Infrastructure & Planning (no production features yet)
- **Goal**: Build a foundation for an LLM-based digital twin agent with future RAG integration
- **Team**: 7 members collaborating on setup, documentation, and architecture
- **Success Metric**: Clean repo structure, clear AI instructions, team collaboration

## Tech Stack
- **Frontend**: Next.js (App Router) with TypeScript
- **Language**: TypeScript exclusively
- **AI**: LLM-based conversational agent
- **Data**: Document ingestion via RAG (Week 2+)
- **Documentation**: Markdown-first with skills-based learning resources

## Repository Organization
```
/agents.md              → Global AI instructions (reference source of truth)
/docs/prd.md            → Product requirements and scope
/docs/                  → Project documentation hub
/skills/                → Technology learning resources organized by domain
  └── ba-prd-skills/    → PRD creation workflow with repo_scan.js tooling
```

## Critical Developer Workflows

### Repository Intelligence
Run the PRD reconnaissance tool to understand project context:
```bash
node skills/ba-prd-skills/repo_scan.js
```
Generates `prelim_summary.md` with project type, tech stack, architecture patterns.

### Documentation Pattern
- **Source of truth**: `/agents.md` for AI behavior; `/docs/prd.md` for requirements
- **Skills structure**: Each `/skills/{technology}-skills/` folder contains `skills.md` (learning guide) and `README.md` (workflow)
- When unsure about scope or behavior, reference these files first

## AI Behavior Rules (Strict)
- ❌ Do NOT generate production features, databases, or backend services in Week 1
- ✅ DO focus on documentation clarity, architecture planning, and repo scaffolding
- ✅ DO ask for clarification when requirements are ambiguous
- ✅ DO follow TypeScript idioms and Next.js App Router conventions
- Write minimal, maintainable code; prefer clarity over cleverness

## Key Integration Points
- **PRD Mastery Skill** (`/skills/ba-prd-skills/`): Use for requirement refinement; includes templates in `templates/` folder
- **Next.js Skills** (`/skills/nextjs16-skills/`): Reference for App Router patterns
- **AuthJS Skills** (`/skills/authjs-skills/`): For authentication architecture planning
- **Prisma ORM Skills** (`/skills/prisma-orm-v7-skills/`): For future data layer (Week 2+)

## Cross-Component Communication Patterns
- Team communication: Reference PRD success criteria (clean repo, clear instructions, collaboration)
- AI to team feedback loop: Issues/PRs should reference relevant skill documentation
- Documentation-driven development: Architecture decisions should be recorded in `/docs/` with rationale

## Conventions Specific to This Project
- All documentation uses Markdown with clear section hierarchies
- Technology-specific knowledge lives in `/skills/{name}-skills/skills.md`
- Executable workflows documented in `README.md` within each skills folder
- Environment config via `.env.example` (no secrets in repo)
- Week-based phasing: Week 1 = planning/setup, Week 2+ = implementation

## When You Need Context
1. Check `/agents.md` → Global project behavior
2. Check `/docs/prd.md` → Requirements and out-of-scope items
3. Browse `/skills/` folders → Technology learning resources
4. Run `repo_scan.js` → Auto-generated project intelligence

---
**Last Updated**: January 19, 2026  
**Scope**: Week 1 – Infrastructure & Planning Phase
