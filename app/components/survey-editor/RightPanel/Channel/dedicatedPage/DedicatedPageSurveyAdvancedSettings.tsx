import { useCallback, useState } from "react";
import { Link } from "react-router";
import {
  BlockStack,
  Box,
  Button,
  Checkbox,
  Divider,
  Icon,
  InlineGrid,
  Text,
  TextField,
  UnstyledButton,
} from "@shopify/polaris";
import { ImageIcon, ResetIcon } from "@shopify/polaris-icons";
import { DEDICATED_PAGE_SURVEY_BRANDING_DEFAULTS } from "../../../../../lib/survey/dedicatedPageSurveyDefaults";
import type {
  DedicatedPageBackgroundType,
  DedicatedPageSurveyChannel,
} from "../../../../../lib/survey/types";
import { ChannelCollapsibleSection } from "./ChannelCollapsibleSection";
import { ChannelColorPickerRow } from "./ChannelColorPickerRow";
import { ChannelImageUploadField } from "./ChannelImageUploadField";
import { ChannelLogoUploadBlock } from "./ChannelLogoUploadBlock";
import { GradientDirectionControl } from "./GradientDirectionControl";

export interface DedicatedPageSurveyAdvancedSettingsProps {
  channel: DedicatedPageSurveyChannel;
  onChange: (patch: Partial<DedicatedPageSurveyChannel>) => void;
}

const BACKGROUND_TYPES: {
  id: DedicatedPageBackgroundType;
  label: string;
}[] = [
  { id: "solid", label: "Solid" },
  { id: "gradient", label: "Gradient" },
  { id: "image", label: "Image" },
];

const defaults = DEDICATED_PAGE_SURVEY_BRANDING_DEFAULTS;

/**
 * Branded survey page advanced settings (right inspector).
 */
export function DedicatedPageSurveyAdvancedSettings({
  channel,
  onChange,
}: DedicatedPageSurveyAdvancedSettingsProps) {
  const [headerLogoOpen, setHeaderLogoOpen] = useState(true);
  const [sideLogoOpen, setSideLogoOpen] = useState(true);
  const [buttonOpen, setButtonOpen] = useState(true);
  const [sectionOpen, setSectionOpen] = useState(true);
  const [backgroundOpen, setBackgroundOpen] = useState(true);

  const button = channel.button ?? {};
  const section = channel.section ?? {};
  const background = channel.background ?? defaults.background!;
  const backgroundType = background.type ?? "solid";

  const patchButton = useCallback(
    (patch: Partial<NonNullable<DedicatedPageSurveyChannel["button"]>>) => {
      onChange({ button: { ...button, ...patch } });
    },
    [button, onChange],
  );

  const patchSection = useCallback(
    (patch: Partial<NonNullable<DedicatedPageSurveyChannel["section"]>>) => {
      onChange({ section: { ...section, ...patch } });
    },
    [onChange, section],
  );

  const patchBackground = useCallback(
    (
      patch: Partial<NonNullable<DedicatedPageSurveyChannel["background"]>>,
    ) => {
      onChange({ background: { ...background, ...patch } });
    },
    [background, onChange],
  );

  const handleReset = useCallback(() => {
    onChange({ ...defaults });
  }, [onChange]);

  const gradientPreview = `linear-gradient(${background.gradientDirection ?? 70}deg, ${background.gradientStart ?? "#FFFFFF"}, ${background.gradientEnd ?? "#000000"})`;

  return (
    <BlockStack gap="400">
      <ChannelLogoUploadBlock
        title="Header logo"
        enabled={channel.enabledHeaderLogo === true}
        onEnabledChange={(enabledHeaderLogo) => onChange({ enabledHeaderLogo })}
        imageUrl={channel.headerLogo?.url ?? ""}
        onImageUrlChange={(url) =>
          onChange({
            headerLogo: {
              ...channel.headerLogo,
              url,
              alignment: channel.headerLogo?.alignment ?? "center",
              enabled: channel.headerLogo?.enabled ?? true,
            },
          })
        }
        expanded={headerLogoOpen}
        onToggleExpanded={() => setHeaderLogoOpen((open) => !open)}
      />

      <ChannelLogoUploadBlock
        title="Side logo"
        enabled={channel.enabledSideLogo === true}
        onEnabledChange={(enabledSideLogo) => onChange({ enabledSideLogo })}
        imageUrl={channel.sideLogo?.url ?? ""}
        onImageUrlChange={(url) =>
          onChange({
            sideLogo: {
              ...channel.sideLogo,
              url,
              enabled: channel.sideLogo?.enabled ?? true,
            },
          })
        }
        expanded={sideLogoOpen}
        onToggleExpanded={() => setSideLogoOpen((open) => !open)}
      />

      <ChannelCollapsibleSection
        title="Button"
        expanded={buttonOpen}
        onToggle={() => setButtonOpen((open) => !open)}
      >
        <ChannelColorPickerRow
          label="Text"
          value={button.color ?? defaults.button!.color!}
          onChange={(color) => patchButton({ color })}
        />
        <ChannelColorPickerRow
          label="Background"
          value={button.backgroundColor ?? defaults.button!.backgroundColor!}
          onChange={(backgroundColor) => patchButton({ backgroundColor })}
        />
        <ChannelColorPickerRow
          label="Background hover"
          value={button.backgroundHover ?? defaults.button!.backgroundHover!}
          onChange={(backgroundHover) => patchButton({ backgroundHover })}
        />
      </ChannelCollapsibleSection>

      <ChannelCollapsibleSection
        title="Section"
        expanded={sectionOpen}
        onToggle={() => setSectionOpen((open) => !open)}
      >
        <Checkbox
          label="Show background"
          checked={channel.enabledSectionBackground !== false}
          onChange={(enabledSectionBackground) =>
            onChange({ enabledSectionBackground })
          }
        />
        <ChannelColorPickerRow
          label="Primary text"
          value={section.primaryTextColor ?? defaults.section!.primaryTextColor!}
          onChange={(primaryTextColor) => patchSection({ primaryTextColor })}
        />
        <ChannelColorPickerRow
          label="Secondary text"
          value={
            section.secondaryTextColor ?? defaults.section!.secondaryTextColor!
          }
          onChange={(secondaryTextColor) => patchSection({ secondaryTextColor })}
        />
        <ChannelColorPickerRow
          label="Accent"
          value={section.accentColor ?? defaults.section!.accentColor!}
          onChange={(accentColor) => patchSection({ accentColor })}
        />
        <ChannelColorPickerRow
          label="Background"
          value={section.backgroundColor ?? defaults.section!.backgroundColor!}
          onChange={(backgroundColor) => patchSection({ backgroundColor })}
        />
      </ChannelCollapsibleSection>

      <ChannelCollapsibleSection
        title="Background"
        expanded={backgroundOpen}
        onToggle={() => setBackgroundOpen((open) => !open)}
      >
        <InlineGrid columns={3} gap="200">
          {BACKGROUND_TYPES.map((option) => {
            const selected = backgroundType === option.id;
            return (
              <BlockStack key={option.id} gap="200" inlineAlign="center">
                <Text as="p" variant="bodySm">
                  {option.label}
                </Text>
                <UnstyledButton
                  onClick={() => patchBackground({ type: option.id })}
                  aria-pressed={selected}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "block",
                      minHeight: "3.5rem",
                      borderRadius: "var(--p-border-radius-200)",
                      border: selected
                        ? "2px solid var(--p-color-border-emphasis)"
                        : "var(--p-border-width-025) solid var(--p-color-border)",
                      overflow: "hidden",
                      backgroundColor:
                        option.id === "image"
                          ? "var(--p-color-bg-surface-secondary)"
                          : undefined,
                    }}
                  >
                    {option.id === "solid" ? (
                      <span
                        aria-hidden
                        style={{
                          display: "block",
                          minHeight: "3.5rem",
                          backgroundColor: background.colorSolid ?? "#FFFFFF",
                        }}
                      />
                    ) : null}
                    {option.id === "gradient" ? (
                      <span
                        aria-hidden
                        style={{
                          display: "block",
                          minHeight: "3.5rem",
                          background: gradientPreview,
                        }}
                      />
                    ) : null}
                    {option.id === "image" ? (
                      <span
                        aria-hidden
                        style={{
                          display: "flex",
                          minHeight: "3.5rem",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon source={ImageIcon} tone="subdued" />
                      </span>
                    ) : null}
                  </span>
                </UnstyledButton>
              </BlockStack>
            );
          })}
        </InlineGrid>

        {backgroundType === "solid" ? (
          <ChannelColorPickerRow
            label="Solid Color"
            value={background.colorSolid ?? defaults.background!.colorSolid!}
            onChange={(colorSolid) => patchBackground({ colorSolid })}
          />
        ) : null}

        {backgroundType === "gradient" ? (
          <BlockStack gap="400">
            <ChannelColorPickerRow
              label="Gradient Start"
              value={
                background.gradientStart ?? defaults.background!.gradientStart!
              }
              onChange={(gradientStart) => patchBackground({ gradientStart })}
            />
            <ChannelColorPickerRow
              label="Gradient End"
              value={background.gradientEnd ?? defaults.background!.gradientEnd!}
              onChange={(gradientEnd) => patchBackground({ gradientEnd })}
            />
            <GradientDirectionControl
              value={background.gradientDirection ?? 70}
              onChange={(gradientDirection) =>
                patchBackground({ gradientDirection })
              }
            />
          </BlockStack>
        ) : null}

        {backgroundType === "image" ? (
          <ChannelImageUploadField
            imageUrl={background.image?.url ?? ""}
            onImageUrlChange={(url) =>
              patchBackground({ image: { url } })
            }
          />
        ) : null}
      </ChannelCollapsibleSection>

      <Box
        borderWidth="025"
        borderColor="border"
        borderRadius="200"
        padding="300"
      >
        <BlockStack gap="300">
          <InlineGrid columns="1fr auto" gap="200" alignItems="center">
            <Text as="p" fontWeight="semibold">
              Custom CSS
            </Text>
            <Checkbox
              label="Enable custom CSS"
              labelHidden
              checked={channel.enabledCustomCss === true}
              onChange={(enabledCustomCss) => onChange({ enabledCustomCss })}
            />
          </InlineGrid>

          {channel.enabledCustomCss ? (
            <>
              <Text as="p" tone="subdued">
                <Link to="/app/settings">Contact us</Link> if you need styling
                that fits with your theme.
              </Text>
              <TextField
                label="Custom CSS"
                labelHidden
                value={channel.customCss ?? ""}
                onChange={(customCss) => onChange({ customCss })}
                multiline={6}
                placeholder="Enter your custom CSS here..."
                autoComplete="off"
              />
            </>
          ) : null}
        </BlockStack>
      </Box>

      <Divider />

      <Button
        variant="plain"
        tone="critical"
        icon={ResetIcon}
        onClick={handleReset}
      >
        Reset to default
      </Button>
    </BlockStack>
  );
}
