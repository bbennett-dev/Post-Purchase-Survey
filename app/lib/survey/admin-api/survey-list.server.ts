import type { SurveyStatus } from "../survey-store.server";
import { CHANNEL_LABELS } from "../channels";
import { enabledChannelLabels } from "../runtime-channels";
import {
  listSurveyRowsForShop,
  responseCountsForSurveys,
} from "../survey-store.server";
import type { ShopRecord } from "../../shop/shop.server";
import type { SurveyDocument } from "../types";

export interface SurveyListItem {
  id: string;
  name: string;
  question: string;
  status: SurveyStatus;
  /** Enabled channel labels for badge stack in the index table. */
  channels: string[];
  channelsLabel: string;
  responses: number;
  createdAt: string;
}

function formatSurveyDate(iso: Date): string {
  const datePart = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(iso);
  const timePart = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(iso);
  return `${datePart} at ${timePart}`;
}

function questionFromDocument(document: SurveyDocument): string {
  return document.questions?.[0]?.heading?.trim() || "—";
}

/** Shop-scoped survey rows for index loader and `GET /api/surveys`. */
export async function listSurveyListItemsForShop(
  shop: ShopRecord,
): Promise<SurveyListItem[]> {
  const rows = await listSurveyRowsForShop(shop);
  const counts = await responseCountsForSurveys(
    shop,
    rows.map((row) => row.surveyUuid),
  );

  return rows.map((row) => {
    const document = row.document as unknown as SurveyDocument;
    const channels = enabledChannelLabels(document, CHANNEL_LABELS);
    return {
      id: row.surveyUuid,
      name: row.name,
      question: questionFromDocument(document),
      status: row.status as SurveyStatus,
      channels,
      channelsLabel: channels.length > 0 ? channels.join(", ") : "—",
      responses: counts.get(row.surveyUuid) ?? 0,
      createdAt: formatSurveyDate(row.createdAt),
    };
  });
}
