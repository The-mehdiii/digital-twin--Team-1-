// @ts-check
const path = require("path");
const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable unused browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS — enforce HTTPS for 1 year
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Basic CSP — allow self + trusted origins
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed by Next.js dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.groq.com https://*.upstash.io https://*.neon.tech wss:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry organisation + project (set these in your Sentry project settings)
  // org: "your-org",
  // project: "digital-twin",

  // Only upload source maps during a real CI/CD build, not local dev
  silent: !process.env.CI,

  // Upload source maps so Sentry shows original TypeScript in stack traces
  // Requires SENTRY_AUTH_TOKEN env var (get from sentry.io → Settings → Auth Tokens)
  sourcemaps: {
    disable: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  // Automatically instrument Next.js API routes & server components
  webpack: {
    autoInstrumentServerFunctions: true,
  },

  // Tunnel Sentry requests through your own domain to avoid ad blockers
  tunnelRoute: "/monitoring",
});
