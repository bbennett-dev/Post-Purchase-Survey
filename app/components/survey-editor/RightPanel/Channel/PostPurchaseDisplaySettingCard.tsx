import { Link } from "react-router";
import {
  BlockStack,
  Button,
  Card,
  InlineGrid,
  Text,
} from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";
import { openShopifyAdminUrl } from "../../../../lib/open-checkout-editor";
import type { CheckoutEditorLinks } from "../../../../lib/shopify/checkout-editor-url.server";

const INSTRUCTION_URL =
  "https://shopify.dev/docs/apps/build/checkout/thank-you-order-status";

export interface PostPurchaseDisplaySettingCardProps {
  checkoutEditor: CheckoutEditorLinks;
}

/** Shared “Display setting” card for block and announcement bar modes. */
export function PostPurchaseDisplaySettingCard({
  checkoutEditor,
}: PostPurchaseDisplaySettingCardProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineGrid columns="1fr auto" gap="200" alignItems="center">
          <Text as="p" fontWeight="semibold">
            Display setting
          </Text>
          <Button url={INSTRUCTION_URL} external variant="plain">
            View instruction
          </Button>
        </InlineGrid>

        <Button
          icon={ExternalIcon}
          fullWidth
          onClick={() => openShopifyAdminUrl(checkoutEditor.thankYou)}
        >
          Add block
        </Button>

        <Text as="p" tone="subdued">
          <Link to="/app/settings">Contact us</Link> if you need any support.
        </Text>
      </BlockStack>
    </Card>
  );
}
