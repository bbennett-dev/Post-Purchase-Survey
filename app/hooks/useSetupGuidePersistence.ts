import { useCallback, useMemo, useState } from "react";
import type { SetupGuideStepId } from "../lib/dashboard/setup-guide-steps";

const STORAGE_VERSION = 1;

type StoredSetupGuide = {
  v: number;
  dismissed?: boolean;
  /** Explicit merchant toggles; when set, overrides auto completion for that step. */
  toggled?: Partial<Record<SetupGuideStepId, boolean>>;
};

function storageKey(shopDomain: string): string {
  return `post-purchase-survey:setup-guide:v${STORAGE_VERSION}:${shopDomain}`;
}

function readStored(shopDomain: string): StoredSetupGuide | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey(shopDomain));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredSetupGuide;
    if (parsed.v !== STORAGE_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(shopDomain: string, data: StoredSetupGuide): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKey(shopDomain), JSON.stringify(data));
}

/**
 * Persists setup guide dismiss + manual step toggles per shop (localStorage).
 */
export function useSetupGuidePersistence(shopDomain: string) {
  const [stored, setStored] = useState<StoredSetupGuide>(() => ({
    v: STORAGE_VERSION,
    ...(readStored(shopDomain) ?? {}),
  }));

  const dismissed = stored.dismissed === true;

  const dismiss = useCallback(() => {
    setStored((prev) => {
      const next: StoredSetupGuide = {
        ...prev,
        v: STORAGE_VERSION,
        dismissed: true,
      };
      writeStored(shopDomain, next);
      return next;
    });
  }, [shopDomain]);

  const toggleStep = useCallback(
    (stepId: SetupGuideStepId, nextComplete: boolean) => {
      setStored((prev) => {
        const next: StoredSetupGuide = {
          ...prev,
          v: STORAGE_VERSION,
          toggled: { ...prev.toggled, [stepId]: nextComplete },
        };
        writeStored(shopDomain, next);
        return next;
      });
    },
    [shopDomain],
  );

  const isStepComplete = useCallback(
    (stepId: SetupGuideStepId, autoComplete: boolean): boolean => {
      const override = stored.toggled?.[stepId];
      if (override !== undefined) {
        return override;
      }
      return autoComplete;
    },
    [stored.toggled],
  );

  return useMemo(
    () => ({
      dismissed,
      dismiss,
      toggleStep,
      isStepComplete,
    }),
    [dismiss, dismissed, isStepComplete, toggleStep],
  );
}
