/**
 * Agent tools for the Digital Twin.
 *
 * These turn the chatbot into an agent: the LLM decides when to call a tool,
 * with what arguments, and our code executes it and returns a result the model
 * can use to continue its answer.
 *
 * Built as a factory so per-request context (the authenticated userId) is
 * available inside each tool's `execute`.
 *
 * Parameters are declared with the AI SDK's `jsonSchema` helper (instead of zod)
 * to stay independent of the zod major version resolved in the dependency tree.
 */

import { tool, jsonSchema } from "ai";
import { prisma } from "@/lib/prisma";
import { searchDocuments } from "@/lib/vector/search";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "The-mehdiii";
// Public, user-configurable links (placeholders until real ones are set)
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "";
const RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL || "";

export function buildTools(userId?: string) {
  return {
    /**
     * Search the user's uploaded knowledge base (RAG exposed as a tool, so the
     * model chooses *when* it needs to look something up).
     */
    searchKnowledge: tool({
      description:
        "Search Mehdi's uploaded documents/knowledge base for relevant information. Use this when the user asks about specific facts, projects, or details that may be in his documents.",
      parameters: jsonSchema<{ query: string }>({
        type: "object",
        properties: {
          query: { type: "string", description: "The search query to look up in the knowledge base" },
        },
        required: ["query"],
        additionalProperties: false,
      }),
      execute: async ({ query }) => {
        if (!userId) {
          return { results: [], note: "No knowledge base is available for this session." };
        }
        try {
          const results = await searchDocuments(query, userId, { topK: 3, minScore: 0.6 });
          if (results.length === 0) {
            return { results: [], note: "No relevant information found in the knowledge base." };
          }
          return {
            results: results.map((r) => ({
              source: r.metadata.filename,
              score: Math.round(r.score * 100),
              content: r.metadata.content,
            })),
          };
        } catch {
          return { results: [], note: "Knowledge base is temporarily unavailable." };
        }
      },
    }),

    /**
     * Fetch Mehdi's most recently updated public GitHub repositories (live data,
     * so answers about his work are never stale).
     */
    getLatestProjects: tool({
      description:
        "Fetch Mehdi's latest public GitHub projects (name, description, language, stars). Use this when the user asks what he's building, his recent projects, or his GitHub activity.",
      parameters: jsonSchema<{ limit?: number }>({
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "How many projects to return (1-10, default 5)",
          },
        },
        additionalProperties: false,
      }),
      execute: async ({ limit }) => {
        const count = Math.min(Math.max(limit ?? 5, 1), 10);
        try {
          const res = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=${count}`,
            { headers: { Accept: "application/vnd.github+json" } }
          );
          if (!res.ok) {
            return { projects: [], note: "Could not reach GitHub right now." };
          }
          const repos = (await res.json()) as Array<{
            name: string;
            description: string | null;
            html_url: string;
            language: string | null;
            stargazers_count: number;
            fork: boolean;
          }>;
          return {
            projects: repos
              .filter((r) => !r.fork)
              .slice(0, count)
              .map((r) => ({
                name: r.name,
                description: r.description || "No description",
                language: r.language || "N/A",
                stars: r.stargazers_count,
                url: r.html_url,
              })),
          };
        } catch {
          return { projects: [], note: "Could not reach GitHub right now." };
        }
      },
    }),

    /**
     * Capture a lead when a visitor (e.g. a recruiter) expresses interest.
     */
    captureLead: tool({
      description:
        "Save a visitor's contact details when they express interest in hiring, collaborating, or being contacted by Mehdi. Only call this after the user has clearly shared their name and email.",
      parameters: jsonSchema<{
        name: string;
        email: string;
        company?: string;
        message?: string;
      }>({
        type: "object",
        properties: {
          name: { type: "string", description: "The visitor's full name" },
          email: { type: "string", description: "The visitor's email address" },
          company: { type: "string", description: "The visitor's company or organization" },
          message: { type: "string", description: "A short note about what they're interested in" },
        },
        required: ["name", "email"],
        additionalProperties: false,
      }),
      execute: async ({ name, email, company, message }) => {
        if (!isValidEmail(email)) {
          return { status: "error", note: "That email doesn't look valid. Please ask the user to confirm it." };
        }
        try {
          await prisma.lead.create({
            data: { name, email, company: company ?? null, message: message ?? null },
          });
          return {
            status: "saved",
            confirmation: `Thanks ${name}! Your details have been shared with Mehdi and he'll be in touch at ${email}.`,
          };
        } catch {
          return { status: "error", note: "Could not save the lead right now." };
        }
      },
    }),

    /**
     * Record a meeting request and return a booking link if configured.
     */
    bookMeeting: tool({
      description:
        "Record a request to meet or call with Mehdi. Call this when the user wants to schedule a meeting, interview, or chat. Collect their name and email first.",
      parameters: jsonSchema<{
        name: string;
        email: string;
        preferredDate?: string;
        topic?: string;
      }>({
        type: "object",
        properties: {
          name: { type: "string", description: "The visitor's full name" },
          email: { type: "string", description: "The visitor's email address" },
          preferredDate: {
            type: "string",
            description: "The visitor's preferred date/time in their own words",
          },
          topic: { type: "string", description: "What the meeting is about" },
        },
        required: ["name", "email"],
        additionalProperties: false,
      }),
      execute: async ({ name, email, preferredDate, topic }) => {
        if (!isValidEmail(email)) {
          return { status: "error", note: "That email doesn't look valid. Please ask the user to confirm it." };
        }
        try {
          await prisma.meetingRequest.create({
            data: {
              name,
              email,
              preferredDate: preferredDate ?? null,
              topic: topic ?? null,
            },
          });
          return {
            status: "requested",
            bookingUrl: BOOKING_URL || undefined,
            confirmation: BOOKING_URL
              ? `Got it, ${name}! You can lock in a time here: ${BOOKING_URL}. Mehdi has also been notified.`
              : `Got it, ${name}! Your meeting request has been sent to Mehdi and he'll reach out at ${email} to confirm a time.`,
          };
        } catch {
          return { status: "error", note: "Could not record the meeting request right now." };
        }
      },
    }),

    /**
     * Share Mehdi's resume/CV link.
     */
    sendResume: tool({
      description:
        "Provide a link to Mehdi's resume/CV. Use this when the user asks for his resume, CV, or portfolio document.",
      parameters: jsonSchema<{ email?: string }>({
        type: "object",
        properties: {
          email: { type: "string", description: "Optional email to note who requested the resume" },
        },
        additionalProperties: false,
      }),
      execute: async ({ email }) => {
        // Note: email delivery isn't configured; we return a link instead.
        if (email && isValidEmail(email)) {
          try {
            await prisma.lead.create({
              data: { name: "Resume request", email, source: "resume", message: "Requested resume" },
            });
          } catch {
            // non-fatal
          }
        }
        if (!RESUME_URL) {
          return {
            note: "Mehdi's resume link isn't configured yet. Suggest connecting via LinkedIn or email instead.",
          };
        }
        return { resumeUrl: RESUME_URL, message: `Here's Mehdi's resume: ${RESUME_URL}` };
      },
    }),
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
