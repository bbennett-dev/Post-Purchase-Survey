import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  /**
   * Default is `lazy`, which loads route modules after first paint and can
   * suspend during hydrateRoot (pingSuspendedRoot) → head/body mismatch + flash.
   * `initial` ships modules needed for the first URL with the document.
   */
  routeDiscovery: { mode: "initial" },
  presets: [vercelPreset()],
} satisfies Config;
