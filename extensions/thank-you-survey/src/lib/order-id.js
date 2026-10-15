/**
 * Order id from thank-you vs order-status extension APIs.
 */

/** @param {import('@shopify/ui-extensions/purchase.thank-you.block.render').Api} api */
export function readThankYouOrderId(api) {
  const confirmation = api.orderConfirmation?.value;
  if (!confirmation) {
    return null;
  }
  if (confirmation.order?.id) {
    return confirmation.order.id;
  }
  const legacy = /** @type {{ id?: string }} */ (confirmation);
  return legacy.id ?? null;
}

/** @param {import('@shopify/ui-extensions/customer-account.order-status.block.render').Api} api */
export function readOrderStatusOrderId(api) {
  return api.order?.value?.id ?? null;
}
