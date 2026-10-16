import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkRateLimit } from "./rate-limit.server.ts";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const config = { max: 2, windowMs: 60_000 };
    assert.equal(checkRateLimit("shop-a", config).allowed, true);
    assert.equal(checkRateLimit("shop-a", config).allowed, true);
  });

  it("blocks when limit exceeded", () => {
    const config = { max: 1, windowMs: 60_000 };
    assert.equal(checkRateLimit("shop-b", config).allowed, true);
    const blocked = checkRateLimit("shop-b", config);
    assert.equal(blocked.allowed, false);
    if (!blocked.allowed) {
      assert.ok(blocked.retryAfterSeconds >= 1);
    }
  });
});
