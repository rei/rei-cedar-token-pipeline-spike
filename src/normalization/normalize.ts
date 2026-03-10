/**
 * normalize.ts
 *
 * Reads every *.json file from tokens/, normalizes them into a canonical tree,
 * and writes the result to tokens/canonical.json.
 *
 * Normalization pipeline:
 *   1. Parse all JSON files from the tokens/ directory
 *   2. Analyze filenames to build a collectionToSection map
 *      (e.g. "neutral-palette" → "color")
 *   3. For each file:
 *      a. clean()           → strip Figma metadata, rewrite bare alias references
 *      b. nestUnderSections → rearrange so all keys nest under section keys
 *         - For alias.color.<mode>.json files, semantic tokens are nested under
 *           color.modes.<mode> to preserve per-mode values
 *      c. deepMerge         → accumulate into the canonical tree
 *   4. Write canonical.json with section-nested structure
 *
 * Input file naming convention (from Figma sync):
 *   {collection}.{section}.{mode}.json
 *   Examples:
 *   - options.color.light.json   → bare color collections (neutral-palette, brand-palette)
 *   - alias.color.default.json   → semantic color tokens for "default" mode
 *   - alias.color.light.json     → semantic color tokens for "light" mode
 *   - alias.color.sale.json      → semantic color tokens for "sale" mode
 *   - spacing.default.json       → spacing dimensions
 *   - typography.font.regular.json → typography tokens
 *
 * Output canonical.json structure:
 *   {
 *     "color": {
 *       "modes": {
 *         "default": {                 ← from alias.color.default.json
 *           "text": { ... },
 *           "surface": { ... },
 *           "border": { ... }
 *         },
 *         "light": {                   ← from alias.color.light.json
 *           "text": { ... },
 *           "surface": { ... },
 *           "border": { ... }
 *         },
 *         "sale": {                    ← from alias.color.sale.json
 *           "text": { ... },
 *           "surface": { ... },
 *           "border": { ... }
 *         }
 *       },
 *       "neutral-palette": { ... },    ← from options.color.light.json
 *       "brand-palette": { ... }       ← from options.color.light.json
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
  extractColorMode,
  extractPrimitiveMode,
  buildSpacingClamp,
} from "./normalize-utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensDir = path.resolve(__dirname, "../../tokens");
const outFile = path.resolve(__dirname, "../../tokens/canonical.json");

try {
  const files = fs.readdirSync(tokensDir).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    throw new Error(`No JSON files found in ${tokensDir}. Run the Figma sync first.`);
  }

  // Parse all token files
  const parsed = files.map((file) => ({
    file,
    data: JSON.parse(fs.readFileSync(path.join(tokensDir, file), "utf-8")) as Record<
      string,
      unknown
    >,
  }));

  // ── Fluid spacing pre-processing ──────────────────────────────────────────
  // Files matching spacing.<number>.json are per-viewport-width breakpoints.
  // We merge them all into a single fluid canonical form using CSS clamp().
  // These files are then excluded from the main normalization loop below.
  const SPACING_BP_RE = /^spacing\.(\d+)\.json$/;
  const spacingBpFiles = parsed.filter(({ file }) => SPACING_BP_RE.test(file));
  const nonSpacingBpFiles = parsed.filter(({ file }) => !SPACING_BP_RE.test(file));

  // Normalize and merge each file into the canonical tree
  const canonical: Record<string, unknown> = {};

  if (spacingBpFiles.length > 0) {
    const parsedBps = spacingBpFiles.map(({ file, data }) => ({
      breakpoint: parseInt(SPACING_BP_RE.exec(file)![1], 10),
      data,
    }));
    const fluidSpacing = buildSpacingClamp(parsedBps);
    deepMerge(canonical, fluidSpacing);
    const bpList = parsedBps
      .map((p) => p.breakpoint)
      .sort((a, b) => a - b)
      .join(", ");
    console.log(
      `  ✓ spacing.[${bpList}].json → fluid clamp() values (${spacingBpFiles.length} breakpoints)`,
    );
  }

  // Build collection → section mapping by analyzing filenames and file content
  const collectionToSection = buildCollectionToSection(nonSpacingBpFiles);

  // Normalize and merge each file into the canonical tree
  for (const { file, data } of nonSpacingBpFiles) {
    // Step 1: Clean metadata and fix alias references
    const cleaned = clean(data, collectionToSection);

    // Step 2: Nest all collections under their section keys.
    // For alias.color.<mode>.json files, semantic tokens are nested under
    // color.modes.<mode> so multiple modes coexist without overwriting each other.
    // For options.color.<mode>.json files, primitive palettes are nested under
    // color.primitives.<mode> so all platform variants coexist.
    const colorMode = extractColorMode(file);
    const primitiveMode = extractPrimitiveMode(file);
    const nested = nestUnderSections(
      cleaned as Record<string, unknown>,
      collectionToSection,
      colorMode,
      primitiveMode,
    );

    // Step 3: Merge into the growing canonical tree
    const modeLabel = colorMode
      ? ` [mode: ${colorMode}]`
      : primitiveMode
        ? ` [primitives: ${primitiveMode}]`
        : "";
    console.log(`  ✓ ${file}${modeLabel} (${Object.keys(data).join(", ")})`);
    deepMerge(canonical, nested);
  }

  // Write the canonical tree to disk
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(canonical, null, 2), "utf-8");

  console.log(`\nSuccessfully created: ${outFile}`);
  console.log(
    `  ${files.length} file(s) merged, ${Object.keys(canonical).length} top-level section(s): ${Object.keys(canonical).join(", ")}`,
  );
} catch (error) {
  console.error("Error creating canonical.json:", error);
  process.exit(1);
}
