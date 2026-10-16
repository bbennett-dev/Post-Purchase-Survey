import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeShopifyCustomerId,
  shopifyCustomerIdMatchValues,
} from "./customer-id.server.ts";

describe("normalizeShopifyCustomerId", () => {
  it("accepts numeric and gid forms", () => {
    assert.equal(normalizeShopifyCustomerId(42), "42");
    assert.equal(normalizeShopifyCustomerId("42"), "42");
    assert.equal(
      normalizeShopifyCustomerId("gid://shopify/Customer/99"),
      "99",
    );
  });

  it("returns null for invalid input", () => {
    assert.equal(normalizeShopifyCustomerId(""), null);
    assert.equal(normalizeShopifyCustomerId("not-an-id"), null);
  });
});

describe("shopifyCustomerIdMatchValues", () => {
  it("returns numeric and gid variants", () => {
    assert.deepEqual(shopifyCustomerIdMatchValues("5"), [
      "5",
      "gid://shopify/Customer/5",
    ]);
  });
});
