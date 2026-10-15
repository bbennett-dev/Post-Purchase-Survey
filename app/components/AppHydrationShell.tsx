import { AppRouteSkeleton } from "./app-skeletons";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";

const POLARIS_REACT_STYLESHEET = "/polaris-react.css";

/**
 * Embedded apps SSR full Polaris markup, then React hydrates. If stylesheet URLs
 * shift during that window, merchants see a brief unstyled flash. This shell keeps
 * SSR and the first client render identical (route-matched skeleton), then reveals
 * real routes after hydration.
 */
export function AppHydrationShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reveal = () => {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => setReady(true));
        return;
      }
      setReady(true);
    };

    const polarisLink = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    ).find((link) => link.href.endsWith(POLARIS_REACT_STYLESHEET));

    if (!polarisLink) {
      reveal();
      return;
    }

    if (polarisLink.sheet) {
      reveal();
      return;
    }

    polarisLink.addEventListener("load", reveal, { once: true });
    polarisLink.addEventListener("error", reveal, { once: true });
    return () => {
      polarisLink.removeEventListener("load", reveal);
      polarisLink.removeEventListener("error", reveal);
    };
  }, []);

  if (!ready) {
    return <AppRouteSkeleton pathname={pathname} />;
  }

  return children;
}
