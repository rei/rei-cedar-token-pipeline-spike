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

// ─── TokenMapping ─────────────────────────────────────────────────────────────

/**
 * Shape of src/schema/token-schema.json (`inputs.figma`) — the governed Figma Input Contract (ADR-0003).
 *
 * Each entry maps a Figma collection name (e.g. "neutral-palette") to:
 *   - canonicalPrefix: the color.option.* path prefix for all tokens in this collection
 *   - tokens: explicit Figma token path → canonical sub-path pairs
 *
 * The normalizer throws a build error for any Figma token path not declared here,
 * so designer renames surface immediately rather than producing corrupt paths.
 */
export type TokenMappingEntry = {
  canonicalPrefix: string;
  tokens: Record<string, string>;
};

export type TokenMapping = {
  collections: Record<string, TokenMappingEntry>;
};

// ─── parseTokenDescription ──────────────────────────────────────────────────

/**
 * Parse a Figma variable description into a structured TokenDocumentation object.
 *
 * Designers write a single plain-text description in Figma using this format:
 *
 *   Warm neutral, used for backgrounds.
 *   usage: Use for page and container backgrounds, never for text.
 *   design: Anchors the warm grey scale; the lightest neutral step.
 *   aliases: surface-default, surface-subtle
 *
 * Rules:
 *   - Lines before the first `key:` line are joined as `summary`.
 *   - Recognised keys: `usage`, `design`, `aliases`.
 *   - `aliases` is split on commas and trimmed into a string[].
 *   - Unrecognised keys are silently ignored.
 *   - Returns undefined when the raw string is empty or whitespace-only.
 */
export function parseTokenDescription(
  raw: string,
): { summary?: string; design?: string; usage?: string; aliases?: string[] } | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const KNOWN_KEYS = new Set(["usage", "design", "aliases"]);
  const lines = trimmed.split("\n");

  const summaryLines: string[] = [];
  const fields: Record<string, string> = {};
  let currentKey: string | null = null;

  for (const line of lines) {
    const keyMatch = line.match(/^([a-z]+):\s*(.*)$/i);
    if (keyMatch && KNOWN_KEYS.has(keyMatch[1].toLowerCase())) {
      currentKey = keyMatch[1].toLowerCase();
      fields[currentKey] = keyMatch[2].trim();
    } else if (currentKey) {
      // Continuation line for current key
      fields[currentKey] += " " + line.trim();
    } else {
      summaryLines.push(line.trim());
    }
  }

  const result: { summary?: string; design?: string; usage?: string; aliases?: string[] } = {};

  const summary = summaryLines.join(" ").trim();
  if (summary) result.summary = summary;
  if (fields.design) result.design = fields.design.trim();
  if (fields.usage) result.usage = fields.usage.trim();
  if (fields.aliases) {
    const parts = fields.aliases
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) result.aliases = parts;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

// ─── applyTokenMapping ────────────────────────────────────────────────────────

/**
 * Given a single Figma options collection (e.g. the contents of "neutral-palette")
 * and its mapping entry, return a flat map of:
 *   canonical path segments → { $type, $value, $description }
 *
 * Throws if any Figma token path in the collection has no mapping entry —
 * this is the governed build error that surfaces designer renames early.
 *
 * Descriptions are extracted from the Figma $description field, which designers
 * can populate in Figma. These are stored in the canonical tree's $extensions.cedar.docs
 * for use in generated TypeScript types and documentation.
 *
 * @param collectionName  Figma collection key (e.g. "neutral-palette")
 * @param collectionData  The cleaned token tree for that collection
 * @param entry           The TokenMappingEntry for this collection
 * @param platformKey     e.g. "web-light" — used only in error messages
 */
export function applyTokenMapping(
  collectionName: string,
  collectionData: Record<string, unknown>,
  entry: TokenMappingEntry,
  platformKey: string,
): Array<{
  canonicalPath: string;
  token: { $type: string; $value: string; docs?: ReturnType<typeof parseTokenDescription> };
}> {
  const results: Array<{
    canonicalPath: string;
    token: { $type: string; $value: string; docs?: ReturnType<typeof parseTokenDescription> };
  }> = [];

  function walkCollection(node: Record<string, unknown>, figmaPath: string[]) {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("$")) continue;
      const currentFigmaPath = [...figmaPath, key];
      const figmaPathStr = currentFigmaPath.join(".");

      if (isLeaf(value)) {
        // Look up the canonical sub-path for this Figma token path
        const canonicalSub = entry.tokens[figmaPathStr];
        if (canonicalSub === undefined) {
          throw new Error(
            `[token-mapping] Unknown Figma token path "${collectionName}.${figmaPathStr}" ` +
              `(from platform "${platformKey}"). ` +
              `Add an entry to src/schema/token-schema.json (inputs.figma.collections) or rename the Figma variable to match an existing entry.`,
          );
        }
        const canonicalPath = `${entry.canonicalPrefix}.${canonicalSub}`;
        const token: {
          $type: string;
          $value: string;
          docs?: ReturnType<typeof parseTokenDescription>;
        } = {
          $type: (value as any).$type,
          $value: String((value as any).$value),
        };
        // Parse structured documentation from the Figma $description field
        const rawDescription = (value as any).$description;
        if (rawDescription && typeof rawDescription === "string") {
          const docs = parseTokenDescription(rawDescription);
          if (docs) token.docs = docs;
        }
        results.push({
          canonicalPath,
          token,
        });
      } else if (value && typeof value === "object") {
        walkCollection(value as Record<string, unknown>, currentFigmaPath);
      }
    }
  }

  walkCollection(collectionData, []);
  return results;
}

// ─── buildOptionTree ──────────────────────────────────────────────────────────

/**
 * Convert a flat list of { canonicalPath, token } pairs into a nested object
 * tree rooted at the top-level section key.
 *
 * e.g. "color.option.neutral.warm.grey.900" with $value "#2e2e2b" and optional $description
 * becomes: { color: { option: { neutral: { warm: { grey: { "900": { $type, $value, $extensions: { cedar: { docs: ... } } } } } } } } }
 *
 * Descriptions from Figma tokens are wrapped into $extensions.cedar.docs.summary for use in
 * generated TypeScript types and documentation.
 *
 * Used to build the color.option subtree from mapped Figma option tokens, preserving
 * descriptions that designers add to Figma variables.
 */
export function buildOptionTree(
  entries: Array<{
    canonicalPath: string;
    token: { $type: string; $value: string; docs?: ReturnType<typeof parseTokenDescription> };
  }>,
): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const { canonicalPath, token } of entries) {
    const segments = canonicalPath.split(".");
    let cursor = root as Record<string, unknown>;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      if (!cursor[seg]) cursor[seg] = {};
      cursor = cursor[seg] as Record<string, unknown>;
    }
    const leaf = segments[segments.length - 1];

    const tokenNode: any = {
      $type: token.$type,
      $value: token.$value,
    };

    if (token.docs) {
      tokenNode.$extensions = {
        cedar: { docs: token.docs },
      };
    }

    cursor[leaf] = tokenNode;
  }

  return root;
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
  tokenMapping?: TokenMapping | null,
): TokenNode {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(node)) {
    // Strip Figma metadata keys
    if (key === "$extensions" || key === "$description") continue;

    if (isLeaf(value)) {
      let $value = String(value.$value);

      // Rewrite alias references that point into Figma option collections
      // to their canonical color.option.* paths.
      //
      // Without a mapping:  {neutral-palette.warm-grey.900} → {color.neutral-palette.warm-grey.900}
      // With a mapping:     {neutral-palette.warm-grey.900} → {color.option.neutral.warm.grey.900}
      //
      // The mapping rewrite is preferred — it produces ADR-0001 compliant paths.
      // The fallback (section prefix only) is kept for non-option alias types
      // (e.g. spacing references) that don't go through the mapping.
      if ($value.startsWith("{") && $value.endsWith("}")) {
        const inner = $value.slice(1, -1); // "{x.y.z}" → "x.y.z"
        const firstSegment = inner.split(".")[0]; // "x.y.z" → "x"
        const mappingEntry = tokenMapping?.collections[firstSegment];

        if (mappingEntry) {
          // This alias points into a mapped Figma collection.
          // Rewrite to the canonical color.option.* path.
          const figmaSubPath = inner.split(".").slice(1).join("."); // drop collection name
          const canonicalSub = mappingEntry.tokens[figmaSubPath];
          if (canonicalSub !== undefined) {
            $value = `{${mappingEntry.canonicalPrefix}.${canonicalSub}}`;
          } else {
            // Token exists in the alias file but has no mapping entry.
            // Throw so the gap surfaces immediately rather than producing a broken reference.
            throw new Error(
              `[clean] Alias reference "{${inner}}" has no entry in src/schema/token-schema.json (inputs.figma.collections) ` +
                `for collection "${firstSegment}", path "${figmaSubPath}". ` +
                `Add the mapping entry or update the Figma alias reference.`,
            );
          }
        } else {
          // Not a mapped collection — apply the legacy section-prefix rewrite
          // (handles spacing, typography, and other non-option alias types).
          const section = collectionToSection.get(firstSegment);
          if (section && section !== firstSegment) {
            $value = `{${section}.${inner}}`;
          }
        }
      }

      out[key] = { $value, $type: value.$type };
    } else if (typeof value === "object" && value !== null) {
      // Recursively clean nested token groups
      out[key] = clean(value as Record<string, unknown>, collectionToSection, tokenMapping);
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
 *   Alias and other files wrap their content under a section key:
 *   - alias.color.<mode>.json: { "color": { "surface": {...}, "text": {...} } }
 *   - spacing.alias.json:      { "spacing": { "component": {...} } }
 *
 *   nestUnderSections ensures these section wrappers are merged correctly
 *   into the canonical tree, and that alias color tokens are placed under
 *   color.modes.<palette> rather than directly under color.
 *
 *   options.color.*.json files (Figma primitive snapshots) are handled
 *   upstream by applyTokenMapping + buildOptionTree and never reach this function.
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
 * Example results (no colorMode):
 *   Input:  { "color": { "surface": {...}, "text": {...} } } (section wrapper)
 *   Output: { "color": { "surface": {...}, "text": {...} } } (unchanged)
 *
 *   Input:  { "spacing": { "sm": {...} } }
 *   Output: { "spacing": { "sm": {...} } } (unchanged)
 *
 * Example results (with colorMode = "sale"):
 *   Input:  { "color": { "surface": {...}, "text": {...} } }
 *   Output: { "color": { "modes": { "sale": { "surface": {...}, "text": {...} } } } }
 *
 * Note: options.color.*.json files (Figma primitives) are handled upstream via
 * applyTokenMapping + buildOptionTree and never reach nestUnderSections.
 */

export function nestUnderSections(
  cleaned: Record<string, unknown>,
  collectionToSection: Map<string, string>,
  colorMode?: string | null,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(cleaned)) {
    const section = collectionToSection.get(key);

    // ───────────────────────────────────────────────
    // SECTION WRAPPER (e.g. "color", "spacing")
    // ───────────────────────────────────────────────
    if (!section || section === key) {
      // Alias color file → nest under color.modes.<mode>
      if (colorMode && key === "color") {
        if (!out["color"]) out["color"] = {};
        deepMerge(out["color"] as Record<string, unknown>, {
          modes: { [colorMode]: value },
        });
        continue;
      }

      // Normal section wrapper
      if (!out[key]) out[key] = {};
      deepMerge(out[key] as Record<string, unknown>, value as Record<string, unknown>);
      continue;
    }

    // ───────────────────────────────────────────────
    // BARE COLLECTION (e.g. "neutral-palette")
    // ───────────────────────────────────────────────
    if (!out[section]) out[section] = {};

    // Default nesting for non-color bare collections (spacing, typography, etc.)
    // Color option collections never reach here — they are handled upstream
    // via applyTokenMapping + buildOptionTree before nestUnderSections is called.
    // Nest bare collection directly under its section.
    // Color primitives (e.g. neutral-palette) sit at color root;
    // option tokens are handled upstream via applyTokenMapping + buildOptionTree.
    (out[section] as Record<string, unknown>)[key] = value;
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
