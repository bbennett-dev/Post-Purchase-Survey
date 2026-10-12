import { useCallback, useRef, useState, type ChangeEvent } from "react";
import {
  ActionList,
  BlockStack,
  Box,
  Button,
  Checkbox,
  Divider,
  InlineGrid,
  Popover,
  Text,
  Thumbnail,
  DropZone,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@shopify/polaris-icons";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  readImageAsDataUrl,
} from "../../../../lib/images/read-image-as-data-url";
import type { PostPurchasePageChannel } from "../../../../lib/survey/types";
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
  const [menuOpen, setMenuOpen] = useState(false);
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

  const pickImage = useCallback(() => {
    inputRef.current?.click();
    setMenuOpen(false);
  }, []);

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
    <Box borderWidth="025" borderColor="border" borderRadius="200" overflowX="hidden" overflowY="hidden">
      <Box padding="300">
        <InlineGrid columns="1fr auto auto" gap="200" alignItems="center">
          <Text as="p" fontWeight="semibold">
            Side logo
          </Text>
          <Checkbox
            label="Enable side logo"
            labelHidden
            checked={enabledSideLogo}
            onChange={(checked) => onChange({ enabledSideLogo: checked })}
          />
          <Button
            variant="tertiary"
            icon={expanded ? ChevronUpIcon : ChevronDownIcon}
            accessibilityLabel={
              expanded ? "Collapse side logo" : "Expand side logo"
            }
            onClick={onToggleExpanded}
          />
        </InlineGrid>
      </Box>

      {expanded ? (
        <>
          <Divider />
          <Box padding="300">
            <BlockStack gap="300">
              <Box visuallyHidden as="span">
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_EXTENSIONS}
                  onChange={onFileChange}
                />
              </Box>

              {sideLogoUrl ? (
                <>
                  <Box
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <Thumbnail source={sideLogoUrl} alt="Side logo preview" />
                  </Box>
                  <Popover
                    active={menuOpen}
                    activator={
                      <Button
                        fullWidth
                        icon={ChevronDownIcon}
                        onClick={() => setMenuOpen((open) => !open)}
                      >
                        Change
                      </Button>
                    }
                    onClose={() => setMenuOpen(false)}
                  >
                    <ActionList
                      items={[
                        {
                          content: "Change image",
                          onAction: pickImage,
                        },
                        {
                          content: "Remove image",
                          destructive: true,
                          onAction: () => {
                            patchUrl("");
                            setMenuOpen(false);
                          },
                        },
                      ]}
                    />
                  </Popover>
                </>
              ) : (
                <DropZone
                  accept="image/*"
                  onDrop={async (_files, accepted) => {
                    const file = accepted[0];
                    if (!file) {
                      return;
                    }
                    try {
                      patchUrl(await readImageAsDataUrl(file));
                    } catch {
                      // Invalid type.
                    }
                  }}
                >
                  <DropZone.FileUpload
                    actionTitle="Add image"
                    actionHint="Accepts .svg, .jpg, .jpeg, and .png"
                  />
                </DropZone>
              )}

              <Text as="p" tone="subdued">
                Leave empty to show the default logo.
              </Text>
            </BlockStack>
          </Box>
        </>
      ) : null}
    </Box>
  );
}
