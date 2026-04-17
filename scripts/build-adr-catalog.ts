import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAdrCatalog } from "../src/architecture/adr-catalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "architecture", "adr-catalog.json");

function main() {
  const catalog = buildAdrCatalog(rootDir);
  fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  console.log(
    `Generated architecture/adr-catalog.json with ${catalog.entries.length} ADR entr${catalog.entries.length === 1 ? "y" : "ies"}.`,
  );
}

main();
