import { SurveyStatus } from "@prisma/client";
import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import prisma from "../../db.server";
import type { ShopRecord } from "../shop/shop.server";
import {
  createDefaultSurveyForShop,
  deleteSurveyForShop,
  duplicateSurveyForShop,
  setSurveyStatusForShop,
  syncShopifyFromDatabase,
} from "./survey-store.server";

export type SurveyMutationIntent = "duplicate" | "toggle-status";

export class SurveyMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SurveyMutationError";
  }
}

export function parseSurveyMutationIntent(raw: unknown): SurveyMutationIntent {
  if (!raw || typeof raw !== "object" || !("intent" in raw)) {
    throw new SurveyMutationError("Missing intent");
  }
  const intent = (raw as { intent: unknown }).intent;
  if (intent === "duplicate" || intent === "toggle-status") {
    return intent;
  }
  throw new SurveyMutationError("Unknown intent");
}

export async function createSurveyForShop(
  shop: ShopRecord,
): Promise<{ surveyId: string }> {
  const surveyId = await createDefaultSurveyForShop(shop);
  return { surveyId };
}

export async function runSurveyMutationForShop(
  admin: AdminApiContext,
  shop: ShopRecord,
  surveyUuid: string,
  intent: SurveyMutationIntent,
): Promise<void> {
  const id = surveyUuid.trim();
  if (!id) {
    throw new SurveyMutationError("Missing survey id");
  }

  if (intent === "duplicate") {
    const created = await duplicateSurveyForShop(shop, id);
    if (!created) {
      throw new SurveyMutationError("Survey not found");
    }
    return;
  }

  if (intent === "toggle-status") {
    const current = await prisma.survey.findFirst({
      where: { shopId: shop.shopId, surveyUuid: id },
    });
    if (!current) {
      throw new SurveyMutationError("Survey not found");
    }
    const nextStatus: SurveyStatus =
      current.status === SurveyStatus.live
        ? SurveyStatus.paused
        : SurveyStatus.live;
    await setSurveyStatusForShop(shop, id, nextStatus);
    await syncShopifyFromDatabase(admin, shop);
    return;
  }
}

export async function deleteSurveyMutationForShop(
  admin: AdminApiContext,
  shop: ShopRecord,
  surveyUuid: string,
): Promise<void> {
  const id = surveyUuid.trim();
  if (!id) {
    throw new SurveyMutationError("Missing survey id");
  }
  const removed = await deleteSurveyForShop(shop, id);
  if (!removed) {
    throw new SurveyMutationError("Survey not found");
  }
  await syncShopifyFromDatabase(admin, shop);
}
