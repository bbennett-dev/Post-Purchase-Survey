import type { ReactNode } from "react";
import {
  Box,
  Checkbox,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Text,
  UnstyledButton,
} from "@shopify/polaris";
import {
  CartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  EmailIcon,
  ExitIcon,
  PageIcon,
  PointOfSaleIcon,
  StarFilledIcon,
} from "@shopify/polaris-icons";
import type { ChannelDefinition } from "../../../../lib/survey/channels";

const CHANNEL_ICONS: Record<string, typeof CartIcon> = {
  cart: CartIcon,
  page: PageIcon,
  "layout-popup": PageIcon,
  email: EmailIcon,
  exit: ExitIcon,
  code: CodeIcon,
  "email-newsletter": EmailIcon,
  "point-of-sale": PointOfSaleIcon,
};

interface ChannelRowProps {
  definition: ChannelDefinition;
  enabled: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onEnabledChange: (enabled: boolean) => void;
  children?: ReactNode;
}

/**
 * Accordion channel row. Core settings render in the expanded left body;
 * advanced settings for the selected channel render in the right panel.
 */
export function ChannelRow({
  definition,
  enabled,
  expanded,
  onToggleExpand,
  onEnabledChange,
  children,
}: ChannelRowProps) {
  const hasToggle = definition.hasToggle !== false;
  const ChannelIcon = CHANNEL_ICONS[definition.icon] ?? PageIcon;

  return (
    <Box borderWidth="025" borderColor="border" borderRadius="200" overflowX="hidden" overflowY="hidden">
      <Box
        padding="200"
        background={expanded ? "bg-surface-secondary" : "bg-surface"}
      >
        <InlineGrid
          columns={
            hasToggle && definition.recommended
              ? "1fr auto auto"
              : hasToggle || definition.recommended
                ? "1fr auto"
                : "1fr"
          }
          gap="200"
          alignItems="center"
        >
          <UnstyledButton
            onClick={onToggleExpand}
            accessibilityLabel={
              expanded
                ? `Collapse ${definition.label}`
                : `Expand ${definition.label}`
            }
          >
            <InlineStack gap="200" blockAlign="center">
              <Icon
                source={expanded ? ChevronUpIcon : ChevronDownIcon}
                tone="subdued"
              />
              <Icon source={ChannelIcon} tone={enabled ? undefined : "subdued"} />
              <Text as="span" fontWeight={enabled ? "semibold" : "regular"}>
                {definition.label}
              </Text>
            </InlineStack>
          </UnstyledButton>

          {definition.recommended ? (
            <Icon source={StarFilledIcon} tone="info" />
          ) : null}

          {hasToggle ? (
            <Checkbox
              label={`Enable ${definition.label}`}
              labelHidden
              checked={enabled}
              onChange={onEnabledChange}
            />
          ) : null}
        </InlineGrid>
      </Box>

      {expanded ? (
        <>
          <Divider />
          <Box padding="300" background="bg-surface-secondary">
            {children}
          </Box>
        </>
      ) : null}
    </Box>
  );
}
