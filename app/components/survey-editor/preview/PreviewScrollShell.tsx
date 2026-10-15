import type { CSSProperties, ReactNode } from "react";

const shell: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
};

const scrollBody: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  outline: "none",
};

const footer: CSSProperties = {
  flexShrink: 0,
  borderTop: "var(--p-border-width-025) solid var(--p-color-border)",
  background: "var(--p-color-bg-surface)",
};

interface PreviewScrollShellProps {
  children: ReactNode;
  footer: ReactNode;
  background?: string;
}

/**
 * Preview column: scrollable mock surface + pinned footer (SEA help / demo reset).
 * Native overflow avoids Polaris `Scrollable` focus rings on click.
 */
export function PreviewScrollShell({
  children,
  footer: footerContent,
  background = "var(--p-color-bg-surface-secondary)",
}: PreviewScrollShellProps) {
  return (
    <div style={{ ...shell, background }}>
      <div style={scrollBody} tabIndex={-1}>
        {children}
      </div>
      <div style={footer}>{footerContent}</div>
    </div>
  );
}
