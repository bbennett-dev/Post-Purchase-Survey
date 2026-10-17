import { useEffect, useState } from "preact/hooks";
import { resolvePostPurchaseShow } from "./post-purchase-eligibility.js";

/**
 * Hides the survey when post-purchase targeting or recurrence rules fail.
 */
export function PostPurchaseSurveyGate({
  survey,
  config,
  surface,
  orderId,
  children,
}) {
  const [show, setShow] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const allowed = await resolvePostPurchaseShow({
        survey,
        config,
        surface,
        orderId,
      });
      if (!cancelled) {
        setShow(allowed);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [survey?.id, config?.eligibilityUrl, surface, orderId]);

  if (show !== true) {
    return null;
  }
  return children;
}
