/**
 * load-tokens.ts
 *
 * Utility to fetch and extract token data from snapshots at runtime.
 * This allows color and spacing stories to display the latest token values dynamically.
 *
 * Color token structure (multi-mode canonical format):
 *   color.modes.<mode>.surface.base
 *   color.modes.<mode>.text.link
 *   color.modes.<mode>.border.subtle
 *   color.neutral-palette.warm-grey.100
 *   color.brand-palette.blue.600
 *
 * Spacing token structure:
 *   spacing.scale.-50   → { $value: "clamp(...)", $type: "fluid" }
 *   spacing.component.xs → { $value: "{spacing.scale.-50}", $type: "number" }  (alias)
 *   spacing.layout.sm    → { $value: "{spacing.scale.-250}", $type: "number" } (alias)
 */

interface TokenLeaf {
  $value: string;
  $type: string;
}

/**
 * Fetch the current token snapshot and extract color tokens for all modes.
 * Returns a map of token paths to their hex values, keyed as
 * "color.modes.<mode>.<category>.<token>".
 */
export async function loadColorTokens(): Promise<
  Map<string, { hex: string; ref: string }>
> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}normalized/current.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch current.json: ${res.status}`);
  }

  const tree = (await res.json()) as Record<string, unknown>;
  const result = new Map<string, { hex: string; ref: string }>();

  const colorSection = tree["color"] as Record<string, unknown> | undefined;
  if (!colorSection) return result;

  const modesSection = colorSection["modes"] as Record<string, unknown> | undefined;
  if (modesSection) {
    // Multi-mode: color.modes.<mode>.<category>.<token>
    for (const [mode, modeTokens] of Object.entries(modesSection)) {
      if (typeof modeTokens !== "object" || modeTokens === null) continue;
      const semanticCategories = ["text", "surface", "border"];
      for (const category of semanticCategories) {
        const group = (modeTokens as Record<string, unknown>)[category] as
          | Record<string, unknown>
          | undefined;
        if (!group) continue;
        for (const [key, value] of Object.entries(group)) {
          if (isLeaf(value)) {
            const leaf = value as TokenLeaf;
            const resolvedHex = resolveAlias(leaf.$value, colorSection);
            result.set(`color.modes.${mode}.${category}.${key}`, {
              hex: resolvedHex || leaf.$value,
              ref: buildRef(leaf.$value),
            });
          }
        }
      }
    }
  } else {
    // Fallback: legacy flat structure (color.text.*, color.surface.*, color.border.*)
    const semanticCategories = ["text", "surface", "border"];
    for (const category of semanticCategories) {
      const group = colorSection[category] as Record<string, unknown> | undefined;
      if (!group) continue;
      for (const [key, value] of Object.entries(group)) {
        if (isLeaf(value)) {
          const leaf = value as TokenLeaf;
          const resolvedHex = resolveAlias(leaf.$value, colorSection);
          result.set(`color.${category}.${key}`, {
            hex: resolvedHex || leaf.$value,
            ref: buildRef(leaf.$value),
          });
        }
      }
    }
  }

  return result;
}

/**
 * Fetch the current token snapshot and extract primitive color tokens per platform mode.
 * Returns a map of mode name → array of { name, value } objects.
 *
 * Mode names match the options.color.<mode>.json filenames:
 *   "light", "web-light", "web-dark", "ios-light", "ios-dark"
 *
 * Falls back to reading from flat color.<palette> if no per-mode structure is present.
 */
export async function loadPrimitiveColors(): Promise<
  Map<string, Array<{ name: string; value: string }>>
> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}normalized/current.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch current.json: ${res.status}`);
  }

  const tree = (await res.json()) as Record<string, unknown>;
  const result = new Map<string, Array<{ name: string; value: string }>>();

  const colorSection = tree["color"] as Record<string, unknown> | undefined;
  if (!colorSection) return result;

  const primitivesSection = colorSection["primitives"] as Record<string, unknown> | undefined;

  if (primitivesSection) {
    // Multi-mode: color.primitives.<mode>.<palette>.<shade>
    for (const [mode, modeData] of Object.entries(primitivesSection)) {
      if (typeof modeData !== "object" || modeData === null) continue;
      const tokens: Array<{ name: string; value: string }> = [];
      for (const palette of ["neutral-palette", "brand-palette"]) {
        const group = (modeData as Record<string, unknown>)[palette] as Record<string, unknown> | undefined;
        if (group) flattenTokens(group, palette, tokens);
      }
      result.set(mode, tokens);
    }
  } else if (colorSection["option"] && typeof colorSection["option"] === "object") {
    // Canonical fallback: color.option.<neutral|brand>.*
    const tokens = flattenOptionPrimitives(colorSection["option"] as Record<string, unknown>);
    result.set("default", tokens);
  } else {
    // Fallback: flat color.<palette> (legacy structure)
    const tokens: Array<{ name: string; value: string }> = [];
    for (const palette of ["neutral-palette", "brand-palette"]) {
      const group = colorSection[palette] as Record<string, unknown> | undefined;
      if (group) flattenTokens(group, palette, tokens);
    }
    result.set("default", tokens);
  }

  return result;
}

function flattenOptionPrimitives(
  optionSection: Record<string, unknown>,
): Array<{ name: string; value: string }> {
  const out: Array<{ name: string; value: string }> = [];

  const neutral = optionSection["neutral"] as Record<string, unknown> | undefined;
  if (neutral) {
    // warm grey scale -> neutral-palette.warm-grey.*
    const warmGrey = (((neutral["warm"] as Record<string, unknown> | undefined)?.["grey"]) as
      | Record<string, unknown>
      | undefined);
    if (warmGrey) {
      for (const [shade, node] of Object.entries(warmGrey)) {
        if (isLeaf(node)) {
          out.push({ name: `neutral-palette.warm-grey.${shade}`, value: node.$value });
        }
      }
    }

    // black/white/overlay -> neutral-palette.base-neutrals.*
    for (const key of ["black", "white"] as const) {
      const node = neutral[key];
      if (isLeaf(node)) {
        out.push({ name: `neutral-palette.base-neutrals.${key}`, value: node.$value });
      }
    }

    const overlay = neutral["overlay"] as Record<string, unknown> | undefined;
    if (overlay) {
      for (const [key, node] of Object.entries(overlay)) {
        if (isLeaf(node)) {
          out.push({ name: `neutral-palette.base-neutrals.overlay-${key}`, value: node.$value });
        }
      }
    }
  }

  // brand scale -> brand-palette.<color>.*
  const brand = optionSection["brand"] as Record<string, unknown> | undefined;
  if (brand) {
    for (const [colorName, scaleNode] of Object.entries(brand)) {
      if (typeof scaleNode !== "object" || scaleNode === null) continue;
      for (const [shade, leaf] of Object.entries(scaleNode as Record<string, unknown>)) {
        if (isLeaf(leaf)) {
          out.push({ name: `brand-palette.${colorName}.${shade}`, value: leaf.$value });
        }
      }
    }
  }

  return out;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLeaf(node: unknown): node is TokenLeaf {
  return (
    typeof node === "object" &&
    node !== null &&
    "$value" in node &&
    "$type" in node
  );
}

// ─── Spacing loader ───────────────────────────────────────────────────────────

export interface SpacingToken {
  /** Dot-separated token path, e.g. "spacing.scale.-100" */
  path: string;
  /**
   * CSS value:
   *   - scale tokens:     CSS clamp() string  (type = "fluid")
   *   - component/layout: resolved clamp() string via alias lookup (type = "fluid")
   */
  value: string;
  /** "fluid" for scale tokens; "alias" for component/layout resolved tokens */
  kind: "fluid" | "alias";
  /** The alias ref if this is a component/layout token, e.g. "spacing.scale.-50" */
  aliasRef?: string;
  /** The scale key this alias resolves to, e.g. "-50" */
  scaleKey?: string;
}

/**
 * Fetch the current token snapshot and extract spacing tokens.
 * Returns scale tokens with their fluid clamp() values, plus component/layout
 * alias tokens resolved to their underlying clamp() values.
 *
 * Fluid tokens (type="fluid") are intended for web CSS only.
 * Non-web platforms should ignore $type="fluid" tokens entirely.
 */
export async function loadSpacingTokens(): Promise<SpacingToken[]> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}normalized/current.json`);
  if (!res.ok) throw new Error(`Failed to fetch current.json: ${res.status}`);

  const tree = (await res.json()) as Record<string, unknown>;
  const spacingSection = tree["spacing"] as Record<string, unknown> | undefined;
  if (!spacingSection) return [];

  const result: SpacingToken[] = [];

  // Build a scale lookup: key → clamp() string
  const scaleMap = new Map<string, string>();
  const scale = spacingSection["scale"] as Record<string, unknown> | undefined;
  if (scale) {
    for (const [key, val] of Object.entries(scale)) {
      if (isLeaf(val) && val.$type === "fluid") {
        scaleMap.set(key, val.$value as string);
        result.push({ path: `spacing.scale.${key}`, value: val.$value as string, kind: "fluid" });
      }
    }
  }

  // Resolve alias groups: component and layout
  for (const groupName of ["component", "layout"] as const) {
    const group = spacingSection[groupName] as Record<string, unknown> | undefined;
    if (!group) continue;
    for (const [key, val] of Object.entries(group)) {
      if (!isLeaf(val)) continue;
      const raw = val.$value as string;
      // Extract alias ref: "{spacing.scale.-100}" → "spacing.scale.-100"
      const aliasMatch = raw.match(/^\{(.+)\}$/);
      if (!aliasMatch) continue;
      const ref = aliasMatch[1]; // "spacing.scale.-100"
      const scaleKey = ref.split(".").pop() ?? "";
      const resolved = scaleMap.get(scaleKey);
      result.push({
        path: `spacing.${groupName}.${key}`,
        value: resolved ?? raw,
        kind: "alias",
        aliasRef: ref,
        scaleKey,
      });
    }
  }

  return result;
}

function flattenTokens(
  node: Record<string, unknown>,
  prefix: string,
  out: Array<{ name: string; value: string }>,
): void {
  for (const [key, value] of Object.entries(node)) {
    const path = `${prefix}.${key}`;
    if (isLeaf(value)) {
      const leaf = value as TokenLeaf;
      out.push({ name: path, value: leaf.$value });
    } else if (typeof value === "object" && value !== null) {
      flattenTokens(value as Record<string, unknown>, path, out);
    }
  }
}

function resolveAlias(
  alias: string,
  colorSection: Record<string, unknown>,
): string | null {
  // Extract the token path from {color.neutral-palette.blue.600} or {neutral-palette.blue.600}
  const match = alias.match(/^{(?:color\.)?(.+)}$/);
  if (!match) return null;

  const path = match[1].split(".");
  let node: unknown = colorSection;

  for (const segment of path) {
    if (typeof node === "object" && node !== null) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return null;
    }
  }

  if (isLeaf(node)) {
    return node.$value;
  }

  return null;
}

function buildRef(alias: string): string {
  // Convert {color.neutral-palette.blue.600} to "Neutral Palette → blue.600"
  const match = alias.match(/^{(?:color\.)?(.+)}$/);
  if (!match) return alias;

  const path = match[1].split(".");
  if (path.length < 2) return alias;

  const collection = path[0]; // e.g., "neutral-palette"
  const subpath = path.slice(1).join(".");

  // Format collection name
  const collectionLabel = collection
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return `${collectionLabel} → ${subpath}`;
}
