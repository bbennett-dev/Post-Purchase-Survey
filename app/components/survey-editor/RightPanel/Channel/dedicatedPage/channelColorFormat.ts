import type { ColorResult } from "@uiw/color-convert";
import { hexToHsva, validHex } from "@uiw/color-convert";

/** Normalize stored hex for display (always includes `#`). */
export function formatColorForDisplay(value: string | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "#FFFFFF";
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  return withHash.toUpperCase();
}

export function colorForPicker(value: string | undefined): string {
  const formatted = formatColorForDisplay(value);
  return validHex(formatted) ? formatted : "#FFFFFF";
}

/** Persist alpha when transparency is used (e.g. button hover). */
export function colorResultToStored(color: ColorResult): string {
  const alpha = color.hsva.a;
  if (alpha < 1) {
    return color.hexa.toUpperCase();
  }
  return color.hex.toUpperCase();
}

export function cssColorFromStored(value: string | undefined): string {
  const formatted = formatColorForDisplay(value);
  if (!validHex(formatted)) {
    return "#FFFFFF";
  }
  if (formatted.length === 9) {
    const hsva = hexToHsva(formatted);
    const a = hsva.a;
    return `rgba(${colorChannel(formatted, 1)}, ${colorChannel(formatted, 3)}, ${colorChannel(formatted, 5)}, ${a})`;
  }
  return formatted;
}

function colorChannel(hex: string, index: number): number {
  return parseInt(hex.slice(index, index + 2), 16);
}
