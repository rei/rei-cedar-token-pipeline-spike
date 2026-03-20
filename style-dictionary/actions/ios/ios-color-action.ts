import fs from 'node:fs';
import path from 'node:path';
import type { Action } from 'style-dictionary/types';
import { iosColorsetFormatter } from '../../formats/ios/ios-colorset';

type CedarOptionNode = {
  value?: unknown;
  $value?: unknown;
  $extensions?: {
    cedar?: {
      appearances?: Record<string, string>;
      platformOverrides?: Record<string, Record<string, string>>;
    };
  };
};

type CedarResolvedPlatform = {
  light: string;
  dark: string;
};

type CedarPlatformRefs = {
  light: string;
  dark: string;
};

/**
 * Resolve an option token node to its final hex for a given platform
 * and appearance, applying platform overrides and appearance values.
 *
 * Resolution order:
 *   1. $extensions.cedar.platformOverrides.<platform>.<appearance>  (most specific)
 *   2. $extensions.cedar.appearances.<appearance>                    (appearance variant)
 *   3. $value                                                        (web-light fallback)
 */
function resolveOptionHex(
  optionNode: CedarOptionNode | undefined,
  platform: 'ios' | 'web',
  appearance: 'light' | 'dark',
): string | undefined {
  const cedar = optionNode?.$extensions?.cedar;
  const platformOverride = cedar?.platformOverrides?.[platform]?.[appearance];
  if (platformOverride) return platformOverride;
  if (appearance === 'dark' && cedar?.appearances?.dark) return cedar.appearances.dark;
  // Fall back to $value — SD may have already resolved this to the hex string
  // (if the token passed through alias resolution) or it may still be a hex literal.
  const val = optionNode?.value ?? optionNode?.$value;
  return typeof val === 'string' ? val : undefined;
}

function hexToP3Components(hex: string) {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean.length === 8
        ? clean.substring(0, 6)
        : clean;
  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;
  const alpha =
    clean.length === 8
      ? (parseInt(clean.substring(6, 8), 16) / 255).toFixed(3)
      : '1.000';
  return { red: r.toFixed(4), green: g.toFixed(4), blue: b.toFixed(4), alpha };
}

function hexToP3(hex: string) {
  return { 'color-space': 'display-p3', components: hexToP3Components(hex) };
}

function hasLightDarkStrings(value: unknown): value is { light: string; dark: string } {
  return !!value && typeof value === 'object'
    && typeof (value as { light?: unknown }).light === 'string'
    && typeof (value as { dark?: unknown }).dark === 'string';
}

/**
 * Navigate dictionary.tokens by a dot-separated path.
 * SD v5 stores tokens as a nested object matching the source JSON structure.
 * Option tokens (color.option.*) are present in dictionary.tokens even though
 * they're filtered out of allTokens by the platform filter.
 */
function getTokenAtPath(tokens: any, dotPath: string): any {
  return dotPath.split('.').reduce<unknown>((node, seg) => {
    if (!node || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[seg];
  }, tokens);
}

function writeColorset(
  assetRoot: string,
  token: { name: string },
  lightHex: string,
  darkHex: string,
) {
  const transformedToken = {
    ...token,
    value: {
      light: hexToP3(lightHex),
      dark: hexToP3(darkHex),
    },
  };

  const folderPath = path.join(assetRoot, `${token.name}.colorset`);
  fs.mkdirSync(folderPath, { recursive: true });
  fs.writeFileSync(
    path.join(folderPath, 'Contents.json'),
    iosColorsetFormatter(transformedToken)
  );
}

export const iosColorsetAction: Action = {
  name: 'ios-colorset',

  do: (dictionary, config) => {
    const buildPath = config.buildPath ?? 'dist/ios/';
    const assetRoot = path.join(buildPath, 'Colors.xcassets');

    fs.mkdirSync(assetRoot, { recursive: true });

    fs.writeFileSync(
      path.join(assetRoot, 'Contents.json'),
      JSON.stringify({ info: { author: 'xcode', version: 1 } }, null, 2)
    );

    const colorTokens = dictionary.allTokens.filter(
      (token) =>
        token.path[0] === 'color' &&
        token.path[1] === 'modes' &&
        token.path[2] === 'default' &&
        token.$type === 'color'
    );

    colorTokens.forEach((token) => {
      const resolved = (token.$extensions as { cedar?: { resolved?: { ios?: unknown } } } | undefined)
        ?.cedar?.resolved?.ios;

      if (hasLightDarkStrings(resolved)) {
        writeColorset(assetRoot, token, resolved.light, resolved.dark);
        return;
      }

      // Read the iOS option token paths from $extensions.cedar.ios.
      // Shape: { light: "color.option.*", dark: "color.option.*" }
      // Stored as plain dot-path strings (no braces) — SD resolves any {ref} syntax
      // it finds in $extensions eagerly, replacing the string with resolved hex.
      // Plain strings bypass SD's resolver; the action looks them up directly.
      const iosCedar = (token.$extensions as { cedar?: { ios?: unknown } } | undefined)?.cedar?.ios;

      if (!hasLightDarkStrings(iosCedar)) {
        throw new Error(
          `Token ${token.name}: $extensions.cedar.ios must be { light, dark } path strings. ` +
          `Got: ${JSON.stringify(iosCedar)}. ` +
          `Ensure normalize.ts mergeColorVariants ran correctly.`
        );
      }

      const lightRefPath = (iosCedar as CedarPlatformRefs).light;
      const darkRefPath  = (iosCedar as CedarPlatformRefs).dark;

      // Look up the option token in dictionary.tokens (the full nested tree)
      const lightOptionNode = getTokenAtPath(dictionary.tokens, lightRefPath) as CedarOptionNode | undefined;
      const darkOptionNode  = getTokenAtPath(dictionary.tokens, darkRefPath) as CedarOptionNode | undefined;

      if (!lightOptionNode) {
        throw new Error(
          `Token ${token.name}: could not find light option token at "${lightRefPath}". ` +
          `Check canonical/tokens.json was built correctly.`
        );
      }
      if (!darkOptionNode) {
        throw new Error(
          `Token ${token.name}: could not find dark option token at "${darkRefPath}". ` +
          `Check canonical/tokens.json was built correctly.`
        );
      }

      const lightHex = resolveOptionHex(lightOptionNode, 'ios', 'light');
      const darkHex  = resolveOptionHex(darkOptionNode,  'ios', 'dark');

      if (!lightHex || !darkHex) {
        throw new Error(
          `Token ${token.name}: could not resolve iOS hex. ` +
          `light="${lightRefPath}"→${lightHex}, dark="${darkRefPath}"→${darkHex}. ` +
          `Check $extensions.cedar on the option tokens.`
        );
      }

      writeColorset(assetRoot, token, lightHex, darkHex);
    });
  },

  undo: (_dictionary, config) => {
    const buildPath = config.buildPath ?? 'dist/ios/';
    const assetRoot = path.join(buildPath, 'Colors.xcassets');
    if (fs.existsSync(assetRoot)) {
      fs.rmSync(assetRoot, { recursive: true, force: true });
    }
  },
};
