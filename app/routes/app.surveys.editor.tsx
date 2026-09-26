import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { closeSurveyEditor } from "../lib/open-survey-editor";
import { authenticate } from "../shopify.server";

type EditorMode = "create" | "template" | "edit";

interface EditorLoaderData {
  mode: EditorMode;
  heading: string;
  sourceLabel: string;
}

const DISCARD_MODAL_ID = "discard-survey-changes";

const TEMPLATE_NAMES: Record<string, string> = {
  blank: "Blank survey",
  hdyhau: "How did you hear about us?",
  campaign: "Campaign attribution",
  repeat: "Repeat buyer check",
  gift: "Gift buyer",
  sms: "Email and SMS source",
  product: "Post-purchase product feedback",
  delivery: "Shipping and delivery",
  nps: "Post-purchase NPS",
  wholesale: "Wholesale source",
};

/**
 * Survey editor loader.
 * The same route opens for a blank survey, a template, or an existing survey.
 * Question content stays empty until the editor sections are designed.
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<EditorLoaderData> => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const templateId = url.searchParams.get("template");
  const surveyId = url.searchParams.get("survey");

  if (surveyId) {
    return {
      mode: "edit",
      heading: "Edit survey",
      sourceLabel: "Changes here update this survey.",
    };
  }

  if (templateId && templateId !== "blank") {
    return {
      mode: "template",
      heading: TEMPLATE_NAMES[templateId] ?? "New survey",
      sourceLabel: "Started from a template. Question setup comes next.",
    };
  }

  return {
    mode: "create",
    heading: "New survey",
    sourceLabel: "Blank survey. Question setup comes next.",
  };
};

function discardMessage(mode: EditorMode): string {
  if (mode === "edit") {
    return "Your latest edits will be lost. The last saved version of this survey stays as it is.";
  }

  return "This survey hasn't been saved. Discarding closes the editor and removes what you started.";
}

/**
 * Opens the discard confirmation from the title-bar button.
 * Title-bar actions are projected into the admin chrome, so this uses the
 * modal method instead of commandFor.
 */
function openDiscardModal(): void {
  const modal = document.getElementById(DISCARD_MODAL_ID) as
    | (HTMLElement & { showOverlay?: () => void })
    | null;
  modal?.showOverlay?.();
}

/**
 * Fullscreen survey editor shell.
 * Left outline, center Thank You preview, and right settings are placeholders
 * until those sections are built. Save does not persist yet.
 */
export default function SurveyEditorPage() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  return (
    <s-page heading={data.heading} inlineSize="large">
      <s-button slot="secondary-actions" onClick={openDiscardModal}>
        Discard
      </s-button>
      <s-button
        slot="primary-action"
        variant="primary"
        icon="save"
        onClick={() => {
          shopify.toast.show("Saving comes next");
        }}
      >
        Save
      </s-button>

      <s-query-container>
        <s-grid
          gridTemplateColumns="@container (inline-size <= 900px) 1fr, 220px minmax(0, 1fr) 260px"
          gap="base"
        >
          <s-section heading="Content" accessibilityLabel="Survey outline">
            <s-paragraph color="subdued">
              Questions and endings will be listed here.
            </s-paragraph>
          </s-section>
          <s-section
            heading="Preview"
            accessibilityLabel="Thank you page preview"
          >
            <s-paragraph color="subdued">
              The Thank You page preview will appear here.
            </s-paragraph>
          </s-section>
          <s-section heading="Question" accessibilityLabel="Question settings">
            <s-paragraph color="subdued">
              Settings for the selected question will appear here.
            </s-paragraph>
          </s-section>
        </s-grid>
      </s-query-container>

      <s-modal
        id={DISCARD_MODAL_ID}
        heading="Discard unsaved changes?"
        size="small"
        accessibilityLabel="Discard unsaved survey changes"
      >
        <s-paragraph>{discardMessage(data.mode)}</s-paragraph>
        <s-button
          slot="secondary-actions"
          variant="secondary"
          commandFor={DISCARD_MODAL_ID}
          command="--hide"
        >
          Continue editing
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          tone="critical"
          commandFor={DISCARD_MODAL_ID}
          command="--hide"
          onClick={() => {
            closeSurveyEditor();
          }}
        >
          Discard changes
        </s-button>
      </s-modal>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
