import type { CSSProperties, ReactNode } from "react";
import styles from "./preview-scroll-shell.module.css";

const shell: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
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
 * Preview column: scrollable mock surface + pinned footer (IKEO help / demo reset).
 * Native overflow avoids Polaris `Scrollable` focus rings on click.
 */
export function PreviewScrollShell({
  children,
  footer: footerContent,
  background = "var(--p-color-bg-surface-secondary)",
}: PreviewScrollShellProps) {
  return (
    <div style={{ ...shell, background }}>
      <div className={styles.scrollBody} tabIndex={-1}>
        {children}
      </div>
      <div style={footer}>{footerContent}</div>
    </div>
  );
}
