export function SurveyFormFooter({
  stepIndex,
  isLastStep,
  submitting,
  onBack,
}) {
  return (
    <s-grid
      gridTemplateColumns="1fr auto auto"
      gap="small"
      alignItems="center"
    >
      <s-text color="subdued">sea</s-text>
      {stepIndex > 0 ? (
        <s-button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={onBack}
        >
          {shopify.i18n.translate("back") || "Back"}
        </s-button>
      ) : (
        <s-box />
      )}
      <s-button
        type="submit"
        variant="primary"
        disabled={submitting}
        loading={submitting}
      >
        {isLastStep
          ? shopify.i18n.translate("submit") || "Submit"
          : shopify.i18n.translate("next") || "Next"}
      </s-button>
    </s-grid>
  );
}
