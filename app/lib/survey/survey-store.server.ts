import { SurveyStatus } from "@prisma/client";
import prisma from "../../db.server";
import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { createBlankSurveyDocument } from "./questions";
import { surveyHasAnyEnabledChannel } from "./runtime-channels";
import { publishSurveysToShop } from "./publish-shopify.server";
import type { SurveyDocument } from "./types";

export type { SurveyStatus };

/** Maps editor Active/Inactive to Prisma status. */
export function surveyStatusFromActive(isActive: boolean): SurveyStatus {
  return isActive ? SurveyStatus.live : SurveyStatus.paused;
}

/** Document fields synced on editor save. */
function surveyDocumentScalars(document: SurveyDocument) {
  return {
    name: document.name.trim(),
    surveyType: document.surveyType?.trim() || "survey",
    templateType: document.templateType?.trim() || "blank",
    isActive: document.isActive === true,
    document: document as object,
  };
}

/**
 * Persists the editor document and list status (`live` / `paused` from `document.isActive`).
 */
export async function saveSurveyDocument(
  shop: string,
  document: SurveyDocument,
): Promise<void> {
  if (!document.id?.trim()) {
    throw new Error("Survey id is required");
  }

  const status = surveyStatusFromActive(document.isActive === true);
  const documentWithStatus: SurveyDocument = {
    ...document,
    isActive: status === SurveyStatus.live,
  };
  const scalars = surveyDocumentScalars(documentWithStatus);

  const existing = await prisma.survey.findFirst({
    where: { id: document.id, shop },
  });

  if (existing) {
    await prisma.survey.update({
      where: { id: document.id },
      data: {
        ...scalars,
        status,
      },
    });
    return;
  }

  await prisma.survey.create({
    data: {
      id: document.id,
      shop,
      status,
      ...scalars,
    },
  });
}

/**
 * Rebuilds Shopify metafields/metaobjects from all **live** surveys that have ≥1 enabled channel.
 * Passes an empty list when none qualify (clears checkout payload).
 */
export async function syncShopifyFromDatabase(
  admin: AdminApiContext,
  shop: string,
): Promise<{ handles: string[] }> {
  const rows = await prisma.survey.findMany({
    where: { shop, status: SurveyStatus.live },
  });
  const documents = rows
    .map((row) => row.document as unknown as SurveyDocument)
    .filter((doc) => surveyHasAnyEnabledChannel(doc));
  return publishSurveysToShop(admin, documents);
}

/**
 * Save path: Postgres first, then Shopify only when this survey is **live** and has ≥1 enabled channel.
 * When publishing, all live + channel-enabled surveys for the shop are written (shared checkout metafield).
 */
function wasOnShopifyCheckout(
  row: { status: SurveyStatus; document: unknown } | null,
): boolean {
  if (!row || row.status !== SurveyStatus.live) {
    return false;
  }
  return surveyHasAnyEnabledChannel(row.document as SurveyDocument);
}

export async function persistSurveyAndMaybePublishShopify(
  admin: AdminApiContext,
  shop: string,
  document: SurveyDocument,
): Promise<{ publishedToShopify: boolean }> {
  const existing = document.id
    ? await prisma.survey.findFirst({
        where: { id: document.id, shop },
      })
    : null;
  const wasPublished = wasOnShopifyCheckout(existing);

  await saveSurveyDocument(shop, document);

  const nowPublished =
    document.isActive === true && surveyHasAnyEnabledChannel(document);

  if (nowPublished || wasPublished) {
    await syncShopifyFromDatabase(admin, shop);
  }

  return { publishedToShopify: nowPublished };
}

/** Creates a paused survey with one default question and main ending. */
export async function createDefaultSurveyForShop(shop: string): Promise<string> {
  const document = createBlankSurveyDocument();
  const id = crypto.randomUUID();
  document.id = id;
  document.isActive = false;
  document.name = "Untitled survey";

  await prisma.survey.create({
    data: {
      id,
      shop,
      status: SurveyStatus.paused,
      ...surveyDocumentScalars(document),
    },
  });

  return id;
}

/** Loads a survey document when it belongs to the authenticated shop. */
export async function getSurveyDocumentForShop(
  shop: string,
  surveyId: string,
): Promise<SurveyDocument | null> {
  const row = await prisma.survey.findFirst({
    where: { shop, id: surveyId },
  });
  if (!row) {
    return null;
  }
  const document = row.document as unknown as SurveyDocument;
  document.isActive = row.status === SurveyStatus.live;
  return document;
}

/** Lists surveys for the shop index, newest activity first. */
export async function listSurveyRowsForShop(shop: string) {
  return prisma.survey.findMany({
    where: { shop },
    orderBy: { updatedAt: "desc" },
  });
}

/** Response counts keyed by survey id. */
export async function responseCountsForSurveys(
  shop: string,
  surveyIds: string[],
): Promise<Map<string, number>> {
  if (surveyIds.length === 0) {
    return new Map();
  }

  const grouped = await prisma.surveyResponse.groupBy({
    by: ["surveyId"],
    where: { shop, surveyId: { in: surveyIds } },
    _count: { _all: true },
  });

  return new Map(
    grouped.map((row) => [row.surveyId ?? "", row._count._all]),
  );
}

/** Clones a survey as paused. */
export async function duplicateSurveyForShop(
  shop: string,
  sourceId: string,
): Promise<string | null> {
  const source = await prisma.survey.findFirst({
    where: { shop, id: sourceId },
  });
  if (!source) {
    return null;
  }

  const document = structuredClone(
    source.document,
  ) as unknown as SurveyDocument;
  document.name = `${source.name} copy`;
  document.isActive = false;

  const created = await prisma.survey.create({
    data: {
      shop,
      ...surveyDocumentScalars(document),
      status: SurveyStatus.paused,
    },
  });

  document.id = created.id;
  await prisma.survey.update({
    where: { id: created.id },
    data: { document: document as object },
  });

  return created.id;
}

/** Sets live/paused and keeps `document.isActive` in sync. */
export async function setSurveyStatusForShop(
  shop: string,
  surveyId: string,
  status: SurveyStatus,
): Promise<boolean> {
  const row = await prisma.survey.findFirst({
    where: { shop, id: surveyId },
  });
  if (!row) {
    return false;
  }

  const document = structuredClone(row.document) as unknown as SurveyDocument;
  document.isActive = status === SurveyStatus.live;

  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      status,
      isActive: document.isActive,
      document: document as object,
    },
  });

  return true;
}

/** Removes a survey row for the shop. */
export async function deleteSurveyForShop(
  shop: string,
  surveyId: string,
): Promise<boolean> {
  const row = await prisma.survey.findFirst({
    where: { shop, id: surveyId },
  });
  if (!row) {
    return false;
  }

  await prisma.$transaction([
    prisma.surveyResponse.deleteMany({ where: { shop, surveyId } }),
    prisma.survey.delete({ where: { id: surveyId } }),
  ]);
  return true;
}

/** @deprecated use syncShopifyFromDatabase */
export async function publishLiveSurveysForShop(
  admin: AdminApiContext,
  shop: string,
): Promise<{ handles: string[] }> {
  return syncShopifyFromDatabase(admin, shop);
}

/** Deletes all shop-owned survey data (uninstall / redact). */
export async function deleteAllShopSurveyData(shop: string): Promise<void> {
  await prisma.$transaction([
    prisma.surveyResponse.deleteMany({ where: { shop } }),
    prisma.survey.deleteMany({ where: { shop } }),
  ]);
}
