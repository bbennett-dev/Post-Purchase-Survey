import { useCallback, useRef, useState, type ChangeEvent } from "react";
import {
  ActionList,
  BlockStack,
  Box,
  Button,
  Checkbox,
  DropZone,
  Popover,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { ChevronDownIcon } from "@shopify/polaris-icons";
import { useShopifyImageUpload } from "../../../../../hooks/useShopifyImageUpload";
import { ACCEPTED_IMAGE_EXTENSIONS } from "../../../../../lib/images/read-image-as-data-url";
import { ChannelCollapsibleSection } from "./ChannelCollapsibleSection";

export interface ChannelLogoUploadBlockProps {
  title: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * Header / side logo upload with enable toggle (Branded survey page).
 */
export function ChannelLogoUploadBlock({
  title,
  enabled,
  onEnabledChange,
  imageUrl,
  onImageUrlChange,
  expanded,
  onToggleExpanded,
}: ChannelLogoUploadBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { uploadImage, uploading } = useShopifyImageUpload();

  const pickImage = useCallback(() => {
    inputRef.current?.click();
    setMenuOpen(false);
  }, []);

  const applyFile = async (file: File) => {
    try {
      onImageUrlChange(await uploadImage(file));
    } catch {
      // Upload failed.
    }
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    await applyFile(file);
  };

  return (
    <ChannelCollapsibleSection
      title={title}
      expanded={expanded}
      onToggle={onToggleExpanded}
      trailing={
        <Checkbox
          label={`Enable ${title}`}
          labelHidden
          checked={enabled}
          onChange={onEnabledChange}
        />
      }
    >
      <Box visuallyHidden as="span">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          onChange={onFileChange}
        />
      </Box>

      {imageUrl ? (
        <>
          <Box padding="400" background="bg-surface-secondary" borderRadius="200">
            <Thumbnail source={imageUrl} alt={`${title} preview`} />
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
                { content: "Change image", onAction: pickImage },
                {
                  content: "Remove image",
                  destructive: true,
                  onAction: () => {
                    onImageUrlChange("");
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
          disabled={uploading}
          onDrop={async (_files, accepted) => {
            const file = accepted[0];
            if (!file) return;
            await applyFile(file);
          }}
        >
          <DropZone.FileUpload
            actionTitle="Add image"
            actionHint="Accepts .svg, .jpg, .jpeg, and .png"
          />
        </DropZone>
      )}

      <Text as="p" tone="subdued">
        Leave empty to show the SEA logo
      </Text>
    </ChannelCollapsibleSection>
  );
}
