import { useLayoutEffect, useEffect, type RefObject } from "react";

/**
 * Locks the editor document so scrolling stays inside Polaris `Scrollable` panels.
 * Replaces a global stylesheet — max-modal iframes need explicit html/body sizing.
 */
export function useEditorViewportLock(): void {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlHeight: html.style.height,
      bodyHeight: body.style.height,
      bodyMargin: body.style.margin,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.height = "100%";
    body.style.margin = "0";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.height = prev.htmlHeight;
      body.style.height = prev.bodyHeight;
      body.style.margin = prev.bodyMargin;
    };
  }, []);
}

/**
 * Sets an explicit pixel height on the editor shell so `%` / `minHeight="100%"`
 * on Polaris `Box` children resolve inside the App Bridge max modal.
 */
export function useFillRemainingViewportHeight(
  targetRef: RefObject<HTMLElement | null>,
): void {
  useLayoutEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return;
    }

    const apply = () => {
      const top = target.getBoundingClientRect().top;
      const height = Math.max(0, Math.floor(window.innerHeight - top));
      target.style.height = `${height}px`;
      target.style.minHeight = "0";
      target.style.overflow = "hidden";
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(document.documentElement);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      target.style.removeProperty("height");
      target.style.removeProperty("min-height");
      target.style.removeProperty("overflow");
    };
  }, [targetRef]);
}

/**
 * While reordering questions, show a grabbing cursor on the whole document.
 * Polaris has no drag-session API; this replaces a global CSS class.
 */
export function useQuestionDragCursor(active: boolean): void {
  useEffect(() => {
    if (!active) {
      return;
    }

    const body = document.body;
    const prevCursor = body.style.cursor;
    const prevUserSelect = body.style.userSelect;
    body.style.cursor = "grabbing";
    document.documentElement.style.cursor = "grabbing";
    body.style.userSelect = "none";

    return () => {
      body.style.cursor = prevCursor;
      body.style.userSelect = prevUserSelect;
      document.documentElement.style.cursor = "";
    };
  }, [active]);
}
