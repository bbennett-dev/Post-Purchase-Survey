import { useFetcher, useNavigate, useParams } from "react-router";
import { BlockStack, Button, Card, Page, Text } from "@shopify/polaris";
import { ResponseDetailPage } from "../components/responses/ResponseDetailPage";
import {
  type ResponseArchiveToastIntent,
  responsesHref,
  responsesListAfterArchiveIntent,
} from "../lib/routes/responses-route";
import { useResponsesRouteData } from "../lib/routes/use-responses-route-data";

type ArchiveActionData =
  | { ok: true; intent?: string }
  | { ok: false; error: string };

/** Response detail — uses parent list loader data only. */
export default function ResponseDetailRoute() {
  const { responseId } = useParams();
  const { responses, view, surveyFilter } = useResponsesRouteData();
  const navigate = useNavigate();
  const archiveFetcher = useFetcher<ArchiveActionData>();

  const item = responses.find((row) => row.id === responseId);

  if (!responseId || !item) {
    return (
      <Page
        backAction={{
          content: "Responses",
          onAction: () =>
            navigate(responsesHref({ view, survey: surveyFilter })),
        }}
        title="Response not found"
      >
        <Card>
          <BlockStack gap="300">
            <Text as="p">This response is not in the current list.</Text>
            <Button
              onClick={() =>
                navigate(responsesHref({ view, survey: surveyFilter }))
              }
            >
              Back to responses
            </Button>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  const listAction = responsesHref({ view, survey: surveyFilter });
  const archivePending =
    archiveFetcher.state !== "idle" &&
    archiveFetcher.formData?.get("responseId") === item.id;

  return (
    <ResponseDetailPage
      item={item}
      view={view}
      surveyFilter={surveyFilter}
      siblingIds={responses.map((row) => row.id)}
      archivePending={archivePending}
      onArchiveToggle={(id, archive) => {
        const intent: ResponseArchiveToastIntent = archive
          ? "archive"
          : "unarchive";
        archiveFetcher.submit(
          { intent, responseId: id },
          { method: "post", action: listAction },
        );
        navigate(responsesListAfterArchiveIntent(intent, surveyFilter), {
          replace: true,
          state: { responseArchiveToast: intent },
        });
      }}
    />
  );
}
