import { useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  Icon,
  InlineGrid,
  InlineStack,
  ProgressBar,
  Scrollable,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { ArrowRightIcon, CartIcon, SearchIcon } from "@shopify/polaris-icons";
import type {
  ImageAlignment,
  PreviewDevice,
  SurveyQuestion,
  ThankYouContent,
} from "../../lib/survey/types";
import { EditorFillBox } from "./EditorFlexLayout";

interface EditorPreviewProps {
  question: SurveyQuestion | null;
  ending: ThankYouContent | null;
  device: PreviewDevice;
  questionIndex: number;
  questionCount: number;
  shopLabel: string;
}

/**
 * Center canvas — on-site survey popup over a storefront mock (reference layout).
 */
export function EditorPreview({
  question,
  ending,
  device,
  questionIndex,
  questionCount,
  shopLabel,
}: EditorPreviewProps) {
  const [demoStep, setDemoStep] = useState(0);
  const frameWidth =
    device === "desktop" ? "100%" : device === "mobile" ? "375px" : "100%";
  const maxWidth = device === "desktop" ? "960px" : frameWidth;

  return (
    <EditorFillBox>
      <Box
        width="100%"
        minHeight="100%"
        padding="400"
        background="bg-surface-secondary"
        borderRadius="200"
        overflowX="hidden"
        overflowY="hidden"
      >
        <Scrollable shadow focusable style={{ height: "100%", maxHeight: "100%" }}>
          <BlockStack gap="500" inlineAlign="center">
            <Box width={maxWidth} maxWidth="100%">
              <BlockStack gap="0">
                <StorefrontChrome shopLabel={shopLabel} width={frameWidth} />
                <Box
                  padding="600"
                  background="bg-surface-secondary"
                  borderWidth="025"
                  borderColor="border"
                  borderBlockStartWidth="0"
                  borderRadius="0"
                >
                  <BlockStack gap="400" inlineAlign="center">
                    <SurveyPopupCard
                      question={question}
                      ending={ending}
                      questionIndex={questionIndex}
                      questionCount={questionCount}
                      demoStep={demoStep}
                    />
                  </BlockStack>
                </Box>
              </BlockStack>
            </Box>

            <BlockStack gap="200" inlineAlign="center">
              <InlineStack gap="100" blockAlign="center">
                <Text as="span" tone="subdued">
                  Want to hide the SEA logo?
                </Text>
                <Button variant="plain">Let us help</Button>
              </InlineStack>
              <Button onClick={() => setDemoStep(0)}>Start demo again</Button>
            </BlockStack>
          </BlockStack>
        </Scrollable>
      </Box>
    </EditorFillBox>
  );
}

function StorefrontChrome({
  shopLabel,
  width,
}: {
  shopLabel: string;
  width: string;
}) {
  const title = shopLabel.trim().length > 0 ? shopLabel : "SHOP NAME";

  return (
    <Box
      width={width}
      maxWidth="100%"
      background="bg-surface"
      borderWidth="025"
      borderColor="border"
      borderRadius="200"
      overflowX="hidden"
      overflowY="hidden"
    >
      <Box padding="300" borderBlockEndWidth="025" borderColor="border">
        <InlineGrid columns="auto 1fr auto" alignItems="center">
          <Text as="span" tone="subdued">
            ☰
          </Text>
          <Text as="p" fontWeight="bold" alignment="center">
            {title.toUpperCase()}
          </Text>
          <InlineStack gap="200" blockAlign="center">
            <Icon source={SearchIcon} tone="subdued" />
            <Icon source={CartIcon} tone="subdued" />
          </InlineStack>
        </InlineGrid>
      </Box>
    </Box>
  );
}

function SurveyPopupCard({
  question,
  ending,
  questionIndex,
  questionCount,
  demoStep,
}: {
  question: SurveyQuestion | null;
  ending: ThankYouContent | null;
  questionIndex: number;
  questionCount: number;
  demoStep: number;
}) {
  if (ending) {
    return (
      <Box
        padding="500"
        background="bg-surface"
        borderRadius="300"
        shadow="300"
        width="100%"
        maxWidth="420px"
      >
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            {ending.heading}
          </Text>
          <Text as="p">{ending.description}</Text>
          {ending.enableButton ? (
            <Button variant="primary">{ending.buttonText || "Continue"}</Button>
          ) : null}
        </BlockStack>
      </Box>
    );
  }

  if (!question) {
    return (
      <Box
        padding="500"
        background="bg-surface"
        borderRadius="300"
        shadow="300"
        width="100%"
        maxWidth="420px"
      >
        <Text as="p" tone="subdued" alignment="center">
          Select a question to preview it.
        </Text>
      </Box>
    );
  }

  const stepLabel = `${questionIndex + 1} of ${questionCount}`;
  const progress = ((questionIndex + 1) / questionCount) * 100;

  return (
    <Box
      padding="500"
      background="bg-surface"
      borderRadius="300"
      shadow="300"
      width="100%"
      maxWidth="420px"
    >
      <BlockStack gap="400">
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="span" variant="bodySm" tone="subdued">
              {stepLabel}
            </Text>
          </InlineStack>
          <ProgressBar progress={progress} size="small" />
        </BlockStack>

        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            {question.heading || "Untitled question"}
          </Text>
          {question.description ? (
            <Text as="p" tone="subdued">
              {question.description}
            </Text>
          ) : null}
        </BlockStack>

        {question.image?.url ? (
          <AlignedPreviewImage
            url={question.image.url}
            alignment={question.image.alignment ?? "center"}
            sizePercent={parseSizePercent(question.image.sizePercentage)}
          />
        ) : null}

        {question.type === "email" || question.type === "short_answer" ? (
          <Box
            padding="300"
            borderWidth="025"
            borderColor="border"
            borderRadius="200"
            background="bg-surface"
          >
            <Text as="p" tone="subdued">
              {question.placeholder?.trim() ||
                (question.type === "email" ? "Enter email" : "Your answer")}
            </Text>
          </Box>
        ) : null}

        {question.answers && question.answers.length > 0 ? (
          <BlockStack gap="200">
            {question.answers.map((answer, index) => (
              <Box
                key={answer.id}
                padding="300"
                borderWidth="025"
                borderColor={
                  index === demoStep ? "border-emphasis" : "border"
                }
                borderRadius="200"
                background={
                  index === demoStep ? "bg-surface-secondary" : "bg-surface"
                }
              >
                <InlineStack gap="200" blockAlign="center">
                  <Box
                    minWidth="16px"
                    minHeight="16px"
                    borderWidth="025"
                    borderColor="border-emphasis"
                    borderRadius="100"
                    background={
                      index === demoStep ? "bg-fill-brand" : undefined
                    }
                  />
                  <Text as="span">{answer.content || "Option"}</Text>
                </InlineStack>
              </Box>
            ))}
          </BlockStack>
        ) : null}

        <InlineGrid columns="1fr auto auto" gap="200" alignItems="center">
          <Text as="span" variant="bodySm" tone="subdued">
            sea
          </Text>
          <Button variant="plain">Back</Button>
          <Button icon={ArrowRightIcon}>Next</Button>
        </InlineGrid>
      </BlockStack>
    </Box>
  );
}

function AlignedPreviewImage({
  url,
  alignment,
  sizePercent,
}: {
  url: string;
  alignment: ImageAlignment;
  sizePercent: number;
}) {
  const align =
    alignment === "left"
      ? "start"
      : alignment === "right"
        ? "end"
        : "center";

  return (
    <InlineStack align={align}>
      <Box maxWidth={`${sizePercent}%`}>
        <Thumbnail source={url} alt="" size="large" />
      </Box>
    </InlineStack>
  );
}

function parseSizePercent(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isFinite(parsed)) {
    return Math.min(100, Math.max(0, parsed));
  }
  return 50;
}
