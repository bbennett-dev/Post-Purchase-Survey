import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  type AppExtensionInfo,
  type ExtensionPlacementStatus,
  parseExtensionPlacementStatus,
} from "../lib/shopify/extension-placement-status";

export type ExtensionPlacementLoadState =
  | { status: "loading" }
  | { status: "ready"; placement: ExtensionPlacementStatus }
  | { status: "unavailable" };

type ShopifyAppBridge = {
  app?: {
    extensions?: () => Promise<AppExtensionInfo[]>;
  };
};

/**
 * Reads published checkout / theme placement from the embedded App Home API.
 */
export function useExtensionPlacementStatus(): ExtensionPlacementLoadState {
  const shopify = useAppBridge();
  const [state, setState] = useState<ExtensionPlacementLoadState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const bridge = shopify as ShopifyAppBridge;
      if (typeof bridge.app?.extensions !== "function") {
        if (!cancelled) {
          setState({ status: "unavailable" });
        }
        return;
      }

      try {
        const extensions = await bridge.app.extensions();
        const placement = parseExtensionPlacementStatus(extensions ?? []);
        if (!cancelled) {
          setState({ status: "ready", placement });
        }
      } catch (error) {
        console.warn("useExtensionPlacementStatus: app.extensions failed", error);
        if (!cancelled) {
          setState({ status: "unavailable" });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [shopify]);

  return state;
}
