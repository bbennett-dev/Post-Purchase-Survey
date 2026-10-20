import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SurveyDocument } from "./types.ts";
import { isSurveyChannelEnabled } from "./runtime-channels.ts";

function minimalDocument(
  channels: SurveyDocument["channels"],
  channelTypes: string[] = [],
): SurveyDocument {
  return {
    name: "Test",
    isActive: false,
    surveyType: "survey",
    templateType: "blank",
    advancedLogicEnabled: false,
    sections: [],
    questions: [],
    thankYou: { heading: "Thanks" },
    thankYouCards: [],
    channels,
    channelTypes,
    discount: { enabled: false },
    translation: {},
  };
}

describe("isSurveyChannelEnabled", () => {
  it("respects channels.enabled === true", () => {
    const document = minimalDocument({
      postPurchasePage: { enabled: true },
    });
    assert.equal(isSurveyChannelEnabled(document, "postPurchasePage"), true);
  });

  it("respects channels.enabled === false", () => {
    const document = minimalDocument(
      { postPurchasePage: { enabled: false } },
      ["postPurchasePage"],
    );
    assert.equal(isSurveyChannelEnabled(document, "postPurchasePage"), false);
  });

  it("falls back to channelTypes when enabled is omitted", () => {
    const document = minimalDocument(
      { postPurchasePage: { type: "postPurchasePage" } },
      ["postPurchasePage"],
    );
    assert.equal(isSurveyChannelEnabled(document, "postPurchasePage"), true);
  });
});
