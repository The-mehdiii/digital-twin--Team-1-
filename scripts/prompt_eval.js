#!/usr/bin/env node
/*
  Prompt evaluation harness

  Usage:
    node scripts/prompt_eval.js

  Environment:
    UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN
    GROQ_API_KEY (optional)
    TEST_USER_ID (optional) - filter vectors by this userId
    TOP_K (optional)
*/

const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch;
const { Index } = require('@upstash/vector');

// Load .env.local if present
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) {
      let val = m[2];
      // strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] = val;
    }
  });
}

const UPSTASH_URL = process.env.UPSTASH_VECTOR_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TEST_USER_ID = process.env.TEST_USER_ID || process.env.ADMIN_USER_ID || null;
const TOP_K = parseInt(process.env.TOP_K || '3', 10);

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN in env');
  process.exit(1);
}

const vector = new Index({ url: UPSTASH_URL, token: UPSTASH_TOKEN });

const examples = [
  {
    id: 'resume-experience',
    prompt: 'Summarize my experience in one sentence.',
    description: 'Expect a short summary of the resume documents.'
  },
  {
    id: 'project-details',
    prompt: 'What projects did I work on related to distributed systems?',
    description: 'Expect results citing project names or descriptions from uploaded docs.'
  },
  {
    id: 'pptx-slide',
    prompt: 'What did slide 2 say in the onboarding deck?',
    description: 'Should retrieve slide text from PPTX if indexed.'
  }
];

async function queryVectors(query) {
  const opts = {
    data: query,
    topK: TOP_K,
    includeMetadata: true,
    includeVectors: false,
  };
  if (TEST_USER_ID) opts.filter = `userId = '${TEST_USER_ID}'`;
  try {
    const res = await vector.query(opts);
    return res.map(r => ({ id: String(r.id), score: r.score, metadata: r.metadata }));
  } catch (err) {
    console.error('Vector query failed:', err.message || err);
    return [];
  }
}

function formatContext(results) {
  if (!results || results.length === 0) return '';
  return results.map((r, i) => `Source ${i + 1} (${r.metadata.filename}):\n${r.metadata.content}`).join('\n\n---\n\n');
}

async function callGroq(prompt, system = 'You are a helpful assistant.') {
  if (!GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not set; skipping LLM call.');
    return null;
  }

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 1024,
  };

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Groq error ${resp.status}: ${t}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || null;
}

(async () => {
  console.log('Prompt evaluation harness');
  console.log('Using TEST_USER_ID:', TEST_USER_ID || 'none (global search)');
  console.log(`TOP_K=${TOP_K}`);

  for (const ex of examples) {
    console.log('\n=== Example:', ex.id, '===');
    console.log('Prompt:', ex.prompt);
    console.log('Description:', ex.description);

    const results = await queryVectors(ex.prompt);
    console.log('\nRetrieved', results.length, 'RAG results:');
    results.forEach((r, i) => {
      console.log(`- [${i+1}] score=${r.score.toFixed(3)} file=${r.metadata?.filename} chunkIndex=${r.metadata?.chunkIndex}`);
    });

    const context = formatContext(results);
    if (context) {
      console.log('\nContext:\n', context.slice(0, 1000) + (context.length > 1000 ? '\n...[truncated]' : ''));
    } else {
      console.log('\nNo RAG context found.');
    }

    if (GROQ_API_KEY) {
      try {
        const finalPrompt = context ? `${context}\n\nUser: ${ex.prompt}` : ex.prompt;
        const reply = await callGroq(finalPrompt);
        console.log('\nLLM Reply:\n', reply);
      } catch (err) {
        console.error('LLM call failed:', err.message || err);
      }
    } else {
      console.log('\nSkipping LLM call (no GROQ_API_KEY). Use the above context to validate retrieval.');
    }
  }

  console.log('\nDone');
})();
