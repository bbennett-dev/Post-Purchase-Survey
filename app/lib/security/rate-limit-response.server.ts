import type { RateLimitResult } from "./rate-limit.server";

export function rateLimitExceededResponse(
  result: Extract<RateLimitResult, { allowed: false }>,
): Response {
  return Response.json(
    { ok: false, error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}
