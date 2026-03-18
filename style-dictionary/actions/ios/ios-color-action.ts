import fs from 'node:fs';
import path from 'node:path';
import type { Action } from 'style-dictionary/types';
import { iosColorsetFormatter } from '../../formats/ios/ios-colorset';

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
  optionNode: any,
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

/**
 * Navigate dictionary.tokens by a dot-separated path.
 * SD v5 stores tokens as a nested object matching the source JSON structure.
 * Option tokens (color.option.*) are present in dictionary.tokens even though
 * they're filtered out of allTokens by the platform filter.
 */
function getTokenAtPath(tokens: any, dotPath: string): any {
  return dotPath.split('.').reduce((node: any, seg: string) => {
    if (node == null) return undefined;
    return node[seg];
  }, tokens);
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
      // Read the iOS option token paths from $extensions.cedar.ios.
      // Shape: { light: "color.option.*", dark: "color.option.*" }
      // Stored as plain dot-path strings (no braces) — SD resolves any {ref} syntax
      // it finds in $extensions eagerly, replacing the string with resolved hex.
      // Plain strings bypass SD's resolver; the action looks them up directly.
      const iosCedar = (token.$extensions as any)?.cedar?.ios;

      if (!iosCedar || typeof iosCedar !== 'object' ||
          typeof iosCedar.light !== 'string' || typeof iosCedar.dark !== 'string') {
        throw new Error(
          `Token ${token.name}: $extensions.cedar.ios must be { light, dark } path strings. ` +
          `Got: ${JSON.stringify(iosCedar)}. ` +
          `Ensure normalize.ts mergeColorVariants ran correctly.`
        );
      }

      const lightRefPath = iosCedar.light;
      const darkRefPath  = iosCedar.dark;

      // Look up the option token in dictionary.tokens (the full nested tree)
      const lightOptionNode = getTokenAtPath(dictionary.tokens, lightRefPath);
      const darkOptionNode  = getTokenAtPath(dictionary.tokens, darkRefPath);

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

      const transformedToken = {
        ...token,
        value: {
          light: hexToP3(lightHex),
          dark:  hexToP3(darkHex),
        },
      };

      const folderPath = path.join(assetRoot, `${token.name}.colorset`);
      fs.mkdirSync(folderPath, { recursive: true });
      fs.writeFileSync(
        path.join(folderPath, 'Contents.json'),
        iosColorsetFormatter(transformedToken)
      );
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
