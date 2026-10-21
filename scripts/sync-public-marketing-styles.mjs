/**
 * Copy marketing/legal CSS to /public so root `links()` can use stable URLs.
 * Vite `?url` hashes in root.tsx caused SSR/client <head> hydration mismatches in dev.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targetDir = join(root, "public/styles");

const files = ["app-home.css", "privacy-legal.css"];

mkdirSync(targetDir, { recursive: true });

for (const file of files) {
  copyFileSync(join(root, "app/styles", file), join(targetDir, file));
}
