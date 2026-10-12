import { Box, Icon, InlineStack, Text } from "@shopify/polaris";
import { LightbulbIcon } from "@shopify/polaris-icons";

/** Hint row aligned with question / ending list icons. */
export function BestPracticeTip() {
  return (
    <Box paddingInline="200" paddingBlockStart="300" paddingBlockEnd="200">
      <InlineStack gap="200" blockAlign="center" wrap={false}>
        <Box minWidth="20px" width="20px">
          <Icon source={LightbulbIcon} tone="subdued" />
        </Box>
        <Text as="p" variant="bodySm" tone="subdued">
          <em>Best practice: Max 3 questions</em>
        </Text>
      </InlineStack>
    </Box>
  );
}
