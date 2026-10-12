import type { CSSProperties, ReactNode } from "react";
import { Box } from "@shopify/polaris";

interface EditorScrollPanelProps {
  accessibilityLabel: string;
  header?: ReactNode;
  children: ReactNode;
  /** Outer card border; off for competitor-style left column. */
  bordered?: boolean;
}

/** Flex column shell: fills the grid cell; does not grow with content. */
function panelShell(bordered: boolean): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    minHeight: 0,
    overflow: "hidden",
    background: "var(--p-color-bg-surface)",
    ...(bordered
      ? {
          border: "var(--p-border-width-025) solid var(--p-color-border)",
          borderRadius: "var(--p-border-radius-200)",
        }
      : {}),
  };
}

/** Scrollable body — native overflow is reliable when flex parents use minHeight: 0. */
const panelBody: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
};

/**
 * Side column: pinned header (name, tabs) + scrollable tab content.
 * Uses overflow on a flex child instead of Polaris Scrollable (needs a strict height cap).
 */
export function EditorScrollPanel({
  accessibilityLabel,
  header,
  children,
  bordered = true,
}: EditorScrollPanelProps) {
  return (
    <div style={panelShell(bordered)}>
      {header ? (
        <Box padding="400" paddingBlockEnd="200">
          {header}
        </Box>
      ) : null}
      <div
        role="region"
        aria-label={accessibilityLabel}
        style={panelBody}
      >
        <Box
          padding="400"
          paddingBlockStart={header ? "0" : "400"}
        >
          {children}
        </Box>
      </div>
    </div>
  );
}
