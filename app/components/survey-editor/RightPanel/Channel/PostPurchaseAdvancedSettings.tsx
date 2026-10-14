import { useCallback, useState } from "react";
import { BlockStack, Select, TextField } from "@shopify/polaris";
import type { CheckoutEditorLinks } from "../../../../lib/shopify/checkout-editor-url.server";
import type { PostPurchasePageChannel } from "../../../../lib/survey/types";
import { PostPurchaseDisplaySettingCard } from "./PostPurchaseDisplaySettingCard";
import {
  ANNOUNCEMENT_BUTTON_TEXT_MAX_LENGTH,
  ANNOUNCEMENT_CONTENT_MAX_LENGTH,
} from "./postPurchaseAnnouncementLimits";
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

const DISPLAY_TYPE_HELP: Record<string, string> = {
  blockType: "Embed the survey as a checkout UI block on the thank you page.",
  announcementBarType:
    "Better for content that needs to capture a buyer's immediate attention",
};

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
  const isAnnouncement = displayType === "announcementBarType";

  const patchAnnouncement = useCallback(
    (
      patch: Partial<
        NonNullable<PostPurchasePageChannel["announcementBar"]>
      >,
    ) => {
      onChange({
        announcementBar: {
          modalTitle: channel.announcementBar?.modalTitle ?? "",
          content: channel.announcementBar?.content ?? "",
          buttonText: channel.announcementBar?.buttonText ?? "",
          ...patch,
        },
      });
    },
    [channel.announcementBar, onChange],
  );

  return (
    <BlockStack gap="400">
      <Select
        label="Display type"
        options={DISPLAY_TYPE_OPTIONS}
        value={displayType}
        helpText={DISPLAY_TYPE_HELP[displayType]}
        onChange={(next) => onChange({ displayType: next })}
      />

      <PostPurchaseDisplaySettingCard checkoutEditor={checkoutEditor} />

      {isAnnouncement ? (
        <BlockStack gap="300">
          <TextField
            label="Modal title"
            value={channel.announcementBar?.modalTitle ?? ""}
            onChange={(modalTitle) => patchAnnouncement({ modalTitle })}
            autoComplete="off"
          />
          <TextField
            label="Content"
            value={channel.announcementBar?.content ?? ""}
            onChange={(content) => patchAnnouncement({ content })}
            multiline={3}
            maxLength={ANNOUNCEMENT_CONTENT_MAX_LENGTH}
            showCharacterCount
            autoComplete="off"
          />
          <TextField
            label="Button text"
            value={channel.announcementBar?.buttonText ?? ""}
            onChange={(buttonText) => patchAnnouncement({ buttonText })}
            maxLength={ANNOUNCEMENT_BUTTON_TEXT_MAX_LENGTH}
            showCharacterCount
            autoComplete="off"
          />
        </BlockStack>
      ) : null}

      <SideLogoSection
        channel={channel}
        onChange={onChange}
        expanded={sideLogoOpen}
        onToggleExpanded={() => setSideLogoOpen((open) => !open)}
      />
    </BlockStack>
  );
}
