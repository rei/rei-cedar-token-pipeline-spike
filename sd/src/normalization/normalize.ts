/**
 * normalize.ts
 *
 * Reads every *.json file from tokens/, normalizes them into a canonical tree,
 * and writes the result to sd/tokens/canonical.json.
 *
 * Normalization pipeline:
 *   1. Parse all JSON files from the tokens/ directory
 *   2. Analyze filenames to build a collectionToSection map
 *      (e.g. "neutral-palette" → "color")
 *   3. For each file:
 *      a. clean()           → strip Figma metadata, rewrite bare alias references
 *      b. nestUnderSections → rearrange so all keys nest under section keys
 *      c. deepMerge         → accumulate into the canonical tree
 *   4. Write canonical.json with section-nested structure
 *
 * Input file naming convention (from Figma sync):
 *   {collection}.{section}.{mode}.json
 *   Examples:
 *   - options.color.light.json   → bare color collections (neutral-palette, brand-palette)
 *   - alias.color.light.json     → semantic color tokens (text, surface, border)
 *   - spacing.default.json       → spacing dimensions
 *   - typography.font.regular.json → typography tokens
 *
 * Output canonical.json structure:
 *   {
 *     "color": {
 *       "neutral-palette": { ... },    ← from options.color.light.json
 *       "brand-palette": { ... },      ← from options.color.light.json
 *       "text": { ... },               ← from alias.color.light.json
 *       "surface": { ... },            ← from alias.color.light.json
 *       "border": { ... }              ← from alias.color.light.json
 *     },
 *     "spacing": { ... },              ← from spacing.default.json
 *     ...
 *   }
 *
 * All alias references are rewritten to point into this nested structure:
 *   "{neutral-palette.blue.600}" → "{color.neutral-palette.blue.600}"
 *   "{spacing.sm}" → "{spacing.sm}" (no change, already at section level)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
  buildCollectionToSection,
  clean,
  nestUnderSections,
  deepMerge,
  buildSpacingClampData,
} from "./normalize-utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensDir = path.resolve(__dirname, "../../../tokens");
console.log(tokensDir);
const outFile = path.resolve(__dirname, "../../tokens/canonical.json");

try {
  const allFiles = fs.readdirSync(tokensDir).filter((f) => f.endsWith(".json"));
  const files = allFiles.filter((f) => !f.includes("spacing"));
  const spacingFiles = allFiles.filter((f) => f.includes("spacing"));
  const spacingAliasFiles = spacingFiles.filter((f) => f.includes("alias"));
  const spacingBreakpointFiles = spacingFiles.filter((f) =>
    /spacing\.\d+\.json$/.test(f)
  );

  if (allFiles.length === 0) {
    throw new Error(
      `No JSON files found in ${tokensDir}. Run the Figma sync first.`
    );
  }

  // Parse all token files
  const parsed = files.map((file) => ({
    file,
    data: JSON.parse(
      fs.readFileSync(path.join(tokensDir, file), "utf-8")
    ) as Record<string, unknown>,
  }));

  const spacingParsed = spacingBreakpointFiles.map((file) => ({
    file,
    data: JSON.parse(
      fs.readFileSync(path.join(tokensDir, file), "utf-8")
    ) as Record<string, unknown>,
  }));
  const spacingClampMap = buildSpacingClampData(spacingParsed);

  const spacingClampTree: Record<string, unknown> = { spacing: { scale: {} } };
  const scaleNode = (spacingClampTree.spacing as Record<string, unknown>)
    .scale as Record<string, unknown>;

  for (const [key, { min, max, ideal }] of spacingClampMap) {
    scaleNode[key] = {
      $type: "dimension",
      $value: {
        min: `${min}px`,
        ideal,
        max: `${max}px`,
      },
      $description: "Fluid spacing scale token",
      $extensions: {
        cedar: {
          source: "figma",
          figmaCollection: "spacing/scale",
        },
      },
    };
  }

  console.log(buildSpacingClampData(spacingParsed));
  // Build collection → section mapping by analyzing filenames and file content
  const collectionToSection = buildCollectionToSection(parsed);

  // Normalize and merge each file into the canonical tree
  const canonical: Record<string, unknown> = {};

  // Process spacing alias files normally (clean + nest + merge)
  for (const { file, data } of spacingAliasFiles.map((file) => ({
    file,
    data: JSON.parse(
      fs.readFileSync(path.join(tokensDir, file), "utf-8")
    ) as Record<string, unknown>,
  }))) {
    const cleaned = clean(data, collectionToSection);
    const nested = nestUnderSections(
      cleaned as Record<string, unknown>,
      collectionToSection
    );
    console.log(`  ✓ ${file} (alias)`);
    deepMerge(canonical, nested);
  }

  for (const { file, data } of parsed) {
    // Step 1: Clean metadata and fix alias references
    const cleaned = clean(data, collectionToSection);

    // Step 2: Nest all collections under their section keys
    const nested = nestUnderSections(
      cleaned as Record<string, unknown>,
      collectionToSection
    );

    // Step 3: Merge into the growing canonical tree
    console.log(`  ✓ ${file} (${Object.keys(data).join(", ")})`);
    deepMerge(canonical, nested);
    deepMerge(canonical, spacingClampTree);
  }

  // Write the canonical tree to disk
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(canonical, null, 2), "utf-8");

  console.log(`\nSuccessfully created: ${outFile}`);
  console.log(
    `  ${files.length} file(s) merged, ${Object.keys(canonical).length} top-level section(s): ${Object.keys(canonical).join(", ")}`
  );
} catch (error) {
  console.error("Error creating canonical.json:", error);
  process.exit(1);
}
