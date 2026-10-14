import { BlockStack, InlineGrid, RangeSlider, Text, TextField } from "@shopify/polaris";

export interface GradientDirectionControlProps {
  value: number;
  onChange: (degrees: number) => void;
}

function clampDegrees(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(360, Math.max(0, Math.round(value)));
}

function parseDegreesInput(raw: string): number | null {
  const cleaned = raw.replace(/deg/gi, "").trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? clampDegrees(parsed) : null;
}

/** Slider + `70 deg` field (competitor “Gradient direction” row). */
export function GradientDirectionControl({
  value,
  onChange,
}: GradientDirectionControlProps) {
  const degrees = clampDegrees(value);

  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodyMd">
        Gradient direction
      </Text>
      <InlineGrid columns="1fr 5.5rem" gap="200" alignItems="center">
        <RangeSlider
          label="Gradient direction"
          labelHidden
          value={degrees}
          min={0}
          max={360}
          output={false}
          onChange={(next) =>
            onChange(
              clampDegrees(typeof next === "number" ? next : next[0]),
            )
          }
        />
        <TextField
          label="Gradient direction degrees"
          labelHidden
          value={`${degrees} deg`}
          onChange={(input) => {
            const parsed = parseDegreesInput(input);
            if (parsed !== null) {
              onChange(parsed);
            }
          }}
          autoComplete="off"
        />
      </InlineGrid>
    </BlockStack>
  );
}
