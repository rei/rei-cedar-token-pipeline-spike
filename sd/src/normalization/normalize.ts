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
 *   4. For options.color files (web/ios): merge them with platform-specific values
 *   5. Write canonical.json with section-nested structure
 *
 * Input file naming convention (from Figma sync):
 *   {collection}.{section}.{mode}.json
 *   Examples:
 *   - options.color.light.json   → bare color collections (neutral-palette, brand-palette)
 *   - options.color.ios.json     → iOS-specific color collections
 *   - options.color.web.json     → Web-specific color collections
 *   - alias.color.light.json     → semantic color tokens (text, surface, border)
 *   - spacing.default.json       → spacing dimensions
 *   - typography.font.regular.json → typography tokens
 *
 * Output canonical.json structure:
 *   {
 *     "color": {
 *       "neutral-palette": { ... },    ← from options.color files (merged iOS+web)
 *       "brand-palette": { ... },      ← from options.color files (merged iOS+web)
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
import { buildCollectionToSection, clean, nestUnderSections, deepMerge, joinPlatformTokens } from "./normalize-utils.js";
import type { TokenNode } from "./normalize-utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensDir = path.resolve(__dirname, "../../../tokens");
const outFile = path.resolve(__dirname, "../../tokens/canonical.json");

try {
  const files = fs.readdirSync(tokensDir).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    throw new Error(`No JSON files found in ${tokensDir}. Run the Figma sync first.`);
  }

  // Parse all token files
  const parsed = files.map((file) => ({
    file,
    data: JSON.parse(fs.readFileSync(path.join(tokensDir, file), "utf-8")) as Record<string, unknown>,
  }));

  // Separate platform-specific options files from other files
  const optionsWebFile = parsed.find(p => p.file === "options.color.web.json");
  const optionsIosFile = parsed.find(p => p.file === "options.color.ios.json");
  const otherFiles = parsed.filter(p => 
    p.file !== "options.color.web.json" && 
    p.file !== "options.color.ios.json"
  );

  // Build collection → section mapping by analyzing filenames and file content
  const collectionToSection = buildCollectionToSection(parsed);

  // Normalize and merge each file into the canonical tree
  const canonical: Record<string, unknown> = {};

  // Handle platform-specific options files if both exist
  if (optionsWebFile && optionsIosFile) {
    const cleanedWeb = clean(optionsWebFile.data, collectionToSection);
    const cleanedIos = clean(optionsIosFile.data, collectionToSection);
    
    // Join the web and iOS tokens
    const joinedTokens = joinPlatformTokens(cleanedWeb, cleanedIos);
    
    // Nest under sections
    const nested = nestUnderSections(joinedTokens as Record<string, unknown>, collectionToSection);
    
    console.log(`  ✓ ${optionsWebFile.file} + ${optionsIosFile.file} (platform-specific merge)`);
    deepMerge(canonical, nested);
  }

  // Process all other files
  for (const { file, data } of otherFiles) {
    // Step 1: Clean metadata and fix alias references
    const cleaned = clean(data, collectionToSection);
    
    // Step 2: Nest all collections under their section keys
    const nested = nestUnderSections(cleaned as Record<string, unknown>, collectionToSection);
    
    // Step 3: Merge into the growing canonical tree
    console.log(`  ✓ ${file} (${Object.keys(data).join(", ")})`);
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
