import { useRef, type ChangeEvent, type CSSProperties } from "react";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  readImageAsDataUrl,
} from "../../../lib/images/read-image-as-data-url";
import type { ImageAlignment, SurveyImage } from "../../../lib/survey/types";
import imageStyles from "./image-upload.module.css";
import styles from "./question-image-section.module.css";

const ALIGNMENTS: { id: ImageAlignment; label: string }[] = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

export interface QuestionImageSectionProps {
  /** Unique id for the change-image menu (one section per question). */
  menuId: string;
  image: SurveyImage;
  onChange: (image: SurveyImage) => void;
  /** Shows image size slider + percent readout (choice questions). */
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
 * Reusable question image block: preview, upload/change menu, alignment, optional size.
 */
export function QuestionImageSection({
  menuId,
  image,
  onChange,
  showSize = true,
}: QuestionImageSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = image.url?.trim() ?? "";
  const sizePercent = parseSizePercent(image.sizePercentage);

  const patch = (partial: Partial<SurveyImage>) => {
    onChange({ ...image, ...partial });
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
      patch({ url: dataUrl });
    } catch {
      // Unsupported type — toast can be added later.
    }
  };

  const setSizePercent = (raw: number) => {
    patch({
      sizePercentage: Math.min(100, Math.max(0, Math.round(raw))),
    });
  };

  return (
    <s-stack gap="small-200">
      <s-text type="strong">Image</s-text>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_EXTENSIONS}
        className={imageStyles.hiddenInput}
        onChange={onFileChange}
      />

      {url ? (
        <s-stack gap="small-200">
          <div className={imageStyles.previewFrame}>
            <img
              src={url}
              alt=""
              className={imageStyles.previewImage}
            />
          </div>
          <s-button
            variant="secondary"
            inlineSize="fill"
            icon="chevron-down"
            commandFor={menuId}
          >
            Change
          </s-button>
          <s-menu id={menuId} accessibilityLabel="Question image actions">
            <s-button icon="image-add" onClick={pickImage}>
              Change image
            </s-button>
            <s-button
              icon="delete"
              tone="critical"
              onClick={() => patch({ url: "" })}
            >
              Remove image
            </s-button>
          </s-menu>
        </s-stack>
      ) : (
        <div className={imageStyles.uploadZone}>
          <s-button variant="secondary" onClick={pickImage}>
            Add image
          </s-button>
          <s-text color="subdued">Accepts .svg, .jpg, .jpeg, and .png</s-text>
        </div>
      )}

      <s-stack gap="small-200" alignItems="stretch">
        <s-text>Image alignment</s-text>
        <div
          className={styles.alignmentGroup}
          role="radiogroup"
          aria-label="Image alignment"
        >
          {ALIGNMENTS.map((item) => {
            const active = image.alignment === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={
                  active
                    ? `${styles.alignmentOption} ${styles.alignmentOptionActive}`
                    : styles.alignmentOption
                }
                onClick={() => patch({ alignment: item.id })}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </s-stack>

      {showSize && url ? (
        <s-stack gap="small-200">
          <s-text>Image size</s-text>
          <div className={styles.sizeRow}>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={sizePercent}
              className={styles.sizeSlider}
              style={
                {
                  "--size-percent": `${sizePercent}%`,
                } as CSSProperties
              }
              aria-label="Image size"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={sizePercent}
              aria-valuetext={`${sizePercent} percent`}
              onChange={(event) =>
                setSizePercent(Number(event.currentTarget.value))
              }
            />
            <div
              className={styles.sizePercentBox}
              role="status"
              aria-live="polite"
              aria-label={`${sizePercent} percent`}
            >
              <span className={styles.sizePercentValue}>{sizePercent}</span>
              <span className={styles.sizePercentSuffix}>%</span>
            </div>
          </div>
        </s-stack>
      ) : null}
    </s-stack>
  );
}
