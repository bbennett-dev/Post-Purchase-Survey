import { useEffect } from "react";
import { useFetcher, useLocation, useNavigate } from "react-router";
import { BlockStack, Button, Card, Page } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { ResponseListIndexTable } from "../components/responses/ResponseListIndexTable";
import type { ResponseView } from "../lib/routes/responses-route";
import {
  type ResponsesLocationState,
  responseDetailHref,
  responsesHref,
} from "../lib/routes/responses-route";
import { useResponsesRouteData } from "../lib/routes/use-responses-route-data";

type ArchiveActionData =
  | { ok: true; intent?: string }
  | { ok: false; error: string };

/** Response list (competitor-style IndexTable). */
export default function ResponsesIndexPage() {
  const { responses, total, surveyFilter, view } = useResponsesRouteData();
  const navigate = useNavigate();
  const location = useLocation();
  const archiveFetcher = useFetcher<ArchiveActionData>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (location.pathname !== "/app/responses") {
      return;
    }
    const target = responsesHref({ view, survey: surveyFilter });
    const current = `${location.pathname}${location.search}`;
    if (current !== target) {
      navigate(target, { replace: true });
    }
  }, [location.pathname, location.search, navigate, surveyFilter, view]);

  useEffect(() => {
    const intent = (location.state as ResponsesLocationState | null)
      ?.responseArchiveToast;
    if (!intent) {
      return;
    }
    shopify.toast.show(
      intent === "unarchive" ? "Response unarchived" : "Response archived",
    );
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null },
    );
  }, [location.pathname, location.search, location.state, navigate, shopify]);

  useEffect(() => {
    if (archiveFetcher.state !== "idle" || !archiveFetcher.data) {
      return;
    }
    if (archiveFetcher.data.ok) {
      const intent = archiveFetcher.data.intent;
      shopify.toast.show(
        intent === "unarchive" ? "Response unarchived" : "Response archived",
      );
      return;
    }
    if ("error" in archiveFetcher.data) {
      shopify.toast.show(archiveFetcher.data.error, { isError: true });
    }
  }, [archiveFetcher.state, archiveFetcher.data, shopify]);

  const setView = (next: ResponseView) => {
    navigate(responsesHref({ view: next, survey: surveyFilter }), {
      replace: true,
    });
  };

  const subtitle = surveyFilter
    ? total > 0
      ? `${total} submission${total === 1 ? "" : "s"} for this survey`
      : "No submissions for this survey"
    : total > 0
      ? `${total} submission${total === 1 ? "" : "s"}`
      : view === "archived"
        ? "No archived responses"
        : "No responses yet";

  const archivingResponseId =
    archiveFetcher.state !== "idle"
      ? String(archiveFetcher.formData?.get("responseId") ?? "")
      : null;

  const listAction = responsesHref({ view, survey: surveyFilter });

  return (
    <Page
      fullWidth
      title="Responses"
      subtitle={subtitle}
      primaryAction={
        <Button url="/app/surveys" variant="primary">
          Manage surveys
        </Button>
      }
    >
      <BlockStack gap="400">
        <Card padding="0">
          <ResponseListIndexTable
            responses={responses}
            view={view}
            onViewChange={setView}
            responseHref={(responseId) =>
              responseDetailHref(responseId, { view, survey: surveyFilter })
            }
            onArchive={(responseId) =>
              archiveFetcher.submit(
                { intent: "archive", responseId },
                { method: "post", action: listAction },
              )
            }
            onUnarchive={(responseId) =>
              archiveFetcher.submit(
                { intent: "unarchive", responseId },
                { method: "post", action: listAction },
              )
            }
            archivingResponseId={archivingResponseId}
          />
        </Card>
      </BlockStack>
    </Page>
  );
}
