import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_POST_PURCHASE_DISPLAY_TYPE,
  isPostPurchaseAnnouncementBar,
  postPurchaseDisplayType,
  resolvePostPurchaseAnnouncementCopy,
} from "./post-purchase-display.ts";

describe("postPurchaseDisplayType", () => {
  it("defaults to block when displayType is missing", () => {
    assert.equal(
      postPurchaseDisplayType(undefined),
      DEFAULT_POST_PURCHASE_DISPLAY_TYPE,
    );
    assert.equal(postPurchaseDisplayType({}), DEFAULT_POST_PURCHASE_DISPLAY_TYPE);
  });

  it("detects announcement bar mode", () => {
    assert.equal(
      isPostPurchaseAnnouncementBar({ displayType: "announcementBarType" }),
      true,
    );
    assert.equal(
      isPostPurchaseAnnouncementBar({ displayType: "blockType" }),
      false,
    );
  });
});

describe("resolvePostPurchaseAnnouncementCopy", () => {
  it("uses merchant copy when provided", () => {
    assert.deepEqual(
      resolvePostPurchaseAnnouncementCopy(
        {
          announcementBar: {
            modalTitle: "Title",
            content: "Hello",
            buttonText: "Go",
          },
        },
        "My survey",
      ),
      {
        modalTitle: "Title",
        content: "Hello",
        buttonText: "Go",
      },
    );
  });

  it("falls back when fields are empty", () => {
    assert.deepEqual(resolvePostPurchaseAnnouncementCopy({}, "Named survey"), {
      modalTitle: "Named survey",
      content: "We'd love to hear your feedback!",
      buttonText: "Take a quick survey",
    });
  });
});
