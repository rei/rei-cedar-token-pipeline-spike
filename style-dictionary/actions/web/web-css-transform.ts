/**
 * web-css-transform.ts
 *
 * Modular CSS output for the web platform organized by semantic category:
 *
 * Light theme:
 *   dist/themes/rei-dot-com/css/cdr-light.css                     — @import index for light theme
 *   dist/themes/rei-dot-com/css/light/cdr-color-surface.css       — Surface color tokens
 *   dist/themes/rei-dot-com/css/light/cdr-color-text.css          — Text color tokens
 *   dist/themes/rei-dot-com/css/light/cdr-color-border.css        — Border color tokens
 *   dist/themes/rei-dot-com/css/light/cdr-spacing-scale.css       — Responsive spacing scale
 *   dist/themes/rei-dot-com/css/light/cdr-spacing-component.css   — Component spacing aliases
 *   dist/themes/rei-dot-com/css/light/cdr-spacing-layout.css      — Layout spacing aliases
 *
 * Dark theme: Same structure under dist/themes/rei-dot-com/css/dark/
 *
 * Resolution order for color values:
 *   light: option.$value                           (web-light canonical)
 *   dark:  option.$extensions.cedar.appearances.dark  (web-dark override)
 *          falling back to option.$value if no dark variant exists
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Action } from 'style-dictionary/types';

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

/** Convert token ref syntax like {spacing.scale.-50} into var(--cdr-spacing-scale--50) */
function toCssValue(value: string): string {
  return value.replace(/\{([^}]+)\}/g, (_match, refPath: string) => {
    const refSegments = refPath.split('.');
    return `var(${toCssVar(refSegments)})`;
  });
}

function resolveOptionHex(optionNode: CedarOptionNode | undefined, appearance: 'light' | 'dark') {
  const cedar = optionNode?.$extensions?.cedar;
  const platformOverride = cedar?.platformOverrides?.web?.[appearance];
  if (platformOverride) return platformOverride;
  if (appearance === 'dark' && cedar?.appearances?.dark) return cedar.appearances.dark;

  const val = optionNode?.value ?? optionNode?.$value;
  return typeof val === 'string' ? val : undefined;
}

export const webCssAction: Action = {
  name: 'web-css',

  do: (dictionary, config) => {
    const buildPath = config.buildPath ?? 'dist/themes/rei-dot-com/css/';
    fs.mkdirSync(buildPath, { recursive: true });
    fs.mkdirSync(path.join(buildPath, 'light'), { recursive: true });
    fs.mkdirSync(path.join(buildPath, 'dark'), { recursive: true });

    // Organize color tokens by semantic category
    const colorSurface = { light: [] as string[], dark: [] as string[] };
    const colorText = { light: [] as string[], dark: [] as string[] };
    const colorBorder = { light: [] as string[], dark: [] as string[] };

    // Organize spacing tokens by type
    const spacingScale = { light: [] as string[], dark: [] as string[] };
    const spacingComponent = { light: [] as string[], dark: [] as string[] };
    const spacingLayout = { light: [] as string[], dark: [] as string[] };

    function pushColorByCategory(token: any, line: string, darkLine: string): boolean {
      const category = token.path[3];
      if (category === 'surface') {
        colorSurface.light.push(line);
        colorSurface.dark.push(darkLine);
        return true;
      }
      if (category === 'text') {
        colorText.light.push(line);
        colorText.dark.push(darkLine);
        return true;
      }
      if (category === 'border') {
        colorBorder.light.push(line);
        colorBorder.dark.push(darkLine);
        return true;
      }

      console.warn(
        `[web-css] Token ${token.name}: unknown semantic color category "${String(category)}" at path "${token.path.join('.')}"`
      );
      return false;
    }

    // Categorize color tokens
    const colorTokens = dictionary.allTokens.filter(
      (t) =>
        t.path[0] === 'color' &&
        t.path[1] === 'modes' &&
        t.path[2] === 'default' &&
        t.$type === 'color'
    );

    colorTokens.forEach((token) => {
      const resolved = (token.$extensions as any)?.cedar?.resolved?.web;
      if (resolved && typeof resolved.light === 'string' && typeof resolved.dark === 'string') {
        const cssVar = toCssVar(token.path);
        const line = `  ${cssVar}: ${resolved.light};`;
        const darkLine = `  ${cssVar}: ${resolved.dark};`;

        pushColorByCategory(token, line, darkLine);
        return;
      }

      const webCedar = (token.$extensions as any)?.cedar?.web;

      if (
        typeof webCedar?.light !== 'string' ||
        typeof webCedar?.dark !== 'string'
      ) {
        throw new Error(
          `[web-css] Token ${token.name}: missing $extensions.cedar.web { light, dark }. ` +
          `Expected string refs but got light=${typeof webCedar?.light}, dark=${typeof webCedar?.dark}. ` +
          `Ensure normalize.ts mergeColorVariants generated web option refs.`
        );
      }

      const lightOptionNode = getTokenAtPath(dictionary.tokens, webCedar.light) as CedarOptionNode | undefined;
      const darkOptionNode = getTokenAtPath(dictionary.tokens, webCedar.dark) as CedarOptionNode | undefined;

      if (!lightOptionNode || !darkOptionNode) {
        throw new Error(
          `[web-css] Token ${token.name}: could not resolve web option tokens. ` +
          `light="${webCedar.light}", dark="${webCedar.dark}".`
        );
      }

      const lightHex = resolveOptionHex(lightOptionNode, 'light');
      const darkHex = resolveOptionHex(darkOptionNode, 'dark');

      if (!lightHex || !darkHex) {
        throw new Error(
          `[web-css] Token ${token.name}: could not resolve web hex values. ` +
          `light="${webCedar.light}"→${lightHex}, dark="${webCedar.dark}"→${darkHex}.`
        );
      }

      const cssVar = toCssVar(token.path);
      const line = `  ${cssVar}: ${lightHex};`;
      const darkLine = `  ${cssVar}: ${darkHex};`;

      pushColorByCategory(token, line, darkLine);
    });

    // Categorize spacing tokens
    const spacingTokens = dictionary.allTokens.filter((t) => t.path[0] === 'spacing');

    spacingTokens.forEach((token) => {
      const raw = (token.value ?? token.$value) as string;
      if (typeof raw !== 'string') return;

      const cssVar = toCssVar(token.path);
      const cssValue = toCssValue(raw);
      const line = `  ${cssVar}: ${cssValue};`;

      // Organize by spacing type (path[1]: scale, component, layout)
      const type = token.path[1];
      if (type === 'scale') {
        spacingScale.light.push(line);
        spacingScale.dark.push(line);
      } else if (type === 'component') {
        spacingComponent.light.push(line);
        spacingComponent.dark.push(line);
      } else if (type === 'layout') {
        spacingLayout.light.push(line);
        spacingLayout.dark.push(line);
      }
    });

    // Write modular CSS files
    const writeThemeFiles = (theme: 'light' | 'dark') => {
      const themeDir = path.join(buildPath, theme);
      const imports: string[] = [];

      // Color files
      if (colorSurface[theme].length > 0) {
        const css = `:root {\n${colorSurface[theme].join('\n')}\n}\n`;
        fs.writeFileSync(path.join(themeDir, 'cdr-color-surface.css'), css);
        imports.push(`@import './${theme}/cdr-color-surface.css';`);
      }
      if (colorText[theme].length > 0) {
        const css = `:root {\n${colorText[theme].join('\n')}\n}\n`;
        fs.writeFileSync(path.join(themeDir, 'cdr-color-text.css'), css);
        imports.push(`@import './${theme}/cdr-color-text.css';`);
      }
      if (colorBorder[theme].length > 0) {
        const css = `:root {\n${colorBorder[theme].join('\n')}\n}\n`;
        fs.writeFileSync(path.join(themeDir, 'cdr-color-border.css'), css);
        imports.push(`@import './${theme}/cdr-color-border.css';`);
      }

      // Spacing files
      if (spacingScale[theme].length > 0) {
        const css = `:root {\n${spacingScale[theme].join('\n')}\n}\n`;
        fs.writeFileSync(path.join(themeDir, 'cdr-spacing-scale.css'), css);
        imports.push(`@import './${theme}/cdr-spacing-scale.css';`);
      }
      if (spacingComponent[theme].length > 0) {
        const css = `:root {\n${spacingComponent[theme].join('\n')}\n}\n`;
        fs.writeFileSync(path.join(themeDir, 'cdr-spacing-component.css'), css);
        imports.push(`@import './${theme}/cdr-spacing-component.css';`);
      }
      if (spacingLayout[theme].length > 0) {
        const css = `:root {\n${spacingLayout[theme].join('\n')}\n}\n`;
        fs.writeFileSync(path.join(themeDir, 'cdr-spacing-layout.css'), css);
        imports.push(`@import './${theme}/cdr-spacing-layout.css';`);
      }

      // Write index file
      const indexCss = imports.join('\n') + '\n';
      fs.writeFileSync(path.join(buildPath, `cdr-${theme}.css`), indexCss);
    };

    writeThemeFiles('light');
    writeThemeFiles('dark');

    // Log generated files
    console.log(`  ✓ dist/themes/rei-dot-com/css/cdr-light.css (index)`);
    if (colorSurface.light.length > 0) console.log(`    ✓ cdr-color-surface.css (${colorSurface.light.length} tokens)`);
    if (colorText.light.length > 0) console.log(`    ✓ cdr-color-text.css (${colorText.light.length} tokens)`);
    if (colorBorder.light.length > 0) console.log(`    ✓ cdr-color-border.css (${colorBorder.light.length} tokens)`);
    if (spacingScale.light.length > 0) console.log(`    ✓ cdr-spacing-scale.css (${spacingScale.light.length} tokens)`);
    if (spacingComponent.light.length > 0) console.log(`    ✓ cdr-spacing-component.css (${spacingComponent.light.length} tokens)`);
    if (spacingLayout.light.length > 0) console.log(`    ✓ cdr-spacing-layout.css (${spacingLayout.light.length} tokens)`);

    console.log(`  ✓ dist/themes/rei-dot-com/css/cdr-dark.css (index)`);
    if (colorSurface.dark.length > 0) console.log(`    ✓ cdr-color-surface.css (${colorSurface.dark.length} tokens)`);
    if (colorText.dark.length > 0) console.log(`    ✓ cdr-color-text.css (${colorText.dark.length} tokens)`);
    if (colorBorder.dark.length > 0) console.log(`    ✓ cdr-color-border.css (${colorBorder.dark.length} tokens)`);
    if (spacingScale.dark.length > 0) console.log(`    ✓ cdr-spacing-scale.css (${spacingScale.dark.length} tokens)`);
    if (spacingComponent.dark.length > 0) console.log(`    ✓ cdr-spacing-component.css (${spacingComponent.dark.length} tokens)`);
    if (spacingLayout.dark.length > 0) console.log(`    ✓ cdr-spacing-layout.css (${spacingLayout.dark.length} tokens)`);
  },

  undo: (_dictionary, config) => {
    const buildPath = config.buildPath ?? 'dist/themes/rei-dot-com/css/';
    const filesToRemove = [
      'cdr-light.css', 'cdr-dark.css',
      'light/cdr-color-surface.css', 'light/cdr-color-text.css', 'light/cdr-color-border.css',
      'light/cdr-spacing-scale.css', 'light/cdr-spacing-component.css', 'light/cdr-spacing-layout.css',
      'dark/cdr-color-surface.css', 'dark/cdr-color-text.css', 'dark/cdr-color-border.css',
      'dark/cdr-spacing-scale.css', 'dark/cdr-spacing-component.css', 'dark/cdr-spacing-layout.css',
    ];
    filesToRemove.forEach((f) => {
      const p = path.join(buildPath, f);
      if (fs.existsSync(p)) fs.rmSync(p);
    });
    // Clean up directories if empty
    ['light', 'dark'].forEach((dir) => {
      const p = path.join(buildPath, dir);
      try {
        if (fs.existsSync(p) && fs.readdirSync(p).length === 0) {
          fs.rmdirSync(p);
        }
      } catch {
        // ignore
      }
    });
  },
};
