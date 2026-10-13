import { useRef, useState, type ChangeEvent } from "react";
import {
  ActionList,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  DropZone,
  InlineGrid,
  Popover,
  RangeSlider,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import { ChevronDownIcon } from "@shopify/polaris-icons";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  readImageAsDataUrl,
} from "../../../../../lib/images/read-image-as-data-url";
import type { ImageAlignment, SurveyImage } from "../../../../../lib/survey/types";

const ALIGNMENTS: { id: ImageAlignment; label: string }[] = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

export interface QuestionImageBlockProps {
  image: SurveyImage;
  onChange: (image: SurveyImage) => void;
  /** When true, shows size slider after an image is uploaded. */
  showSize?: boolean;
}

function parseSizePercent(value: SurveyImage["sizePercentage"]): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isFinite(parsed)) {
    return Math.min(100, Math.max(0, parsed));
  }
  return 50;
}

/**
 * Reusable question image control: upload/change/remove, then alignment + size only when an image exists.
 */
export function QuestionImageBlock({
  image,
  onChange,
  showSize = true,
}: QuestionImageBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const url = image.url?.trim() ?? "";
  const sizePercent = parseSizePercent(image.sizePercentage);

  const patch = (partial: Partial<SurveyImage>) => {
    onChange({ ...image, ...partial });
  };

  const pickImage = () => {
    inputRef.current?.click();
    setMenuOpen(false);
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
      patch({ url: dataUrl });
    } catch {
      // Unsupported type — toast can be added later.
    }
  };

  const onDrop = async (_dropFiles: File[], acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readImageAsDataUrl(file);
      patch({ url: dataUrl });
    } catch {
      // Unsupported type.
    }
  };

  return (
    <BlockStack gap="300">
      <Text as="p" fontWeight="semibold">
        Image
      </Text>

      <Box visuallyHidden as="span">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          onChange={onFileChange}
        />
      </Box>

      {url ? (
        <BlockStack gap="200">
          <Box
            padding="400"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <InlineGrid columns="1fr" alignItems="center">
              <Thumbnail source={url} alt="" size="large" />
            </InlineGrid>
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
                    patch({ url: "" });
                    setMenuOpen(false);
                  },
                },
              ]}
            />
          </Popover>

          <BlockStack gap="200">
            <Text as="p">Image alignment</Text>
            <ButtonGroup variant="segmented" fullWidth>
              {ALIGNMENTS.map((item) => (
                <Button
                  key={item.id}
                  pressed={image.alignment === item.id}
                  onClick={() => patch({ alignment: item.id })}
                >
                  {item.label}
                </Button>
              ))}
            </ButtonGroup>
          </BlockStack>

          {showSize ? (
            <BlockStack gap="200">
              <Text as="p">Image size</Text>
              <InlineGrid columns="1fr 72px" gap="300" alignItems="center">
                <RangeSlider
                  label="Image size"
                  labelHidden
                  min={0}
                  max={100}
                  value={sizePercent}
                  onChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value;
                    patch({
                      sizePercentage: Math.min(
                        100,
                        Math.max(0, Math.round(next)),
                      ),
                    });
                  }}
                />
                <TextField
                  label="Image size percent"
                  labelHidden
                  value={String(sizePercent)}
                  suffix="%"
                  readOnly
                  autoComplete="off"
                  onChange={() => {}}
                />
              </InlineGrid>
            </BlockStack>
          ) : null}
        </BlockStack>
      ) : (
        <DropZone accept="image/*" onDrop={onDrop}>
          <DropZone.FileUpload
            actionTitle="Add image"
            actionHint="Accepts .svg, .jpg, .jpeg, and .png"
          />
        </DropZone>
      )}
    </BlockStack>
  );
}
