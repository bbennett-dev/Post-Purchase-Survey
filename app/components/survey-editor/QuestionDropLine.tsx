import { Box } from "@shopify/polaris";

/** Empty slot in the list where the dragged row will land. */
export function QuestionDropLine() {
  return (
    <Box paddingBlock="050" role="presentation" aria-hidden>
      <Box
        minHeight="32px"
        borderRadius="200"
        borderWidth="025"
        borderColor="border-secondary"
        background="bg-surface-secondary"
      />
    </Box>
  );
}
