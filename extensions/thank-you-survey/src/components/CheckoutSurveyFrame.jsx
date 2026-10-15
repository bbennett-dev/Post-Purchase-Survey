/** Card shell aligned with admin `CheckoutSurveyFrame` in `SurveyPreviewStep`. */
export function CheckoutSurveyFrame({ children }) {
  return (
    <s-box
      background="base"
      border="base"
      borderRadius="large"
      overflow="hidden"
      inlineSize="fill"
    >
      <s-box blockSize="4px" background="strong" inlineSize="fill" />
      <s-box padding="large">{children}</s-box>
    </s-box>
  );
}
