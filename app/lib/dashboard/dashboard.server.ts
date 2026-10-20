import { SurveyStatus } from "@prisma/client";
import prisma from "../../db.server";
import type { SurveyResponseListItemDto } from "../survey/response/response-api.mapper";
import { formatResponseDisplayId } from "../survey/response/response-list-formatters";
import type { ShopRecord } from "../shop/shop.server";

export interface DashboardRecentResponse {
  id: string;
  displayId: string;
  surveyName: string;
  submittedAt: string;
  questionCount: number;
}

export interface DashboardSnapshot {
  liveSurveys: number;
  pausedSurveys: number;
  totalSurveys: number;
  totalResponses: number;
  activeResponses: number;
  responsesLast7Days: number;
  recentResponses: DashboardRecentResponse[];
}

const RECENT_RESPONSES_TAKE = 5;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function questionCountFromJson(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/**
 * Shop-scoped metrics for the embedded app home dashboard.
 */
export async function loadDashboardSnapshot(
  shop: ShopRecord,
): Promise<DashboardSnapshot> {
  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);

  const [
    liveSurveys,
    pausedSurveys,
    totalSurveys,
    totalResponses,
    activeResponses,
    responsesLast7Days,
    recentRows,
  ] = await Promise.all([
    prisma.survey.count({
      where: { shopId: shop.shopId, status: SurveyStatus.live },
    }),
    prisma.survey.count({
      where: { shopId: shop.shopId, status: SurveyStatus.paused },
    }),
    prisma.survey.count({
      where: { shopId: shop.shopId },
    }),
    prisma.surveyResponse.count({
      where: { shopId: shop.shopId },
    }),
    prisma.surveyResponse.count({
      where: { shopId: shop.shopId, isArchived: false },
    }),
    prisma.surveyResponse.count({
      where: {
        shopId: shop.shopId,
        isArchived: false,
        submittedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.surveyResponse.findMany({
      where: { shopId: shop.shopId, isArchived: false },
      orderBy: { submittedAt: "desc" },
      take: RECENT_RESPONSES_TAKE,
      select: {
        responseUuid: true,
        surveyName: true,
        submittedAt: true,
        questions: true,
      },
    }),
  ]);

  const recentResponses: DashboardRecentResponse[] = recentRows.map((row) => ({
    id: row.responseUuid,
    displayId: formatResponseDisplayId({
      id: row.responseUuid,
    } as SurveyResponseListItemDto),
    surveyName: row.surveyName,
    submittedAt: row.submittedAt.toISOString(),
    questionCount: questionCountFromJson(row.questions),
  }));

  return {
    liveSurveys,
    pausedSurveys,
    totalSurveys,
    totalResponses,
    activeResponses,
    responsesLast7Days,
    recentResponses,
  };
}
