export function SurveyFormFooter({
  stepIndex,
  isLastStep,
  submitting,
  onBack,
}) {
  return (
    <s-grid gridTemplateColumns="1fr" justifyItems="end">
      <s-grid gridTemplateColumns="auto auto" gap="small" alignItems="center">
        {stepIndex > 0 ? (
          <s-button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={onBack}
          >
            {shopify.i18n.translate("back") || "Back"}
          </s-button>
        ) : null}
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
    </s-grid>
  );
}
