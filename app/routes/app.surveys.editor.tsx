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

/**
 * Fullscreen survey editor shell.
 * Left outline, center Thank You preview, and right settings are placeholders
 * until those sections are built. Save and discard do not persist yet.
 */
export default function SurveyEditorPage() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  return (
    <s-page heading={data.heading} inlineSize="large">
      <s-button
        slot="secondary-actions"
        onClick={() => {
          closeSurveyEditor();
        }}
      >
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
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
