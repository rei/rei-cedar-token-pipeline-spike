/**
 * web-css-transform.ts
 *
 * Minimal CSS output for the web platform. Generates two files:
 *   dist/css/light.css  — :root { --cdr-* } with web-light values
 *   dist/css/dark.css   — :root { --cdr-* } with web-dark values
 *
 * Resolution order for each token's CSS value:
 *   light: option.$value                           (web-light canonical)
 *   dark:  option.$extensions.cedar.appearances.dark  (web-dark override)
 *          falling back to option.$value if no dark variant exists
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Action } from 'style-dictionary/types';

/** Navigate dictionary.tokens by dot-separated path */
function getTokenAtPath(tokens: any, dotPath: string): any {
  return dotPath.split('.').reduce(
    (node: any, seg: string) => node?.[seg],
    tokens
  );
}

/** Convert dot-path token name to CSS custom property */
function toCssVar(tokenPath: string[]): string {
  // Drop structural scaffolding: color, modes, <palette>
  const meaningful =
    tokenPath[0] === 'color' && tokenPath[1] === 'modes'
      ? tokenPath.slice(3)
      : tokenPath;
  return `--cdr-${meaningful.join('-')}`;
}

export const webCssAction: Action = {
  name: 'web-css',

  do: (dictionary, config) => {
    const buildPath = config.buildPath ?? 'dist/css/';
    fs.mkdirSync(buildPath, { recursive: true });

    const colorTokens = dictionary.allTokens.filter(
      (t) =>
        t.path[0] === 'color' &&
        t.path[1] === 'modes' &&
        t.path[2] === 'default' &&
        t.$type === 'color'
    );

    const lightLines: string[] = [];
    const darkLines:  string[] = [];

    colorTokens.forEach((token) => {
      const webCedar = (token.$extensions as any)?.cedar?.web;

      if (!webCedar?.light || !webCedar?.dark) {
        console.warn(`[web-css] Token ${token.name}: missing $extensions.cedar.web`);
        return;
      }

      // Resolve the option token for light and dark
      const lightOptionNode = getTokenAtPath(dictionary.tokens, webCedar.light);
      const darkOptionNode  = getTokenAtPath(dictionary.tokens, webCedar.dark);

      if (!lightOptionNode || !darkOptionNode) {
        console.warn(`[web-css] Token ${token.name}: could not resolve option tokens`);
        return;
      }

      // Light: use $value (web-light canonical)
      const lightHex = lightOptionNode.value ?? lightOptionNode.$value;

      // Dark: use appearances.dark override if present, else $value
      const darkHex =
        lightOptionNode.$extensions?.cedar?.appearances?.dark ??
        darkOptionNode.value ??
        darkOptionNode.$value;

      const cssVar = toCssVar(token.path);
      lightLines.push(`  ${cssVar}: ${lightHex};`);
      darkLines.push(`  ${cssVar}: ${darkHex};`);
    });

    const lightCss = `:root {\n${lightLines.join('\n')}\n}\n`;
    const darkCss  = `:root {\n${darkLines.join('\n')}\n}\n`;

    fs.writeFileSync(path.join(buildPath, 'light.css'), lightCss);
    fs.writeFileSync(path.join(buildPath, 'dark.css'),  darkCss);

    console.log(`  ✓ dist/css/light.css (${lightLines.length} tokens)`);
    console.log(`  ✓ dist/css/dark.css  (${darkLines.length} tokens)`);
  },

  undo: (_dictionary, config) => {
    const buildPath = config.buildPath ?? 'dist/css/';
    ['light.css', 'dark.css'].forEach((f) => {
      const p = path.join(buildPath, f);
      if (fs.existsSync(p)) fs.rmSync(p);
    });
  },
};
