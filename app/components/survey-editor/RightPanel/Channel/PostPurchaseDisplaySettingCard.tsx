import { Link } from "react-router";
import {
  BlockStack,
  Button,
  Card,
  InlineGrid,
  Text,
} from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";
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
          <Button variant="plain" url={INSTRUCTION_URL} external target="_blank">
            View instruction
          </Button>
        </InlineGrid>

        {isAnnouncement ? (
          <Text as="p" tone="subdued">
            Open the checkout editor and add{" "}
            <Text as="span" fontWeight="semibold">
              Post Purchase Survey
            </Text>{" "}
            under{" "}
            <Text as="span" fontWeight="semibold">
              Announcement bar
            </Text>{" "}
            (not Main). Save the profile, then publish your survey.
          </Text>
        ) : (
          <Text as="p" tone="subdued">
            Open the checkout editor and add{" "}
            <Text as="span" fontWeight="semibold">
              Post Purchase Survey
            </Text>{" "}
            under <Text as="span" fontWeight="semibold">Main</Text>, then save
            the profile and publish your survey.
          </Text>
        )}

        <Button
          icon={ExternalIcon}
          fullWidth
          url={checkoutEditor.thankYou}
          external
          target="_blank"
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
