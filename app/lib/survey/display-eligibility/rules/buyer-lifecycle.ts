import type { BuyerLifecycle } from "../types";

export function lifecycleFromIsFirstOrder(
  isFirstOrder: boolean | null | undefined,
): BuyerLifecycle {
  if (isFirstOrder === true) {
    return "new";
  }
  if (isFirstOrder === false) {
    return "return";
  }
  return "unknown";
}

export function lifecycleFromOrderCount(
  numberOfOrders: number | null | undefined,
): BuyerLifecycle {
  if (numberOfOrders == null || Number.isNaN(numberOfOrders)) {
    return "unknown";
  }
  return numberOfOrders <= 1 ? "new" : "return";
}
