import { useEffect, useRef, useState } from "react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import {
  useFetcher,
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
import { PublishSurveyError } from "../lib/survey/publish-shopify.server";
import {
  getSurveyDocumentForShop,
  persistSurveyAndMaybePublishShopify,
} from "../lib/survey/survey-store.server";
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

interface SaveActionData {
  ok: boolean;
  error?: string;
  publishedToShopify?: boolean;
}

/**
 * Saves to Postgres first (including live/paused from Active/Inactive), then publishes to Shopify
 * only when the survey is active and has at least one enabled channel.
 */
export const action = async ({
  request,
}: ActionFunctionArgs): Promise<SaveActionData> => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);

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

  try {
    const { publishedToShopify } = await persistSurveyAndMaybePublishShopify(
      admin,
      shop,
      survey,
    );
    return { ok: true, publishedToShopify };
  } catch (error) {
    if (error instanceof PublishSurveyError) {
      return { ok: false, error: error.message };
    }
    console.error("persistSurveyAndMaybePublishShopify", error);
    const message =
      error instanceof Error ? error.message : "Could not save survey";
    return { ok: false, error: message };
  }
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
  const saveFetcher = useFetcher<SaveActionData>();
  const handledSaveData = useRef<SaveActionData | null>(null);
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
    if (handledSaveData.current === saveFetcher.data) {
      return;
    }
    handledSaveData.current = saveFetcher.data;

    if (saveFetcher.data.ok) {
      setDirty(false);
      shopifyRef.current.toast.show(
        saveFetcher.data.publishedToShopify
          ? "Survey saved and published to Shopify"
          : "Survey saved",
      );
      return;
    }
    if (saveFetcher.data.error) {
      shopifyRef.current.toast.show(saveFetcher.data.error, { isError: true });
    }
  }, [saveFetcher.state, saveFetcher.data]);

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
