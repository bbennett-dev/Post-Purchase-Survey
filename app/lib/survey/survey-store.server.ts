import { SurveyStatus } from "@prisma/client";
import prisma from "../../db.server";
import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import type { ShopRecord } from "../shop/shop.server";
import { createBlankSurveyDocument } from "./questions";
import { surveyHasAnyEnabledChannel } from "./runtime-channels";
import { publishSurveysToShop } from "./publish-shopify.server";
import type { SurveyDocument } from "./types";

export type { SurveyStatus };

/** Maps editor live/paused (`document.isActive`) to Prisma `SurveyStatus`. */
export function surveyStatusFromActive(isActive: boolean): SurveyStatus {
  return isActive ? SurveyStatus.live : SurveyStatus.paused;
}

/** Document fields synced on editor save. */
function surveyDocumentScalars(document: SurveyDocument) {
  return {
    name: document.name.trim(),
    surveyType: document.surveyType?.trim() || "survey",
    templateType: document.templateType?.trim() || "blank",
    document: document as object,
  };
}

/**
 * Persists the editor document; `document.id` must be the public `surveyUuid`.
 */
export async function saveSurveyDocument(
  shop: ShopRecord,
  document: SurveyDocument,
): Promise<void> {
  const surveyUuid = document.id?.trim();
  if (!surveyUuid) {
    throw new Error("Survey id is required");
  }

  const status = surveyStatusFromActive(document.isActive === true);
  const documentWithStatus: SurveyDocument = {
    ...document,
    id: surveyUuid,
    isActive: status === SurveyStatus.live,
  };
  const scalars = surveyDocumentScalars(documentWithStatus);

  const existing = await prisma.survey.findFirst({
    where: { shopId: shop.shopId, surveyUuid },
  });

  if (existing) {
    await prisma.survey.update({
      where: { id: existing.id },
      data: {
        ...scalars,
        status,
      },
    });
    return;
  }

  const created = await prisma.survey.create({
    data: {
      shopId: shop.shopId,
      status,
      ...scalars,
    },
  });
  const documentWithUuid: SurveyDocument = {
    ...documentWithStatus,
    id: created.surveyUuid,
  };
  await prisma.survey.update({
    where: { id: created.id },
    data: { document: documentWithUuid as object },
  });
}

/**
 * Rebuilds Shopify metafields/metaobjects from all **live** surveys that have ≥1 enabled channel.
 */
export async function syncShopifyFromDatabase(
  admin: AdminApiContext,
  shop: ShopRecord,
): Promise<{ handles: string[] }> {
  const rows = await prisma.survey.findMany({
    where: { shopId: shop.shopId, status: SurveyStatus.live },
  });
  const documents = rows
    .map((row) => {
      const doc = row.document as unknown as SurveyDocument;
      doc.id = row.surveyUuid;
      return doc;
    })
    .filter((doc) => surveyHasAnyEnabledChannel(doc));
  return publishSurveysToShop(admin, documents);
}

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
  shop: ShopRecord,
  document: SurveyDocument,
): Promise<{ publishedToShopify: boolean }> {
  const surveyUuid = document.id?.trim();
  const existing = surveyUuid
    ? await prisma.survey.findFirst({
        where: { shopId: shop.shopId, surveyUuid },
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
export async function createDefaultSurveyForShop(
  shop: ShopRecord,
): Promise<string> {
  const document = createBlankSurveyDocument();
  document.isActive = false;
  document.name = "Untitled survey";

  const created = await prisma.survey.create({
    data: {
      shopId: shop.shopId,
      status: SurveyStatus.paused,
      ...surveyDocumentScalars(document),
    },
  });
  document.id = created.surveyUuid;
  await prisma.survey.update({
    where: { id: created.id },
    data: { document: document as object },
  });

  return created.surveyUuid;
}

/** Loads a survey document when it belongs to the shop (`surveyUuid`). */
export async function getSurveyDocumentForShop(
  shop: ShopRecord,
  surveyUuid: string,
): Promise<SurveyDocument | null> {
  const row = await prisma.survey.findFirst({
    where: { shopId: shop.shopId, surveyUuid },
  });
  if (!row) {
    return null;
  }
  const document = row.document as unknown as SurveyDocument;
  document.id = row.surveyUuid;
  document.isActive = row.status === SurveyStatus.live;
  return document;
}

/** Lists surveys for the shop index, newest activity first. */
export async function listSurveyRowsForShop(shop: ShopRecord) {
  return prisma.survey.findMany({
    where: { shopId: shop.shopId },
    orderBy: { updatedAt: "desc" },
  });
}

/** Response counts keyed by surveyUuid. */
export async function responseCountsForSurveys(
  shop: ShopRecord,
  surveyUuids: string[],
): Promise<Map<string, number>> {
  if (surveyUuids.length === 0) {
    return new Map();
  }

  const surveys = await prisma.survey.findMany({
    where: { shopId: shop.shopId, surveyUuid: { in: surveyUuids } },
    select: { id: true, surveyUuid: true },
  });
  const idToUuid = new Map(surveys.map((s) => [s.id, s.surveyUuid]));

  const grouped = await prisma.surveyResponse.groupBy({
    by: ["surveyId"],
    where: {
      shopId: shop.shopId,
      surveyId: { in: surveys.map((s) => s.id) },
    },
    _count: { _all: true },
  });

  return new Map(
    grouped.map((row) => [
      idToUuid.get(row.surveyId) ?? "",
      row._count._all,
    ]),
  );
}

/** Clones a survey as paused; returns new `surveyUuid`. */
export async function duplicateSurveyForShop(
  shop: ShopRecord,
  sourceSurveyUuid: string,
): Promise<string | null> {
  const source = await prisma.survey.findFirst({
    where: { shopId: shop.shopId, surveyUuid: sourceSurveyUuid },
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
      shopId: shop.shopId,
      ...surveyDocumentScalars(document),
      status: SurveyStatus.paused,
    },
  });
  document.id = created.surveyUuid;
  await prisma.survey.update({
    where: { id: created.id },
    data: { document: document as object },
  });

  return created.surveyUuid;
}

/** Sets live/paused and keeps `document.isActive` in sync. */
export async function setSurveyStatusForShop(
  shop: ShopRecord,
  surveyUuid: string,
  status: SurveyStatus,
): Promise<boolean> {
  const row = await prisma.survey.findFirst({
    where: { shopId: shop.shopId, surveyUuid },
  });
  if (!row) {
    return false;
  }

  const document = structuredClone(row.document) as unknown as SurveyDocument;
  document.id = row.surveyUuid;
  document.isActive = status === SurveyStatus.live;

  await prisma.survey.update({
    where: { id: row.id },
    data: {
      status,
      document: document as object,
    },
  });

  return true;
}

/** Removes a survey row for the shop. */
export async function deleteSurveyForShop(
  shop: ShopRecord,
  surveyUuid: string,
): Promise<boolean> {
  const row = await prisma.survey.findFirst({
    where: { shopId: shop.shopId, surveyUuid },
  });
  if (!row) {
    return false;
  }

  await prisma.$transaction([
    prisma.surveyResponse.deleteMany({
      where: { shopId: shop.shopId, surveyId: row.id },
    }),
    prisma.survey.delete({ where: { id: row.id } }),
  ]);
  return true;
}

/** @deprecated use syncShopifyFromDatabase */
export async function publishLiveSurveysForShop(
  admin: AdminApiContext,
  shop: ShopRecord,
): Promise<{ handles: string[] }> {
  return syncShopifyFromDatabase(admin, shop);
}

/** Deletes all shop-owned survey data (uninstall / redact). */
export async function deleteAllShopSurveyData(
  myshopifyDomain: string,
): Promise<void> {
  const shop = await prisma.shop.findUnique({
    where: { myshopifyDomain: myshopifyDomain.trim().toLowerCase() },
  });
  if (!shop) {
    return;
  }
  await prisma.$transaction([
    prisma.surveyResponse.deleteMany({ where: { shopId: shop.id } }),
    prisma.survey.deleteMany({ where: { shopId: shop.id } }),
    prisma.shop.delete({ where: { id: shop.id } }),
  ]);
}
