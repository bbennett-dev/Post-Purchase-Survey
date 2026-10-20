import type { ReactNode } from "react";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  Divider,
  Icon,
  InlineStack,
  Spinner,
  Text,
} from "@shopify/polaris";
import { AppsIcon, LayoutBlockIcon, ExternalIcon } from "@shopify/polaris-icons";
import type { CheckoutEditorLinks } from "../../lib/shopify/checkout-editor-url.server";
import {
  activeAppBlockCount,
  isAppEmbedActive,
} from "../../lib/shopify/extension-placement-status";
import type { ExtensionPlacementLoadState } from "../../hooks/useExtensionPlacementStatus";

function OnOffBadge({ on }: { on: boolean }) {
  return (
    <Badge tone={on ? "success" : undefined}>{on ? "On" : "Off"}</Badge>
  );
}

function StatusRow({
  icon,
  label,
  trailing,
}: {
  icon: typeof AppsIcon;
  label: string;
  trailing: ReactNode;
}) {
  return (
    <Box padding="400">
      <InlineStack align="space-between" blockAlign="center" gap="400">
        <InlineStack gap="300" blockAlign="center">
          <Icon source={icon} tone="base" />
          <Text as="span" variant="bodyMd">
            {label}
          </Text>
        </InlineStack>
        {trailing}
      </InlineStack>
    </Box>
  );
}

/**
 * Competitor-style App embed + Active app blocks card.
 * This app uses checkout UI extensions; embed On/Off reflects published checkout placement.
 */
export function DashboardExtensionStatusCard({
  checkoutEditor,
  placementState,
}: {
  checkoutEditor: CheckoutEditorLinks;
  placementState: ExtensionPlacementLoadState;
}) {
  /** Checkout editor is the enablement surface for this app (equivalent to theme App embeds). */
  const embedSettingsUrl = checkoutEditor.thankYou;

  if (placementState.status === "loading") {
    return (
      <Card>
        <Box padding="400">
          <InlineStack gap="300" blockAlign="center">
            <Spinner size="small" accessibilityLabel="Checking app embed status" />
            <Text as="p" tone="subdued">
              Checking app embed status…
            </Text>
          </InlineStack>
        </Box>
      </Card>
    );
  }

  const placement =
    placementState.status === "ready" ? placementState.placement : null;
  const embedStatusKnown = placementState.status === "ready";
  const appEmbedOn = placement ? isAppEmbedActive(placement) : false;
  const blockCount = placement ? activeAppBlockCount(placement) : 0;
  const embedSettingsDisabled = embedStatusKnown && appEmbedOn;

  const blocksSummary =
    placementState.status === "unavailable" ? (
      <Text as="p" tone="subdued" variant="bodySm">
        Open app embed settings to confirm placement.
      </Text>
    ) : (
      <Text as="p" tone="subdued" variant="bodySm">
        You have{" "}
        <Button
          variant="plain"
          url={embedSettingsUrl}
          external
          target="_blank"
        >
          {`${blockCount} active`}
        </Button>{" "}
        app block{blockCount === 1 ? "" : "s"} on your store
      </Text>
    );

  return (
    <Card padding="0">
      <StatusRow
        icon={AppsIcon}
        label="App embed"
        trailing={
          <InlineStack gap="300" blockAlign="center">
            {placementState.status === "ready" ? (
              <OnOffBadge on={appEmbedOn} />
            ) : null}
            <Button
              icon={ExternalIcon}
              url={embedSettingsDisabled ? undefined : embedSettingsUrl}
              external={!embedSettingsDisabled}
              target={embedSettingsDisabled ? undefined : "_blank"}
              disabled={embedSettingsDisabled}
              accessibilityLabel={
                embedSettingsDisabled
                  ? "App embed is already on"
                  : "Open app embed settings in checkout editor"
              }
            >
              App embed settings
            </Button>
          </InlineStack>
        }
      />
      <Divider />
      <StatusRow
        icon={LayoutBlockIcon}
        label="Active app blocks"
        trailing={blocksSummary}
      />
      {placementState.status === "unavailable" ? (
        <>
          <Divider />
          <Box padding="400">
            <BlockStack gap="200">
              <Text as="p" tone="subdued" variant="bodySm">
                Status could not be loaded automatically. Open{" "}
                <Text as="span" fontWeight="semibold">
                  App embed settings
                </Text>{" "}
                and add{" "}
                <Text as="span" fontWeight="semibold">
                  Post Purchase Survey
                </Text>{" "}
                on Thank you (and Order status if needed).
              </Text>
            </BlockStack>
          </Box>
        </>
      ) : null}
    </Card>
  );
}
