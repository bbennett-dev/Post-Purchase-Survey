import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { serverlessDatabaseUrl } from "./serverless-database-url.server.ts";

describe("serverlessDatabaseUrl", () => {
  it("reuses a Neon pooler host and opens one connection", () => {
    const url = serverlessDatabaseUrl(
      "postgresql://user:p%40ssword@ep-example-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    );

    assert.match(
      url,
      /postgresql:\/\/user:p%40ssword@ep-example-pooler\.c-4\.us-east-2\.aws\.neon\.tech\/neondb\?/,
    );
    assert.match(url, /(?:^|&)connection_limit=1(?:&|$)/);
    assert.match(url, /(?:^|&)pool_timeout=15(?:&|$)/);
    assert.match(url, /(?:^|&)connect_timeout=15(?:&|$)/);
    assert.match(url, /sslmode=require/);
    assert.match(url, /channel_binding=require/);
    assert.doesNotMatch(url, /-pooler-pooler/);
  });

  it("sends a direct Neon host through the pooler", () => {
    const url = serverlessDatabaseUrl(
      "postgresql://user:secret@ep-example.c-4.us-east-2.aws.neon.tech:5432/neondb?sslmode=require",
    );

    assert.match(
      url,
      /@ep-example-pooler\.c-4\.us-east-2\.aws\.neon\.tech:5432\/neondb\?/,
    );
  });

  it("keeps explicit pool params from the env URL", () => {
    const url = serverlessDatabaseUrl(
      "postgresql://user:secret@ep-example-pooler.c-4.us-east-2.aws.neon.tech/neondb?connection_limit=2&pool_timeout=30&connect_timeout=20",
    );

    assert.match(url, /connection_limit=2/);
    assert.match(url, /pool_timeout=30/);
    assert.match(url, /connect_timeout=20/);
  });

  it("leaves a non-Neon host unchanged", () => {
    const url = serverlessDatabaseUrl(
      "postgresql://user:secret@localhost:5432/app",
    );

    assert.match(url, /@localhost:5432\/app\?/);
    assert.match(url, /connection_limit=1/);
  });
});
