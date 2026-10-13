import type { ReactNode } from "react";
import { Button, InlineStack, Text } from "@shopify/polaris";
import { MenuHorizontalIcon } from "@shopify/polaris-icons";
import { CHANNEL_DEFINITIONS } from "../../../lib/survey/channels";
import type {
  DiscountPreviewTarget,
  EditorPanel,
  SurveyDocument,
  SurveyQuestion,
  ThankYouContent,
} from "../../../lib/survey/types";

const CHANNEL_RIGHT_TITLES: Record<string, string> = {
  postPurchasePage: "Thank you page",
};

export interface RightPanelHeaderContext {
  panel: EditorPanel;
  survey: SurveyDocument;
  question: SurveyQuestion | null;
  ending: ThankYouContent | null;
  selectedChannelKey: string | null;
  selectedDiscountTarget: DiscountPreviewTarget;
}

export interface RightPanelHeaderModel {
  title: string;
  actions?: ReactNode;
}

/**
 * Title + actions for the pinned right-panel bar (mirrors left column chrome).
 */
export function buildRightPanelHeader(
  context: RightPanelHeaderContext,
): RightPanelHeaderModel {
  const {
    panel,
    survey,
    question,
    ending,
    selectedChannelKey,
    selectedDiscountTarget,
  } = context;

  if (panel === "content") {
    if (ending) {
      return { title: "Ending" };
    }
    if (question) {
      return {
        title: "Question",
        actions: (
          <Button
            icon={MenuHorizontalIcon}
            variant="tertiary"
            accessibilityLabel="Question actions"
            disabled
          />
        ),
      };
    }
    return { title: "Content" };
  }

  if (panel === "channel") {
    if (selectedChannelKey) {
      const definition = CHANNEL_DEFINITIONS.find(
        (item) => item.key === selectedChannelKey,
      );
      const title =
        (definition &&
          (CHANNEL_RIGHT_TITLES[selectedChannelKey] ?? definition.label)) ||
        "Channel";
      return { title };
    }
    return { title: "Channel" };
  }

  if (panel === "discount") {
    if (!survey.discount.enabled) {
      return { title: "Discount" };
    }
    if (selectedDiscountTarget === "banner") {
      return { title: "Discount banner" };
    }
    return { title: "Thank you card" };
  }

  return { title: "Settings" };
}

interface RightPanelHeaderBarProps {
  title: string;
  actions?: ReactNode;
}

/** Pinned header row above the scrollable inspector body. */
export function RightPanelHeaderBar({
  title,
  actions,
}: RightPanelHeaderBarProps) {
  return (
    <InlineStack align="space-between" blockAlign="center" wrap={false}>
      <Text as="h2" variant="headingMd">
        {title}
      </Text>
      {actions ?? <span />}
    </InlineStack>
  );
}
