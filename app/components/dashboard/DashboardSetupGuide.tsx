import { useMemo } from "react";
import type { DashboardSnapshot } from "../../lib/dashboard/dashboard.server";
import {
  SETUP_GUIDE_STEP_IDS,
  buildSetupGuideAutoCompletion,
  type SetupGuideStepId,
} from "../../lib/dashboard/setup-guide-steps";
import { isAppEmbedActive } from "../../lib/shopify/extension-placement-status";
import type { CheckoutEditorLinks } from "../../lib/shopify/checkout-editor-url.server";
import type { ExtensionPlacementLoadState } from "../../hooks/useExtensionPlacementStatus";
import { useSetupGuidePersistence } from "../../hooks/useSetupGuidePersistence";
import { responsesHref } from "../../lib/routes/responses-route";
import { SetupGuide, type SetupGuideItem } from "./SetupGuide";

/**
 * Dashboard setup guide wired to shop metrics and checkout embed status.
 */
export function DashboardSetupGuide({
  shopDomain,
  snapshot,
  checkoutEditor,
  placementState,
}: {
  shopDomain: string;
  snapshot: DashboardSnapshot;
  checkoutEditor: CheckoutEditorLinks;
  placementState: ExtensionPlacementLoadState;
}) {
  const { dismissed, dismiss, toggleStep, isStepComplete } =
    useSetupGuidePersistence(shopDomain);

  const placement =
    placementState.status === "ready" ? placementState.placement : null;
  const appEmbedOn = placement ? isAppEmbedActive(placement) : false;
  const embedSettingsDisabled =
    placementState.status === "ready" && appEmbedOn;

  const auto = useMemo(
    () => buildSetupGuideAutoCompletion(snapshot, appEmbedOn),
    [appEmbedOn, snapshot],
  );

  const items: SetupGuideItem[] = useMemo(() => {
    const completeFor = (id: SetupGuideStepId) =>
      isStepComplete(id, auto[id]);

    return [
      {
        id: "enable-embed",
        title: "Enable app embed on Thank you",
        description:
          "Open app embed settings and add Post Purchase Survey on the Thank you page (block or announcement bar). Save the checkout profile so shoppers see the survey after purchase.",
        complete: completeFor("enable-embed"),
        primaryButton: {
          content: "App embed settings",
          props: {
            href: checkoutEditor.thankYou,
            target: "_blank",
            disabled: embedSettingsDisabled,
          },
        },
        secondaryButton: {
          content: "Order status editor",
          props: {
            href: checkoutEditor.orderStatus,
            target: "_blank",
          },
        },
      },
      {
        id: "create-survey",
        title: "Create your first survey",
        description:
          "Add attribution questions (how did you hear about us), optional follow-ups, and customize Thank you styling in the survey editor.",
        complete: completeFor("create-survey"),
        primaryButton: {
          content: "Create survey",
          props: { href: "/app/surveys" },
        },
        secondaryButton: {
          content: "Browse templates",
          props: { href: "/app/surveys/templates" },
        },
      },
      {
        id: "publish-live",
        title: "Publish a live survey to checkout",
        description:
          "Set your survey status to live and save. Only live surveys sync to checkout — paused surveys stay hidden from buyers.",
        complete: completeFor("publish-live"),
        primaryButton: {
          content: "Manage surveys",
          props: { href: "/app/surveys" },
        },
      },
      {
        id: "first-response",
        title: "Collect your first response",
        description:
          "Place a test order on your store and complete the Thank you survey. Submissions appear under Responses with order and answer details.",
        complete: completeFor("first-response"),
        primaryButton: {
          content: "View responses",
          props: { href: responsesHref({ view: "active" }) },
        },
      },
    ];
  }, [
    auto,
    checkoutEditor.orderStatus,
    checkoutEditor.thankYou,
    embedSettingsDisabled,
    isStepComplete,
  ]);

  if (dismissed) {
    return null;
  }

  return (
    <SetupGuide
      subtitle="Use this guide to enable checkout placement, publish a survey, and start collecting post-purchase attribution."
      items={items}
      onDismiss={dismiss}
      onStepComplete={async (stepId) => {
        if (!SETUP_GUIDE_STEP_IDS.includes(stepId as SetupGuideStepId)) {
          return;
        }
        const id = stepId as SetupGuideStepId;
        const current = isStepComplete(id, auto[id]);
        toggleStep(id, !current);
      }}
    />
  );
}
