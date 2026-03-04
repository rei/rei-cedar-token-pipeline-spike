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

type TokenNode = { [key: string]: TokenNode } | { $value: string; $type: string };

/** Return true if the node is a leaf token (has $value + $type). */
function isLeaf(node: unknown): node is { $value: string; $type: string; [k: string]: unknown } {
  return typeof node === "object" && node !== null && "$value" in node;
}

/**
 * Recursively strip $extensions, $description and any other Figma-only fields,
 * keeping only $value and $type on leaf nodes.
 *
 * Alias $values like "{neutral-palette.foo.bar}" are rewritten to
 * "{color.neutral-palette.foo.bar}" so they resolve inside the canonical tree
 * where all tokens live under a "color" root (unless they already start with
 * a known top-level key — we'll prefix all bare aliases with "color.").
 */
function clean(node: Record<string, unknown>, knownRoots: Set<string>): TokenNode {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(node)) {
    // Skip Figma metadata fields
    if (key === "$extensions" || key === "$description") continue;

    if (isLeaf(value)) {
      let $value = String(value.$value);

      // Fix alias references: "{foo.bar}" → "{color.foo.bar}" when "foo" is a
      // known top-level collection key that sits under "color" in the canonical tree.
      if ($value.startsWith("{") && $value.endsWith("}")) {
        const inner = $value.slice(1, -1);
        const firstSegment = inner.split(".")[0];
        if (knownRoots.has(firstSegment)) {
          $value = `{color.${inner}}`;
        }
      }

      out[key] = { $value, $type: value.$type };
    } else if (typeof value === "object" && value !== null) {
      out[key] = clean(value as Record<string, unknown>, knownRoots);
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

  // First pass: collect every top-level key across all files so we can fix
  // alias references that point to sibling collections.
  const knownRoots = new Set<string>();
  const parsed: Array<{ file: string; data: Record<string, unknown> }> = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(tokensDir, file), "utf-8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    for (const key of Object.keys(data)) {
      knownRoots.add(key);
    }
    parsed.push({ file, data });
  }

  // Second pass: clean and deep-merge all files into a single canonical object.
  const canonical: Record<string, unknown> = {};

  for (const { file, data } of parsed) {
    const cleaned = clean(data, knownRoots);
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
