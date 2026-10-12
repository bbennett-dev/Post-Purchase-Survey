import { Box, Text } from "@shopify/polaris";

interface SectionLabelProps {
  children: string;
  /** `content` = first block under tabs; `endings` = after divider. */
  variant?: "content" | "endings";
}

/** List section title (Content, Endings) — spacing via Polaris `Box` tokens. */
export function SectionLabel({
  children,
  variant = "content",
}: SectionLabelProps) {
  return (
    <Box
      paddingInline="200"
      paddingBlockStart={variant === "endings" ? "600" : "500"}
      paddingBlockEnd="300"
    >
      <Text as="p" variant="bodySm" tone="subdued" fontWeight="semibold">
        {children.toUpperCase()}
      </Text>
    </Box>
  );
}
