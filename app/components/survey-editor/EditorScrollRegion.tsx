import type { CSSProperties, ReactNode } from "react";
import { Box } from "@shopify/polaris";

interface EditorScrollRegionProps {
  accessibilityLabel: string;
  children: ReactNode;
  compactTop?: boolean;
}

const regionScroll: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
};

/**
 * Scrollable region inside a flex column parent (e.g. advanced-logic placeholder).
 */
export function EditorScrollRegion({
  accessibilityLabel,
  children,
  compactTop = false,
}: EditorScrollRegionProps) {
  return (
    <div role="region" aria-label={accessibilityLabel} style={regionScroll}>
      <Box
        padding="400"
        paddingBlockStart={compactTop ? "0" : "400"}
      >
        {children}
      </Box>
    </div>
  );
}
