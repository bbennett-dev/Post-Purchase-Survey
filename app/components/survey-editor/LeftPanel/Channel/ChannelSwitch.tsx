import { UnstyledButton } from "@shopify/polaris";

interface ChannelSwitchProps {
  enabled: boolean;
  accessibilityLabel: string;
  onChange: (enabled: boolean) => void;
}

/**
 * Pill switch matching Shopify admin app-embed toggles (Polaris has no Switch export).
 */
export function ChannelSwitch({
  enabled,
  accessibilityLabel,
  onChange,
}: ChannelSwitchProps) {
  return (
    <UnstyledButton
      role="switch"
      aria-checked={enabled}
      aria-label={accessibilityLabel}
      onClick={() => onChange(!enabled)}
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        boxShadow: "none",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          width: 36,
          height: 20,
          padding: 2,
          borderRadius: 10,
          boxSizing: "border-box",
          background: enabled
            ? "var(--p-color-bg-fill-inverse)"
            : "var(--p-color-bg-fill-secondary)",
          transition: "background 120ms ease",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: "var(--p-color-bg-surface)",
            transform: enabled ? "translateX(16px)" : "translateX(0)",
            transition: "transform 120ms ease",
            boxShadow: "var(--p-shadow-100)",
          }}
        />
      </span>
    </UnstyledButton>
  );
}
