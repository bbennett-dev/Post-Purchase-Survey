import { useCallback, useEffect, useState } from "react";
import {
  BlockStack,
  InlineGrid,
  Modal,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import type {
  SurveyCustomerSegmentGroup,
  SegmentConditionField,
  SegmentConditionOperator,
} from "../../../../lib/survey/types";
import {
  SEGMENT_FIELD_OPTIONS,
  SEGMENT_OPERATOR_OPTIONS,
} from "./segmentConditionOptions";
import { SegmentTagsSelect } from "./SegmentTagsSelect";

const DEFAULT_FIELD: SegmentConditionField = "user_tag";
const DEFAULT_OPERATOR: SegmentConditionOperator = "include";

export interface CreateCustomerGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (group: SurveyCustomerSegmentGroup) => void;
}

/**
 * Create a custom user segment group (competitor “Create group” modal).
 */
export function CreateCustomerGroupModal({
  open,
  onClose,
  onCreate,
}: CreateCustomerGroupModalProps) {
  const [name, setName] = useState("");
  const [field, setField] = useState<SegmentConditionField>(DEFAULT_FIELD);
  const [operator, setOperator] =
    useState<SegmentConditionOperator>(DEFAULT_OPERATOR);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setName("");
      setField(DEFAULT_FIELD);
      setOperator(DEFAULT_OPERATOR);
      setTags([]);
    }
  }, [open]);

  const canCreate = name.trim().length > 0 && tags.length > 0;

  const handleCreate = useCallback(() => {
    if (!canCreate) return;
    onCreate({
      id: `segment_group_${Date.now()}`,
      name: name.trim(),
      condition: {
        field,
        operator,
        tags,
      },
      enabled: true,
    });
    onClose();
  }, [canCreate, field, name, onClose, onCreate, operator, tags]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create group"
      primaryAction={{
        content: "Create",
        onAction: handleCreate,
        disabled: !canCreate,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <TextField
            label="Group name"
            value={name}
            onChange={setName}
            placeholder="Enter group name"
            autoComplete="off"
          />

          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              Segment condition
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 3 }} gap="200">
              <Select
                label="Segment condition field"
                labelHidden
                options={SEGMENT_FIELD_OPTIONS}
                value={field}
                onChange={(value) => setField(value as SegmentConditionField)}
              />
              <Select
                label="Segment condition operator"
                labelHidden
                options={SEGMENT_OPERATOR_OPTIONS}
                value={operator}
                onChange={(value) =>
                  setOperator(value as SegmentConditionOperator)
                }
              />
              <SegmentTagsSelect selectedTags={tags} onChange={setTags} />
            </InlineGrid>
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
