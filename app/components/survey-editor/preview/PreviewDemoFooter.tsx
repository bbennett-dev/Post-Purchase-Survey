import { BlockStack, Button, InlineStack, Text } from "@shopify/polaris";

interface PreviewDemoFooterProps {
  onRestartDemo: () => void;
}

export function PreviewDemoFooter({ onRestartDemo }: PreviewDemoFooterProps) {
  return (
    <BlockStack gap="200" inlineAlign="center">
      <InlineStack gap="100" blockAlign="center">
        <Text as="span" tone="subdued">
          Want to hide the SEA logo?
        </Text>
        <Button variant="plain">Let us help</Button>
      </InlineStack>
      <Button onClick={onRestartDemo}>Start demo again</Button>
    </BlockStack>
  );
}
