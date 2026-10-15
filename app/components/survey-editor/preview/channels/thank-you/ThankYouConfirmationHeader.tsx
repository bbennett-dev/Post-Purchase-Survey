import { BlockStack, Text } from "@shopify/polaris";

interface ThankYouConfirmationHeaderProps {
  confirmationCode: string;
  customerName: string;
}

/**
 * Shopify Thank you page confirmation row (outline check + stacked labels).
 */
export function ThankYouConfirmationHeader({
  confirmationCode,
  customerName,
}: ThankYouConfirmationHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--p-space-300)",
      }}
    >
      <CheckoutOutlineCheckIcon />
      <BlockStack gap="050">
        <Text as="p" variant="bodySm" tone="subdued">
          Confirmation #{confirmationCode}
        </Text>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Thank you, {customerName}!
        </Text>
      </BlockStack>
    </div>
  );
}

function CheckoutOutlineCheckIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="var(--p-color-border-emphasis)"
        strokeWidth="1.75"
      />
      <path
        d="M9 14.25L12.25 17.5L19 10.75"
        stroke="var(--p-color-border-emphasis)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
