import styles from "./section-label.module.css";

interface SectionLabelProps {
  children: string;
}

/**
 * List section title (Content, Endings). Uppercase is visual only;
 * the accessible name stays the sentence-case children string.
 */
export function SectionLabel({ children }: SectionLabelProps) {
  return <span className={styles.sectionLabel}>{children}</span>;
}
