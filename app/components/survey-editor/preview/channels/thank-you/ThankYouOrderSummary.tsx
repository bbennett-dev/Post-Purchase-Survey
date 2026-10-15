import {
  BlockStack,
  Box,
  Divider,
  InlineGrid,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { THANK_YOU_PREVIEW_ORDER } from "./mock-order";

export function ThankYouOrderSummary() {
  const order = THANK_YOU_PREVIEW_ORDER;

  return (
    <Box
      padding="500"
      background="bg-surface-secondary"
      minHeight="100%"
    >
      <BlockStack gap="400">
        <BlockStack gap="300">
          {order.lineItems.map((item) => (
            <InlineGrid
              key={item.id}
              columns="auto 1fr auto"
              gap="300"
              alignItems="start"
            >
              <div style={{ position: "relative", display: "inline-block" }}>
                <Thumbnail source={item.imageUrl} alt={item.title} size="small" />
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    background: "var(--p-color-bg-fill-inverse)",
                    color: "var(--p-color-text-inverse)",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.quantity}
                </div>
              </div>
              <BlockStack gap="050">
                <Text as="p" fontWeight="semibold">
                  {item.title}
                </Text>
                <Text as="p" tone="subdued" variant="bodySm">
                  {item.subtitle}
                </Text>
              </BlockStack>
              <Text as="p">{item.price}</Text>
            </InlineGrid>
          ))}
        </BlockStack>

        <Divider />

        <BlockStack gap="200">
          <InlineStack align="space-between">
            <Text as="span" tone="subdued">Subtotal</Text>
            <Text as="span">{order.subtotal}</Text>
          </InlineStack>
          <InlineStack align="space-between">
            <Text as="span" tone="subdued">Estimated taxes</Text>
            <Text as="span">{order.tax}</Text>
          </InlineStack>
          <InlineStack align="space-between" blockAlign="end">
            <BlockStack gap="050">
              <Text as="span" fontWeight="bold">Total</Text>
              <Text as="span" tone="subdued" variant="bodySm">
                Including {order.tax} in taxes
              </Text>
            </BlockStack>
            <Text as="span" fontWeight="bold" variant="headingMd">
              {order.total}
            </Text>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Box>
  );
}
