import { useLayoutEffect, type RefObject } from "react";

/**
 * App-window iframe: s-page does not pass a reliable flex height into its slot.
 * One measured height on the editor body; bottom inset is CSS padding on `.editorPage`.
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
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(document.documentElement);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      target.style.removeProperty("height");
    };
  }, [targetRef]);
}
