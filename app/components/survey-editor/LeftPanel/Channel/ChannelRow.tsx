import type { CSSProperties, ReactNode } from "react";
import {
  BlockStack,
  Box,
  Collapsible,
  Icon,
  InlineStack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@shopify/polaris";
import {
  CartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  DesktopIcon,
  EmailIcon,
  ExitIcon,
  PageIcon,
  PointOfSaleIcon,
  StarFilledIcon,
} from "@shopify/polaris-icons";
import type { ChannelDefinition } from "../../../../lib/survey/channels";
import { ChannelSwitch } from "./ChannelSwitch";

const CHANNEL_ICONS: Record<string, typeof CartIcon> = {
  cart: CartIcon,
  page: PageIcon,
  "layout-popup": DesktopIcon,
  email: EmailIcon,
  exit: ExitIcon,
  code: CodeIcon,
  "email-newsletter": EmailIcon,
  "point-of-sale": PointOfSaleIcon,
};

/** Disclosure control: flex row so chevron, icons, and label share one vertical center line. */
const disclosureControl: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flex: "1 1 auto",
  minWidth: 0,
  margin: 0,
  padding: 0,
  border: "none",
  background: "transparent",
  boxShadow: "none",
  cursor: "pointer",
  textAlign: "left",
};

function RecommendedStarTooltip({
  definition,
}: {
  definition: ChannelDefinition;
}) {
  const tip = definition.recommendedTooltip;
  const content = tip ? (
    <BlockStack gap="0">
      <Text as="span" variant="bodySm">
        {tip.line1}
      </Text>
      {tip.line2 ? (
        <Text as="span" variant="bodySm">
          {tip.line2}
        </Text>
      ) : null}
    </BlockStack>
  ) : (
    "Recommended channel"
  );

  return (
    <Tooltip content={content} preferredPosition="above">
      <span
        aria-label={
          tip
            ? [tip.line1, tip.line2].filter(Boolean).join(" ")
            : "Recommended channel"
        }
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <Icon source={StarFilledIcon} tone="info" />
      </span>
    </Tooltip>
  );
}

export interface ChannelRowProps {
  definition: ChannelDefinition;
  enabled: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onEnabledChange: (enabled: boolean) => void;
  children: ReactNode;
}

/**
 * Flat accordion row: aligned header (competitor) + {@link Collapsible} body for every channel.
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
  const collapsibleId = `channel-${definition.key}`;

  return (
    <Box background="bg-surface">
      <Box
        background={expanded ? "bg-surface-secondary" : "bg-surface"}
        paddingBlock="300"
        paddingInline="400"
      >
        <InlineStack
          align={hasToggle ? "space-between" : "start"}
          blockAlign="center"
          wrap={false}
          gap="300"
        >
          <UnstyledButton
            onClick={onToggleExpand}
            ariaExpanded={expanded}
            ariaControls={collapsibleId}
            accessibilityLabel={
              expanded
                ? `Collapse ${definition.label}`
                : `Expand ${definition.label}`
            }
            style={disclosureControl}
          >
            <InlineStack gap="200" blockAlign="center" wrap={false}>
              <Box minWidth="500">
                <Icon
                  source={expanded ? ChevronUpIcon : ChevronDownIcon}
                  tone="subdued"
                />
              </Box>
              <Box minWidth="500">
                <Icon
                  source={ChannelIcon}
                  tone={enabled ? undefined : "subdued"}
                />
              </Box>
              <Text
                as="span"
                variant="bodyMd"
                fontWeight={expanded ? "semibold" : "regular"}
              >
                {definition.label}
              </Text>
              {definition.recommended ? (
                <RecommendedStarTooltip definition={definition} />
              ) : null}
            </InlineStack>
          </UnstyledButton>

          {hasToggle ? (
            <Box minHeight="500">
              <InlineStack blockAlign="center">
                <ChannelSwitch
                  enabled={enabled}
                  accessibilityLabel={`Enable ${definition.label}`}
                  onChange={onEnabledChange}
                />
              </InlineStack>
            </Box>
          ) : null}
        </InlineStack>
      </Box>

      <Collapsible
        open={expanded}
        id={collapsibleId}
        transition={{ duration: "200ms", timingFunction: "ease-in-out" }}
        expandOnPrint
      >
        <Box
          paddingBlock="300"
          paddingInline="400"
          paddingBlockStart="300"
          background="bg-surface"
        >
          {children}
        </Box>
      </Collapsible>
    </Box>
  );
}
