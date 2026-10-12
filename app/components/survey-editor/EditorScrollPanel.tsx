import type { ReactNode } from "react";
import { EditorScrollRegion } from "./EditorScrollRegion";
import styles from "./editor-scroll-panel.module.css";

interface EditorScrollPanelProps {
  accessibilityLabel: string;
  header?: ReactNode;
  children: ReactNode;
}

/** Full-height side column: pinned header + scrollable body. */
export function EditorScrollPanel({
  accessibilityLabel,
  header,
  children,
}: EditorScrollPanelProps) {
  return (
    <div className={styles.columnFill}>
      <div className={styles.panelBorder}>
        <div className={styles.panelShell}>
          {header ? (
            <div className={styles.panelHeader}>
              <s-box padding="base" paddingBlockEnd="small-200">
                {header}
              </s-box>
            </div>
          ) : null}
          <EditorScrollRegion
            accessibilityLabel={accessibilityLabel}
            compactTop={Boolean(header)}
          >
            {children}
          </EditorScrollRegion>
        </div>
      </div>
    </div>
  );
}
