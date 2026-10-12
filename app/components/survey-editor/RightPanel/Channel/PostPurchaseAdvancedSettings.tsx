import { useState } from "react";
import { Link } from "react-router";
import {
  BlockStack,
  Button,
  Card,
  InlineGrid,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";
import { openShopifyAdminUrl } from "../../../../lib/open-checkout-editor";
import type { CheckoutEditorLinks } from "../../../../lib/shopify/checkout-editor-url.server";
import type { PostPurchasePageChannel } from "../../../../lib/survey/types";
import { SideLogoSection } from "./SideLogoSection";

interface PostPurchaseAdvancedSettingsProps {
  channel: PostPurchasePageChannel;
  checkoutEditor: CheckoutEditorLinks;
  onChange: (patch: Partial<PostPurchasePageChannel>) => void;
}

const DISPLAY_TYPE_OPTIONS = [
  { value: "blockType", label: "Block" },
  { value: "announcementBarType", label: "Announcement bar" },
];

const INSTRUCTION_URL =
  "https://shopify.dev/docs/apps/build/checkout/thank-you-order-status";

/**
 * Thank you page advanced settings (right column).
 */
export function PostPurchaseAdvancedSettings({
  channel,
  checkoutEditor,
  onChange,
}: PostPurchaseAdvancedSettingsProps) {
  const [sideLogoOpen, setSideLogoOpen] = useState(true);
  const displayType = channel.displayType ?? "blockType";

  return (
    <BlockStack gap="400">
      <Select
        label="Display type"
        options={DISPLAY_TYPE_OPTIONS}
        value={displayType}
        onChange={(next) => onChange({ displayType: next })}
      />

      {displayType === "blockType" ? (
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
              <Link to="/app/settings">Contact us</Link> if you need any
              support.
            </Text>
          </BlockStack>
        </Card>
      ) : (
        <BlockStack gap="200">
          <TextField
            label="Modal title"
            value={channel.announcementBar?.modalTitle ?? ""}
            onChange={(modalTitle) =>
              onChange({
                announcementBar: {
                  ...channel.announcementBar,
                  modalTitle,
                  content: channel.announcementBar?.content ?? "",
                  buttonText: channel.announcementBar?.buttonText ?? "",
                },
              })
            }
            autoComplete="off"
          />
          <TextField
            label="Announcement text"
            value={channel.announcementBar?.content ?? ""}
            onChange={(content) =>
              onChange({
                announcementBar: {
                  ...channel.announcementBar,
                  modalTitle: channel.announcementBar?.modalTitle ?? "",
                  content,
                  buttonText: channel.announcementBar?.buttonText ?? "",
                },
              })
            }
            autoComplete="off"
          />
          <TextField
            label="Button text"
            value={channel.announcementBar?.buttonText ?? ""}
            onChange={(buttonText) =>
              onChange({
                announcementBar: {
                  ...channel.announcementBar,
                  modalTitle: channel.announcementBar?.modalTitle ?? "",
                  content: channel.announcementBar?.content ?? "",
                  buttonText,
                },
              })
            }
            autoComplete="off"
          />
        </BlockStack>
      )}

      <SideLogoSection
        channel={channel}
        onChange={onChange}
        expanded={sideLogoOpen}
        onToggleExpanded={() => setSideLogoOpen((open) => !open)}
      />
    </BlockStack>
  );
}
