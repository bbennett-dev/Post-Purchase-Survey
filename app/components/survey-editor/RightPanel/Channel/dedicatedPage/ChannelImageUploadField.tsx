import { useCallback, useRef, useState, type ChangeEvent } from "react";
import {
  ActionList,
  BlockStack,
  Box,
  Button,
  DropZone,
  Popover,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { ChevronDownIcon } from "@shopify/polaris-icons";
import { useShopifyImageUpload } from "../../../../../hooks/useShopifyImageUpload";
import { ACCEPTED_IMAGE_EXTENSIONS } from "../../../../../lib/images/read-image-as-data-url";

export interface ChannelImageUploadFieldProps {
  label?: string;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  actionHint?: string;
}

/**
 * Labeled image upload with preview + Change menu (competitor background image UI).
 */
export function ChannelImageUploadField({
  label = "Image",
  imageUrl,
  onImageUrlChange,
  actionHint = "Accepts .svg, .jpg, .jpeg, and .png",
}: ChannelImageUploadFieldProps) {
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
    <BlockStack gap="200">
      <Text as="p" variant="bodyMd">
        {label}
      </Text>

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
          <Thumbnail source={imageUrl} alt="" size="large" />
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
          <DropZone.FileUpload actionTitle="Add image" actionHint={actionHint} />
        </DropZone>
      )}
    </BlockStack>
  );
}
