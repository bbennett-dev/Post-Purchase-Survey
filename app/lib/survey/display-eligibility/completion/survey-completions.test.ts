import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeSurveyCompletion,
  parseSurveyCompletionsMetafield,
  surveyCompletedInMap,
} from "./survey-completions.ts";

describe("mergeSurveyCompletion", () => {
  it("adds a survey key without dropping existing entries", () => {
    const merged = mergeSurveyCompletion(
      {
        "survey-a": {
          completedAt: "2026-01-01T00:00:00.000Z",
          orderId: "gid://shopify/Order/1",
        },
      },
      "survey-b",
      "gid://shopify/Order/2",
      "2026-02-01T00:00:00.000Z",
    );
    assert.equal(Object.keys(merged).length, 2);
    assert.equal(merged["survey-b"]?.orderId, "gid://shopify/Order/2");
  });
});

describe("surveyCompletedInMap", () => {
  it("detects completion by survey uuid", () => {
    assert.equal(
      surveyCompletedInMap({ "uuid-1": { completedAt: "x", orderId: "y" } }, "uuid-1"),
      true,
    );
    assert.equal(surveyCompletedInMap({}, "uuid-1"), false);
  });
});

describe("parseSurveyCompletionsMetafield", () => {
  it("returns empty object for invalid json", () => {
    assert.deepEqual(parseSurveyCompletionsMetafield("not-json"), {});
  });
});
