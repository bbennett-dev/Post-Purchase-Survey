import { useCallback, useMemo, useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  Checkbox,
  Icon,
  Popover,
  Scrollable,
  Text,
  TextField,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { SEGMENT_TAG_SUGGESTIONS } from "./segmentConditionOptions";

export interface SegmentTagsSelectProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

function activatorLabel(tags: string[]): string {
  if (tags.length === 0) return "Select tags...";
  if (tags.length === 1) return tags[0]!;
  return `${tags.length} tags selected`;
}

/**
 * Select-style control that opens a search popover for customer tags (competitor UI).
 */
export function SegmentTagsSelect({
  selectedTags,
  onChange,
}: SegmentTagsSelectProps) {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState("");

  const toggleActive = useCallback(() => setActive((open) => !open), []);

  const close = useCallback(() => {
    setActive(false);
    setQuery("");
  }, []);

  const filteredTags = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = new Set([...SEGMENT_TAG_SUGGESTIONS, ...selectedTags]);
    const list = [...pool].sort((a, b) => a.localeCompare(b));
    if (!needle) return list;
    return list.filter((tag) => tag.toLowerCase().includes(needle));
  }, [query, selectedTags]);

  const toggleTag = useCallback(
    (tag: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedTags, tag]);
        return;
      }
      onChange(selectedTags.filter((t) => t !== tag));
    },
    [onChange, selectedTags],
  );

  const activator = (
    <Button
      onClick={toggleActive}
      disclosure="select"
      fullWidth
      textAlign="left"
    >
      {activatorLabel(selectedTags)}
    </Button>
  );

  return (
    <Popover
      active={active}
      activator={activator}
      onClose={close}
      preferredAlignment="left"
      autofocusTarget="first-node"
    >
      <Box padding="300" minWidth="16rem">
        <BlockStack gap="300">
          <TextField
            label="Search tags"
            labelHidden
            value={query}
            onChange={setQuery}
            placeholder="Search"
            prefix={<Icon source={SearchIcon} tone="subdued" />}
            autoComplete="off"
            clearButton
            onClearButtonClick={() => setQuery("")}
          />
          <Scrollable style={{ maxHeight: "12rem" }}>
            <BlockStack gap="100">
              {filteredTags.length === 0 ? (
                <Box padding="200">
                  <Text as="p" tone="subdued">
                    No tags found
                  </Text>
                </Box>
              ) : (
                filteredTags.map((tag) => (
                  <Checkbox
                    key={tag}
                    label={tag}
                    checked={selectedTags.includes(tag)}
                    onChange={(checked) => toggleTag(tag, checked)}
                  />
                ))
              )}
            </BlockStack>
          </Scrollable>
        </BlockStack>
      </Box>
    </Popover>
  );
}
