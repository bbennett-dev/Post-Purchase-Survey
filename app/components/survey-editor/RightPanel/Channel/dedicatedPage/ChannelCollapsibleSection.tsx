import type { ReactNode } from "react";
import {
  BlockStack,
  Box,
  Button,
  Divider,
  InlineGrid,
  Text,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";

export interface ChannelCollapsibleSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  /** Optional control beside the chevron (e.g. enable toggle). */
  trailing?: ReactNode;
  children?: ReactNode;
}

/**
 * Bordered accordion block used in channel advanced settings (competitor layout).
 */
export function ChannelCollapsibleSection({
  title,
  expanded,
  onToggle,
  trailing,
  children,
}: ChannelCollapsibleSectionProps) {
  return (
    <Box
      borderWidth="025"
      borderColor="border"
      borderRadius="200"
      overflowX="hidden"
      overflowY="hidden"
    >
      <Box padding="300">
        <InlineGrid
          columns={trailing ? "1fr auto auto" : "1fr auto"}
          gap="200"
          alignItems="center"
        >
          <Text as="p" fontWeight="semibold">
            {title}
          </Text>
          {trailing ?? null}
          <Button
            variant="tertiary"
            icon={expanded ? ChevronUpIcon : ChevronDownIcon}
            accessibilityLabel={expanded ? `Collapse ${title}` : `Expand ${title}`}
            onClick={onToggle}
          />
        </InlineGrid>
      </Box>

      {expanded && children ? (
        <>
          <Divider />
          <Box padding="300">
            <BlockStack gap="300">{children}</BlockStack>
          </Box>
        </>
      ) : null}
    </Box>
  );
}
