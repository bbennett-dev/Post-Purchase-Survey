import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { passesUserSegmentTargeting } from "./segment-targeting.ts";
import {
  passesWidgetRecurrence,
  widgetRecurrenceMode,
} from "./widget-recurrence.ts";

describe("passesUserSegmentTargeting", () => {
  it("allows all users by default", () => {
    assert.equal(
      passesUserSegmentTargeting(undefined, { lifecycle: "new" }),
      true,
    );
  });

  it("blocks new buyers when only return is selected", () => {
    assert.equal(
      passesUserSegmentTargeting(
        { userTargeting: { type: "segment", returnCustomer: true } },
        { lifecycle: "new" },
      ),
      false,
    );
    assert.equal(
      passesUserSegmentTargeting(
        { userTargeting: { type: "segment", returnCustomer: true } },
        { lifecycle: "return" },
      ),
      true,
    );
  });

  it("matches include tag groups", () => {
    assert.equal(
      passesUserSegmentTargeting(
        {
          userTargeting: {
            type: "segment",
            customerSegment: [
              {
                id: "1",
                name: "VIP",
                enabled: true,
                condition: {
                  field: "user_tag",
                  operator: "include",
                  tags: ["VIP"],
                },
              },
            ],
          },
        },
        { lifecycle: "unknown", customerTags: ["VIP"] },
      ),
      true,
    );
  });
});

describe("passesWidgetRecurrence", () => {
  it("honors once per customer", () => {
    assert.equal(
      passesWidgetRecurrence(
        { widgetRecurrence: "once_per_customer" },
        true,
      ),
      false,
    );
    assert.equal(
      passesWidgetRecurrence(
        { widgetRecurrence: "once_per_customer" },
        false,
      ),
      true,
    );
  });

  it("defaults to once per customer", () => {
    assert.equal(widgetRecurrenceMode(undefined), "once_per_customer");
  });
});
