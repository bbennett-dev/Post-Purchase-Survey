import { BlockStack, Box, Button, Checkbox, Divider, InlineStack, Text } from "@shopify/polaris";
import { THANK_YOU_PREVIEW_ORDER } from "./mock-order";

interface ThankYouOrderDetailsBlockProps {
  showShopAppCta?: boolean;
}

/** Shopify thank-you “Order details” + optional Shop app CTA (competitor desktop stack). */
export function ThankYouOrderDetailsBlock({
  showShopAppCta = true,
}: ThankYouOrderDetailsBlockProps) {
  const order = THANK_YOU_PREVIEW_ORDER;

  return (
    <BlockStack gap="400">
      {showShopAppCta ? (
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingSm">
              Your order is confirmed
            </Text>
            <Text as="p" tone="subdued">
              You&apos;ll get a confirmation email with your order number soon.
            </Text>
          </BlockStack>
          <Button fullWidth>Download Shop to track package</Button>
          <Checkbox label="Email me with news and offers" checked={false} />
        </BlockStack>
      ) : null}

      <BlockStack gap="300">
        <Text as="h2" variant="headingSm">Order details</Text>
        <BlockStack gap="300">
          <DetailGroup
            title="Contact information"
            lines={[order.contactEmail]}
          />
          <DetailGroup
            title="Shipping address"
            lines={order.shippingAddress}
          />
          <DetailGroup
            title="Shipping method"
            lines={[order.shippingMethod]}
          />
        </BlockStack>
      </BlockStack>
    </BlockStack>
  );
}

function DetailGroup({ title, lines }: { title: string; lines: string[] }) {
  return (
    <BlockStack gap="100">
      <Text as="p" tone="subdued" variant="bodySm">{title}</Text>
      {lines.map((line) => (
        <Text key={line} as="p">{line}</Text>
      ))}
    </BlockStack>
  );
}

/** Payment + billing tail shown when scrolling fullscreen thank-you preview. */
export function ThankYouPaymentTailBlock() {
  const order = THANK_YOU_PREVIEW_ORDER;

  return (
    <Box padding="600" background="bg-surface-secondary">
      <div style={{ maxWidth: "480px", marginInline: "auto" }}>
        <BlockStack gap="400">
          <BlockStack gap="300">
            <DetailGroup title="Payment method" lines={[order.paymentLine]} />
            <DetailGroup title="Billing address" lines={order.billingAddress} />
          </BlockStack>
          <Box padding="300" background="bg-surface-secondary" borderRadius="200">
            <Checkbox
              label="Save my information for a faster checkout"
              checked={false}
            />
          </Box>
          <Button variant="primary" fullWidth>Continue shopping</Button>
          <InlineStack gap="100" align="center">
            <Text as="span" tone="subdued">Need help?</Text>
            <Button variant="plain">Contact us</Button>
          </InlineStack>
          <Divider />
          <BlockStack gap="200" inlineAlign="center">
            <Button variant="plain">Return policy</Button>
            <Button variant="plain">Privacy policy</Button>
            <Button variant="plain">Terms of service</Button>
          </BlockStack>
        </BlockStack>
      </div>
    </Box>
  );
}
