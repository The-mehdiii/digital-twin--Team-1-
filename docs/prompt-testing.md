# Prompt Testing & Evaluation

This document lists example prompts and expected behaviors to validate the RAG pipeline.

How to run the harness

1. Ensure `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN` are set in your environment or `.env.local`.
2. Optionally set `GROQ_API_KEY` to call the LLM; otherwise the harness will show retrieved context only.
3. Optionally set `TEST_USER_ID` to filter vector search to a specific user.

Run:

```bash
node scripts/prompt_eval.js
```

Example prompts

- `Summarize my experience in one sentence.`
  - Expected: RAG returns resume chunks; LLM (if used) returns a concise summary of experience.

- `What projects did I work on related to distributed systems?`
  - Expected: RAG returns chunks describing projects; LLM lists projects with short descriptions and citations (filename).

- `What did slide 2 say in the onboarding deck?`
  - Expected: If a PPTX was indexed, RAG should return the slide text as a chunk; LLM should quote or paraphrase the slide.

Validation checklist

- Retrieval: top results are relevant (look at `file` and `score`). Scores >= 0.6 are good for relevance.
- Context: `Context:` printed by the harness should contain the chunk text used to answer.
- LLM output: when `GROQ_API_KEY` is set, the reply should use context if relevant and cite sources where applicable.

Add new prompts to `scripts/prompt_eval.js` examples array for more coverage.
