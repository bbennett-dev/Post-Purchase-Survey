import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type { SketchProps } from "@uiw/react-color-sketch";
import { BlockStack, InlineGrid, Popover, Text } from "@shopify/polaris";
import { CHANNEL_COLOR_PRESET_SWATCHES } from "./channelColorPresets";
import {
  colorForPicker,
  colorResultToStored,
  cssColorFromStored,
  formatColorForDisplay,
} from "./channelColorFormat";

export interface ChannelColorPickerRowProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const activatorStyle: CSSProperties = {
  width: "100%",
  margin: 0,
  padding: 0,
  border: "none",
  background: "transparent",
  boxShadow: "none",
  outline: "none",
  textAlign: "left",
  cursor: "pointer",
  font: "inherit",
  color: "inherit",
};

/**
 * Color row: swatch + label opens Sketch picker only (no extra popover chrome).
 */
export function ChannelColorPickerRow({
  label,
  value,
  onChange,
}: ChannelColorPickerRowProps) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [SketchPicker, setSketchPicker] = useState<ComponentType<SketchProps> | null>(
    null,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active || SketchPicker) {
      return;
    }
    let cancelled = false;
    void import("@uiw/react-color-sketch").then((module) => {
      if (!cancelled) {
        setSketchPicker(() => module.default);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [active, SketchPicker]);

  const display = formatColorForDisplay(value);
  const swatchColor = cssColorFromStored(value);

  const close = useCallback(() => setActive(false), []);

  const toggle = useCallback(() => setActive((open) => !open), []);

  const onActivatorKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
      if (event.key === "Escape") {
        close();
      }
    },
    [close, toggle],
  );

  const activator = (
    <div
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={onActivatorKeyDown}
      aria-label={`Edit ${label} color`}
      aria-expanded={active}
      style={activatorStyle}
    >
      <InlineGrid columns="auto 1fr" gap="300" alignItems="center">
        <span
          aria-hidden
          style={{
            display: "block",
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "9999px",
            border: "var(--p-border-width-025) solid var(--p-color-border)",
            backgroundColor: swatchColor,
            flexShrink: 0,
          }}
        />
        <BlockStack gap="050">
          <Text as="p" variant="bodyMd">
            {label}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {display}
          </Text>
        </BlockStack>
      </InlineGrid>
    </div>
  );

  return (
    <Popover
      active={active}
      activator={activator}
      onClose={close}
      preferredAlignment="left"
      autofocusTarget="none"
      sectioned={false}
      fluidContent
    >
      {mounted && active && SketchPicker ? (
        <SketchPicker
          color={colorForPicker(value)}
          width={280}
          presetColors={CHANNEL_COLOR_PRESET_SWATCHES}
          onChange={(color) => onChange(colorResultToStored(color))}
        />
      ) : null}
    </Popover>
  );
}
