import type { CSSProperties } from "react";
import {
  Box,
  Icon,
  InlineGrid,
  Text,
  UnstyledButton,
} from "@shopify/polaris";
import type { CursorIcon } from "@shopify/polaris-icons";

const rowButton: CSSProperties = {
  display: "block",
  width: "100%",
  margin: 0,
  padding: 0,
  border: "none",
  background: "transparent",
  boxShadow: "none",
  cursor: "pointer",
  textAlign: "left",
};

interface DiscountTargetRowProps {
  label: string;
  icon: typeof CursorIcon;
  selected: boolean;
  onSelect: () => void;
}

/** Preview target row — competitor: fixed icon column, grey fill when selected. */
export function DiscountTargetRow({
  label,
  icon,
  selected,
  onSelect,
}: DiscountTargetRowProps) {
  return (
    <UnstyledButton
      onClick={onSelect}
      accessibilityLabel={label}
      aria-pressed={selected}
      style={rowButton}
    >
      <Box
        background={selected ? "bg-surface-secondary" : "bg-surface"}
        paddingBlock="300"
        paddingInline="300"
      >
        <InlineGrid columns="auto minmax(0, 1fr)" gap="200" alignItems="center">
          <Box minWidth="500" maxWidth="500">
            <Icon source={icon} tone={selected ? undefined : "subdued"} />
          </Box>
          <Text
            as="span"
            variant="bodyMd"
            fontWeight={selected ? "semibold" : "regular"}
            tone={selected ? undefined : "subdued"}
          >
            {label}
          </Text>
        </InlineGrid>
      </Box>
    </UnstyledButton>
  );
}
