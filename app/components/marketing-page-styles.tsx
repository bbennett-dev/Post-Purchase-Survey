import appHomeCss from "../styles/app-home.css?inline";
import privacyLegalCss from "../styles/privacy-legal.css?inline";
import type { MarketingStyleSurface } from "../lib/styles/public-marketing-links";

const MARKETING_INLINE_CSS: Record<MarketingStyleSurface, string> = {
  appHome: appHomeCss,
  privacyLegal: privacyLegalCss,
};

/**
 * First paint styling for public marketing routes. Inline CSS in the document
 * body (first node) avoids an external stylesheet round-trip before layout.
 */
export function MarketingPageStyles({
  surface,
}: {
  surface: MarketingStyleSurface;
}) {
  return (
    <style
      dangerouslySetInnerHTML={{ __html: MARKETING_INLINE_CSS[surface] }}
    />
  );
}
