/**
 * load-tokens.ts
 *
 * Utility to fetch and extract token data from snapshots at runtime.
 * This allows color and spacing stories to display the latest token values dynamically.
 * Web color stories intentionally format colors as CSS oklch() values while
 * preserving canonical hex as sourceHex for fallback/contrast context.
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

import type { Platform, Mode } from "../../src/storybook/platform-mode-context";
import { toWebOklch } from "./web-color-format.js";

interface TokenLeaf {
  $value: string;
  $type: string;
  $extensions?: {
    cedar?: {
      docs?: TokenDocs;
      appearances?: Record<string, string>;
      platformOverrides?: Record<string, Record<string, string>>;
      resolved?: Record<string, Record<string, string>>;
    };
  };
}

export interface TokenDocs {
  summary?: string;
  design?: string;
  usage?: string;
  aliases?: string[];
}

export interface LoadedColorToken {
  value: string;
  sourceHex: string;
  ref: string;
  docs?: TokenDocs;
}

export interface PrimitiveColorToken {
  name: string;
  value: string;
  sourceHex: string;
  docs?: TokenDocs;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Fetch the current token snapshot and extract color tokens for all modes.
 * Returns a map of token paths to their web OKLCH values, keyed as
 * "color.modes.<mode>.<category>.<token>".
 */
export async function loadColorTokens(
  platform: Platform = "web",
  mode: Mode = "light",
): Promise<
  Map<string, LoadedColorToken>
> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}normalized/current.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch current.json: ${res.status}`);
  }

  const tree = (await res.json()) as Record<string, unknown>;
  const result = new Map<string, LoadedColorToken>();

  const colorSection = tree["color"] as Record<string, unknown> | undefined;
  if (!colorSection) return result;

  const modesSection = colorSection["modes"] as Record<string, unknown> | undefined;
  if (modesSection) {
    // Multi-mode: color.modes.<mode>.<category>.<token>
    for (const [modeName, modeTokens] of Object.entries(modesSection)) {
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
            const sourceHex = resolveColorValue(leaf, colorSection, platform, mode);
            result.set(`color.modes.${modeName}.${category}.${key}`, {
              value: formatColorForPlatform(sourceHex, platform),
              sourceHex,
              ref: buildRef(leaf.$value),
              docs: leaf.$extensions?.cedar?.docs,
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
          const sourceHex = resolveColorValue(leaf, colorSection, platform, mode);
          result.set(`color.${category}.${key}`, {
            value: formatColorForPlatform(sourceHex, platform),
            sourceHex,
            ref: buildRef(leaf.$value),
            docs: leaf.$extensions?.cedar?.docs,
          });
        }
      }
    }
  }

  return result;
}

/**
 * Fetch the current token snapshot and extract primitive color tokens for web appearances.
 * Returns a map of mode name → array of { name, value } objects.
 *
 * Mode names match the options.color.<mode>.json filenames:
 *   "web-light", "web-dark"
 *
 * Falls back to reading from flat color.<palette> if no per-mode structure is present.
 */
export async function loadPrimitiveColors(): Promise<
  Map<string, PrimitiveColorToken[]>
> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}normalized/current.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch current.json: ${res.status}`);
  }

  const tree = (await res.json()) as Record<string, unknown>;
  const result = new Map<string, PrimitiveColorToken[]>();

  const colorSection = tree["color"] as Record<string, unknown> | undefined;
  if (!colorSection) return result;

  const primitivesSection = colorSection["primitives"] as Record<string, unknown> | undefined;

  if (primitivesSection) {
    // Multi-mode: color.primitives.<mode>.<palette>.<shade>
    for (const [mode, modeData] of Object.entries(primitivesSection)) {
      if (!isWebMode(mode)) continue;
      if (typeof modeData !== "object" || modeData === null) continue;
      const tokens: PrimitiveColorToken[] = [];
      for (const palette of ["neutral-palette", "brand-palette"]) {
        const group = (modeData as Record<string, unknown>)[palette] as Record<string, unknown> | undefined;
        if (group) flattenTokens(group, palette, tokens);
      }
      result.set(mode, tokens);
    }
  } else if (isRecord(colorSection["option"])) {
    // Canonical fallback: derive web appearances from color.option.*.
    const optionSection = colorSection["option"] as Record<string, unknown>;
    result.set("web-light", flattenOptionPrimitives(optionSection, "light"));
    result.set("web-dark", flattenOptionPrimitives(optionSection, "dark"));
  } else {
    // Fallback: flat color.<palette> (legacy structure)
    const tokens: PrimitiveColorToken[] = [];
    for (const palette of ["neutral-palette", "brand-palette"]) {
      const group = colorSection[palette] as Record<string, unknown> | undefined;
      if (group) flattenTokens(group, palette, tokens);
    }
    result.set("default", tokens);
  }

  return result;
}

function isWebMode(mode: string): boolean {
  return mode === "light" || mode === "dark" || mode.startsWith("web-");
}

function flattenOptionPrimitives(
  optionSection: Record<string, unknown>,
  appearance: "light" | "dark",
): PrimitiveColorToken[] {
  const out: PrimitiveColorToken[] = [];

  const neutralNode = optionSection["neutral"];
  if (isRecord(neutralNode)) {
    const neutral = neutralNode;
    // warm grey scale -> neutral-palette.warm-grey.*
    const warmNode = neutral["warm"];
    const warmGreyNode = isRecord(warmNode) ? warmNode["grey"] : undefined;
    if (isRecord(warmGreyNode)) {
      const warmGrey = warmGreyNode;
      for (const [shade, node] of Object.entries(warmGrey)) {
        if (isLeaf(node)) {
          const sourceHex = resolveOptionWebHex(node, appearance);
          out.push({
            name: `neutral-palette.warm-grey.${shade}`,
            value: toWebOklch(sourceHex),
            sourceHex,
            docs: node.$extensions?.cedar?.docs,
          });
        }
      }
    }

    // black/white/overlay -> neutral-palette.base-neutrals.*
    for (const key of ["black", "white"] as const) {
      const node = neutral[key];
      if (isLeaf(node)) {
        const sourceHex = resolveOptionWebHex(node, appearance);
        out.push({
          name: `neutral-palette.base-neutrals.${key}`,
          value: toWebOklch(sourceHex),
          sourceHex,
          docs: node.$extensions?.cedar?.docs,
        });
      }
    }

    const overlayNode = neutral["overlay"];
    if (isRecord(overlayNode)) {
      const overlay = overlayNode;
      for (const [key, node] of Object.entries(overlay)) {
        if (isLeaf(node)) {
          const sourceHex = resolveOptionWebHex(node, appearance);
          out.push({
            name: `neutral-palette.base-neutrals.overlay-${key}`,
            value: toWebOklch(sourceHex),
            sourceHex,
            docs: node.$extensions?.cedar?.docs,
          });
        }
      }
    }
  }

  // brand scale -> brand-palette.<color>.*
  const brandNode = optionSection["brand"];
  if (isRecord(brandNode)) {
    const brand = brandNode;
    for (const [colorName, scaleNode] of Object.entries(brand)) {
      if (!isRecord(scaleNode)) continue;
      for (const [shade, leaf] of Object.entries(scaleNode)) {
        if (isLeaf(leaf)) {
          const sourceHex = resolveOptionWebHex(leaf, appearance);
          out.push({
            name: `brand-palette.${colorName}.${shade}`,
            value: toWebOklch(sourceHex),
            sourceHex,
            docs: leaf.$extensions?.cedar?.docs,
          });
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
  out: PrimitiveColorToken[],
): void {
  for (const [key, value] of Object.entries(node)) {
    const path = `${prefix}.${key}`;
    if (isLeaf(value)) {
      const leaf = value as TokenLeaf;
      out.push({
        name: path,
        value: toWebOklch(leaf.$value),
        sourceHex: leaf.$value,
        docs: leaf.$extensions?.cedar?.docs,
      });
    } else if (typeof value === "object" && value !== null) {
      flattenTokens(value as Record<string, unknown>, path, out);
    }
  }
}

function formatColorForPlatform(value: string, platform: Platform): string {
  return platform === "web" ? toWebOklch(value) : value;
}

function resolveColorValue(
  leaf: TokenLeaf,
  colorSection: Record<string, unknown>,
  platform: Platform,
  mode: Mode,
): string {
  const resolved = leaf.$extensions?.cedar?.resolved?.[platform]?.[mode];
  if (typeof resolved === "string") return resolved;
  return resolveAlias(leaf.$value, colorSection, platform, mode) ?? leaf.$value;
}

function resolveOptionWebHex(node: TokenLeaf, appearance: "light" | "dark"): string {
  const dark = node.$extensions?.cedar?.appearances?.dark;
  return appearance === "dark" && typeof dark === "string" ? dark : node.$value;
}

function resolveAlias(
  alias: string,
  colorSection: Record<string, unknown>,
  platform: Platform,
  mode: Mode,
  seen = new Set<string>(),
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

  if (!isLeaf(node)) return null;
  return resolveLeafValue(node as TokenLeaf, colorSection, platform, mode, seen);
}

function resolveLeafValue(
  leaf: TokenLeaf,
  colorSection: Record<string, unknown>,
  platform: Platform,
  mode: Mode,
  seen: Set<string>,
): string | null {
  const rawValue = leaf.$value;

  if (typeof rawValue === "string" && rawValue.startsWith("{") && rawValue.endsWith("}")) {
    if (seen.has(rawValue)) return null;
    seen.add(rawValue);
    return resolveAlias(rawValue, colorSection, platform, mode, seen);
  }

  const cedar = leaf.$extensions?.cedar;
  const platformOverride = cedar?.platformOverrides?.[platform]?.[mode];
  if (typeof platformOverride === "string") {
    return platformOverride;
  }

  if (mode === "dark" && typeof cedar?.appearances?.dark === "string") {
    return cedar.appearances.dark;
  }

  return typeof rawValue === "string" ? rawValue : null;
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
