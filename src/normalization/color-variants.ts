type JsonObject = Record<string, unknown>;

type CedarOptionNode = JsonObject & {
  value?: unknown;
  $value?: unknown;
  $extensions?: {
    cedar?: {
      appearances?: Record<string, string>;
      platformOverrides?: Record<string, Record<string, string>>;
    };
  };
};

function walkSemanticTree(
  node: JsonObject,
  fn: (token: JsonObject, path: string[]) => void,
  currentPath: string[] = [],
) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (value && typeof value === "object" && "$value" in value) {
      fn(value as JsonObject, [...currentPath, key]);
    } else if (value && typeof value === "object") {
      walkSemanticTree(value as JsonObject, fn, [...currentPath, key]);
    }
  }
}

/**
 * Walk every alias color token in each palette mode and:
 *   1. Write platform+appearance option-token references into $extensions.cedar
 *   2. Stamp $meta onto each palette root
 *   3. Write appearance values and platform overrides onto option tokens
 *   4. Write resolved platform+appearance hex values onto alias tokens
 *
 * After this runs, each alias token carries:
 *   $extensions.cedar: {
 *     ios: { light: "color.option.*", dark: "color.option.*" },
 *     web: { light: "color.option.*", dark: "color.option.*" },
 *     resolved: {
 *       ios: { light: "#hex", dark: "#hex" },
 *       web: { light: "#hex", dark: "#hex" }
 *     }
 *   }
 *
 * Each option token receives appearance and override data:
 *   $value:                               web-light hex (canonical fallback)
 *   $extensions.cedar.appearances.dark:   web-dark hex
 *   $extensions.cedar.platformOverrides:  { ios: { light: "#hex", dark: "#hex" } }
 *     (only written when ios differs from web)
 */
export function mergeColorVariants(
  canonical: JsonObject,
  platformLookup: Map<string, Record<string, string>>,
) {
  const color = canonical.color as JsonObject | undefined;
  const modes = color?.modes as Record<string, JsonObject> | undefined;
  if (!modes) return;

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

  function getNodeAt(path: string): CedarOptionNode | undefined {
    const segments = path.split(".");
    let cursor: unknown = canonical;
    for (const seg of segments) {
      if (!cursor || typeof cursor !== "object") return undefined;
      cursor = (cursor as JsonObject)[seg];
      if (!cursor) return undefined;
    }
    return cursor as CedarOptionNode;
  }

  function resolveOptionValue(
    optionNode: CedarOptionNode | undefined,
    platform: string,
    appearance: string,
  ): string | undefined {
    const cedar = optionNode?.$extensions?.cedar;
    const platformOverride = cedar?.platformOverrides?.[platform]?.[appearance];
    if (typeof platformOverride === "string") return platformOverride;

    if (appearance === "dark") {
      const darkAppearance = cedar?.appearances?.dark;
      if (typeof darkAppearance === "string") return darkAppearance;
    }

    const base = optionNode?.$value ?? optionNode?.value;
    return typeof base === "string" ? base : undefined;
  }

  const webLight = platformLookup.get("web-light") ?? {};
  const webDark = platformLookup.get("web-dark") ?? {};
  const iosLight = platformLookup.get("ios-light") ?? {};
  const iosDark = platformLookup.get("ios-dark") ?? {};

  for (const canonicalPath of Object.keys(webLight)) {
    const optionNode = getNodeAt(canonicalPath);
    if (!optionNode) continue;

    const darkHex = webDark[canonicalPath];
    const hasDark = !!darkHex && darkHex !== webLight[canonicalPath];

    const iosLightHex = iosLight[canonicalPath];
    const iosDarkHex = iosDark[canonicalPath];
    const iosLightDiffers = !!iosLightHex && iosLightHex !== webLight[canonicalPath];
    const iosDarkDiffers =
      !!iosDarkHex && iosDarkHex !== (webDark[canonicalPath] ?? webLight[canonicalPath]);
    const hasIosOverrides = iosLightDiffers || iosDarkDiffers;

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

  for (const [modeName, modeTree] of Object.entries(modes)) {
    const meta = paletteMetadata[modeName] ?? {
      scope: "surface" as const,
      inheritsFrom: "default",
      cssAttribute: "data-palette",
    };

    const modeTreeObject = modeTree as JsonObject & {
      $extensions?: { cedar?: JsonObject & { $meta?: unknown } };
    };
    modeTreeObject.$extensions = modeTreeObject.$extensions ?? {};
    modeTreeObject.$extensions.cedar = modeTreeObject.$extensions.cedar ?? {};
    modeTreeObject.$extensions.cedar.$meta = meta;

    walkSemanticTree(modeTree, (token) => {
      const aliasRef = token.$value;
      if (typeof aliasRef !== "string" || !aliasRef.startsWith("{")) return;

      const canonicalPath = aliasRef.slice(1, -1);
      if (!canonicalPath.startsWith("color.option.")) return;

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
            `Check src/schema/token-schema.json (inputs.figma.collections) and options.color.*.json files.`,
        );
        return;
      }

      const tokenWithExtensions = token as JsonObject & { $extensions?: { cedar?: JsonObject } };
      tokenWithExtensions.$extensions = tokenWithExtensions.$extensions ?? {};
      tokenWithExtensions.$extensions.cedar = tokenWithExtensions.$extensions.cedar ?? {};
      Object.assign(tokenWithExtensions.$extensions.cedar, platformRefs);

      const resolved: Record<string, Record<string, string>> = {};

      for (const [platform, appearances] of Object.entries(platformRefs)) {
        for (const [appearance, optionPath] of Object.entries(appearances)) {
          const optionNode = getNodeAt(optionPath);
          const resolvedValue = resolveOptionValue(optionNode, platform, appearance);
          if (!resolvedValue) continue;

          resolved[platform] = resolved[platform] ?? {};
          resolved[platform][appearance] = resolvedValue;
        }
      }

      if (Object.keys(resolved).length > 0) {
        tokenWithExtensions.$extensions.cedar.resolved = resolved;
      }
    });
  }
}
