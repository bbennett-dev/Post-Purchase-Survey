import { Spinner, Text } from "@shopify/polaris";

/**
 * Blocks editor interaction while save/publish runs (competitor-style modal overlay).
 * SaveBar buttons cannot show App Bridge loading state reliably.
 */
export function EditorSaveOverlay({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--p-space-300)",
        backgroundColor: "rgba(255, 255, 255, 0.72)",
        pointerEvents: "auto",
      }}
    >
      <Spinner accessibilityLabel="Saving survey" size="large" />
      <Text as="p" tone="subdued">
        Saving…
      </Text>
    </div>
  );
}
