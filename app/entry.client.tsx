import { startTransition, StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

declare global {
  interface Window {
    __reactRouterContext?: {
      stream?: ReadableStream;
      state?: unknown;
    };
  }
}

/**
 * React Router single-fetch emits `streamController.enqueue/close` in inline
 * scripts after `</html>`. Vite's async entry module can execute before those
 * scripts run (especially with a warm module cache), so `HydratedRouter` throws
 * a pending decode promise during `hydrateRoot(document)` → `<head>` mismatch.
 */
function waitForSingleFetchBootstrap(): Promise<void> {
  const ctx = window.__reactRouterContext;
  if (!ctx?.stream) {
    return Promise.resolve();
  }

  const isReady = () =>
    [...document.scripts].some((script) =>
      script.textContent?.includes("streamController.close()"),
    );

  if (isReady()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
      resolve();
    };

    const observer = new MutationObserver(() => {
      if (isReady()) finish();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const interval = window.setInterval(() => {
      if (isReady()) finish();
    }, 0);

    const timeout = window.setTimeout(finish, 3_000);
  });
}

function renderApp() {
  const app = import.meta.env.PROD ? (
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  ) : (
    <HydratedRouter />
  );

  if (import.meta.env.DEV) {
    // Dev-only: skip document hydration to avoid the single-fetch + async entry race.
    // SSR HTML remains the first paint; the router mounts cleanly on the client.
    // react-dom types omit `Document`, but React supports it (same as hydrateRoot).
    createRoot(document as unknown as HTMLElement, {
      identifierPrefix: "pps-dev-",
    }).render(app);
    return;
  }

  startTransition(() => {
    hydrateRoot(document, app);
  });
}

void waitForSingleFetchBootstrap().then(renderApp);
