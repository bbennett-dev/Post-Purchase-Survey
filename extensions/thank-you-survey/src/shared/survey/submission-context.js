/**
 * Best-effort checkout context for POST body (sparse keys only).
 * Server enriches gaps via Admin API when order GID is present.
 */

function readSignal(signal) {
  if (signal == null) {
    return undefined;
  }
  if (typeof signal === "object" && "value" in signal) {
    return signal.value;
  }
  return signal;
}

function setIfDefined(target, key, value) {
  if (value === undefined || value === null) {
    return;
  }
  if (typeof value === "string" && value.trim() === "") {
    return;
  }
  target[key] = value;
}

function detectDeviceType() {
  try {
    const ua = globalThis.navigator?.userAgent ?? "";
    if (/Mobi|Android/i.test(ua)) {
      return "Mobile";
    }
    if (ua) {
      return "Desktop";
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function readCountryCode(localization, shippingAddress) {
  const loc = readSignal(localization);
  const countrySignal = loc?.country;
  const country = readSignal(countrySignal);
  const fromLoc =
    country?.isoCode ?? loc?.country?.isoCode ?? loc?.isoCode ?? undefined;
  if (fromLoc) {
    return fromLoc;
  }
  const address = readSignal(shippingAddress);
  return address?.countryCode ?? undefined;
}

function applyLineItemsToContext(ctx, lineItems) {
  if (!lineItems?.length) {
    return;
  }
  ctx.lineItems = lineItems;
  ctx.variantIds = lineItems
    .map((item) => {
      const vid = item.variantId ?? "";
      return vid.includes("/") ? vid.split("/").pop() : vid;
    })
    .filter(Boolean);
  const first = lineItems[0];
  if (first?.productId) {
    const pid = String(first.productId);
    setIfDefined(
      ctx,
      "productId",
      pid.includes("/") ? pid.split("/").pop() : pid,
    );
  }
  setIfDefined(ctx, "productName", first?.productTitle);
}

/** Lifecycle tags for first vs repeat purchase (not Shopify Admin merchant tags). */
function applyCustomerLifecycleTags(ctx, isFirstOrder) {
  if (isFirstOrder === true) {
    ctx.customerTags = ["New customer"];
  } else if (isFirstOrder === false) {
    ctx.customerTags = ["Return customer"];
  }
}

function lineItemsFromCartLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return undefined;
  }
  const mapped = lines
    .map((line) => {
      const variant = line?.merchandise;
      if (!variant?.id) {
        return null;
      }
      return {
        variantId: variant.id,
        variantTitle: variant.title ?? null,
        productId: variant.product?.id ?? null,
        productTitle: variant.product?.title ?? null,
        featuredImageUrl: variant.image?.url ?? variant.product?.image?.url ?? null,
        quantity: line.quantity ?? 1,
      };
    })
    .filter(Boolean);
  return mapped.length ? mapped : undefined;
}

/**
 * @param {{ surface: 'thank-you' | 'order-status'; orderId: string | null; pageType: string; channelType: string; endingCardId?: string | null; completionTime?: number; completionRate?: number }} options
 */
export function buildSubmissionContext(options) {
  const {
    surface,
    orderId,
    pageType,
    channelType,
    endingCardId,
    completionTime,
    completionRate,
  } = options;

  const ctx = {};
  setIfDefined(ctx, "pageType", pageType);
  setIfDefined(ctx, "channelType", channelType);
  setIfDefined(ctx, "attributionSource", "checkout_ext");
  setIfDefined(ctx, "endingCardId", endingCardId);
  if (typeof completionTime === "number" && completionTime >= 0) {
    ctx.completionTime = completionTime;
  }
  if (typeof completionRate === "number") {
    ctx.completionRate = completionRate;
  }

  const deviceType = detectDeviceType();
  setIfDefined(ctx, "deviceType", deviceType);

  const country = readCountryCode(
    shopify.localization,
    shopify.shippingAddress,
  );
  setIfDefined(ctx, "country", country);

  if (surface === "thank-you") {
    const confirmation = readSignal(shopify.orderConfirmation);
    if (confirmation?.number) {
      setIfDefined(ctx, "orderName", `#${confirmation.number}`);
    }
    applyCustomerLifecycleTags(ctx, confirmation?.isFirstOrder);

    const buyer = shopify.buyerIdentity;
    const email = readSignal(buyer?.email);
    setIfDefined(ctx, "email", email);
    const customer = readSignal(buyer?.customer);
    if (customer?.id) {
      const id = String(customer.id);
      setIfDefined(
        ctx,
        "customerId",
        id.includes("/") ? id.split("/").pop() : id,
      );
    }
    const displayName =
      customer?.displayName ??
      [customer?.firstName, customer?.lastName].filter(Boolean).join(" ");
    setIfDefined(ctx, "customerName", displayName);

    const lines = readSignal(shopify.lines);
    applyLineItemsToContext(ctx, lineItemsFromCartLines(lines));
  }

  if (surface === "order-status") {
    const order = readSignal(shopify.order);
    if (order?.name) {
      setIfDefined(ctx, "orderName", order.name);
    }
    const buyer = shopify.buyerIdentity;
    const email = readSignal(buyer?.email);
    setIfDefined(ctx, "email", email);
    const customer = readSignal(buyer?.customer);
    if (customer?.id) {
      const id = String(customer.id);
      setIfDefined(
        ctx,
        "customerId",
        id.includes("/") ? id.split("/").pop() : id,
      );
    }
    const displayName =
      customer?.fullName ??
      customer?.displayName ??
      [customer?.firstName, customer?.lastName].filter(Boolean).join(" ");
    setIfDefined(ctx, "customerName", displayName);

    // No orderConfirmation / isFirstOrder on order-status — lifecycle tags filled on server.
    const lines = readSignal(shopify.lines);
    applyLineItemsToContext(ctx, lineItemsFromCartLines(lines));

    const checkoutToken = readSignal(shopify.checkoutToken);
    setIfDefined(ctx, "checkoutToken", checkoutToken);
  }

  if (orderId) {
    /* orderId sent separately on submit; context stays optional */
  }

  return ctx;
}
