import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import type { ShopRecord } from "../shop/shop.server";
import {
  parseSurveySaveRequestBody,
  SurveySaveBodyError,
} from "./save-survey-document-parse.server";
import { persistSurveyAndMaybePublishShopify } from "./survey-store.server";
import type { SurveyDocument } from "./types";

export { parseSurveySaveRequestBody, SurveySaveBodyError };

/**
 * Persists editor document for the authenticated shop; URL id must match body id.
 */
export async function saveSurveyDocumentForShop(
  admin: AdminApiContext,
  shop: ShopRecord,
  surveyUuidFromUrl: string,
  survey: SurveyDocument,
): Promise<{ publishedToShopify: boolean }> {
  const urlId = surveyUuidFromUrl.trim();
  const bodyId = survey.id?.trim();
  if (!bodyId) {
    throw new SurveySaveBodyError("Survey id is required");
  }
  if (urlId !== bodyId) {
    throw new SurveySaveBodyError("Survey id does not match URL");
  }

  return persistSurveyAndMaybePublishShopify(admin, shop, survey);
}
