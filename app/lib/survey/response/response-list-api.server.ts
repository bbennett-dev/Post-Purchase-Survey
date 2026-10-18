import {
  formatQuestionsSummary,
  mapSurveyResponseToListItem,
} from "./response-api.mapper";
import {
  countSurveyResponsesForShop,
  listSurveyResponsesForShop,
} from "./survey-response.server";
import type { ShopRecord } from "../../shop/shop.server";

export const RESPONSES_API_DEFAULT_TAKE = 50;
export const RESPONSES_API_MAX_TAKE = 100;

export interface ResponseListApiItem {
  id: string;
  orderName: string;
  customer: string;
  product: string;
  surveyName: string;
  questionCount: number;
  answerSummary: string;
  submittedAt: string;
  /** Full competitor-shaped DTO for clients that need it. */
  dto: ReturnType<typeof mapSurveyResponseToListItem>;
}

export interface ResponseListApiResult {
  items: ResponseListApiItem[];
  total: number;
  skip: number;
  take: number;
}

function orderLabel(orderId: string, orderName: string | null): string {
  if (orderName?.trim()) {
    return orderName;
  }
  const match = orderId.match(/(\d+)\s*$/);
  if (match) {
    return `#${match[1]}`;
  }
  const tail = orderId.split("/").pop();
  return tail ? `#${tail}` : orderId;
}

function displayOrDash(value: string | null | undefined): string {
  return value?.trim() ? value.trim() : "—";
}

function customerLabel(name: string | null, email: string | null): string {
  const parts = [name?.trim(), email?.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function formatSubmittedAt(iso: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(iso);
}

export function parseResponsesPagination(searchParams: URLSearchParams): {
  skip: number;
  take: number;
} | { error: string } {
  const skipRaw = searchParams.get("skip") ?? "0";
  const takeRaw = searchParams.get("take") ?? String(RESPONSES_API_DEFAULT_TAKE);

  const skip = Number.parseInt(skipRaw, 10);
  const take = Number.parseInt(takeRaw, 10);

  if (!Number.isFinite(skip) || skip < 0) {
    return { error: "Invalid skip" };
  }
  if (!Number.isFinite(take) || take < 1 || take > RESPONSES_API_MAX_TAKE) {
    return {
      error: `Invalid take (1–${RESPONSES_API_MAX_TAKE})`,
    };
  }

  return { skip, take };
}

/** Paginated responses for `GET /api/responses` and optional client refresh. */
export async function listResponsesForAdminApi(
  shop: ShopRecord,
  skip: number,
  take: number,
  surveyUuid?: string,
): Promise<ResponseListApiResult> {
  const filterSurveyUuid = surveyUuid?.trim() || undefined;
  const [rows, total] = await Promise.all([
    listSurveyResponsesForShop(shop, {
      take,
      skip,
      surveyUuid: filterSurveyUuid,
    }),
    countSurveyResponsesForShop(shop, filterSurveyUuid),
  ]);

  const items: ResponseListApiItem[] = rows.map((row) => {
    const dto = mapSurveyResponseToListItem(row);
    return {
      id: dto.id,
      orderName: orderLabel(dto.orderId, dto.orderName),
      customer: customerLabel(dto.customerName, dto.email),
      product: displayOrDash(dto.productName),
      surveyName: dto.surveyName,
      questionCount: dto.questions.length,
      answerSummary: formatQuestionsSummary(dto.questions),
      submittedAt: formatSubmittedAt(row.submittedAt),
      dto,
    };
  });

  return { items, total, skip, take };
}
