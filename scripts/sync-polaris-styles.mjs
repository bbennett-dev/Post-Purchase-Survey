import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(
  root,
  "node_modules/@shopify/polaris/build/esm/styles.css",
);
const targetDir = join(root, "public");
const target = join(targetDir, "polaris-react.css");

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
