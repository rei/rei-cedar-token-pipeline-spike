/**
 * load-tokens.ts
 *
 * Utility to fetch and extract token data from snapshots at runtime.
 * This allows color stories to display the latest token values dynamically.
 */

interface TokenLeaf {
  $value: string;
  $type: string;
}

/**
 * Fetch the current token snapshot and extract color tokens.
 * Returns a map of token paths to their hex values.
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

  // Extract semantic color tokens (color.text.*, color.surface.*, color.border.*)
  const colorSection = tree["color"] as Record<string, unknown> | undefined;
  if (colorSection) {
    // Process semantic tokens (text, surface, border)
    const semanticCategories = ["text", "surface", "border"];
    for (const category of semanticCategories) {
      const group = colorSection[category] as Record<string, unknown> | undefined;
      if (group) {
        for (const [key, value] of Object.entries(group)) {
          if (isLeaf(value)) {
            const leaf = value as TokenLeaf;
            // For semantic tokens, the $value is an alias like {color.neutral-palette.blue.600}
            // Extract the target path and resolve to the primitive value
            const resolvedHex = resolveAlias(leaf.$value, colorSection);
            result.set(`color.${category}.${key}`, {
              hex: resolvedHex || leaf.$value,
              ref: buildRef(leaf.$value),
            });
          }
        }
      }
    }
  }

  return result;
}

/**
 * Fetch the current token snapshot and extract primitive color tokens.
 * Returns an array of { name, value } objects.
 */
export async function loadPrimitiveColors(): Promise<
  Array<{ name: string; value: string }>
> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const res = await fetch(`${base}normalized/current.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch current.json: ${res.status}`);
  }

  const tree = (await res.json()) as Record<string, unknown>;
  const result: Array<{ name: string; value: string }> = [];

  // Extract primitive color tokens
  const colorSection = tree["color"] as Record<string, unknown> | undefined;
  if (colorSection) {
    // Process primitive palettes: neutral-palette, brand-palette
    const primitives = ["neutral-palette", "brand-palette"];
    for (const palette of primitives) {
      const group = colorSection[palette] as Record<string, unknown> | undefined;
      if (group) {
        flattenTokens(group, palette, result);
      }
    }
  }

  return result;
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
