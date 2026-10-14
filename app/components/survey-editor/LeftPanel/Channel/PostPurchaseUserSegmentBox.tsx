import { useCallback, useMemo, useState } from "react";
import { BlockStack, Box, Button, Checkbox } from "@shopify/polaris";
import type {
  PostPurchasePageChannel,
  SurveyCustomerSegmentGroup,
} from "../../../../lib/survey/types";
import { CreateCustomerGroupModal } from "./CreateCustomerGroupModal";

export interface PostPurchaseUserSegmentBoxProps {
  channel: PostPurchasePageChannel;
  onChange: (patch: Partial<PostPurchasePageChannel>) => void;
}

function normalizeSegmentGroups(
  raw: NonNullable<PostPurchasePageChannel["userTargeting"]>["customerSegment"],
): SurveyCustomerSegmentGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is SurveyCustomerSegmentGroup => {
    if (typeof item !== "object" || item === null) return false;
    const group = item as SurveyCustomerSegmentGroup;
    return (
      typeof group.id === "string" &&
      typeof group.name === "string" &&
      typeof group.condition === "object" &&
      group.condition !== null &&
      Array.isArray(group.condition.tags)
    );
  });
}

/**
 * Segment targeting options (Thank you page left panel).
 */
export function PostPurchaseUserSegmentBox({
  channel,
  onChange,
}: PostPurchaseUserSegmentBoxProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const targeting = channel.userTargeting ?? {};
  const returnCustomer = targeting.returnCustomer === true;
  const newCustomer = targeting.newCustomer === true;
  const customGroups = useMemo(
    () => normalizeSegmentGroups(targeting.customerSegment),
    [targeting.customerSegment],
  );

  const patchTargeting = useCallback(
    (patch: Partial<NonNullable<PostPurchasePageChannel["userTargeting"]>>) => {
      onChange({
        userTargeting: {
          type: "segment",
          customerSegment: customGroups,
          returnCustomer,
          newCustomer,
          ...patch,
        },
      });
    },
    [customGroups, newCustomer, onChange, returnCustomer],
  );

  const updateCustomGroup = useCallback(
    (groupId: string, patch: Partial<SurveyCustomerSegmentGroup>) => {
      patchTargeting({
        customerSegment: customGroups.map((group) =>
          group.id === groupId ? { ...group, ...patch } : group,
        ),
      });
    },
    [customGroups, patchTargeting],
  );

  const handleCreateGroup = useCallback(
    (group: SurveyCustomerSegmentGroup) => {
      patchTargeting({
        customerSegment: [...customGroups, group],
      });
    },
    [customGroups, patchTargeting],
  );

  return (
    <>
      <Box
        padding="400"
        background="bg-surface"
        borderWidth="025"
        borderColor="border"
        borderRadius="300"
      >
        <BlockStack gap="200">
          <Checkbox
            label="Return customer"
            checked={returnCustomer}
            onChange={(checked) => patchTargeting({ returnCustomer: checked })}
          />

          <Checkbox
            label="New customer"
            checked={newCustomer}
            onChange={(checked) => patchTargeting({ newCustomer: checked })}
          />

          {customGroups.map((group) => (
            <Checkbox
              key={group.id}
              label={group.name}
              checked={group.enabled !== false}
              onChange={(checked) =>
                updateCustomGroup(group.id, { enabled: checked })
              }
            />
          ))}

          {/* <Box paddingBlockStart="100">
            <Button variant="plain" onClick={() => setCreateModalOpen(true)}>
              + Create new group
            </Button>
          </Box> */}
        </BlockStack>
      </Box>

      <CreateCustomerGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateGroup}
      />
    </>
  );
}
