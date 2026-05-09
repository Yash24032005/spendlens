// Simple in-memory rate limiter for API routes
// For production, use Redis or Upstash

const ipMap = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.reset) {
    ipMap.set(ip, { count: 1, reset: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= limit) {
    return false; // rate limited
  }

  entry.count++;
  return true;
}
