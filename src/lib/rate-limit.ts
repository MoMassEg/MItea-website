import { Ratelimit } from '@upstash/ratelimit';
import { redis, isRedisConfigured } from './redis';

// In-memory fallback for local dev when Upstash Redis is not configured
const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Creates a rate limiter instance.
 * Uses Upstash Redis if available, or in-memory map as a resilient local fallback.
 */
export function createRateLimiter(limit = 10, windowMs = 60 * 1000) {
  if (isRedisConfigured && redis) {
    const upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
      analytics: false,
    });

    return {
      async limit(identifier: string) {
        const result = await upstashLimiter.limit(identifier);
        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        };
      },
    };
  }

  // In-memory rate limiting fallback
  return {
    async limit(identifier: string) {
      const now = Date.now();
      const record = memoryStore.get(identifier);

      if (!record || now > record.resetAt) {
        memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: now + windowMs,
        };
      }

      if (record.count >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: record.resetAt,
        };
      }

      record.count += 1;
      return {
        success: true,
        limit,
        remaining: limit - record.count,
        reset: record.resetAt,
      };
    },
  };
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 mins for auth
export const apiRateLimiter = createRateLimiter(60, 60 * 1000); // 60 requests per minute for general API
