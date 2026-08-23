import { Prisma } from "@prisma/client";
import type { JwtPayload } from "@shopify/shopify-api";
import prisma from "../db.server";
import {
  DEFAULT_SURVEY_HEADING,
  DEFAULT_SURVEY_OPTIONS,
  HEADING_MAX_LENGTH,
  OPTION_LABEL_MAX_LENGTH,
  OTHER_TEXT_MAX_LENGTH,
  SURVEY_SOURCES,
  type AdminSurveySaveRequest,
  type PublicSurveyGetResponse,
  type SurveyConfigDto,
  type SurveyOptionDto,
  type SurveySource,
  type SurveySubmitRequest,
  type SurveySubmitResponse,
} from "../types/survey";

const ORDER_GID_PREFIX = "gid://shopify/Order/";
const CUSTOMER_GID_PREFIX = "gid://shopify/Customer/";

export class SurveyHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SurveyHttpError";
    this.status = status;
  }
}

function normalizeShop(shop: string): string {
  return shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function isSurveySource(value: unknown): value is SurveySource {
  return (
    typeof value === "string" &&
    (SURVEY_SOURCES as readonly string[]).includes(value)
  );
}

function customerGidFromToken(sessionToken: JwtPayload): string | null {
  const sub = sessionToken.sub;
  if (typeof sub === "string" && sub.startsWith(CUSTOMER_GID_PREFIX)) {
    return sub;
  }
  return null;
}

function toOptionDto(option: {
  id: string;
  label: string;
  position: number;
  isOther: boolean;
  isActive: boolean;
}): SurveyOptionDto {
  return {
    id: option.id,
    label: option.label,
    position: option.position,
    isOther: option.isOther,
    isActive: option.isActive,
  };
}

export async function ensureSurveyConfig(shop: string): Promise<SurveyConfigDto> {
  const shopDomain = normalizeShop(shop);

  const existing = await prisma.surveyConfig.findUnique({
    where: { shop: shopDomain },
    include: { options: { orderBy: { position: "asc" } } },
  });

  if (existing) {
    return {
      id: existing.id,
      shop: existing.shop,
      heading: existing.heading,
      isEnabled: existing.isEnabled,
      allowOther: existing.allowOther,
      options: existing.options.map(toOptionDto),
    };
  }

  const created = await prisma.surveyConfig.create({
    data: {
      shop: shopDomain,
      heading: DEFAULT_SURVEY_HEADING,
      options: {
        create: DEFAULT_SURVEY_OPTIONS.map((option, index) => ({
          label: option.label,
          isOther: option.isOther,
          position: index,
          isActive: true,
        })),
      },
    },
    include: { options: { orderBy: { position: "asc" } } },
  });

  return {
    id: created.id,
    shop: created.shop,
    heading: created.heading,
    isEnabled: created.isEnabled,
    allowOther: created.allowOther,
    options: created.options.map(toOptionDto),
  };
}

export async function getPublicSurvey(params: {
  shop: string;
  shopifyOrderGid?: string | null;
}): Promise<PublicSurveyGetResponse> {
  const config = await ensureSurveyConfig(params.shop);
  const shop = normalizeShop(params.shop);

  let alreadySubmitted = false;
  if (params.shopifyOrderGid) {
    const existing = await prisma.surveyResponse.findUnique({
      where: {
        shop_shopifyOrderGid: {
          shop,
          shopifyOrderGid: params.shopifyOrderGid,
        },
      },
      select: { id: true },
    });
    alreadySubmitted = Boolean(existing);
  }

  const options = config.options
    .filter((option) => option.isActive)
    .filter((option) => (config.allowOther ? true : !option.isOther))
    .map((option) => ({
      id: option.id,
      label: option.label,
      isOther: option.isOther,
    }));

  return {
    heading: config.heading,
    isEnabled: config.isEnabled,
    allowOther: config.allowOther,
    alreadySubmitted,
    options,
  };
}

function parseSubmitBody(body: unknown): SurveySubmitRequest {
  if (!body || typeof body !== "object") {
    throw new SurveyHttpError(400, "Invalid JSON body.");
  }

  const payload = body as Record<string, unknown>;
  const shopifyOrderGid =
    typeof payload.shopifyOrderGid === "string" ? payload.shopifyOrderGid.trim() : "";
  if (!shopifyOrderGid.startsWith(ORDER_GID_PREFIX)) {
    throw new SurveyHttpError(400, "A valid Shopify order GID is required.");
  }

  if (!Array.isArray(payload.optionIds) || payload.optionIds.length === 0) {
    throw new SurveyHttpError(400, "Select at least one option.");
  }

  const optionIds = [
    ...new Set(
      payload.optionIds.filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];
  if (optionIds.length === 0) {
    throw new SurveyHttpError(400, "Select at least one option.");
  }

  if (!isSurveySource(payload.source)) {
    throw new SurveyHttpError(400, "Invalid survey source.");
  }

  const otherText =
    typeof payload.otherText === "string" ? payload.otherText.trim() : "";

  return {
    shopifyOrderGid,
    shopifyOrderNumber:
      typeof payload.shopifyOrderNumber === "string"
        ? payload.shopifyOrderNumber.trim()
        : null,
    shopifyCustomerGid:
      typeof payload.shopifyCustomerGid === "string" &&
      payload.shopifyCustomerGid.startsWith(CUSTOMER_GID_PREFIX)
        ? payload.shopifyCustomerGid
        : null,
    checkoutToken:
      typeof payload.checkoutToken === "string" ? payload.checkoutToken.trim() : null,
    optionIds,
    otherText: otherText.length > 0 ? otherText.slice(0, OTHER_TEXT_MAX_LENGTH) : null,
    source: payload.source,
  };
}

export async function submitSurvey(params: {
  shop: string;
  sessionToken: JwtPayload;
  body: unknown;
}): Promise<SurveySubmitResponse> {
  const shop = normalizeShop(params.shop);
  const input = parseSubmitBody(params.body);
  const config = await ensureSurveyConfig(shop);

  if (!config.isEnabled) {
    throw new SurveyHttpError(409, "This survey is currently disabled.");
  }

  const selected = config.options.filter((option) =>
    input.optionIds.includes(option.id),
  );

  if (selected.length !== input.optionIds.length) {
    throw new SurveyHttpError(400, "One or more options are invalid for this shop.");
  }

  if (selected.some((option) => !option.isActive)) {
    throw new SurveyHttpError(400, "One or more selected options are no longer available.");
  }

  const otherOption = selected.find((option) => option.isOther);
  if (otherOption && !config.allowOther) {
    throw new SurveyHttpError(400, "Other is not enabled for this survey.");
  }
  if (otherOption && !input.otherText) {
    throw new SurveyHttpError(400, "Please tell us a bit more for Other.");
  }

  const shopifyCustomerGid =
    customerGidFromToken(params.sessionToken) ?? input.shopifyCustomerGid;

  try {
    await prisma.surveyResponse.create({
      data: {
        shop,
        shopifyOrderGid: input.shopifyOrderGid,
        shopifyOrderNumber: input.shopifyOrderNumber,
        shopifyCustomerGid,
        checkoutToken: input.checkoutToken,
        surveyConfigId: config.id,
        otherText: otherOption ? input.otherText : null,
        source: input.source,
        selections: {
          create: selected.map((option) => ({
            surveyOptionId: option.id,
            optionLabel: option.label,
          })),
        },
      },
    });

    return { ok: true, alreadySubmitted: false };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: true, alreadySubmitted: true };
    }
    throw error;
  }
}

export async function saveAdminSurvey(
  shop: string,
  input: AdminSurveySaveRequest,
): Promise<SurveyConfigDto> {
  const shopDomain = normalizeShop(shop);
  const config = await ensureSurveyConfig(shopDomain);

  const heading = input.heading.trim();
  if (!heading || heading.length > HEADING_MAX_LENGTH) {
    throw new SurveyHttpError(400, "Enter a heading up to 120 characters.");
  }

  if (!Array.isArray(input.options) || input.options.length === 0) {
    throw new SurveyHttpError(400, "Add at least one survey option.");
  }

  const otherOptions = input.options.filter((option) => option.isOther);
  if (otherOptions.length !== 1) {
    throw new SurveyHttpError(400, "Keep exactly one Other option.");
  }

  const labels = input.options.map((option) => option.label.trim());
  if (labels.some((label) => !label || label.length > OPTION_LABEL_MAX_LENGTH)) {
    throw new SurveyHttpError(400, "Each option needs a label up to 80 characters.");
  }
  if (new Set(labels.map((label) => label.toLowerCase())).size !== labels.length) {
    throw new SurveyHttpError(400, "Option labels must be unique.");
  }

  const existingIds = new Set(config.options.map((option) => option.id));
  const incomingIds = input.options
    .map((option) => option.id)
    .filter((id): id is string => Boolean(id));
  for (const id of incomingIds) {
    if (!existingIds.has(id)) {
      throw new SurveyHttpError(400, "An option could not be found for this shop.");
    }
  }

  const keptIds = new Set(incomingIds);

  await prisma.$transaction(async (tx) => {
    await tx.surveyConfig.update({
      where: { id: config.id },
      data: {
        heading,
        isEnabled: input.isEnabled,
        allowOther: input.allowOther,
      },
    });

    for (const [index, option] of input.options.entries()) {
      const label = option.label.trim();
      const data = {
        label,
        isActive: option.isOther ? true : option.isActive,
        isOther: option.isOther,
        position: index,
      };

      if (option.id) {
        await tx.surveyOption.update({
          where: { id: option.id },
          data,
        });
        continue;
      }

      const existingByLabel = config.options.find(
        (current) => current.label.toLowerCase() === label.toLowerCase(),
      );
      if (existingByLabel) {
        keptIds.add(existingByLabel.id);
        await tx.surveyOption.update({
          where: { id: existingByLabel.id },
          data,
        });
      } else {
        await tx.surveyOption.create({
          data: {
            surveyConfigId: config.id,
            ...data,
          },
        });
      }
    }

    const removedIds = config.options
      .map((option) => option.id)
      .filter((id) => !keptIds.has(id));

    if (removedIds.length > 0) {
      await tx.surveyOption.updateMany({
        where: { id: { in: removedIds }, surveyConfigId: config.id },
        data: { isActive: false },
      });
    }
  });

  return ensureSurveyConfig(shopDomain);
}

export async function redactCustomerData(params: {
  shop: string;
  customerGid?: string | null;
  orderGids: string[];
}): Promise<number> {
  const shop = normalizeShop(params.shop);
  const filters: Prisma.SurveyResponseWhereInput[] = [];

  if (params.customerGid) {
    filters.push({ shopifyCustomerGid: params.customerGid });
  }
  if (params.orderGids.length > 0) {
    filters.push({ shopifyOrderGid: { in: params.orderGids } });
  }
  if (filters.length === 0) {
    return 0;
  }

  const result = await prisma.surveyResponse.deleteMany({
    where: {
      shop,
      OR: filters,
    },
  });

  return result.count;
}

export async function redactShopData(shop: string): Promise<void> {
  const shopDomain = normalizeShop(shop);
  await prisma.surveyConfig.deleteMany({ where: { shop: shopDomain } });
}

export async function findCustomerSurveyData(params: {
  shop: string;
  customerGid?: string | null;
  orderGids: string[];
}) {
  const shop = normalizeShop(params.shop);
  const filters: Prisma.SurveyResponseWhereInput[] = [];

  if (params.customerGid) {
    filters.push({ shopifyCustomerGid: params.customerGid });
  }
  if (params.orderGids.length > 0) {
    filters.push({ shopifyOrderGid: { in: params.orderGids } });
  }
  if (filters.length === 0) {
    return [];
  }

  return prisma.surveyResponse.findMany({
    where: { shop, OR: filters },
    select: {
      id: true,
      shopifyOrderGid: true,
      shopifyOrderNumber: true,
      shopifyCustomerGid: true,
      otherText: true,
      source: true,
      createdAt: true,
      selections: {
        select: { optionLabel: true },
      },
    },
  });
}
