import { BlockStack, Button, ButtonGroup, Select, Text } from "@shopify/polaris";
import type { PostPurchasePageChannel } from "../../../../lib/survey/types";
import { PostPurchaseUserSegmentBox } from "./PostPurchaseUserSegmentBox";

interface PostPurchaseSettingsProps {
  channel: PostPurchasePageChannel;
  onChange: (patch: Partial<PostPurchasePageChannel>) => void;
}

const TARGETING_OPTIONS = [
  { id: "all_users" as const, label: "All users" },
  { id: "segment" as const, label: "A segment of users" },
];

const RECURRENCE_OPTIONS = [
  { value: "once_per_customer", label: "Once per customer" },
  { value: "every_order", label: "Every order" },
];

/**
 * Core Thank you page settings in the left accordion (targeting + recurrence).
 */
export function PostPurchaseSettings({
  channel,
  onChange,
}: PostPurchaseSettingsProps) {
  const targetingType = channel.userTargeting?.type ?? "all_users";
  const recurrence = channel.widgetRecurrence ?? "once_per_customer";

  return (
    <BlockStack gap="400">
      <BlockStack gap="200">
        <Text as="p" variant="bodySm" tone="subdued">
          User targeting
        </Text>
        <ButtonGroup variant="segmented" fullWidth>
          {TARGETING_OPTIONS.map((option) => (
            <Button
              key={option.id}
              pressed={targetingType === option.id}
              onClick={() => {
                if (option.id === "segment") {
                  onChange({
                    userTargeting: {
                      type: "segment",
                      returnCustomer:
                        channel.userTargeting?.returnCustomer ?? true,
                      newCustomer: channel.userTargeting?.newCustomer ?? false,
                      customerSegment: channel.userTargeting?.customerSegment ?? [],
                    },
                  });
                  return;
                }
                onChange({
                  userTargeting: {
                    type: "all_users",
                    customerSegment: channel.userTargeting?.customerSegment ?? [],
                  },
                });
              }}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>

        {targetingType === "segment" ? (
          <PostPurchaseUserSegmentBox channel={channel} onChange={onChange} />
        ) : null}
      </BlockStack>

      <Select
        label="Widget recurrence"
        options={RECURRENCE_OPTIONS}
        value={recurrence}
        onChange={(widgetRecurrence) => onChange({ widgetRecurrence })}
      />
    </BlockStack>
  );
}
