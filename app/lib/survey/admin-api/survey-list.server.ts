import type { SurveyStatus } from "../survey-store.server";
import { enabledChannelsForSurveyList } from "../survey-list-channels";
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
  /** Enabled channels from the survey JSON (`channels` + `channelTypes`). */
  enabledChannels: { key: string; label: string }[];
  /** Flat labels for search and accessibility. */
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
    const enabledChannels = enabledChannelsForSurveyList(document);
    const channelLabels = enabledChannels.map((channel) => channel.label);
    return {
      id: row.surveyUuid,
      name: row.name,
      question: questionFromDocument(document),
      status: row.status as SurveyStatus,
      enabledChannels,
      channelsLabel:
        channelLabels.length > 0 ? channelLabels.join(", ") : "—",
      responses: counts.get(row.surveyUuid) ?? 0,
      createdAt: formatSurveyDate(row.createdAt),
    };
  });
}
