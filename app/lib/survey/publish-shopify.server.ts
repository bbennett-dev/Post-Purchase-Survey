import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import {
  buildChannelIndex,
  buildCheckoutSurveys,
  buildPublishedSurveyPayload,
  surveyPublishHandle,
} from "./publish";
import type { SurveyDocument } from "./types";

const SURVEY_METAOBJECT_TYPE = "$app:survey";

export interface PublishUserError {
  field?: string[] | null;
  message: string;
}

export class PublishSurveyError extends Error {
  constructor(
    message: string,
    readonly userErrors: PublishUserError[] = [],
  ) {
    super(message);
    this.name = "PublishSurveyError";
  }
}

/**
 * Writes published survey data to Shopify so Thank you / Order status extensions
 * can read `$app.checkout_surveys` without calling the app server.
 */
export async function publishSurveysToShop(
  admin: AdminApiContext,
  surveys: SurveyDocument[],
): Promise<{ handles: string[] }> {
  const shopId = await fetchShopGid(admin);
  const checkoutSurveys = buildCheckoutSurveys(surveys);
  const channelIndex = buildChannelIndex(surveys);

  await setShopMetafields(admin, shopId, [
    {
      namespace: "$app",
      key: "checkout_surveys",
      type: "json",
      value: JSON.stringify(checkoutSurveys),
    },
    {
      namespace: "$app",
      key: "channel_index",
      type: "json",
      value: JSON.stringify(channelIndex),
    },
  ]);

  const handles: string[] = [];
  for (const survey of surveys) {
    const handle = surveyPublishHandle(survey);
    handles.push(handle);
    const payload = buildPublishedSurveyPayload(survey);
    await upsertSurveyMetaobject(admin, handle, survey.name, payload);
  }

  return { handles };
}

async function fetchShopGid(admin: AdminApiContext): Promise<string> {
  const response = await admin.graphql(`#graphql
    query PublishSurveyShop {
      shop {
        id
      }
    }
  `);
  const { data, errors } = (await response.json()) as {
    data?: { shop?: { id?: string } };
    errors?: { message: string }[];
  };

  if (errors?.length) {
    throw new PublishSurveyError(errors.map((e) => e.message).join("; "));
  }
  const id = data?.shop?.id;
  if (!id) {
    throw new PublishSurveyError("Could not load shop id for publish.");
  }
  return id;
}

async function setShopMetafields(
  admin: AdminApiContext,
  ownerId: string,
  metafields: {
    namespace: string;
    key: string;
    type: string;
    value: string;
  }[],
): Promise<void> {
  const response = await admin.graphql(
    `#graphql
    mutation PublishSurveyMetafields($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        metafields: metafields.map((field) => ({
          ownerId,
          ...field,
        })),
      },
    },
  );

  const body = (await response.json()) as {
    data?: {
      metafieldsSet?: {
        userErrors?: PublishUserError[];
      };
    };
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    throw new PublishSurveyError(body.errors.map((e) => e.message).join("; "));
  }

  const userErrors = body.data?.metafieldsSet?.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new PublishSurveyError(
      userErrors.map((e) => e.message).join("; "),
      userErrors,
    );
  }
}

async function upsertSurveyMetaobject(
  admin: AdminApiContext,
  handle: string,
  title: string,
  payload: ReturnType<typeof buildPublishedSurveyPayload>,
): Promise<void> {
  const response = await admin.graphql(
    `#graphql
    mutation PublishSurveyMetaobject(
      $handle: MetaobjectHandleInput!
      $metaobject: MetaobjectUpsertInput!
    ) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject {
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        handle: {
          type: SURVEY_METAOBJECT_TYPE,
          handle,
        },
        metaobject: {
          fields: [
            { key: "title", value: title },
            { key: "payload", value: JSON.stringify(payload) },
          ],
        },
      },
    },
  );

  const body = (await response.json()) as {
    data?: {
      metaobjectUpsert?: {
        userErrors?: PublishUserError[];
      };
    };
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    throw new PublishSurveyError(body.errors.map((e) => e.message).join("; "));
  }

  const userErrors = body.data?.metaobjectUpsert?.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new PublishSurveyError(
      userErrors.map((e) => e.message).join("; "),
      userErrors,
    );
  }
}
