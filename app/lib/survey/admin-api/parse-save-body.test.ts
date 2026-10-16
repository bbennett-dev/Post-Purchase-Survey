import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SurveyDocument } from "../types.ts";
import {
  parseSurveySaveRequestBody,
  SurveySaveBodyError,
} from "./parse-save-body.server.ts";

function minimalSurvey(overrides: Partial<SurveyDocument> = {}): SurveyDocument {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Test survey",
    isActive: false,
    surveyType: "survey",
    templateType: "blank",
    advancedLogicEnabled: false,
    sections: [],
    questions: [],
    thankYou: {
      type: "thank_you",
      thankYouType: "default",
      heading: "Thanks",
      description: "",
    },
    thankYouCards: [],
    channels: {},
    channelTypes: [],
    discount: { enabled: false },
    translation: {},
    ...overrides,
  };
}

describe("parseSurveySaveRequestBody", () => {
  it("accepts competitor-shaped { data } wrapper", () => {
    const doc = minimalSurvey();
    const parsed = parseSurveySaveRequestBody({ data: doc });
    assert.equal(parsed.id, doc.id);
    assert.equal(parsed.name, "Test survey");
  });

  it("accepts bare document", () => {
    const doc = minimalSurvey({
      id: "22222222-2222-4222-8222-222222222222",
      name: "Bare",
    });
    const parsed = parseSurveySaveRequestBody(doc);
    assert.equal(parsed.name, "Bare");
  });

  it("rejects missing name", () => {
    const doc = minimalSurvey({ name: "   " });
    assert.throws(
      () => parseSurveySaveRequestBody(doc),
      (error: unknown) =>
        error instanceof SurveySaveBodyError &&
        error.message === "Survey name is required",
    );
  });

  it("rejects invalid payload", () => {
    assert.throws(
      () => parseSurveySaveRequestBody(null),
      (error: unknown) => error instanceof SurveySaveBodyError,
    );
  });
});
