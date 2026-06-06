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
 *   color.option.alpine-lake-blue.100
 *   color.option.warm-grey.900
 *
 * Spacing token structure:
 *   spacing.scale.-50   → { $value: "clamp(...)", $type: "dimension" }
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
  const res = await fetch(`${base}canonical/tokens.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch canonical/tokens.json: ${res.status}`);
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
      for (const [category, group] of Object.entries(modeTokens as Record<string, unknown>)) {
        if (category.startsWith("$")) continue;
        if (typeof group !== "object" || group === null) continue;
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
    // Fallback: flat structure (color.<category>.<token>)
    for (const [category, group] of Object.entries(colorSection)) {
      if (category.startsWith("$") || category === "option" || category === "modes") continue;
      if (typeof group !== "object" || group === null) continue;
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
 * Reads directly from color.option.<family>.<step> — each family is a
 * top-level key (e.g. alpine-lake-blue, warm-grey, info-blue).
 * Appearance values are derived from $extensions.cedar.appearances.dark
 * (dark mode) or $value (light mode / fallback).
 */
export async function loadPrimitiveColors(): Promise<
  Map<string, PrimitiveColorToken[]>
> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}canonical/tokens.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch canonical/tokens.json: ${res.status}`);
  }

  const tree = (await res.json()) as Record<string, unknown>;
  const result = new Map<string, PrimitiveColorToken[]>();

  const colorSection = tree["color"] as Record<string, unknown> | undefined;
  if (!colorSection) return result;

  const optionSection = colorSection["option"] as Record<string, unknown> | undefined;
  if (!optionSection) return result;

  result.set("web-light", flattenOptionPrimitives(optionSection, "light"));
  result.set("web-dark", flattenOptionPrimitives(optionSection, "dark"));

  return result;
}

function flattenOptionPrimitives(
  optionSection: Record<string, unknown>,
  appearance: "light" | "dark",
): PrimitiveColorToken[] {
  const out: PrimitiveColorToken[] = [];

  for (const [familyName, familyNode] of Object.entries(optionSection)) {
    if (!isRecord(familyNode)) continue;

    for (const [step, stepNode] of Object.entries(familyNode)) {
      if (!isLeaf(stepNode)) continue;
      const sourceHex = resolveOptionWebHex(stepNode, appearance);
      out.push({
        name: `${familyName}.${step}`,
        value: toWebOklch(sourceHex),
        sourceHex,
        docs: stepNode.$extensions?.cedar?.docs,
      });
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
   *   - scale tokens:     CSS clamp() string  (type = "dimension")
   *   - component/layout: resolved clamp() string via alias lookup (type = "dimension")
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
 * Fluid tokens (detected by clamp() in $value) are intended for web CSS only.
 * Non-web platforms should ignore clamp() tokens entirely.
 */
export async function loadSpacingTokens(): Promise<SpacingToken[]> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}canonical/tokens.json`);
  if (!res.ok) throw new Error(`Failed to fetch canonical/tokens.json: ${res.status}`);

  const tree = (await res.json()) as Record<string, unknown>;
  const spacingSection = tree["spacing"] as Record<string, unknown> | undefined;
  if (!spacingSection) return [];

  const result: SpacingToken[] = [];

  // Build a scale lookup: key → clamp() string
  const scaleMap = new Map<string, string>();
  const scale = spacingSection["scale"] as Record<string, unknown> | undefined;
  if (scale) {
    for (const [key, val] of Object.entries(scale)) {
      if (isLeaf(val) && typeof val.$value === "string" && val.$value.startsWith("clamp(")) {
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

// ─── Static spacing loader ─────────────────────────────────────────────────

export interface StaticSpacingToken {
  /** Dot-separated token path, e.g. "spacing.static.quarter.x" */
  path: string;
  /** Display name, e.g. "quarter-x" */
  name: string;
  /** Numeric value (from $value) */
  value: number;
  /** Unit — always "pt" for iOS static tokens */
  unit: "pt";
  /** Per-platform values from $extensions.cedar */
  platforms?: {
    web?: { light: string; dark: string };
    ios?: { light: string; dark: string };
  };
}

/**
 * Fetch the current token snapshot and extract static spacing tokens.
 * These are fixed-value tokens for platforms that don't support fluid clamp().
 * Walks spacing.static.* recursively, flattening nested keys with hyphens.
 */
export async function loadStaticSpacingTokens(): Promise<StaticSpacingToken[]> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}canonical/tokens.json`);
  if (!res.ok) throw new Error(`Failed to fetch canonical/tokens.json: ${res.status}`);

  const tree = (await res.json()) as Record<string, unknown>;
  const spacingSection = tree["spacing"] as Record<string, unknown> | undefined;
  if (!spacingSection) return [];

  const staticSection = spacingSection["static"] as Record<string, unknown> | undefined;
  if (!staticSection) return [];

  const result: StaticSpacingToken[] = [];
  flattenStaticTokens(staticSection, "spacing.static", "", result);
  return result;
}

function flattenStaticTokens(
  node: Record<string, unknown>,
  pathPrefix: string,
  namePrefix: string,
  out: StaticSpacingToken[],
): void {
  for (const [key, value] of Object.entries(node)) {
    const path = `${pathPrefix}.${key}`;
    const name = namePrefix ? `${namePrefix}-${key}` : key;

    if (isLeaf(value)) {
      const leaf = value as TokenLeaf;
      const cedar = leaf.$extensions?.cedar as Record<string, unknown> | undefined;
      out.push({
        path,
        name,
        value: parseFloat(leaf.$value) || 0,
        unit: "pt",
        platforms: cedar ? {
          web: cedar.web as { light: string; dark: string } | undefined,
          ios: cedar.ios as { light: string; dark: string } | undefined,
        } : undefined,
      });
    } else if (typeof value === "object" && value !== null) {
      flattenStaticTokens(value as Record<string, unknown>, path, name, out);
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
