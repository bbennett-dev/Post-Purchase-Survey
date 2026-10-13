import { useEffect, useState } from "react";
import {
  Banner,
  BlockStack,
  Box,
  Card,
  Divider,
  InlineStack,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { CursorBannerIcon, CursorIcon } from "@shopify/polaris-icons";
import type {
  DiscountPreviewTarget,
  SurveyDiscount,
  SurveyDocument,
} from "../../../../lib/survey/types";
import { ChannelSwitch } from "../Channel/ChannelSwitch";
import { DiscountTargetRow } from "./DiscountTargetRow";

/** Competitor “Display discount code on” — thank you card only; email not shipped yet. */
const DISPLAY_ON_OPTIONS = [
  { label: "Thank you card", value: "card" },
  { label: "Email (coming soon)", value: "email", disabled: true },
];

export interface DiscountPanelProps {
  survey: SurveyDocument;
  selectedDiscountTarget: DiscountPreviewTarget;
  onSelectDiscountTarget: (target: DiscountPreviewTarget) => void;
  onDiscountChange: (patch: Partial<SurveyDiscount>) => void;
}

/**
 * Discount tab (left): competitor layout — toggle, code, display-on, preview targets.
 */
export function DiscountPanel({
  survey,
  selectedDiscountTarget,
  onSelectDiscountTarget,
  onDiscountChange,
}: DiscountPanelProps) {
  const { discount } = survey;
  const [shareWarningDismissed, setShareWarningDismissed] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [codeBlurred, setCodeBlurred] = useState(false);

  useEffect(() => {
    if (!discount.enabled) {
      setCodeFocused(false);
      setCodeBlurred(false);
    }
  }, [discount.enabled]);

  const codeEmpty = !(discount.code?.trim()?.length ?? 0);
  const showCodeError = discount.enabled && codeBlurred && codeEmpty;

  /** Only thank you card is selectable; legacy banner/email values show as card. */
  const displayOn = "card";

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center" wrap={false}>
        <Text as="h2" variant="headingMd">
          Discount
        </Text>
        <ChannelSwitch
          enabled={discount.enabled}
          accessibilityLabel="Enable discount reward"
          onChange={(enabled) => {
            onDiscountChange({ enabled });
            if (enabled) {
              setCodeBlurred(false);
              setCodeFocused(true);
            }
          }}
        />
      </InlineStack>

      <Text as="p" variant="bodySm" tone="subdued">
        We recommend offering discounts to boost survey responses.
      </Text>

      {discount.enabled ? (
        <BlockStack gap="400">
          <TextField
            label="Discount code"
            value={discount.code ?? ""}
            onChange={(code) => onDiscountChange({ code })}
            autoComplete="off"
            focused={codeFocused}
            selectTextOnFocus
            onFocus={() => {
              setCodeFocused(true);
              setCodeBlurred(false);
            }}
            onBlur={() => {
              setCodeFocused(false);
              setCodeBlurred(true);
            }}
            error={showCodeError ? "This field is required" : undefined}
          />

          {!shareWarningDismissed ? (
            <Card padding="0">
              <Banner
                tone="info"
                onDismiss={() => setShareWarningDismissed(true)}
              >
                We cannot control if your customers share the discount code
                with others
              </Banner>
            </Card>
          ) : null}

          <Select
            label="Display discount code on"
            options={DISPLAY_ON_OPTIONS}
            value={displayOn}
            onChange={(displayOnValue) => {
              if (displayOnValue === "card") {
                onDiscountChange({ displayOn: displayOnValue });
              }
            }}
          />

          <Box
            borderWidth="025"
            borderColor="border"
            borderRadius="200"
            overflowX="hidden"
            overflowY="hidden"
          >
            <DiscountTargetRow
              label="Discount banner"
              icon={CursorBannerIcon}
              selected={selectedDiscountTarget === "banner"}
              onSelect={() => onSelectDiscountTarget("banner")}
            />
            <Divider />
            <DiscountTargetRow
              label="Thank you card"
              icon={CursorIcon}
              selected={selectedDiscountTarget === "thankYouCard"}
              onSelect={() => onSelectDiscountTarget("thankYouCard")}
            />
          </Box>
        </BlockStack>
      ) : null}
    </BlockStack>
  );
}
