/**
 * option-resolver.ts
 *
 * Shared utilities for resolving option tokens to hex values in platform actions.
 * Used by both web-css-transform.ts and ios-color-action.ts.
 */

export type CedarOptionNode = {
  value?: unknown;
  $value?: unknown;
  $extensions?: {
    cedar?: {
      appearances?: Record<string, string>;
      platformOverrides?: Record<string, Record<string, string>>;
      colorFamily?: string;
    };
  };
};

/**
 * Navigate dictionary.tokens by a dot-separated path.
 * SD v5 stores tokens as a nested object matching the source JSON structure.
 */
export function getTokenAtPath(tokens: any, dotPath: string): any {
  return dotPath
    .split(".")
    .reduce<unknown>((node, seg) => {
      if (!node || typeof node !== "object") return undefined;
      return (node as Record<string, unknown>)[seg];
    }, tokens);
}

/**
 * Resolve an option token node to its final hex for a given platform
 * and appearance, applying platform overrides and appearance values.
 *
 * Resolution order:
 *   1. $extensions.cedar.platformOverrides.<platform>.<appearance>  (most specific)
 *   2. $extensions.cedar.appearances.<appearance>                    (appearance variant)
 *   3. $value                                                        (web-light fallback)
 */
export function resolveOptionHex(
  optionNode: CedarOptionNode | undefined,
  platform: "ios" | "web" | "android",
  appearance: "light" | "dark",
): string | undefined {
  const cedar = optionNode?.$extensions?.cedar;
  const platformOverride = cedar?.platformOverrides?.[platform]?.[appearance];
  if (platformOverride) return platformOverride;
  if (appearance === "dark" && cedar?.appearances?.dark)
    return cedar.appearances.dark;
  const val = optionNode?.value ?? optionNode?.$value;
  return typeof val === "string" ? val : undefined;
}
