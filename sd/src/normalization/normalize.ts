/**
 * normalize.ts
 *
 * Reads every *.json file from the root tokens/ directory, strips Figma-specific
 * metadata ($extensions, $description), fixes alias cross-references so they
 * resolve within the canonical tree, and writes the merged result to
 * sd/tokens/canonical.json.
 *
 * File naming convention produced by the Figma sync:
 *   {collection}.{mode}.json   e.g. options.color.light.json
 *                                   alias.color.light.json
 *                                   spacing.default.json
 *
 * All top-level keys from every file are merged into canonical.json.
 * Alias $values that reference other tokens without a leading namespace are
 * automatically prefixed with "color." so they resolve correctly (e.g.
 * "{neutral-palette.warm-grey.100}" → "{color.neutral-palette.warm-grey.100}").
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensDir = path.resolve(__dirname, "../../../tokens");
const outFile = path.resolve(__dirname, "../../tokens/canonical.json");

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TokenNode = { [key: string]: TokenNode } | { $value: string | number | boolean; $type: string };

/** Return true if the node is a leaf token (has $value + $type). */
function isLeaf(node: unknown): node is { $value: string | number | boolean; $type: string; [k: string]: unknown } {
  return typeof node === "object" && node !== null && "$value" in node;
}

/**
 * Recursively strip $extensions, $description and any other Figma-only fields,
 * keeping only $value and $type on leaf nodes.
 *
 * Alias $values that reference a bare collection key (e.g. "{neutral-palette.foo.bar}")
 * are rewritten to include the parent section they live under in the canonical tree
 * (e.g. "{color.neutral-palette.foo.bar}"). The mapping from collection key → section
 * is built during the first pass over all token files.
 */
function clean(
  node: Record<string, unknown>,
  // Maps a bare collection root (e.g. "neutral-palette") to the section it
  // belongs to in the canonical tree (e.g. "color").
  collectionToSection: Map<string, string>,
): TokenNode {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(node)) {
    // Strip Figma-specific metadata fields
    if (key === "$extensions" || key === "$description") continue;

    if (isLeaf(value)) {
      let $value = String(value.$value);

      // Rewrite bare alias references so they resolve inside the canonical tree.
      // e.g. "{neutral-palette.warm-grey.100}" → "{color.neutral-palette.warm-grey.100}"
      //      "{spacing.sm}"                    → "{spacing.sm}"  (already a root key, no change)
      if ($value.startsWith("{") && $value.endsWith("}")) {
        const inner = $value.slice(1, -1);
        const firstSegment = inner.split(".")[0];
        const section = collectionToSection.get(firstSegment);
        // Only prefix when the collection lives *under* a section (not when it
        // is itself a top-level section key in the canonical tree).
        if (section && section !== firstSegment) {
          $value = `{${section}.${inner}}`;
        }
      }

      out[key] = { $value, $type: value.$type };
    } else if (typeof value === "object" && value !== null) {
      out[key] = clean(value as Record<string, unknown>, collectionToSection);
    }
  }

  return out as TokenNode;
}

/** Deep-merge src into dest (dest is mutated). Later files win on conflicts. */
function deepMerge(dest: Record<string, unknown>, src: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(src)) {
    if (
      typeof value === "object" &&
      value !== null &&
      !isLeaf(value) &&
      typeof dest[key] === "object" &&
      dest[key] !== null &&
      !isLeaf(dest[key])
    ) {
      deepMerge(dest[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      dest[key] = value;
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

try {
  const files = fs.readdirSync(tokensDir).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    throw new Error(`No JSON files found in ${tokensDir}. Run the Figma sync first.`);
  }

  const parsed: Array<{ file: string; data: Record<string, unknown> }> = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(tokensDir, file), "utf-8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    parsed.push({ file, data });
  }

  // First pass: determine the canonical section each collection root belongs to.
  //
  // A file like alias.color.light.json has structure:
  //   { "color": { "surface": { ... }, "text": { ... } } }
  // → section "color", collection keys are "surface", "text" (nested under color)
  //
  // A file like options.color.light.json has structure:
  //   { "neutral-palette": { ... }, "brand-palette": { ... } }
  // → bare collection keys; the second segment of the filename ("color") names
  //   the section they belong to.
  //
  // A future spacing.default.json would have:
  //   { "spacing": { "sm": { ... } } }  OR  { "sm": { ... }, "md": { ... } }
  // → section "spacing"
  //
  // Strategy: derive the section from the filename's middle segment
  // (e.g. "options.COLOR.light.json" → "color", "spacing.DEFAULT.json" → "default"
  // is not ideal, so we fall back to using the top-level key itself when it is
  // already a section name, otherwise we use the filename-derived section).
  //
  // Simpler and more robust: the section is always the middle part of the filename.
  // Collection roots that are NOT themselves top-level sections in the merged output
  // need to be mapped to the correct section for alias resolution.

  // Build: collectionRoot → canonicalSection
  // e.g. "neutral-palette" → "color", "brand-palette" → "color", "color" → "color"
  //      "spacing" → "spacing", "typography" → "typography"
  const collectionToSection = new Map<string, string>();

  for (const { file, data } of parsed) {
    // Derive section from filename: {collection}.{section}.{mode}.json
    // or fall back to the first top-level key if the filename doesn't match the pattern.
    const parts = file.replace(/\.json$/, "").split(".");
    const sectionFromFilename = parts.length >= 2 ? parts[1] : parts[0];

    for (const topKey of Object.keys(data)) {
      const value = data[topKey];
      // If the top-level key itself is a group of tokens (not a leaf), check if
      // its children are also groups — meaning topKey is a section wrapper (like "color")
      // or a bare collection (like "neutral-palette").
      if (typeof value === "object" && value !== null) {
        // If topKey matches the section derived from the filename, treat it as a
        // section wrapper and map its children to that section.
        if (topKey === sectionFromFilename) {
          collectionToSection.set(topKey, topKey);
          // Map nested collection keys under this section
          for (const childKey of Object.keys(value as object)) {
            collectionToSection.set(childKey, topKey);
          }
        } else {
          // Bare collection key — belongs to the section from the filename
          collectionToSection.set(topKey, sectionFromFilename);
        }
      }
    }
  }

  // Second pass: clean and deep-merge all files into a single canonical object.
  const canonical: Record<string, unknown> = {};

  for (const { file, data } of parsed) {
    const cleaned = clean(data, collectionToSection);
    console.log(`  ✓ ${file} (${Object.keys(data).join(", ")})`);
    deepMerge(canonical, cleaned as Record<string, unknown>);
  }

  // Ensure the output directory exists
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(canonical, null, 2), "utf-8");

  console.log(`\nSuccessfully created: ${outFile}`);
  console.log(`  ${files.length} file(s) merged, ${Object.keys(canonical).length} top-level section(s): ${Object.keys(canonical).join(", ")}`);
} catch (error) {
  console.error("Error creating canonical.json:", error);
  process.exit(1);
}
