/**
 * normalize-utils.ts
 *
 * Pure functions extracted from normalize.ts so they can be unit-tested
 * without hitting the filesystem.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TokenNode =
  | { [key: string]: TokenNode }
  | { $value: string | number | boolean; $type: string };

export type ParsedFile = { file: string; data: Record<string, unknown> };

/**
 * Extract the semantic color mode name from a token filename.
 *
 * For alias color files the convention is `alias.color.<mode>.json`.
 * The mode is the third segment (index 2). If the file has fewer than
 * three segments (e.g. `spacing.default.json`) this returns null.
 *
 * Examples:
 *   alias.color.light.json   → "light"
 *   alias.color.default.json → "default"
 *   alias.color.sale.json    → "sale"
 *   options.color.light.json → null  (options files are primitive, not semantic)
 *   spacing.default.json     → null
 */
export function extractColorMode(file: string): string | null {
  const parts = file.replace(/\.json$/, "").split(".");
  // Only alias.color.<mode> files carry semantic mode information for colors
  if (parts[0] === "alias" && parts[1] === "color" && parts.length >= 3) {
    return parts[2];
  }
  return null;
}

/**
 * Extract the primitive platform mode from a token filename.
 *
 * For options color files the convention is `options.color.<mode>.json`.
 * The mode is the third segment (index 2). Returns null for all other files.
 *
 * Examples:
 *   options.color.light.json    → "light"
 *   options.color.web-dark.json → "web-dark"
 *   options.color.ios-light.json → "ios-light"
 *   alias.color.default.json    → null  (alias files are semantic, not primitive)
 *   spacing.default.json        → null
 */
export function extractPrimitiveMode(file: string): string | null {
  const parts = file.replace(/\.json$/, "").split(".");
  // Only options.color.<mode> files carry platform mode information for primitives
  if (parts[0] === "options" && parts[1] === "color" && parts.length >= 3) {
    return parts[2]; // e.g. "light", "web-dark", "ios-light"
  }
  return null;
}

// ─── isLeaf ───────────────────────────────────────────────────────────────────

export function isLeaf(
  node: unknown,
): node is { $value: string | number | boolean; $type: string; [k: string]: unknown } {
  return typeof node === "object" && node !== null && "$value" in node;
}

// ─── buildCollectionToSection ─────────────────────────────────────────────────

/**
 * Inspect every parsed file and build a map from bare collection root
 * (e.g. "neutral-palette") to the canonical section it belongs to (e.g. "color").
 *
 * The section is derived from the second segment of the filename:
 *   options.color.light.json  → section "color"
 *   alias.color.light.json    → section "color"
 *   spacing.default.json      → section "default" … but the top-level key IS
 *                               "spacing", so it maps to itself.
 *
 * Rules:
 *   - If a file's top-level key matches the filename-derived section name,
 *     it IS the section wrapper → map it and all its children to that section.
 *   - Otherwise the top-level key is a bare collection → map it to the
 *     filename-derived section.
 */
export function buildCollectionToSection(parsed: ParsedFile[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const { file, data } of parsed) {
    const parts = file.replace(/\.json$/, "").split(".");
    const sectionFromFilename = parts.length >= 2 ? parts[1] : parts[0];

    for (const topKey of Object.keys(data)) {
      const value = data[topKey];
      if (typeof value !== "object" || value === null) continue;

      // A top-level key is a section wrapper if it appears anywhere in the
      // filename segments (e.g. "spacing" in "spacing.default.json", or
      // "color" in "alias.color.light.json").
      const isWrapper = parts.includes(topKey);

      if (isWrapper) {
        // Section wrapper (e.g. alias.color → { "color": { … } },
        //                       spacing.default → { "spacing": { … } })
        map.set(topKey, topKey);
        for (const childKey of Object.keys(value as object)) {
          map.set(childKey, topKey);
        }
      } else {
        // Bare collection (e.g. options.color → { "neutral-palette": { … } })
        map.set(topKey, sectionFromFilename);
      }
    }
  }

  return map;
}

// ─── clean ────────────────────────────────────────────────────────────────────

/**
 * Recursively strip Figma metadata and rewrite bare alias references so they
 * resolve correctly after nesting under section keys.
 *
 * Two main transformations:
 *   1. Strip $extensions and $description (Figma-specific metadata)
 *   2. Rewrite bare alias references with their section prefix if needed.
 *      This prepares aliases for the section-nested canonical tree where
 *      collections like "neutral-palette" are nested under "color".
 *
 * Examples:
 *   "{neutral-palette.warm-grey.100}" → "{color.neutral-palette.warm-grey.100}"
 *   "{spacing.sm}" → "{spacing.sm}" (already a section root, no change)
 *   "{color.text.link}" → "{color.text.link}" (already prefixed, no change)
 *
 * The collectionToSection map (built from filename analysis) tells us which
 * section each collection belongs to. If a bare reference's first segment
 * (e.g. "neutral-palette") is a collection, we prefix it with its section
 * (e.g. "color.") so the reference resolves in the nested tree.
 */
export function clean(
  node: Record<string, unknown>,
  collectionToSection: Map<string, string>,
): TokenNode {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(node)) {
    // Strip Figma metadata keys
    if (key === "$extensions" || key === "$description") continue;

    if (isLeaf(value)) {
      let $value = String(value.$value);

      // Rewrite bare alias references if needed
      if ($value.startsWith("{") && $value.endsWith("}")) {
        const inner = $value.slice(1, -1); // "{x.y.z}" → "x.y.z"
        const firstSegment = inner.split(".")[0]; // "x.y.z" → "x"
        const section = collectionToSection.get(firstSegment);
        // Only rewrite if: (1) it's a known collection, and (2) it's not already a section
        if (section && section !== firstSegment) {
          $value = `{${section}.${inner}}`; // "x.y.z" → "section.x.y.z"
        }
      }

      out[key] = { $value, $type: value.$type };
    } else if (typeof value === "object" && value !== null) {
      // Recursively clean nested token groups
      out[key] = clean(value as Record<string, unknown>, collectionToSection);
    }
  }

  return out as TokenNode;
}

// ─── nestUnderSections ────────────────────────────────────────────────────────

/**
 * Restructure cleaned file output so all collections are nested under their
 * canonical section keys. This creates the final hierarchical canonical tree.
 *
 * Why nested sections?
 *   The Figma sync produces files with different structures:
 *   - alias.color.light.json: { "color": { "surface": {...}, "text": {...} } }
 *   - options.color.light.json: { "neutral-palette": {...}, "brand-palette": {...} }
 *
 *   To keep aliases resolvable and the tree organized, we nest everything
 *   under section keys:
 *   - Alias tokens (already section-wrapped) stay as-is
 *   - Option collections (bare) get nested under their section
 *
 * Nesting rules (using collectionToSection map):
 *   - If map.get(key) === key:
 *     → key IS a section wrapper (e.g. "color" from alias.color.light.json).
 *       Keep at top level: { "color": { children } }
 *   - If map.get(key) !== key (and not undefined):
 *     → key is a bare collection (e.g. "neutral-palette" from options.color.light.json).
 *       Nest under its section: { "color": { "neutral-palette": {...} } }
 *
 * Multiple files can contribute to the same section (e.g. both options.color.*
 * and alias.color.* nest under "color"), so top-level keys that map to the
 * same section are merged together via deepMerge.
 *
 * Color mode nesting:
 *   When colorMode is provided (for alias.color.<mode>.json files), the
 *   semantic children of the "color" wrapper (e.g. "surface", "text",
 *   "border") are placed under color.modes.<mode> rather than directly
 *   under "color". This allows multiple modes to coexist in the canonical
 *   tree without overwriting each other.
 *
 * Example results (no mode):
 *   Input:  { "neutral-palette": {...}, "brand-palette": {...} } (bare collections)
 *   Output: { "color": { "neutral-palette": {...}, "brand-palette": {...} } }
 *
 *   Input:  { "color": { "surface": {...}, "text": {...} } } (section wrapper)
 *   Output: { "color": { "surface": {...}, "text": {...} } } (unchanged)
 *
 * Example results (with colorMode = "sale"):
 *   Input:  { "color": { "surface": {...}, "text": {...} } }
 *   Output: { "color": { "modes": { "sale": { "surface": {...}, "text": {...} } } } }
 *
 * Example results (with primitiveMode = "web-dark"):
 *   Input:  { "neutral-palette": {...}, "brand-palette": {...} } (bare collections)
 *   Output: { "color": { "primitives": { "web-dark": { "neutral-palette": {...}, "brand-palette": {...} } } } }
 */
export function nestUnderSections(
  cleaned: Record<string, unknown>,
  collectionToSection: Map<string, string>,
  colorMode?: string | null,
  primitiveMode?: string | null,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(cleaned)) {
    const section = collectionToSection.get(key);

    if (!section || section === key) {
      // Section wrapper: "color", "spacing", etc.
      if (colorMode && key === "color" && typeof value === "object" && value !== null) {
        // Nest semantic children under color.modes.<mode>
        const modesWrapper: Record<string, unknown> = {
          modes: { [colorMode]: value },
        };
        if (out["color"] === undefined) {
          out["color"] = modesWrapper;
        } else {
          deepMerge(out["color"] as Record<string, unknown>, modesWrapper);
        }
      } else {
        // Keep at top level as-is (no mode or not a color section wrapper)
        if (out[key] === undefined) {
          out[key] = value;
        } else {
          deepMerge(out[key] as Record<string, unknown>, value as Record<string, unknown>);
        }
      }
    } else {
      // Bare collection: "neutral-palette", "brand-palette", etc.
      // If we have a primitiveMode, nest under color.primitives.<mode>;
      // otherwise nest flat under color (legacy / no-mode behaviour).
      if (out[section] === undefined) {
        out[section] = {};
      }
      if (primitiveMode && section === "color") {
        // color.primitives.<mode>.<palette>  ← per-mode storage for Storybook display
        const colorSection = out[section] as Record<string, unknown>;
        if (!colorSection["primitives"]) colorSection["primitives"] = {};
        const primitivesSection = colorSection["primitives"] as Record<string, unknown>;
        if (!primitivesSection[primitiveMode]) primitivesSection[primitiveMode] = {};
        (primitivesSection[primitiveMode] as Record<string, unknown>)[key] = value;
        // Also write flat: color.<palette>  ← for semantic alias resolution.
        // Multiple options files deep-merge; last file wins (web-light is processed last
        // alphabetically, which is a good default for web/light-mode alias resolution).
        (out[section] as Record<string, unknown>)[key] = value;
      } else {
        (out[section] as Record<string, unknown>)[key] = value;
      }
    }
  }

  return out;
}

// ─── deepMerge ────────────────────────────────────────────────────────────────

// ─── buildSpacingClamp ────────────────────────────────────────────────────────

/**
 * Given multiple per-breakpoint spacing token files (e.g. spacing.320.json,
 * spacing.1440.json, spacing.2560.json), produce a single canonical spacing
 * tree where every `spacing.scale.*` leaf has a CSS `clamp()` string as its
 * $value, and $type is "fluid".
 *
 * The non-scale collections (spacing.component.*, spacing.layout.*) come from
 * the alias file and keep their alias references unchanged.
 *
 * CSS clamp formula:
 *   clamp(<min>px, <slope>vw + <intercept>px, <max>px)
 *
 * Derivation (per token):
 *   - min breakpoint (bp_min = 320px): value = v_min
 *   - max (saturation) breakpoint (bp_max): value = v_max
 *   - 1vw = viewport_width / 100 px, so:
 *       slope = (v_max - v_min) / (bp_max/100 - bp_min/100)   [units: px/vw]
 *       intercept = v_min - slope * (bp_min / 100)             [units: px]
 *   clamp(v_min px, slope vw + intercept px, v_max px)
 *
 * The saturation breakpoint is the smallest breakpoint at which the token
 * value first equals the global maximum across all breakpoints.
 *
 * @param parsedSpacingFiles  Array of { breakpoint: number, data: RawSpacingFile }
 *   where breakpoint is the viewport width from the filename (e.g. 320 for spacing.320.json)
 *   and data is the parsed JSON (null-safe: alias file is excluded by the caller).
 */
export function buildSpacingClamp(
  parsedSpacingFiles: Array<{ breakpoint: number; data: Record<string, unknown> }>,
): Record<string, unknown> {
  if (parsedSpacingFiles.length === 0) return {};

  // Sort ascending by breakpoint
  const sorted = [...parsedSpacingFiles].sort((a, b) => a.breakpoint - b.breakpoint);
  const minBp = sorted[0].breakpoint;

  // Collect all token keys from the scale group
  const scaleKeys = new Set<string>();
  for (const { data } of sorted) {
    const scale = getScale(data);
    if (scale) Object.keys(scale).forEach((k) => scaleKeys.add(k));
  }

  const scaleOut: Record<string, unknown> = {};

  for (const tokenKey of scaleKeys) {
    // Gather (breakpoint, value) pairs for this token
    const pairs: Array<{ bp: number; val: number }> = [];
    for (const { breakpoint, data } of sorted) {
      const scale = getScale(data);
      if (!scale) continue;
      const leaf = scale[tokenKey];
      if (isLeaf(leaf) && typeof leaf.$value === "number") {
        pairs.push({ bp: breakpoint, val: leaf.$value });
      } else if (isLeaf(leaf) && typeof leaf.$value === "string") {
        const n = parseFloat(leaf.$value);
        if (!isNaN(n)) pairs.push({ bp: breakpoint, val: n });
      }
    }

    if (pairs.length < 2) {
      // Not enough data for a fluid formula — keep raw px value
      const v = pairs[0]?.val ?? 0;
      scaleOut[tokenKey] = { $value: `${roundPx(v)}px`, $type: "dimension" };
      continue;
    }

    const vMin = pairs[0].val;
    const vMax = Math.max(...pairs.map((p) => p.val));

    // Find saturation breakpoint: first bp where value == vMax (within float tolerance)
    const satPair = pairs.find((p) => Math.abs(p.val - vMax) < 0.05);
    const maxBp = satPair?.bp ?? sorted[sorted.length - 1].breakpoint;

    // Compute slope (px per vw) and intercept
    const bpMinVw = minBp / 100; // bp in vw units (1vw = viewport/100)
    const bpMaxVw = maxBp / 100;
    const slope = (vMax - vMin) / (bpMaxVw - bpMinVw); // px / vw
    const intercept = vMin - slope * bpMinVw; // px

    const clampValue = `clamp(${roundPx(vMin)}px, ${roundSlope(slope)}vw + ${roundPx(intercept)}px, ${roundPx(vMax)}px)`;
    scaleOut[tokenKey] = { $value: clampValue, $type: "fluid" };
  }

  return { spacing: { scale: scaleOut } };
}

/** Extract the spacing.scale object from a raw spacing file, if present. */
function getScale(data: Record<string, unknown>): Record<string, unknown> | null {
  const spacingSection = data["spacing"];
  if (typeof spacingSection !== "object" || spacingSection === null) return null;
  const scale = (spacingSection as Record<string, unknown>)["scale"];
  if (typeof scale !== "object" || scale === null) return null;
  return scale as Record<string, unknown>;
}

/** Round a px value to 4 significant decimal places. */
function roundPx(v: number): string {
  // Use up to 4 decimal places but strip trailing zeros
  return parseFloat(v.toFixed(4)).toString();
}

/** Round a vw slope coefficient to 4 decimal places. */
function roundSlope(v: number): string {
  return parseFloat(v.toFixed(4)).toString();
}

/** Deep-merge src into dest (dest is mutated). Later files win on conflicts. */
export function deepMerge(dest: Record<string, unknown>, src: Record<string, unknown>): void {
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
