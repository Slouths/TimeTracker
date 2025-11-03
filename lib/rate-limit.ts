import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Create rate limiter (10 requests per 10 seconds)
export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'tradetimer',
    })
  : null

// More strict rate limit for sensitive operations (5 requests per minute)
export const strictRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'tradetimer_strict',
    })
  : null

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  identifier: string,
  strict: boolean = false
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = strict ? strictRatelimit : ratelimit

  if (!limiter) {
    // If rate limiting is not configured, allow the request
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
