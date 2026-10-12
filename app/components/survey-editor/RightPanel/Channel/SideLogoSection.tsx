import { useRef, type ChangeEvent } from "react";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  readImageAsDataUrl,
} from "../../../../lib/images/read-image-as-data-url";
import type { PostPurchasePageChannel } from "../../../../lib/survey/types";
import imageStyles from "../../shared/image-upload.module.css";

interface SideLogoSectionProps {
  channel: PostPurchasePageChannel;
  onChange: (patch: Partial<PostPurchasePageChannel>) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * Side logo block: toggle, upload, preview, and change/remove menu.
 */
export function SideLogoSection({
  channel,
  onChange,
  expanded,
  onToggleExpanded,
}: SideLogoSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuId = "side-logo-change-menu";
  const enabledSideLogo = channel.enabledSideLogo === true;
  const sideLogoUrl = channel.sideLogo?.url ?? "";

  const patchUrl = (url: string) => {
    onChange({
      sideLogo: {
        ...channel.sideLogo,
        url,
        enabled: channel.sideLogo?.enabled ?? true,
      },
    });
  };

  const pickImage = () => {
    inputRef.current?.click();
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readImageAsDataUrl(file);
      patchUrl(dataUrl);
    } catch {
      // Invalid type — ignore until we add toast feedback.
    }
  };

  return (
    <s-box border="base" borderRadius="base" overflow="hidden">
      <s-box padding="small">
        <s-grid
          gridTemplateColumns="minmax(0, 1fr) auto auto"
          gap="small-200"
          alignItems="center"
        >
          <s-text type="strong">Side logo</s-text>
          <s-switch
            label="Enable side logo"
            labelAccessibilityVisibility="exclusive"
            checked={enabledSideLogo}
            onChange={(event) =>
              onChange({
                enabledSideLogo: Boolean(
                  (event.currentTarget as HTMLElement & { checked?: boolean })
                    .checked,
                ),
              })
            }
          />
          <s-button
            variant="tertiary"
            icon={expanded ? "chevron-up" : "chevron-down"}
            accessibilityLabel={
              expanded ? "Collapse side logo" : "Expand side logo"
            }
            onClick={onToggleExpanded}
          />
        </s-grid>
      </s-box>

      {expanded ? (
        <>
          <s-divider direction="inline" color="base" />
          <s-box padding="small">
            <s-stack gap="small">
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_IMAGE_EXTENSIONS}
                className={imageStyles.hiddenInput}
                onChange={onFileChange}
              />

              {sideLogoUrl ? (
                <>
                  <s-image
                    src={sideLogoUrl}
                    alt="Side logo preview"
                    aspectRatio="16/9"
                    borderRadius="base"
                  />
                  <s-button
                    variant="secondary"
                    inlineSize="fill"
                    icon="chevron-down"
                    commandFor={menuId}
                  >
                    Change
                  </s-button>
                  <s-menu id={menuId} accessibilityLabel="Side logo actions">
                    <s-button icon="image-add" onClick={pickImage}>
                      Change image
                    </s-button>
                    <s-button
                      icon="delete"
                      tone="critical"
                      onClick={() => patchUrl("")}
                    >
                      Remove image
                    </s-button>
                  </s-menu>
                </>
              ) : (
                <div className={imageStyles.uploadZone}>
                  <s-button variant="secondary" onClick={pickImage}>
                    Add Image
                  </s-button>
                  <s-text color="subdued">
                    Accepts .svg, .jpg, .jpeg, and .png
                  </s-text>
                </div>
              )}

              <s-text color="subdued">
                Leave empty to show the default logo.
              </s-text>
            </s-stack>
          </s-box>
        </>
      ) : null}
    </s-box>
  );
}
