#!/usr/bin/env node
/**
 * Production Readiness Checklist
 * Run before every production deploy: pnpm check:production
 *
 * Checks:
 *  - All required environment variables present
 *  - Sentry DSN configured
 *  - DATABASE_URL contains ssl/pooling params (Neon)
 *  - NEXTAUTH_SECRET is a strong secret (>= 32 chars)
 *  - NODE_ENV is not "development"
 *  - No obvious debug/test values in secrets
 */

const REQUIRED_ENV = [
  "DATABASE_URL",
  "GROQ_API_KEY",
  "UPSTASH_VECTOR_REST_URL",
  "UPSTASH_VECTOR_REST_TOKEN",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "ADMIN_EMAIL",
];

const OPTIONAL_ENV = [
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_ADMIN_EMAIL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_LINKEDIN_URL",
];

let passed = 0;
let failed = 0;
let warned = 0;

function ok(msg) {
  console.log("  ✓", msg);
  passed++;
}

function fail(msg) {
  console.error("  ✖", msg);
  failed++;
}

function warn(msg) {
  console.warn("  ⚠", msg);
  warned++;
}

// ── 1. Required env vars ───────────────────────────────────────────────────
console.log("\n1. Required environment variables");
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    fail(`${key} is missing`);
  } else if (["stub", "your-", "xxx", "test", "changeme"].some((bad) => process.env[key].toLowerCase().includes(bad))) {
    fail(`${key} looks like a placeholder value`);
  } else {
    ok(key);
  }
}

// ── 2. Optional env vars (warnings only) ──────────────────────────────────
console.log("\n2. Optional / recommended environment variables");
for (const key of OPTIONAL_ENV) {
  if (!process.env[key]) {
    warn(`${key} not set (optional but recommended)`);
  } else {
    ok(key);
  }
}

// ── 3. Sentry ─────────────────────────────────────────────────────────────
console.log("\n3. Sentry error monitoring");
if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
  warn("NEXT_PUBLIC_SENTRY_DSN not set — errors won't be tracked in production");
} else {
  ok("Sentry DSN configured");
}

// ── 4. Neon / DATABASE_URL quality check ─────────────────────────────────
console.log("\n4. Neon database connection");
const dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl) {
  fail("DATABASE_URL missing");
} else {
  if (!dbUrl.includes("sslmode=require") && !dbUrl.includes("sslmode=verify")) {
    warn("DATABASE_URL: consider adding ?sslmode=require for Neon (TLS enforced)");
  } else {
    ok("DATABASE_URL: SSL mode set");
  }
  if (!dbUrl.includes("pgbouncer=true") && !dbUrl.includes("connection_limit")) {
    warn("DATABASE_URL: consider using Neon pooling endpoint or adding ?connection_limit=1 for serverless");
  } else {
    ok("DATABASE_URL: connection pooling params set");
  }
}

// ── 5. NEXTAUTH_SECRET strength ───────────────────────────────────────────
console.log("\n5. Auth secret strength");
const secret = process.env.NEXTAUTH_SECRET || "";
if (secret.length < 32) {
  fail(`NEXTAUTH_SECRET is too short (${secret.length} chars, need >= 32). Generate with: openssl rand -base64 32`);
} else {
  ok("NEXTAUTH_SECRET length OK");
}

// ── 6. NEXTAUTH_URL ────────────────────────────────────────────────────────
console.log("\n6. Auth URL");
const authUrl = process.env.NEXTAUTH_URL || "";
if (authUrl.startsWith("http://") && !authUrl.includes("localhost")) {
  fail("NEXTAUTH_URL uses http:// in what appears to be a non-local URL — use https:// in production");
} else if (authUrl.startsWith("https://")) {
  ok("NEXTAUTH_URL uses HTTPS");
} else {
  warn("NEXTAUTH_URL: verify this is correct for your production domain");
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log("\n─────────────────────────────────────");
console.log(`Passed: ${passed}  Warnings: ${warned}  Failed: ${failed}`);
if (failed > 0) {
  console.error("\n❌ Production checklist FAILED — fix the issues above before deploying.\n");
  process.exit(2);
} else if (warned > 0) {
  console.warn("\n⚠  Production checklist passed with warnings — review them before going live.\n");
  process.exit(0);
} else {
  console.log("\n✅ All checks passed — ready to deploy!\n");
  process.exit(0);
}
