import { unauthenticated } from "../../shopify.server";
import {
  adminEnrichmentNeeded,
  isShopifyOrderGid,
  mergeSubmissionContext,
  needsCustomerEmailLookup,
  needsOrderEnrichment,
  needsProductNameLookup,
  needsVariantHydration,
} from "./submission-context-merge";
import type {
  SurveySubmissionContext,
  SurveySubmissionLineItem,
} from "./survey-response.types";

const LIFECYCLE_TAG_FIRST = "New customer";
const LIFECYCLE_TAG_RETURN = "Return customer";

function lifecycleTagsFromOrderCount(
  numberOfOrders: number | undefined | null,
): string[] | undefined {
  if (numberOfOrders == null || Number.isNaN(numberOfOrders)) {
    return undefined;
  }
  if (numberOfOrders <= 1) {
    return [LIFECYCLE_TAG_FIRST];
  }
  return [LIFECYCLE_TAG_RETURN];
}

function stripGidNumeric(gid: string | null | undefined): string | null {
  if (!gid || typeof gid !== "string") {
    return null;
  }
  const tail = gid.split("/").pop();
  return tail && /^\d+$/.test(tail) ? tail : null;
}

function lineItemsFromOrderNode(
  lineItems: {
    edges: {
      node: {
        quantity: number;
        variant?: {
          id: string;
          title: string;
          image?: { url: string } | null;
          product?: {
            id: string;
            title: string;
            featuredImage?: { url: string } | null;
          } | null;
        } | null;
      };
    }[];
  } | null,
): SurveySubmissionLineItem[] {
  if (!lineItems?.edges?.length) {
    return [];
  }
  return lineItems.edges
    .map((edge) => edge.node)
    .filter((node) => node.variant)
    .map((node) => ({
      variantId: node.variant!.id,
      variantTitle: node.variant!.title,
      productId: node.variant!.product?.id ?? null,
      productTitle: node.variant!.product?.title ?? null,
      featuredImageUrl:
        node.variant!.image?.url ??
        node.variant!.product?.featuredImage?.url ??
        null,
      quantity: node.quantity,
    }));
}

const ORDER_ENRICHMENT_QUERY = `#graphql
  query SurveyResponseOrderEnrichment($id: ID!) {
    order(id: $id) {
      name
      customer {
        id
        displayName
        email
        tags
        numberOfOrders
      }
      shippingLine {
        title
      }
      lineItems(first: 50) {
        edges {
          node {
            quantity
            variant {
              id
              title
              image {
                url
              }
              product {
                id
                title
                featuredImage {
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CUSTOMER_BY_EMAIL_QUERY = `#graphql
  query SurveyResponseCustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          displayName
          email
          tags
        }
      }
    }
  }
`;

const VARIANTS_BY_IDS_QUERY = `#graphql
  query SurveyResponseVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        image {
          url
        }
        product {
          id
          title
          featuredImage {
            url
          }
        }
      }
    }
  }
`;

const PRODUCT_TITLE_QUERY = `#graphql
  query SurveyResponseProduct($id: ID!) {
    product(id: $id) {
      id
      title
      featuredImage {
        url
      }
    }
  }
`;

type AdminClient = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
};

async function enrichFromOrder(
  admin: AdminClient,
  orderId: string,
  ctx: SurveySubmissionContext,
): Promise<SurveySubmissionContext> {
  const response = await admin.graphql(ORDER_ENRICHMENT_QUERY, {
    variables: { id: orderId },
  });
  const { data } = (await response.json()) as {
    data?: {
      order?: {
        name: string;
        customer?: {
          id: string;
          displayName: string;
          email: string;
          tags: string[];
          numberOfOrders?: number;
        } | null;
        shippingLine?: { title: string } | null;
        lineItems: {
          edges: {
            node: {
              quantity: number;
              variant?: {
                id: string;
                title: string;
                image?: { url: string } | null;
                product?: {
                  id: string;
                  title: string;
                  featuredImage?: { url: string } | null;
                } | null;
              } | null;
            };
          }[];
        };
      } | null;
    };
  };

  const order = data?.order;
  if (!order) {
    return ctx;
  }

  const patch: SurveySubmissionContext = {};
  if (order.name) {
    patch.orderName = order.name;
  }
  if (order.shippingLine?.title) {
    patch.deliveryMethodTitle = order.shippingLine.title;
    patch.deliveryMethodType = "SHIPPING";
  }
  if (order.customer) {
    patch.customerId = stripGidNumeric(order.customer.id);
    patch.customerName = order.customer.displayName ?? null;
    patch.customerEmail = order.customer.email ?? null;
    if (!ctx.customerTags?.length) {
      if (order.customer.tags?.length) {
        patch.customerTags = order.customer.tags;
      } else {
        const lifecycle = lifecycleTagsFromOrderCount(
          order.customer.numberOfOrders,
        );
        if (lifecycle) {
          patch.customerTags = lifecycle;
        }
      }
    }
  }
  const items = lineItemsFromOrderNode(order.lineItems);
  if (items.length) {
    patch.lineItems = items;
    patch.variantIds = items
      .map((item) => stripGidNumeric(item.variantId ?? undefined))
      .filter(Boolean) as string[];
    const first = items[0];
    if (first.productId) {
      patch.productId = stripGidNumeric(first.productId);
    }
    if (first.productTitle) {
      patch.productName = first.productTitle;
    }
  }

  return mergeSubmissionContext(ctx, patch);
}

async function enrichFromCustomerEmail(
  admin: AdminClient,
  ctx: SurveySubmissionContext,
): Promise<SurveySubmissionContext> {
  const email = ctx.customerEmail?.trim();
  if (!email) {
    return ctx;
  }
  const sanitized = email.replace(/"/g, '\\"');
  const response = await admin.graphql(CUSTOMER_BY_EMAIL_QUERY, {
    variables: { query: `email:"${sanitized}"` },
  });
  const { data } = (await response.json()) as {
    data?: {
      customers?: {
        edges: {
          node: {
            id: string;
            displayName: string;
            email: string;
            tags: string[];
          };
        }[];
      };
    };
  };
  const node = data?.customers?.edges?.[0]?.node;
  if (!node) {
    return ctx;
  }
  return mergeSubmissionContext(ctx, {
    customerId: stripGidNumeric(node.id),
    customerName: node.displayName,
    customerEmail: node.email,
    customerTags: node.tags?.length ? node.tags : undefined,
  });
}

function variantGidsFromContext(ctx: SurveySubmissionContext): string[] {
  const fromIds = (ctx.variantIds ?? []).map((id) => {
    const trimmed = String(id).trim();
    if (trimmed.startsWith("gid://")) {
      return trimmed;
    }
    return `gid://shopify/ProductVariant/${trimmed}`;
  });
  const fromLines = (ctx.lineItems ?? [])
    .map((item) => item.variantId)
    .filter(Boolean)
    .map((id) => {
      const trimmed = String(id).trim();
      if (trimmed.startsWith("gid://")) {
        return trimmed;
      }
      return `gid://shopify/ProductVariant/${trimmed}`;
    });
  return [...new Set([...fromIds, ...fromLines])];
}

async function enrichFromVariantIds(
  admin: AdminClient,
  ctx: SurveySubmissionContext,
): Promise<SurveySubmissionContext> {
  const gids = variantGidsFromContext(ctx);
  if (gids.length === 0) {
    return ctx;
  }
  const response = await admin.graphql(VARIANTS_BY_IDS_QUERY, {
    variables: { ids: gids },
  });
  const { data } = (await response.json()) as {
    data?: {
      nodes?: Array<{
        id?: string;
        title?: string;
        image?: { url: string } | null;
        product?: {
          id: string;
          title: string;
          featuredImage?: { url: string } | null;
        } | null;
      } | null>;
    };
  };
  const nodes = (data?.nodes ?? []).filter(
    (node): node is NonNullable<typeof node> =>
      !!node && typeof node.id === "string",
  );
  if (!nodes.length) {
    return ctx;
  }

  const lineItems: SurveySubmissionLineItem[] = nodes.map((node) => ({
    variantId: node.id!,
    variantTitle: node.title ?? null,
    productId: node.product?.id ?? null,
    productTitle: node.product?.title ?? null,
    featuredImageUrl:
      node.image?.url ?? node.product?.featuredImage?.url ?? null,
  }));

  const patch: SurveySubmissionContext = { lineItems };
  const first = lineItems[0];
  if (first?.productId && !ctx.productId) {
    patch.productId = stripGidNumeric(first.productId);
  }
  if (first?.productTitle && !ctx.productName) {
    patch.productName = first.productTitle;
  }
  patch.variantIds = lineItems
    .map((item) => stripGidNumeric(item.variantId ?? undefined))
    .filter(Boolean) as string[];

  return mergeSubmissionContext(ctx, patch);
}

async function enrichFromProductId(
  admin: AdminClient,
  ctx: SurveySubmissionContext,
): Promise<SurveySubmissionContext> {
  const rawId = ctx.productId?.trim();
  if (!rawId) {
    return ctx;
  }
  const gid = rawId.startsWith("gid://")
    ? rawId
    : `gid://shopify/Product/${rawId}`;
  const response = await admin.graphql(PRODUCT_TITLE_QUERY, {
    variables: { id: gid },
  });
  const { data } = (await response.json()) as {
    data?: { product?: { title: string } | null };
  };
  if (!data?.product?.title) {
    return ctx;
  }
  return mergeSubmissionContext(ctx, { productName: data.product.title });
}

/**
 * Fills gaps in submission context via Admin API; client values always win.
 * Skips Admin entirely when no enrichment step applies or calls fail.
 */
export async function enrichSubmissionContext(
  shop: string,
  orderId: string,
  clientContext: SurveySubmissionContext | undefined,
): Promise<SurveySubmissionContext> {
  const base = clientContext ?? {};
  if (!adminEnrichmentNeeded(orderId, base)) {
    return base;
  }

  let admin: AdminClient;
  try {
    const session = await unauthenticated.admin(shop);
    admin = session.admin;
  } catch (error) {
    console.error("enrichSubmissionContext: no admin session", shop, error);
    return base;
  }

  let merged = { ...base };

  try {
    if (needsOrderEnrichment(orderId, merged) && isShopifyOrderGid(orderId)) {
      merged = await enrichFromOrder(admin, orderId, merged);
    }
    if (needsCustomerEmailLookup(merged)) {
      merged = await enrichFromCustomerEmail(admin, merged);
    }
    if (needsVariantHydration(merged)) {
      merged = await enrichFromVariantIds(admin, merged);
    }
    if (needsProductNameLookup(merged)) {
      merged = await enrichFromProductId(admin, merged);
    }
  } catch (error) {
    console.error("enrichSubmissionContext: Admin enrichment failed", error);
    return mergeSubmissionContext(base, merged);
  }

  return merged;
}
