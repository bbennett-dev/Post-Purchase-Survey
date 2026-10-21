import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fixDevSingleFetchHtmlOrder } from "./fix-dev-single-fetch-html.server.ts";

describe("fixDevSingleFetchHtmlOrder", () => {
  it("moves turbo-stream scripts before entry.client and drops module async", () => {
    const tail =
      '<!--$--><script>window.__reactRouterContext.streamController.enqueue("x");</script><!--$--><script>window.__reactRouterContext.streamController.close();</script><!--/$--><!--/$-->';
    const html =
      "<html><body>" +
      '<script type="module" async="">import("/app/entry.client.tsx");</script>' +
      "</body></html>" +
      tail;

    const fixed = fixDevSingleFetchHtmlOrder(html);
    const closeIndex = fixed.indexOf("streamController.close()");
    const entryIndex = fixed.indexOf('import("/app/entry.client.tsx")');

    assert.ok(closeIndex > -1);
    assert.ok(entryIndex > closeIndex);
    assert.doesNotMatch(fixed, /<\/html>\s*<!--\$-->/);
    assert.equal(fixed.includes('type="module" async'), false);
  });
});
