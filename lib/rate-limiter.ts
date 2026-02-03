/**
 * Simple in-memory rate limiter for API routes
 * For production, use Redis-based rate limiting (Upstash)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxRequests: number;  // Max requests per window
  windowMs: number;     // Time window in milliseconds
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 20,      // 20 requests
  windowMs: 60 * 1000,  // per minute
};

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier (IP, userId, etc.)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  // If no entry exists or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  }

  // Check if over limit
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetIn.toString(),
  };
}

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
  chat: {
    maxRequests: 30,    // 30 chat requests
    windowMs: 60 * 1000, // per minute
  },
  upload: {
    maxRequests: 10,    // 10 uploads
    windowMs: 60 * 1000, // per minute
  },
  api: {
    maxRequests: 100,   // 100 general API calls
    windowMs: 60 * 1000, // per minute
  },
};
