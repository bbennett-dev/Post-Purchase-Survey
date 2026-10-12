import { useEffect, useRef, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { SurveyEditorChrome } from "../components/survey-editor/SurveyEditorChrome";
import editorChromeStyles from "../components/survey-editor/editor-chrome.module.css";
import "../components/survey-editor/editor-viewport.css";
import { useFillRemainingViewportHeight } from "../components/survey-editor/useFillRemainingViewportHeight";
import { closeSurveyEditor } from "../lib/open-survey-editor";
import { createSampleSurvey } from "../lib/survey/questions";
import {
  PublishSurveyError,
  publishSurveysToShop,
} from "../lib/survey/publish-shopify.server";
import type { CheckoutEditorLinks } from "../lib/shopify/checkout-editor-url.server";
import { fetchCheckoutEditorLinks } from "../lib/shopify/checkout-editor-url.server";
import type { SurveyDocument } from "../lib/survey/types";
import { authenticate } from "../shopify.server";

type EditorMode = "create" | "template" | "edit";

interface EditorLoaderData {
  mode: EditorMode;
  heading: string;
  sourceLabel: string;
  checkoutEditor: CheckoutEditorLinks;
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
  const { admin, session } = await authenticate.admin(request);
  const checkoutEditor = await fetchCheckoutEditorLinks(admin, session.shop);

  const url = new URL(request.url);
  const templateId = url.searchParams.get("template");
  const surveyId = url.searchParams.get("survey");

  if (surveyId) {
    return {
      mode: "edit",
      heading: "Edit survey",
      sourceLabel: "Changes here update this survey.",
      checkoutEditor,
    };
  }

  if (templateId && templateId !== "blank") {
    return {
      mode: "template",
      heading: TEMPLATE_NAMES[templateId] ?? "New survey",
      sourceLabel: "Started from a template. Question setup comes next.",
      checkoutEditor,
    };
  }

  return {
    mode: "create",
    heading: "New survey",
    sourceLabel: "Blank survey. Question setup comes next.",
    checkoutEditor,
  };
};

interface SaveActionData {
  ok: boolean;
  error?: string;
  handles?: string[];
}

/**
 * Publishes the in-editor survey to shop metafields and the survey metaobject.
 * Extensions read `$app.checkout_surveys` on Thank you and Order status pages.
 */
export const action = async ({
  request,
}: ActionFunctionArgs): Promise<SaveActionData> => {
  const { admin } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return { ok: false, error: "Method not allowed" };
  }

  let survey: SurveyDocument;
  try {
    const formData = await request.formData();
    const raw = formData.get("survey");
    if (typeof raw !== "string" || raw.trim().length === 0) {
      return { ok: false, error: "Missing survey payload" };
    }
    survey = JSON.parse(raw) as SurveyDocument;
  } catch {
    return { ok: false, error: "Invalid survey JSON" };
  }

  if (!survey.name?.trim()) {
    return { ok: false, error: "Survey name is required" };
  }

  if (survey.channels.postPurchasePage?.enabled !== true) {
    return {
      ok: false,
      error:
        "Turn on “Thank you / Order status” in the Channel tab before saving for checkout.",
    };
  }

  try {
    const { handles } = await publishSurveysToShop(admin, [survey]);
    return { ok: true, handles };
  } catch (error) {
    if (error instanceof PublishSurveyError) {
      return { ok: false, error: error.message };
    }
    console.error("publishSurveysToShop", error);
    return { ok: false, error: "Publish failed. Check server logs." };
  }
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
 * Survey editor.
 * The document matches the get-survey response. Content can be edited in
 * memory until Save publishes to Shopify metafields for checkout extensions.
 */
export default function SurveyEditorPage() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const saveFetcher = useFetcher<SaveActionData>();
  const [survey, setSurvey] = useState<SurveyDocument>(() =>
    createSampleSurvey(),
  );

  const isSaving =
    saveFetcher.state === "submitting" || saveFetcher.state === "loading";
  const editorBodyRef = useRef<HTMLDivElement>(null);
  useFillRemainingViewportHeight(editorBodyRef);

  /** Keep scroll inside left/right panels, not the app window document. */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (saveFetcher.state !== "idle" || !saveFetcher.data) {
      return;
    }
    if (saveFetcher.data.ok) {
      shopify.toast.show("Survey published for Thank you & Order status");
      return;
    }
    if (saveFetcher.data.error) {
      shopify.toast.show(saveFetcher.data.error, { isError: true });
    }
  }, [saveFetcher.state, saveFetcher.data, shopify]);

  function saveSurvey(): void {
    const formData = new FormData();
    formData.set("survey", JSON.stringify(survey));
    saveFetcher.submit(formData, { method: "POST" });
  }

  return (
    <div className={editorChromeStyles.editorViewport}>
      <s-page heading={survey.name} inlineSize="large">
        <s-button slot="secondary-actions" onClick={openDiscardModal}>
          Discard
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="save"
          loading={isSaving}
          disabled={isSaving}
          onClick={saveSurvey}
        >
          Save
        </s-button>

        <div ref={editorBodyRef} className={editorChromeStyles.editorPage}>
          <SurveyEditorChrome
            survey={survey}
            checkoutEditor={data.checkoutEditor}
            onSurveyChange={setSurvey}
          />
        </div>

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
    </div>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
