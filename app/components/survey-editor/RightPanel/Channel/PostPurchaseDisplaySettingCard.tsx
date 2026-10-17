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
import { isPostPurchaseAnnouncementBar } from "../../../../lib/survey/post-purchase-display";
import type { PostPurchasePageChannel } from "../../../../lib/survey/types";

const INSTRUCTION_URL =
  "https://shopify.dev/docs/apps/build/checkout/thank-you-order-status";

export interface PostPurchaseDisplaySettingCardProps {
  checkoutEditor: CheckoutEditorLinks;
  displayType?: PostPurchasePageChannel["displayType"];
}

/** Display placement guidance for post-purchase block vs announcement bar. */
export function PostPurchaseDisplaySettingCard({
  checkoutEditor,
  displayType,
}: PostPurchaseDisplaySettingCardProps) {
  const isAnnouncement = isPostPurchaseAnnouncementBar(
    displayType !== undefined ? { displayType } : undefined,
  );

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

        {isAnnouncement ? (
          <Text as="p" tone="subdued">
            Open the checkout editor, go to the left sidebar{" "}
            <Text as="span" fontWeight="semibold">Announcement bar</Text>{" "}
            section (not Main), and add{" "}
            <Text as="span" fontWeight="semibold">Post Purchase Survey</Text> for
            Thank you and Order status. Save the profile, then publish your
            survey. Block placements in Main are ignored while this display
            type is selected.
          </Text>
        ) : null}

        <Button
          icon={ExternalIcon}
          fullWidth
          onClick={() => openShopifyAdminUrl(checkoutEditor.thankYou)}
        >
          {isAnnouncement ? "Open checkout editor" : "Add block"}
        </Button>

        {isAnnouncement ? (
          <Button
            icon={ExternalIcon}
            fullWidth
            variant="secondary"
            onClick={() => openShopifyAdminUrl(checkoutEditor.orderStatus)}
          >
            Order status page
          </Button>
        ) : null}

        <Text as="p" tone="subdued">
          <Link to="/app/settings">Contact us</Link> if you need any support.
        </Text>
      </BlockStack>
    </Card>
  );
}
