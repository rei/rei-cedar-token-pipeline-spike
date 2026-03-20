/**
 * normalize.ts
 *
 * Reads every *.json file from tokens/, normalizes them into a canonical tree,
 * and writes the result to canonical/tokens.json.
 *
 * Normalization pipeline:
 *   1. Load schema with Figma Input Contract (ADR-0003, src/schema/token-schema.json)
 *   2. Parse all JSON files from tokens/
 *   3. Fluid spacing: build clamp() values from per-breakpoint files
 *   4. Option color files (options.color.*.json):
 *      a. applyTokenMapping → translate Figma collection paths to color.option.*
 *         (throws on any unmapped path — designer rename guard)
 *      b. Build platformLookup table: "web-light" → { "color.option.*": "#hex" }
 *      c. Build color.option tree from web-light (canonical $value source)
 *      d. mergeColorVariants writes appearance values + platform overrides
 *         onto option tokens; writes per-platform references and resolved values
 *         into alias $extensions.cedar
 *      color.primitives is NOT written to canonical/tokens.json
 *   5. Alias and other files:
 *      a. clean()           → strip Figma metadata; rewrite alias refs to color.option.*
 *      b. nestUnderSections → nest under section keys; color.modes.<palette>
 *      c. deepMerge         → accumulate into canonical tree
 *   6. mergeColorVariants → write option references into alias $extensions.cedar;
 *      write resolved platform values onto aliases; write appearance values +
 *      platformOverrides onto option tokens; stamp $meta
 *   7. Write canonical/tokens.json
 *
 * Input file naming convention (from Figma sync):
 *   {collection}.{section}.{mode}.json
 *   Examples:
 *   - options.color.ios-light.json  → bare color collections (neutral-palette, brand-palette)
 *   - alias.color.default.json      → semantic color tokens for "default" palette
 *   - alias.color.sale.json         → semantic color tokens for "sale" palette
 *   - spacing.default.json          → spacing dimensions
 *
 * Output canonical/tokens.json structure:
 *   {
 *     "color": {
 *       "modes": {
 *         "default": { "$meta": { ... }, "surface": { ... }, ... },
 *         "sale":    { "$meta": { ... }, "surface": { ... }, ... }
 *       },
 *       "option": {
 *         "neutral": { "warm": { "grey": { "900": { ... } } }, "white": { ... } },
 *         "brand":   { "blue": { "400": { ... } }, "red": { "400": { ... } } }
 *       }
 *     },
 *     "spacing": { ... }
 *   }
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
  applyTokenMapping,
  buildOptionTree,
  type TokenMapping,
} from "./normalize-utils.js";
import { mergeColorVariants } from "./color-variants.js";
import { reportValidationIssues, validateFigmaInputs } from "./normalize-validation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensDir = path.resolve(__dirname, "../../tokens");
const outFile = path.resolve(__dirname, "../../canonical/tokens.json");
const schemaFile = path.resolve(__dirname, "../../src/schema/token-schema.json");

// ─── main ─────────────────────────────────────────────────────────────────────

try {
  // ── Load schema with Figma Input Contract (ADR-0003) ────────────────────────
  if (!fs.existsSync(schemaFile)) {
    throw new Error(
      `Token schema not found at ${schemaFile}. ` +
        `This file is required — see ADR-0003 (Figma Input Contract).`,
    );
  }
  const schema = JSON.parse(fs.readFileSync(schemaFile, "utf-8"));
  const tokenMapping: TokenMapping = schema.inputs.figma;

  // ── Read all token files ─────────────────────────────────────────────────────
  const files = fs
    .readdirSync(tokensDir)
    .filter((f) => f.endsWith(".json") && f !== "canonical.json");

  if (files.length === 0) {
    throw new Error(`No JSON files found in ${tokensDir}. Run the Figma sync first.`);
  }

  const parsed = files.map((file) => ({
    file,
    data: JSON.parse(fs.readFileSync(path.join(tokensDir, file), "utf-8")) as Record<
      string,
      unknown
    >,
  }));

  // ── Partition files by type ─────────────────────────────────────────────────
  const SPACING_BP_RE = /^spacing\.(\d+)\.json$/;
  const spacingBpFiles = parsed.filter(({ file }) => SPACING_BP_RE.test(file));
  const optionColorFiles = parsed.filter(({ file }) => extractPrimitiveMode(file) !== null);
  const otherFiles = parsed.filter(
    ({ file }) => !SPACING_BP_RE.test(file) && extractPrimitiveMode(file) === null,
  );

  const validationIssues = validateFigmaInputs({
    parsedFiles: parsed,
    optionColorFiles,
    otherFiles,
    tokenMapping,
  });
  reportValidationIssues(validationIssues);

  const canonical: Record<string, unknown> = {};

  // ── 1. Fluid spacing ────────────────────────────────────────────────────────
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

  // ── 2. Option color files → color.option + platform lookup table ────────────
  //
  // Each options.color.*.json file is a platform×appearance snapshot of the
  // primitive palette. We use applyTokenMapping to:
  //   a. Translate every Figma token path to its canonical color.option.* path
  //   b. Fail loudly if any Figma path has no mapping entry (designer rename guard)
  //
  // All four platform files (web-light, web-dark, ios-light, ios-dark) produce
  // the same canonical paths — only the $value hex differs. We use web-light
  // as the authoritative source for $value in color.option (the canonical fallback
  // per ADR-0001). The other three files contribute only to the platformLookup
  // table, which mergeColorVariants uses to build $resolved on alias tokens.
  //
  // color.primitives is NOT written to canonical/tokens.json — it was a spike artifact.
  // The four platform files are normalization input only.

  // platformLookup: "web-light" → { "color.option.neutral.warm.grey.900": "#hex", ... }
  const platformLookup = new Map<string, Record<string, string>>();

  for (const { file, data } of optionColorFiles) {
    const primitiveMode = extractPrimitiveMode(file)!;
    const lookup: Record<string, string> = {};

    for (const [collectionName, collectionData] of Object.entries(data)) {
      const entry = tokenMapping.collections[collectionName];
      if (!entry) {
        throw new Error(
          `[normalize] Figma collection "${collectionName}" (from ${file}) has no entry ` +
            `in src/schema/token-schema.json (inputs.figma.collections). ` +
            `Add an "inputs.figma.collections.${collectionName}" entry.`,
        );
      }

      const mapped = applyTokenMapping(
        collectionName,
        collectionData as Record<string, unknown>,
        entry,
        primitiveMode,
      );

      for (const { canonicalPath, token } of mapped) {
        lookup[canonicalPath] = token.$value;
      }
    }

    platformLookup.set(primitiveMode, lookup);
    console.log(`  ✓ ${file} [primitives: ${primitiveMode}] (${Object.keys(data).join(", ")})`);
  }

  // Build color.option tree from the web-light snapshot (canonical $value source)
  const webLightLookup = platformLookup.get("web-light");
  if (webLightLookup) {
    const optionEntries = Object.entries(webLightLookup).map(([canonicalPath, $value]) => ({
      canonicalPath,
      // $type is color for all option tokens in the current mapping
      token: { $type: "color", $value },
    }));
    const optionTree = buildOptionTree(optionEntries);
    deepMerge(canonical, optionTree);
  }

  // ── 3. Alias and other files ────────────────────────────────────────────────
  const collectionToSection = buildCollectionToSection(otherFiles);

  for (const { file, data } of otherFiles) {
    const cleaned = clean(data, collectionToSection, tokenMapping);
    const colorMode = extractColorMode(file);

    const nested = nestUnderSections(
      cleaned as Record<string, unknown>,
      collectionToSection,
      colorMode,
    );

    const modeLabel = colorMode ? ` [mode: ${colorMode}]` : "";
    console.log(`  ✓ ${file}${modeLabel} (${Object.keys(data).join(", ")})`);

    deepMerge(canonical, nested);
  }

  // ── 4. Attach $resolved and $meta to all alias color tokens ─────────────────
  mergeColorVariants(canonical, platformLookup);

  // ── 5. Write canonical/tokens.json ─────────────────────────────────────────────
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(canonical, null, 2), "utf-8");

  console.log(`\nSuccessfully created: ${outFile}`);
  console.log(
    `  ${files.length} file(s) merged, ${Object.keys(canonical).length} top-level section(s): ${Object.keys(canonical).join(", ")}`,
  );
} catch (error) {
  console.error("Error creating canonical/tokens.json:", error);
  process.exit(1);
}
