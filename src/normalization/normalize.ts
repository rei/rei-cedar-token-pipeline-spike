/**
 * normalize.ts
 *
 * Reads every *.json file from tokens/, normalizes them into a canonical tree,
 * and writes the result to tokens/canonical.json.
 *
 * Normalization pipeline:
 *   1. Load token-mapping.json (ADR-0003 Figma Input Contract)
 *   2. Parse all JSON files from tokens/
 *   3. Fluid spacing: build clamp() values from per-breakpoint files
 *   4. Option color files (options.color.*.json):
 *      a. applyTokenMapping → translate Figma collection paths to color.option.*
 *         (throws on any unmapped path — designer rename guard)
 *      b. Build platformLookup table: "web-light" → { "color.option.*": "#hex" }
 *      c. Build color.option tree from web-light (canonical $value source)
 *      d. mergeColorVariants writes appearance values + platform overrides
 *         onto option tokens; writes option references into alias $extensions.cedar
 *      color.primitives is NOT written to canonical.json
 *   5. Alias and other files:
 *      a. clean()           → strip Figma metadata; rewrite alias refs to color.option.*
 *      b. nestUnderSections → nest under section keys; color.modes.<palette>
 *      c. deepMerge         → accumulate into canonical tree
 *   6. mergeColorVariants → write option references into alias $extensions.cedar;
 *      write appearance values + platformOverrides onto option tokens; stamp $meta
 *   7. Write canonical.json
 *
 * Input file naming convention (from Figma sync):
 *   {collection}.{section}.{mode}.json
 *   Examples:
 *   - options.color.ios-light.json  → bare color collections (neutral-palette, brand-palette)
 *   - alias.color.default.json      → semantic color tokens for "default" palette
 *   - alias.color.sale.json         → semantic color tokens for "sale" palette
 *   - spacing.default.json          → spacing dimensions
 *
 * Output canonical.json structure:
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensDir = path.resolve(__dirname, "../../tokens");
const outFile = path.resolve(__dirname, "../../tokens/canonical.json");
const mappingFile = path.resolve(__dirname, "../../tokens/token-mapping.json");

// ─── walkSemanticTree ─────────────────────────────────────────────────────────

function walkSemanticTree(
  node: any,
  fn: (token: any, path: string[]) => void,
  currentPath: string[] = [],
) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (value && typeof value === "object" && "$value" in value) {
      fn(value, [...currentPath, key]);
    } else if (value && typeof value === "object") {
      walkSemanticTree(value, fn, [...currentPath, key]);
    }
  }
}

// ─── mergeColorVariants ───────────────────────────────────────────────────────

/**
 * Walk every alias color token in each palette mode and:
 *   1. Write platform option-token references into $extensions.cedar
 *   2. Stamp $meta onto each palette root
 *   3. Write appearance values and platform overrides onto option tokens
 *
 * After this runs, each alias token carries:
 *   $extensions.cedar: { ios: "{color.option.*}", web: "{color.option.*}" }
 *
 * The data confirms every alias maps to the same option path in both light and
 * dark appearances — only the hex at that path differs by appearance. So we
 * store one reference per platform (not one per appearance). The transform
 * resolves the reference at build time, reading appearance values and platform
 * overrides from the option token itself.
 *
 * Each option token receives appearance and override data:
 *   $value:                               web-light hex (canonical fallback)
 *   $extensions.cedar.appearances.dark:   web-dark hex
 *   $extensions.cedar.platformOverrides:  { ios: { light: "#hex", dark: "#hex" } }
 *     (only written when ios differs from web)
 */
function mergeColorVariants(
  canonical: Record<string, any>,
  platformLookup: Map<string, Record<string, string>>,
) {
  const color = canonical.color;
  if (!color || !color.modes) return;

  const modes = color.modes;

  const paletteMetadata: Record<
    string,
    {
      scope: "root" | "surface";
      isBaseline?: boolean;
      inheritsFrom?: string;
      cssAttribute?: string;
    }
  > = {
    default: { scope: "root", isBaseline: true },
    sale: { scope: "surface", inheritsFrom: "default", cssAttribute: "data-palette" },
  };

  // Helper: navigate to a node in the canonical tree by dot-path
  function getNodeAt(path: string): any {
    const segments = path.split(".");
    let cursor: any = canonical;
    for (const seg of segments) {
      cursor = cursor?.[seg];
      if (!cursor) return undefined;
    }
    return cursor;
  }

  // ── Step 1: Write appearance values + platform overrides onto option tokens ──
  // For each option token, compare values across all four platform-appearance files.
  // web-light $value is the canonical fallback (already set by buildOptionTree).
  // web-dark  → write into $extensions.cedar.appearances.dark
  // ios-light → write into $extensions.cedar.platformOverrides.ios.light (if differs from web-light)
  // ios-dark  → write into $extensions.cedar.platformOverrides.ios.dark  (if differs from web-dark)

  const webLight = platformLookup.get("web-light") ?? {};
  const webDark = platformLookup.get("web-dark") ?? {};
  const iosLight = platformLookup.get("ios-light") ?? {};
  const iosDark = platformLookup.get("ios-dark") ?? {};

  for (const canonicalPath of Object.keys(webLight)) {
    const optionNode = getNodeAt(canonicalPath);
    if (!optionNode) continue;

    // Dark appearance (web)
    const darkHex = webDark[canonicalPath];
    const hasDark = darkHex && darkHex !== webLight[canonicalPath];

    // iOS platform overrides (only when different from web)
    const iosLightHex = iosLight[canonicalPath];
    const iosDarkHex = iosDark[canonicalPath];
    const iosLightDiffers = iosLightHex && iosLightHex !== webLight[canonicalPath];
    const iosDarkDiffers =
      iosDarkHex && iosDarkHex !== (webDark[canonicalPath] ?? webLight[canonicalPath]);
    const hasIosOverrides = iosLightDiffers || iosDarkDiffers;

    // Only write $extensions.cedar if there is actually something to say.
    // Tokens identical across all platforms and appearances get no $extensions at all.
    if (hasDark || hasIosOverrides) {
      optionNode.$extensions = optionNode.$extensions ?? {};
      optionNode.$extensions.cedar = optionNode.$extensions.cedar ?? {};

      if (hasDark) {
        optionNode.$extensions.cedar.appearances = { dark: darkHex };
      }

      if (hasIosOverrides) {
        optionNode.$extensions.cedar.platformOverrides = {
          ios: {
            ...(iosLightDiffers ? { light: iosLightHex } : {}),
            ...(iosDarkDiffers ? { dark: iosDarkHex } : {}),
          },
        };
      }
    }
  }

  // ── Step 2: Walk alias tokens, write platform references + $meta ─────────────
  for (const [modeName, modeTree] of Object.entries(modes)) {
    const meta = paletteMetadata[modeName] ?? {
      scope: "surface" as const,
      inheritsFrom: "default",
      cssAttribute: "data-palette",
    };

    // $meta into $extensions.cedar — DTCG only preserves $extensions through SD
    (modeTree as any).$extensions = (modeTree as any).$extensions ?? {};
    (modeTree as any).$extensions.cedar = (modeTree as any).$extensions.cedar ?? {};
    (modeTree as any).$extensions.cedar.$meta = meta;

    walkSemanticTree(modeTree, (token) => {
      const aliasRef = token.$value;
      if (!aliasRef || typeof aliasRef !== "string" || !aliasRef.startsWith("{")) return;

      const canonicalPath = aliasRef.slice(1, -1);
      if (!canonicalPath.startsWith("color.option.")) return;

      // Build per-platform option token references.
      // We verified that every alias maps to the same option path in light and dark —
      // so one reference per platform is sufficient. The transform reads appearance
      // values from the option token's $extensions.cedar.appearances and platformOverrides.
      // Build per-platform, per-appearance option token path references.
      // Stored WITHOUT braces — SD resolves any {ref} syntax it finds in $extensions
      // eagerly (replacing our path string with a resolved hex value before the action
      // runs). Plain path strings are ignored by SD's resolver.
      //
      // Shape: { ios: { light: "color.option.*", dark: "color.option.*" },
      //          web: { light: "color.option.*", dark: "color.option.*" } }
      //
      // Currently every alias maps to the same option path in both appearances —
      // verified against all current tokens. The per-appearance structure is kept
      // so that future tokens where light and dark resolve to different option paths
      // work without a schema change.
      const platformRefs: Record<string, Record<string, string>> = {};

      for (const [platformKey, lookup] of platformLookup.entries()) {
        if (!(canonicalPath in lookup)) continue;

        const hyphenIdx = platformKey.indexOf("-");
        const platform = hyphenIdx !== -1 ? platformKey.slice(0, hyphenIdx) : platformKey;
        const appearance = hyphenIdx !== -1 ? platformKey.slice(hyphenIdx + 1) : "default";

        if (!platformRefs[platform]) platformRefs[platform] = {};
        platformRefs[platform][appearance] = canonicalPath;
      }

      if (Object.keys(platformRefs).length === 0) {
        console.warn(
          `[mergeColorVariants] No platform references found for "${canonicalPath}". ` +
            `Check token-mapping.json and options.color.*.json files.`,
        );
        return;
      }

      token.$extensions = token.$extensions ?? {};
      (token.$extensions as any).cedar = (token.$extensions as any).cedar ?? {};
      Object.assign((token.$extensions as any).cedar, platformRefs);
    });
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

try {
  // ── Load token mapping (Figma Input Contract, ADR-0003) ─────────────────────
  if (!fs.existsSync(mappingFile)) {
    throw new Error(
      `token-mapping.json not found at ${mappingFile}. ` +
        `This file is required — see ADR-0003 (Figma Input Contract).`,
    );
  }
  const tokenMapping: TokenMapping = JSON.parse(fs.readFileSync(mappingFile, "utf-8"));

  // ── Read all token files ─────────────────────────────────────────────────────
  const files = fs
    .readdirSync(tokensDir)
    .filter((f) => f.endsWith(".json") && f !== "canonical.json" && f !== "token-mapping.json");

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
  // color.primitives is NOT written to canonical.json — it was a spike artifact.
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
            `in token-mapping.json. Add a "collections.${collectionName}" entry.`,
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

  // ── 5. Write canonical.json ─────────────────────────────────────────────────
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
