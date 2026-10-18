import { useRef, useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRevalidator } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { useOpenEditor } from "../lib/editor-modal";
import {
  createSurveyViaApi,
  deleteSurveyViaApi,
  surveyMutationViaApi,
} from "../lib/survey/admin-api/list-actions.client";
import { listSurveyListItemsForShop } from "../lib/survey/admin-api/survey-list.server";
import type { SurveyStatus } from "../lib/survey/survey-store.server";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { SurveyListIndexTable } from "../components/surveys/SurveyListIndexTable";

type SurveyRow = Awaited<
  ReturnType<typeof listSurveyListItemsForShop>
>[number];

/**
 * Surveys index loader — shop-scoped rows from Prisma.
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<{ surveys: SurveyRow[] }> => {
  const { session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);
  const surveys = await listSurveyListItemsForShop(shop);
  return { surveys };
};

/**
 * Survey index — Polaris IndexFilters + IndexTable (see SurveyListIndexTable).
 */
export default function SurveysPage() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const shopifyRef = useRef(shopify);
  shopifyRef.current = shopify;
  const openEditor = useOpenEditor();
  const revalidator = useRevalidator();
  const [mutationPending, setMutationPending] = useState(false);
  const surveys = data.surveys;
  const [showPlacementTip, setShowPlacementTip] = useState(true);
  const createThenOpenEditor = useRef(false);

  async function runListMutation(
    run: (token: string) => Promise<{ ok: boolean; error?: string; surveyId?: string }>,
    options?: { openEditorOnCreate?: boolean },
  ): Promise<void> {
    setMutationPending(true);
    try {
      const token = await shopifyRef.current.idToken();
      const result = await run(token);
      if (result.ok) {
        if (options?.openEditorOnCreate && result.surveyId) {
          createThenOpenEditor.current = false;
          openEditor({ surveyId: result.surveyId });
        } else {
          shopifyRef.current.toast.show("Survey updated");
        }
        revalidator.revalidate();
        return;
      }
      shopifyRef.current.toast.show(
        result.error ?? "Action failed",
        { isError: true },
      );
    } catch (error) {
      console.error("survey list mutation", error);
      shopifyRef.current.toast.show("Action failed", { isError: true });
    } finally {
      setMutationPending(false);
    }
  }

  function createSurveyAndOpenEditor() {
    createThenOpenEditor.current = true;
    void runListMutation((token) => createSurveyViaApi(token), {
      openEditorOnCreate: true,
    });
  }

  const duplicateSurvey = (survey: SurveyRow) => {
    void runListMutation((token) =>
      surveyMutationViaApi(survey.id, "duplicate", token),
    );
  };

  const setSurveyStatus = (survey: SurveyRow, next: SurveyStatus) => {
    if (survey.status === next) {
      return;
    }
    void runListMutation((token) =>
      surveyMutationViaApi(survey.id, "toggle-status", token),
    );
  };

  const deleteSurvey = (survey: SurveyRow) => {
    void runListMutation((token) => deleteSurveyViaApi(survey.id, token));
  };

  return (
    <Page
      fullWidth
      title="Surveys"
      secondaryActions={[
        {
          content: "Choose a template",
          url: "/app/surveys/templates",
        },
      ]}
      primaryAction={
        <Button
          variant="primary"
          icon={
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
              <path d="M11 9h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 1 1 2 0v4Z" />
            </svg>
          }
          onClick={createSurveyAndOpenEditor}
          loading={mutationPending}
        >
          Create survey
        </Button>
      }
    >
      <BlockStack gap="400">
        <Card padding="0">
          {surveys.length === 0 ? (
            <EmptyState
              heading="Create your first survey"
              image="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
              action={{
                content: "Create survey",
                onAction: createSurveyAndOpenEditor,
              }}
              secondaryAction={{
                content: "Choose a template",
                url: "/app/surveys/templates",
              }}
            >
              <Text as="p">
                Ask customers how they found you on the Thank You page, then read
                the answers under Responses.
              </Text>
            </EmptyState>
          ) : (
            <SurveyListIndexTable
              surveys={surveys}
              mutationPending={mutationPending}
              onEdit={(surveyId) => openEditor({ surveyId })}
              onDuplicate={duplicateSurvey}
              onDelete={deleteSurvey}
              onStatusChange={setSurveyStatus}
            />
          )}
        </Card>

        {showPlacementTip && surveys.length > 0 ? (
          <Card>
            <InlineStack align="space-between" blockAlign="start">
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Show this survey after checkout
                </Text>
                <Text as="p" tone="subdued">
                  Add the block to the Thank You page. Only live surveys are
                  offered to customers.
                </Text>
                <Box>
                  <Button url="/app/settings">Review placement</Button>
                </Box>
              </BlockStack>
              <Button
                variant="plain"
                accessibilityLabel="Dismiss placement tip"
                onClick={() => {
                  setShowPlacementTip(false);
                  shopify.toast.show("Tip dismissed");
                }}
              >
                ✕
              </Button>
            </InlineStack>
          </Card>
        ) : null}
      </BlockStack>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
