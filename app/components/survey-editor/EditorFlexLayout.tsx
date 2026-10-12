import type { CSSProperties, ReactNode } from "react";

/**
 * Max-modal editor layout helpers.
 *
 * Polaris `Box` / `BlockStack` do not expose flex-grow or a full-height page shell
 * (unlike admin `Page`). These wrappers are the minimal non-CSS fallback so the
 * toolbar stays pinned and the three-column body fills the measured iframe height.
 */

const columnShell: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
};

const flexMain: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "hidden",
};

const gridShell: CSSProperties = {
  display: "grid",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  gridTemplateRows: "minmax(0, 1fr)",
  alignContent: "stretch",
};

/** Root column: toolbar + main editor grid. */
export function EditorFlexColumn({
  children,
  gap = "var(--p-space-200)",
  style,
}: {
  children: ReactNode;
  gap?: string;
  style?: CSSProperties;
}) {
  return <div style={{ ...columnShell, gap, ...style }}>{children}</div>;
}

/** Region below the toolbar that should consume remaining height. */
export function EditorFlexMain({ children }: { children: ReactNode }) {
  return <div style={flexMain}>{children}</div>;
}

/**
 * Three-column editor body. Replaces `InlineGrid` here so rows stay within the
 * measured modal height (`minmax(0, 1fr)`); otherwise grid rows grow with content
 * and the iframe scrolls.
 */
export function EditorGridShell({
  children,
  gridTemplateColumns,
  gap = "var(--p-space-200)",
}: {
  children: ReactNode;
  gridTemplateColumns: string;
  gap?: string;
}) {
  return (
    <div style={{ ...gridShell, gridTemplateColumns, gap }}>{children}</div>
  );
}

/** Grid column cell: stretch to row height without growing the iframe. */
export function EditorGridCell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

/** Full-height surface wrapper (Polaris Box has no height/flex props in our types). */
export function EditorFillBox({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
      {children}
    </div>
  );
}
