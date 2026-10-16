import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminEnrichmentNeeded,
  isShopifyOrderGid,
  mergeSubmissionContext,
} from "./submission-context-merge.ts";

describe("isShopifyOrderGid", () => {
  it("accepts Admin order GIDs", () => {
    assert.equal(
      isShopifyOrderGid("gid://shopify/Order/7290837598498"),
      true,
    );
  });

  it("rejects OrderIdentity and surrogates", () => {
    assert.equal(
      isShopifyOrderGid("gid://shopify/OrderIdentity/0"),
      false,
    );
    assert.equal(isShopifyOrderGid("cart:abc"), false);
  });
});

describe("mergeSubmissionContext", () => {
  it("client wins over patch for non-empty values", () => {
    const merged = mergeSubmissionContext(
      { orderName: "#1006", customerEmail: "a@b.com" },
      { orderName: "#9999", customerName: "Patch Name" },
    );
    assert.equal(merged.orderName, "#1006");
    assert.equal(merged.customerEmail, "a@b.com");
    assert.equal(merged.customerName, "Patch Name");
  });
});

describe("adminEnrichmentNeeded", () => {
  it("false for sparse channel-only context", () => {
    assert.equal(
      adminEnrichmentNeeded("gid://survey-response/Session/abc", {
        channelType: "siteWidget",
      }),
      false,
    );
  });

  it("true when order GID missing order name", () => {
    assert.equal(
      adminEnrichmentNeeded("gid://shopify/Order/123", {}),
      true,
    );
  });

  it("true for email lookup when customer id missing", () => {
    assert.equal(
      adminEnrichmentNeeded("cart:token", {
        customerEmail: "buyer@example.com",
      }),
      true,
    );
  });
});
