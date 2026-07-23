type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_GENERATIONS = 5;

export class RateLimitError extends Error {
  readonly code = "RATE_LIMITED";
  constructor(public readonly retryAfterSeconds: number) {
    super("Demasiadas generaciones. Intenta nuevamente en unos segundos.");
  }
}

export function assertGenerationRateLimit(identifier: string, now = Date.now()) {
  const current = buckets.get(identifier);
  if (!current || current.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  if (current.count >= MAX_GENERATIONS) throw new RateLimitError(Math.max(1, Math.ceil((current.resetAt - now) / 1000)));
  current.count++;
}

export function resetRateLimitsForTests() {
  buckets.clear();
}
