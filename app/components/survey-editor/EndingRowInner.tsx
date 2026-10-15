import { Badge, Icon, Text } from "@shopify/polaris";
import { CursorIcon } from "@shopify/polaris-icons";
import type { ReactNode } from "react";
import { truncateText } from "../../lib/truncate";
import {
  QUESTION_ROW_LINE_HEIGHT,
  QUESTION_ROW_MENU_SLOT_WIDTH,
} from "./QuestionRowInner";

const ROW_GAP = "var(--p-space-200)";
const LEADING_WIDTH = 20;

interface EndingRowInnerProps {
  title: string;
  selected?: boolean;
  isMain?: boolean;
  menu?: ReactNode;
  /** Hovered row or open ⋯ menu (non-main rows only). */
  showMenuChrome?: boolean;
}

/** Same grid as question rows: icon · title · trailing (Main badge and/or ⋯). */
export function EndingRowInner({
  title,
  selected = false,
  isMain = false,
  menu,
  showMenuChrome = false,
}: EndingRowInnerProps) {
  const label = truncateText(title, 32);
  const iconTone = selected ? undefined : "subdued";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: ROW_GAP,
        width: "100%",
        minWidth: 0,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: LEADING_WIDTH,
          minWidth: LEADING_WIDTH,
          height: QUESTION_ROW_LINE_HEIGHT,
          flexShrink: 0,
        }}
        aria-hidden
      >
        <Icon source={CursorIcon} tone={iconTone} />
      </span>
      <div
        style={{
          minWidth: 0,
          flex: "1 1 auto",
          display: "flex",
          alignItems: "center",
          height: QUESTION_ROW_LINE_HEIGHT,
        }}
      >
        <Text
          as="span"
          variant="bodySm"
          truncate
          fontWeight={selected ? "medium" : "regular"}
        >
          {label}
        </Text>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minWidth: isMain ? undefined : QUESTION_ROW_MENU_SLOT_WIDTH,
          flexShrink: 0,
        }}
      >
        {isMain ? (
          selected ? (
            <span className="se-main-badge se-main-badge--on-brand">Main</span>
          ) : (
            <Badge tone="info" size="small">
              Main
            </Badge>
          )
        ) : (
          <div
            className={`se-menu-slot${showMenuChrome ? " se-menu-slot--visible" : ""}`}
            style={{
              width: QUESTION_ROW_MENU_SLOT_WIDTH,
              minWidth: QUESTION_ROW_MENU_SLOT_WIDTH,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {menu}
          </div>
        )}
      </div>
    </div>
  );
}
