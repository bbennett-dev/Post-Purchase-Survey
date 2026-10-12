import { useState } from "react";
import { openShopifyAdminUrl } from "../../../../lib/open-checkout-editor";
import type { CheckoutEditorLinks } from "../../../../lib/shopify/checkout-editor-url.server";
import type { PostPurchasePageChannel } from "../../../../lib/survey/types";
import { fieldValue } from "../../field-value";
import { SideLogoSection } from "./SideLogoSection";

interface PostPurchaseAdvancedSettingsProps {
  channel: PostPurchasePageChannel;
  checkoutEditor: CheckoutEditorLinks;
  onChange: (patch: Partial<PostPurchasePageChannel>) => void;
}

const DISPLAY_TYPE_OPTIONS = [
  { value: "blockType", label: "Block" },
  { value: "announcementBarType", label: "Announcement bar" },
] as const;

const INSTRUCTION_URL =
  "https://shopify.dev/docs/apps/build/checkout/thank-you-order-status";

/**
 * Thank you page advanced settings (right column), aligned with merchant UX reference.
 */
export function PostPurchaseAdvancedSettings({
  channel,
  checkoutEditor,
  onChange,
}: PostPurchaseAdvancedSettingsProps) {
  const [sideLogoOpen, setSideLogoOpen] = useState(true);

  const displayType = channel.displayType ?? "blockType";

  return (
    <s-stack gap="base">
      <s-stack gap="small-200">
        <s-text type="strong">Display type</s-text>
        <s-select
          label="Display type"
          labelAccessibilityVisibility="exclusive"
          value={displayType}
          onChange={(event) => onChange({ displayType: fieldValue(event) })}
        >
          {DISPLAY_TYPE_OPTIONS.map((opt) => (
            <s-option key={opt.value} value={opt.value}>
              {opt.label}
            </s-option>
          ))}
        </s-select>
      </s-stack>

      {displayType === "blockType" ? (
        <s-box padding="base" border="base" borderRadius="base">
          <s-stack gap="small">
            <s-grid
              gridTemplateColumns="1fr auto"
              gap="small-200"
              alignItems="center"
            >
              <s-text type="strong">Display setting</s-text>
              <s-link href={INSTRUCTION_URL} target="_blank">
                View instruction
              </s-link>
            </s-grid>

            <s-button
              variant="secondary"
              icon="external"
              inlineSize="fill"
              onClick={() => openShopifyAdminUrl(checkoutEditor.thankYou)}
            >
              Add block
            </s-button>

            <s-paragraph color="subdued">
              <s-link href="/app/settings">Contact us</s-link> if you need any
              support.
            </s-paragraph>
          </s-stack>
        </s-box>
      ) : (
        <s-stack gap="small-200">
          <s-text-field
            label="Modal title"
            value={channel.announcementBar?.modalTitle ?? ""}
            onInput={(event) =>
              onChange({
                announcementBar: {
                  ...channel.announcementBar,
                  modalTitle: fieldValue(event),
                  content: channel.announcementBar?.content ?? "",
                  buttonText: channel.announcementBar?.buttonText ?? "",
                },
              })
            }
          />
          <s-text-field
            label="Announcement text"
            value={channel.announcementBar?.content ?? ""}
            onInput={(event) =>
              onChange({
                announcementBar: {
                  ...channel.announcementBar,
                  modalTitle: channel.announcementBar?.modalTitle ?? "",
                  content: fieldValue(event),
                  buttonText: channel.announcementBar?.buttonText ?? "",
                },
              })
            }
          />
          <s-text-field
            label="Button text"
            value={channel.announcementBar?.buttonText ?? ""}
            onInput={(event) =>
              onChange({
                announcementBar: {
                  ...channel.announcementBar,
                  modalTitle: channel.announcementBar?.modalTitle ?? "",
                  content: channel.announcementBar?.content ?? "",
                  buttonText: fieldValue(event),
                },
              })
            }
          />
        </s-stack>
      )}

      <SideLogoSection
        channel={channel}
        onChange={onChange}
        expanded={sideLogoOpen}
        onToggleExpanded={() => setSideLogoOpen((open) => !open)}
      />
    </s-stack>
  );
}
