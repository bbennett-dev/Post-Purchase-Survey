function readSignal(signal) {
  if (signal == null) {
    return undefined;
  }
  if (typeof signal === "object" && "value" in signal) {
    return signal.value;
  }
  return signal;
}

/** Thank-you `orderConfirmation.isFirstOrder` when available. */
export function readThankYouIsFirstOrder() {
  const confirmation = readSignal(shopify.orderConfirmation);
  return confirmation?.isFirstOrder;
}

export function readBuyerIds(surface) {
  const buyer = shopify.buyerIdentity;
  const email = readSignal(buyer?.email);
  const customer = readSignal(buyer?.customer);
  let customerId = null;
  if (customer?.id) {
    const id = String(customer.id);
    customerId = id.includes("/") ? id.split("/").pop() : id;
  }
  const isFirstOrder =
    surface === "thank-you" ? readThankYouIsFirstOrder() : undefined;
  return { email, customerId, isFirstOrder };
}
