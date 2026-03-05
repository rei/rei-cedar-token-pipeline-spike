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
 * Example results:
 *   Input:  { "neutral-palette": {...}, "brand-palette": {...} } (bare collections)
 *   Output: { "color": { "neutral-palette": {...}, "brand-palette": {...} } }
 *
 *   Input:  { "color": { "surface": {...}, "text": {...} } } (section wrapper)
 *   Output: { "color": { "surface": {...}, "text": {...} } } (unchanged)
 */
export function nestUnderSections(
  cleaned: Record<string, unknown>,
  collectionToSection: Map<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(cleaned)) {
    const section = collectionToSection.get(key);

    if (!section || section === key) {
      // Section wrapper: "color", "spacing", etc. Keep at top level.
      // If multiple files contribute to the same section, merge them.
      if (out[key] === undefined) {
        out[key] = value;
      } else {
        deepMerge(out[key] as Record<string, unknown>, value as Record<string, unknown>);
      }
    } else {
      // Bare collection: "neutral-palette", "brand-palette", etc.
      // Nest it under its section so it's accessible via section.key.
      if (out[section] === undefined) {
        out[section] = {};
      }
      (out[section] as Record<string, unknown>)[key] = value;
    }
  }

  return out;
}

// ─── deepMerge ────────────────────────────────────────────────────────────────

/** Deep-merge src into dest (dest is mutated). Later files win on conflicts. */
export function deepMerge(
  dest: Record<string, unknown>,
  src: Record<string, unknown>,
): void {
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

// ─── joinPlatformTokens ───────────────────────────────────────────────────────

/**
 * Recursively merge web and iOS tokens into a single token structure
 * where each color token has both web and iOS values.
 *
 * Validates that every leaf's web value is a 6–9 digit hex string and fails
 * fast with a descriptive error (non-zero exit) if it is not. iOS value falls
 * back to the web value when absent.
 *
 * Examples:
 *   Web:  { "100": { $value: "#edeae3", $type: "color" } }
 *   iOS:  { "100": { $value: "#2E2E2B", $type: "color" } }
 *   Result: { "100": { $value: { web: "#edeae3", ios: "#2E2E2B" }, $type: "color" } }
 */
export function joinPlatformTokens(
  webNode: TokenNode,
  iosNode: TokenNode,
  path = "",
): TokenNode {
  const hexRegex = /^#([A-Fa-f0-9]{6,9})$/;
  const out: Record<string, unknown> = {};
  const allKeys = new Set([
    ...Object.keys(webNode as Record<string, unknown>),
    ...Object.keys(iosNode as Record<string, unknown>),
  ]);

  for (const key of allKeys) {
    const webValue = (webNode as Record<string, unknown>)[key];
    const iosValue = (iosNode as Record<string, unknown>)[key];
    const currentPath = path ? `${path}.${key}` : key;

    if (isLeaf(webValue) && isLeaf(iosValue)) {
      const webStr = String(webValue.$value);
      const iosRaw = String(iosValue.$value);
      const iosStr = iosRaw !== "" ? iosRaw : webStr;

      // AC: Required Field — web value must be present
      if (!webStr) {
        throw new Error(
          `Validation Failed: Token "${currentPath}" is missing required "web" value. Workflow halted.`,
        );
      }
      // AC: Hex Validation — web must be 6–9 digit hex
      if (!hexRegex.test(webStr.trim())) {
        throw new Error(
          `Validation Failed: Token "${currentPath}" has invalid web value "${webStr}". Expected 6-9 digit hex (e.g., "#406EB5" or "#406EB5FF"). Workflow halted.`,
        );
      }
      // AC: Hex Validation — iOS must be 6–9 digit hex
      if (!hexRegex.test(iosStr.trim())) {
        throw new Error(
          `Validation Failed: Token "${currentPath}" has invalid iOS value "${iosStr}". Expected 6-9 digit hex (e.g., "#406EB5" or "#406EB5FF"). Workflow halted.`,
        );
      }

      out[key] = {
        $value: { web: webStr, ios: iosStr },
        $type: webValue.$type,
      };
    } else if (isLeaf(webValue)) {
      // Only web is a leaf: use it as-is
      out[key] = webValue;
    } else if (isLeaf(iosValue)) {
      // Only iOS is a leaf: use it as-is
      out[key] = iosValue;
    } else if (typeof webValue === "object" && webValue !== null && typeof iosValue === "object" && iosValue !== null) {
      // Both are token groups: recurse
      out[key] = joinPlatformTokens(
        webValue as TokenNode,
        iosValue as TokenNode,
        currentPath,
      );
    } else if (typeof webValue === "object" && webValue !== null) {
      out[key] = webValue;
    } else {
      out[key] = iosValue;
    }
  }

  return out as TokenNode;
}
