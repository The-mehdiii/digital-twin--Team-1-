/**
 * Next.js Instrumentation file — initialises Sentry on server startup.
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Setup steps:
 *  1. pnpm add @sentry/nextjs
 *  2. Add NEXT_PUBLIC_SENTRY_DSN to your .env.local (get DSN from sentry.io → Project Settings → Client Keys)
 *  3. This file is auto-detected by Next.js — no further config needed for basic error tracking.
 */

export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry not configured — skip silently
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    });
  }
}

export const onRequestError = async (
  err: { digest?: string } & Error,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routePath: string; routeType: string }
) => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  const { captureRequestError } = await import("@sentry/nextjs");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  captureRequestError(err, request, context as any);
};
