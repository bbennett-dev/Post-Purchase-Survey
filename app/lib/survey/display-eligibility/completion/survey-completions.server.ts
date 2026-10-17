import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { unauthenticated } from "../../../../shopify.server";
import {
  mergeSurveyCompletion,
  parseSurveyCompletionsMetafield,
  SURVEY_COMPLETIONS_KEY,
  SURVEY_COMPLETIONS_NAMESPACE,
  surveyCompletedInMap,
} from "./survey-completions";

const CUSTOMER_COMPLETIONS_QUERY = `#graphql
  query CustomerSurveyCompletions($id: ID!) {
    customer(id: $id) {
      id
      metafield(namespace: "$app", key: "survey_completions") {
        value
      }
    }
  }
`;

const CUSTOMER_BY_EMAIL_QUERY = `#graphql
  query SurveyCompletionCustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const METAFIELDS_SET = `#graphql
  mutation SurveyCompletionMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors {
        field
        message
      }
    }
  }
`;

export function customerGidFromId(
  customerId: string | null | undefined,
): string | null {
  if (!customerId?.trim()) {
    return null;
  }
  const trimmed = customerId.trim();
  if (trimmed.startsWith("gid://")) {
    return trimmed;
  }
  if (/^\d+$/.test(trimmed)) {
    return `gid://shopify/Customer/${trimmed}`;
  }
  return null;
}

export async function findCustomerGidByEmail(
  admin: AdminApiContext,
  email: string,
): Promise<string | null> {
  const normalized = email.trim();
  if (!normalized) {
    return null;
  }
  const sanitized = normalized.replace(/"/g, '\\"');
  const response = await admin.graphql(CUSTOMER_BY_EMAIL_QUERY, {
    variables: { query: `email:"${sanitized}"` },
  });
  const { data } = (await response.json()) as {
    data?: {
      customers?: { edges?: { node?: { id?: string } }[] };
    };
  };
  return data?.customers?.edges?.[0]?.node?.id ?? null;
}

export async function readSurveyCompletionsForCustomer(
  admin: AdminApiContext,
  customerGid: string,
): Promise<ReturnType<typeof parseSurveyCompletionsMetafield>> {
  const response = await admin.graphql(CUSTOMER_COMPLETIONS_QUERY, {
    variables: { id: customerGid },
  });
  const { data } = (await response.json()) as {
    data?: {
      customer?: {
        metafield?: { value?: string } | null;
      } | null;
    };
  };
  return parseSurveyCompletionsMetafield(
    data?.customer?.metafield?.value ?? null,
  );
}

export async function customerHasSurveyCompletion(
  admin: AdminApiContext,
  customerGid: string,
  surveyUuid: string,
): Promise<boolean> {
  const map = await readSurveyCompletionsForCustomer(admin, customerGid);
  return surveyCompletedInMap(map, surveyUuid);
}

/**
 * Records survey completion on the Shopify Customer for recurrence checks (Admin read path).
 */
export async function writeSurveyCompletionMetafield(
  admin: AdminApiContext,
  customerGid: string,
  surveyUuid: string,
  orderId: string,
): Promise<void> {
  const existing = await readSurveyCompletionsForCustomer(admin, customerGid);
  const merged = mergeSurveyCompletion(existing, surveyUuid, orderId);
  const response = await admin.graphql(METAFIELDS_SET, {
    variables: {
      metafields: [
        {
          ownerId: customerGid,
          namespace: SURVEY_COMPLETIONS_NAMESPACE,
          key: SURVEY_COMPLETIONS_KEY,
          type: "json",
          value: JSON.stringify(merged),
        },
      ],
    },
  });
  const body = (await response.json()) as {
    data?: {
      metafieldsSet?: { userErrors?: { message: string }[] };
    };
    errors?: { message: string }[];
  };
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  const userErrors = body.data?.metafieldsSet?.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join("; "));
  }
}

/**
 * Resolves customer GID and writes completion after a successful DB response save.
 * Failures are logged; callers should not fail the buyer submit.
 */
export async function recordSurveyCompletionOnCustomer(input: {
  myshopifyDomain: string;
  surveyUuid: string;
  orderId: string;
  customerId?: string | null;
  email?: string | null;
}): Promise<void> {
  const { admin } = await unauthenticated.admin(input.myshopifyDomain);
  let customerGid = customerGidFromId(input.customerId);
  if (!customerGid && input.email?.trim()) {
    customerGid = await findCustomerGidByEmail(admin, input.email);
  }
  if (!customerGid) {
    return;
  }
  await writeSurveyCompletionMetafield(
    admin,
    customerGid,
    input.surveyUuid,
    input.orderId,
  );
}
