import type { ReactNode } from "react";
import styles from "./editor-scroll-panel.module.css";

interface EditorScrollRegionProps {
  accessibilityLabel: string;
  children: ReactNode;
  /** When true, omit top padding (content sits under a pinned header). */
  compactTop?: boolean;
}

/**
 * Bounded scroll area for App Home. Padding lives on an inner wrapper so the
 * scrollbar sits on the panel edge with a transparent track (thumb only).
 */
export function EditorScrollRegion({
  accessibilityLabel,
  children,
  compactTop = false,
}: EditorScrollRegionProps) {
  return (
    <div
      className={styles.scrollRegion}
      role="region"
      aria-label={accessibilityLabel}
      tabIndex={0}
    >
      <div
        className={
          compactTop ? styles.scrollRegionInnerCompactTop : styles.scrollRegionInner
        }
      >
        {children}
      </div>
    </div>
  );
}
