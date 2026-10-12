import { fieldValue } from "../../field-value";
import type { PostPurchasePageChannel } from "../../../../lib/survey/types";

interface PostPurchaseSettingsProps {
  channel: PostPurchasePageChannel;
  onChange: (patch: Partial<PostPurchasePageChannel>) => void;
}

const TARGETING_OPTIONS = [
  { id: "all_users", label: "All users" },
  { id: "segment", label: "A segment of users" },
] as const;

const RECURRENCE_OPTIONS = [
  { value: "once_per_customer", label: "Once per customer" },
  { value: "every_order", label: "Every order" },
] as const;

/**
 * Core Thank you / Order status settings shown in the left accordion body.
 */
export function PostPurchaseSettings({
  channel,
  onChange,
}: PostPurchaseSettingsProps) {
  const targetingType = channel.userTargeting?.type ?? "all_users";
  const recurrence = channel.widgetRecurrence ?? "once_per_customer";

  return (
    <s-stack gap="base">
      <s-stack gap="small-200">
        <s-text type="strong">User targeting</s-text>
        <s-button-group gap="none" accessibilityLabel="User targeting">
          {TARGETING_OPTIONS.map((option) => {
            const active = targetingType === option.id;
            return (
              <s-press-button
                key={option.id}
                slot="secondary-actions"
                variant="secondary"
                pressed={active}
                inlineSize="fill"
                onClick={() =>
                  onChange({
                    userTargeting: {
                      ...channel.userTargeting,
                      type: option.id,
                      customerSegment:
                        channel.userTargeting?.customerSegment ?? [],
                    },
                  })
                }
              >
                {option.label}
              </s-press-button>
            );
          })}
        </s-button-group>
      </s-stack>

      <s-select
        label="Widget recurrence"
        value={recurrence}
        onChange={(event) => onChange({ widgetRecurrence: fieldValue(event) })}
      >
        {RECURRENCE_OPTIONS.map((opt) => (
          <s-option key={opt.value} value={opt.value}>
            {opt.label}
          </s-option>
        ))}
      </s-select>
    </s-stack>
  );
}
