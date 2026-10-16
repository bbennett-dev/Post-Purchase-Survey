import { useCallback, useEffect, useRef, useState } from "react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import {
  useLoaderData,
  useSearchParams,
  type LinksFunction,
} from "react-router";
import surveyEditorListSurfaces from "../components/survey-editor/survey-editor-list-surfaces.css?url";
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
import { createBlankSurveyDocument } from "../lib/survey/questions";
import "../components/survey-editor/RightPanel/Content/date/survey-date-picker.module.css";
import "../components/survey-editor/RightPanel/Content/date/date-input-clear-button.module.css";
import { saveSurveyDocument } from "../lib/survey/admin-api/save-document.client";
import { getSurveyDocumentForShop } from "../lib/survey/survey-store.server";
import type { CheckoutEditorLinks } from "../lib/shopify/checkout-editor-url.server";
import { fetchCheckoutEditorLinks } from "../lib/shopify/checkout-editor-url.server";
import type { SurveyDocument } from "../lib/survey/types";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";

/** Plain CSS (not `.module.css`) so Vite can emit a stable `<link>` in the editor iframe. */
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: surveyEditorListSurfaces },
];

type EditorMode = "create" | "template" | "edit";

interface EditorLoaderData {
  mode: EditorMode;
  heading: string;
  sourceLabel: string;
  checkoutEditor: CheckoutEditorLinks;
  initialSurvey: SurveyDocument | null;
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
  const shop = await shopFromAdminSession(session);
  const checkoutEditor = await fetchCheckoutEditorLinks(admin, session.shop);

  const url = new URL(request.url);
  const templateId = url.searchParams.get("template");
  const surveyId = url.searchParams.get("survey");

  if (surveyId) {
    const initialSurvey = await getSurveyDocumentForShop(shop, surveyId);
    if (!initialSurvey) {
      throw new Response("Survey not found", { status: 404 });
    }
    return {
      mode: "edit",
      heading: "Edit survey",
      sourceLabel: "Changes here update this survey.",
      checkoutEditor,
      initialSurvey,
    };
  }

  if (templateId && templateId !== "blank") {
    return {
      mode: "template",
      heading: TEMPLATE_NAMES[templateId] ?? "New survey",
      sourceLabel: "Started from a template. Question setup comes next.",
      checkoutEditor,
      initialSurvey: null,
    };
  }

  return {
    mode: "create",
    heading: "New survey",
    sourceLabel: "Blank survey. Question setup comes next.",
    checkoutEditor,
    initialSurvey: null,
  };
};

/**
 * Survey editor body (max-modal `src` iframe). Modal chrome (`TitleBar`, `SaveBar`)
 * lives on the parent route in `EditorModalProvider`.
 */
export default function SurveyEditorPage() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const shopifyRef = useRef(shopify);
  shopifyRef.current = shopify;
  const [survey, setSurvey] = useState<SurveyDocument>(() => {
    if (data.initialSurvey) {
      return data.initialSurvey;
    }
    const draft = createBlankSurveyDocument();
    draft.id = crypto.randomUUID();
    return draft;
  });
  const [searchParams] = useSearchParams();
  const inMaxModal = searchParams.get("modal") === "1";

  const [discardOpen, setDiscardOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editorBodyRef = useRef<HTMLDivElement>(null);
  const surveyRef = useRef(survey);
  surveyRef.current = survey;

  useEditorViewportLock();
  useFillRemainingViewportHeight(editorBodyRef);

  const performSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const token = await shopifyRef.current.idToken();
      const result = await saveSurveyDocument(surveyRef.current, token);
      if (result.ok) {
        setDirty(false);
        shopifyRef.current.toast.show(
          result.publishedToShopify
            ? "Survey saved and published to Shopify"
            : "Survey saved",
        );
        return;
      }
      shopifyRef.current.toast.show(
        result.error ?? "Could not save survey",
        { isError: true },
      );
    } catch (error) {
      console.error("saveSurveyDocument", error);
      shopifyRef.current.toast.show("Could not save survey", { isError: true });
    } finally {
      setIsSaving(false);
    }
  }, []);

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
        void performSave();
      }
      if (message?.type === "discard") {
        setDiscardOpen(true);
      }
    };

    return () => channel.close();
  }, [performSave]);

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
                onClick={() => void performSave()}
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
