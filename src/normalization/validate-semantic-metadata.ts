import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { loadMetadataManifest, validateMetadataManifest } from "./merge-metadata.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const canonicalFile = path.resolve(rootDir, "canonical/tokens.json");
const metadataDir = path.resolve(rootDir, "metadata");

async function main() {
  const strict = process.argv.includes("--strict");

  if (!fs.existsSync(canonicalFile)) {
    throw new Error(
      `canonical/tokens.json not found at ${canonicalFile}. Run pnpm tokens:normalize first.`,
    );
  }

  const loaded = loadMetadataManifest(metadataDir);
  if (!loaded) {
    console.log(
      "⊘ metadata/tokens.{json,yaml,yml} not found. Skipping semantic metadata validation.",
    );
    return;
  }

  const canonical = JSON.parse(fs.readFileSync(canonicalFile, "utf-8")) as Record<string, unknown>;
  const issues = validateMetadataManifest(canonical, loaded.manifest);
  const warnings = issues.filter((issue) => issue.severity === "warn");
  const errors = issues.filter((issue) => issue.severity === "error");

  warnings.forEach((issue) => {
    console.warn(`⊘ ${issue.code}: ${issue.message}`);
  });

  if (errors.length > 0) {
    errors.forEach((issue) => {
      console.error(`✗ ${issue.code}: ${issue.message}`);
    });
    process.exit(1);
  }

  if (strict && warnings.length > 0) {
    console.error(
      `✗ Semantic metadata validation failed in strict mode (${warnings.length} warning(s) elevated to failure).`,
    );
    process.exit(1);
  }

  console.log(`✓ Semantic metadata validation passed for ${path.basename(loaded.filePath)}.`);
}

main().catch((error) => {
  console.error("Semantic metadata validation failed:", error);
  process.exit(1);
});
