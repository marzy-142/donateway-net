interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

class RateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.attempts = new Map();
    this.config = config;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return false;
    }

    // Reset if window has passed
    if (now - attempt.timestamp > this.config.windowMs) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return false;
    }

    // Increment attempts
    attempt.count += 1;
    return attempt.count > this.config.maxAttempts;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.config.maxAttempts;

    const remaining = this.config.maxAttempts - attempt.count;
    return Math.max(0, remaining);
  }
}

// Create a singleton instance with default config
export const rateLimiter = new RateLimiter({
  maxAttempts: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
});
