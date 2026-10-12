import { useEffect, useRef, useState } from "react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";
import { EditorDiscardModal } from "../components/survey-editor/EditorDiscardModal";
import { SurveyEditorChrome } from "../components/survey-editor/SurveyEditorChrome";
import { EditorFlexColumn, EditorFlexMain } from "../components/survey-editor/EditorFlexLayout";
import {
  useEditorViewportLock,
  useFillRemainingViewportHeight,
} from "../components/survey-editor/useEditorViewport";
import {
  EDITOR_BRIDGE_CHANNEL,
  publishEditorChromeState,
  type EditorBridgeMessage,
} from "../lib/editor-bridge";
import { EDITOR_MODAL_ID } from "../lib/editor-modal";
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
        'Turn on "Thank you / Order status" in the Channel tab before saving for checkout.',
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

/**
 * Survey editor body (max-modal `src` iframe). Modal chrome (`TitleBar`, `SaveBar`)
 * lives on the parent route in `EditorModalProvider`.
 */
export default function SurveyEditorPage() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const saveFetcher = useFetcher<SaveActionData>();
  const [survey, setSurvey] = useState<SurveyDocument>(() =>
    createSampleSurvey(),
  );
  const [searchParams] = useSearchParams();
  const inMaxModal = searchParams.get("modal") === "1";

  const [discardOpen, setDiscardOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const isSaving =
    saveFetcher.state === "submitting" || saveFetcher.state === "loading";

  const editorBodyRef = useRef<HTMLDivElement>(null);
  const surveyRef = useRef(survey);
  surveyRef.current = survey;

  useEditorViewportLock();
  useFillRemainingViewportHeight(editorBodyRef);

  useEffect(() => {
    publishEditorChromeState({
      dirty,
      name: survey.name,
      saving: isSaving,
    });
  }, [dirty, survey.name, isSaving]);

  useEffect(() => {
    const channel = new BroadcastChannel(EDITOR_BRIDGE_CHANNEL);
    channel.onmessage = (event: MessageEvent<EditorBridgeMessage>) => {
      const message = event.data;
      if (message?.type === "save") {
        const formData = new FormData();
        formData.set("survey", JSON.stringify(surveyRef.current));
        saveFetcher.submit(formData, { method: "POST" });
      }
      if (message?.type === "discard") {
        setDiscardOpen(true);
      }
    };

    return () => channel.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable command listener
  }, []);

  useEffect(() => {
    if (saveFetcher.state !== "idle" || !saveFetcher.data) {
      return;
    }
    if (saveFetcher.data.ok) {
      setDirty(false);
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

  async function closeEditor(): Promise<void> {
    if (shopify.modal?.hide) {
      try {
        await shopify.modal.hide(EDITOR_MODAL_ID);
        return;
      } catch {
        // Not inside a modal — fall through.
      }
    }
    window.history.back();
  }

  return (
    <EditorFlexColumn>
      {!inMaxModal ? (
        <TitleBar title={survey.name}>
          {dirty ? (
            <>
              <s-button onClick={() => setDiscardOpen(true)}>Discard</s-button>
              <s-button
                variant="primary"
                disabled={isSaving}
                loading={isSaving}
                onClick={saveSurvey}
              >
                Save
              </s-button>
            </>
          ) : null}
        </TitleBar>
      ) : null}

      <EditorFlexMain>
        <div
          ref={editorBodyRef}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            minHeight: 0,
          }}
        >
          <SurveyEditorChrome
            survey={survey}
            checkoutEditor={data.checkoutEditor}
            onSurveyChange={(next) => {
              setSurvey(next);
              setDirty(true);
            }}
          />
        </div>
      </EditorFlexMain>

      <EditorDiscardModal
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirmDiscard={() => {
          setDirty(false);
          void closeEditor();
        }}
      />
    </EditorFlexColumn>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
