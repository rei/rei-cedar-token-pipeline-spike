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
import fs from "node:fs";
import path from "node:path";
import type { Action } from "style-dictionary/types";
import { hexToCustomOklch } from "./oklch-formulas";
import {
  type CedarOptionNode,
  getTokenAtPath,
  resolveOptionHex,
} from "../../utils/option-resolver";

function formatOklch(hex: string, colorFamily?: string): string {
  return hexToCustomOklch(hex, colorFamily);
}

function renderColorDeclarations(
  cssVar: string,
  hex: string,
  colorFamily?: string
): string {
  return [
    `  ${cssVar}: ${hex};`,
    `  ${cssVar}: ${formatOklch(hex, colorFamily)};`,
  ].join("\n");
}

/** Convert dot-path token name to CSS custom property */
export function toCssVar(tokenPath: string[], subProperty?: string): string {
  let meaningful = [...tokenPath];

  if (meaningful[0] === "color" && meaningful[1] === "modes") {
    meaningful = meaningful.slice(3);
  } else if (meaningful[0] === "text" && meaningful[1] === "semantic") {
    meaningful.splice(1, 1);
  }

  if (subProperty) {
    const kebabSub = subProperty
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase();
    meaningful.push(kebabSub);
  }

  return `--cdr-${meaningful.join("-")}`;
}

/** Convert token ref syntax like {spacing.scale.-50} into var(--cdr-spacing-scale--50) */
export function toCssValue(value: unknown): string {
  if (typeof value === "number") {
    // Mitigate floating point precision issues (e.g., -0.25600001215934753 -> -0.256)
    const rounded = Math.round(value * 1000) / 1000;
    return String(rounded);
  }

  if (typeof value !== "string") {
    return String(value);
  }

  // Rewrite token aliases (e.g. "{text.size.fluid.400}" -> "var(--cdr-text-size-fluid-400)")
  return value.replace(/\{([^}]+)\}/g, (_match, refPath: string) => {
    const refSegments = refPath.split(".");
    return `var(${toCssVar(refSegments)})`;
  });
}

/**
 * Loops over composite typography tokens to generate their split CSS variables.
 * * @param token - Resolved token payload containing path and composite $value
 */
export function decomposeTypographyToken(token: {
  path: string[];
  $value: Record<string, unknown>;
}): Array<string> {
  const variables: Array<string> = [];

  for (const [propName, propValue] of Object.entries(token.$value)) {
    const line = `${toCssVar(token.path, propName)}: ${toCssValue(propValue)};`;
    variables.push(line);
  }

  return variables;
}

export const webCssAction: Action = {
  name: "web-css",

  do: (dictionary, config) => {
    const buildPath = config.buildPath ?? "dist/themes/rei-dot-com/css/";
    fs.mkdirSync(buildPath, { recursive: true });
    fs.mkdirSync(path.join(buildPath, "light"), { recursive: true });
    fs.mkdirSync(path.join(buildPath, "dark"), { recursive: true });

    // Organize color tokens by semantic category
    const colorSurface = { light: [] as string[], dark: [] as string[] };
    const colorText = { light: [] as string[], dark: [] as string[] };
    const colorBorder = { light: [] as string[], dark: [] as string[] };

    // Organize spacing tokens by type
    const spacingScale = { light: [] as string[], dark: [] as string[] };
    const spacingStatic = { light: [] as string[], dark: [] as string[] };
    const spacingComponent = { light: [] as string[], dark: [] as string[] };
    const spacingLayout = { light: [] as string[], dark: [] as string[] };

    // Organize typography tokens by type
    const typographyFamily = { light: [] as string[], dark: [] as string[] };
    const typographyLetterSpacing = {
      light: [] as string[],
      dark: [] as string[],
    };
    const typographyLineHeight = {
      light: [] as string[],
      dark: [] as string[],
    };
    const typographySizeStatic = {
      light: [] as string[],
      dark: [] as string[],
    };
    const typographySizeFluid = {
      light: [] as string[],
      dark: [] as string[],
    };
    const typographyStyle = { light: [] as string[], dark: [] as string[] };
    const typographyWeight = { light: [] as string[], dark: [] as string[] };
    const typographyHeadingSans = {
      light: [] as string[],
      dark: [] as string[],
    };
    const typographyHeadingTitle = {
      light: [] as string[],
      dark: [] as string[],
    };

    function pushColorByCategory(
      token: any,
      line: string,
      darkLine: string
    ): boolean {
      const category = token.path[3];
      if (category === "surface") {
        colorSurface.light.push(line);
        colorSurface.dark.push(darkLine);
        return true;
      }
      if (category === "text") {
        colorText.light.push(line);
        colorText.dark.push(darkLine);
        return true;
      }
      if (category === "border") {
        colorBorder.light.push(line);
        colorBorder.dark.push(darkLine);
        return true;
      }

      console.warn(
        `[web-css] Token ${
          token.name
        }: unknown semantic color category "${String(
          category
        )}" at path "${token.path.join(".")}"`
      );
      return false;
    }

    // Categorize color tokens
    const colorTokens = dictionary.allTokens.filter(
      (t) =>
        t.path[0] === "color" &&
        t.path[1] === "modes" &&
        t.path[2] === "default" &&
        t.$type === "color"
    );

    colorTokens.forEach((token) => {
      const resolved = (token.$extensions as any)?.cedar?.resolved?.web;
      if (
        resolved &&
        typeof resolved.light === "string" &&
        typeof resolved.dark === "string"
      ) {
        const cssVar = toCssVar(token.path);
        // colorFamily is not available on resolved semantic tokens; skip custom OKLCH for resolved path
        const line = renderColorDeclarations(cssVar, resolved.light);
        const darkLine = renderColorDeclarations(cssVar, resolved.dark);

        pushColorByCategory(token, line, darkLine);
        return;
      }

      const webCedar = (token.$extensions as any)?.cedar?.web;

      if (
        typeof webCedar?.light !== "string" ||
        typeof webCedar?.dark !== "string"
      ) {
        throw new Error(
          `[web-css] Token ${token.name}: missing $extensions.cedar.web { light, dark }. ` +
            `Expected string refs but got light=${typeof webCedar?.light}, dark=${typeof webCedar?.dark}. ` +
            `Ensure normalize.ts mergeColorVariants generated web option refs.`
        );
      }

      const lightOptionNode = getTokenAtPath(
        dictionary.tokens,
        webCedar.light
      ) as CedarOptionNode | undefined;
      const darkOptionNode = getTokenAtPath(
        dictionary.tokens,
        webCedar.dark
      ) as CedarOptionNode | undefined;

      if (!lightOptionNode || !darkOptionNode) {
        throw new Error(
          `[web-css] Token ${token.name}: could not resolve web option tokens. ` +
            `light="${webCedar.light}", dark="${webCedar.dark}".`
        );
      }

      const lightHex = resolveOptionHex(lightOptionNode, "web", "light");
      const darkHex = resolveOptionHex(darkOptionNode, "web", "dark");

      if (!lightHex || !darkHex) {
        throw new Error(
          `[web-css] Token ${token.name}: could not resolve web hex values. ` +
            `light="${webCedar.light}"→${lightHex}, dark="${webCedar.dark}"→${darkHex}.`
        );
      }

      const cssVar = toCssVar(token.path);
      const colorFamily = (lightOptionNode.$extensions as any)?.cedar
        ?.colorFamily;
      const line = renderColorDeclarations(cssVar, lightHex, colorFamily);
      const darkLine = renderColorDeclarations(cssVar, darkHex, colorFamily);

      pushColorByCategory(token, line, darkLine);
    });

    // Categorize spacing tokens
    const spacingTokens = dictionary.allTokens.filter(
      (t) => t.path[0] === "spacing"
    );

    spacingTokens.forEach((token) => {
      const raw = (token.value ?? token.$value) as string;
      if (typeof raw !== "string") return;

      const cssVar = toCssVar(token.path);
      const cssValue = toCssValue(raw);
      const line = `  ${cssVar}: ${cssValue};`;

      // Organize by spacing type (path[1]: scale, component, layout)
      const type = token.path[1];
      if (type === "scale") {
        spacingScale.light.push(line);
        spacingScale.dark.push(line);
      } else if (type === "static") {
        spacingStatic.light.push(line);
        spacingStatic.dark.push(line);
      } else if (type === "component") {
        spacingComponent.light.push(line);
        spacingComponent.dark.push(line);
      } else if (type === "layout") {
        spacingLayout.light.push(line);
        spacingLayout.dark.push(line);
      }
    });

    // Categorize typography tokens
    const typographyTokens = dictionary.allTokens.filter(
      (t) => t.path[0] === "text"
    );

    typographyTokens.forEach((token) => {
      const tokenValue = token.value ?? token.$value;
      const semanticTokensLines = decomposeTypographyToken({
        path: token.path,
        $value: tokenValue,
      });

      const raw = String(tokenValue);
      const cssVar = toCssVar(token.path);
      const cssValue = toCssValue(raw);

      const line = `  ${cssVar}: ${cssValue};`;

      // Organize by spacing type (path[1]: scale, component, layout)
      const type = token.path[1];
      const typePostfix = type === "semantic" ? token.path[3] : token.path[2];

      if (type === "family") {
        typographyFamily.light.push(line);
        typographyFamily.dark.push(line);
      } else if (type === "letter") {
        typographyLetterSpacing.light.push(line);
        typographyLetterSpacing.dark.push(line);
      } else if (type === "line") {
        typographyLineHeight.light.push(line);
        typographyLineHeight.dark.push(line);
      } else if (type === "size" && typePostfix === "static") {
        typographySizeStatic.light.push(line);
        typographySizeStatic.dark.push(line);
      } else if (type === "size" && typePostfix === "fluid") {
        typographySizeFluid.light.push(line);
        typographySizeFluid.dark.push(line);
      } else if (type === "style") {
        typographyStyle.light.push(line);
        typographyStyle.dark.push(line);
      } else if (type === "weight") {
        typographyWeight.light.push(line);
        typographyWeight.dark.push(line);
      } else if (type === "semantic" && typePostfix === "title") {
        typographyHeadingTitle.light = [...semanticTokensLines];
        typographyHeadingTitle.dark = [...semanticTokensLines];
      } else if (type === "semantic" && typePostfix === "sans") {
        typographyHeadingSans.light = [...semanticTokensLines];
        typographyHeadingSans.dark = [...semanticTokensLines];
      }
    });

    // Write modular CSS files
    const writeThemeFiles = (theme: "light" | "dark") => {
      const themeDir = path.join(buildPath, theme);
      const imports: string[] = [];

      // Color files
      if (colorSurface[theme].length > 0) {
        const css = `:root {\n${colorSurface[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-color-surface.css"), css);
        imports.push(`@import './${theme}/cdr-color-surface.css';`);
      }
      if (colorText[theme].length > 0) {
        const css = `:root {\n${colorText[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-color-text.css"), css);
        imports.push(`@import './${theme}/cdr-color-text.css';`);
      }
      if (colorBorder[theme].length > 0) {
        const css = `:root {\n${colorBorder[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-color-border.css"), css);
        imports.push(`@import './${theme}/cdr-color-border.css';`);
      }

      // Spacing files
      if (spacingScale[theme].length > 0) {
        const css = `:root {\n${spacingScale[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-spacing-scale.css"), css);
        imports.push(`@import './${theme}/cdr-spacing-scale.css';`);
      }

      if (spacingComponent[theme].length > 0) {
        const css = `:root {\n${spacingComponent[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-spacing-component.css"), css);
        imports.push(`@import './${theme}/cdr-spacing-component.css';`);
      }
      if (spacingLayout[theme].length > 0) {
        const css = `:root {\n${spacingLayout[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-spacing-layout.css"), css);
        imports.push(`@import './${theme}/cdr-spacing-layout.css';`);
      }

      // Typography files
      if (typographyFamily[theme].length > 0) {
        const css = `:root {\n${typographyFamily[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-text-family.css"), css);
        imports.push(`@import './${theme}/cdr-text-family.css';`);
      }

      if (typographyLetterSpacing[theme].length > 0) {
        const css = `:root {\n${typographyLetterSpacing[theme].join(
          "\n"
        )}\n}\n`;
        fs.writeFileSync(
          path.join(themeDir, "cdr-text-letter-spacing.css"),
          css
        );
        imports.push(`@import './${theme}/cdr-text-letter-spacing.css';`);
      }

      if (typographyLineHeight[theme].length > 0) {
        const css = `:root {\n${typographyLineHeight[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-text-line-height.css"), css);
        imports.push(`@import './${theme}/cdr-text-line-height.css';`);
      }

      if (typographySizeStatic[theme].length > 0) {
        const css = `:root {\n${typographySizeStatic[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-text-size-static.css"), css);
        imports.push(`@import './${theme}/cdr-text-size-static.css';`);
      }

      if (typographySizeFluid[theme].length > 0) {
        const css = `:root {\n${typographySizeFluid[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-text-size-fluid.css"), css);
        imports.push(`@import './${theme}/cdr-text-size-fluid.css';`);
      }

      if (typographyStyle[theme].length > 0) {
        const css = `:root {\n${typographyStyle[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-text-style.css"), css);
        imports.push(`@import './${theme}/cdr-text-style.css';`);
      }

      if (typographyWeight[theme].length > 0) {
        const css = `:root {\n${typographyWeight[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-text-weight.css"), css);
        imports.push(`@import './${theme}/cdr-text-weight.css';`);
      }

      if (typographyHeadingTitle[theme].length > 0) {
        const css = `:root {\n${typographyHeadingTitle[theme].join("\n")}\n}\n`;
        fs.writeFileSync(
          path.join(themeDir, "cdr-text-heading-title.css"),
          css
        );
        imports.push(`@import './${theme}/cdr-text-heading-title.css';`);
      }

      if (typographyHeadingSans[theme].length > 0) {
        const css = `:root {\n${typographyHeadingSans[theme].join("\n")}\n}\n`;
        fs.writeFileSync(path.join(themeDir, "cdr-text-heading-sans.css"), css);
        imports.push(`@import './${theme}/cdr-text-heading-sans.css';`);
      }

      // Write index file
      const indexCss = imports.join("\n") + "\n";
      fs.writeFileSync(path.join(buildPath, `cdr-${theme}.css`), indexCss);
    };

    writeThemeFiles("light");
    writeThemeFiles("dark");

    // Log generated files
    console.log(`  ✓ dist/themes/rei-dot-com/css/cdr-light.css (index)`);
    if (colorSurface.light.length > 0)
      console.log(
        `    ✓ cdr-color-surface.css (${colorSurface.light.length} tokens)`
      );
    if (colorText.light.length > 0)
      console.log(
        `    ✓ cdr-color-text.css (${colorText.light.length} tokens)`
      );
    if (colorBorder.light.length > 0)
      console.log(
        `    ✓ cdr-color-border.css (${colorBorder.light.length} tokens)`
      );
    if (spacingScale.light.length > 0)
      console.log(
        `    ✓ cdr-spacing-scale.css (${spacingScale.light.length} tokens)`
      );
    if (spacingComponent.light.length > 0)
      console.log(
        `    ✓ cdr-spacing-component.css (${spacingComponent.light.length} tokens)`
      );
    if (spacingLayout.light.length > 0)
      console.log(
        `    ✓ cdr-spacing-layout.css (${spacingLayout.light.length} tokens)`
      );
    if (typographyFamily.light.length > 0)
      console.log(
        `    ✓ cdr-text-family.css (${spacingComponent.light.length} tokens)`
      );
    if (typographyLetterSpacing.light.length > 0)
      console.log(
        `    ✓ cdr-text-letter-spacing.css (${spacingLayout.light.length} tokens)`
      );
    if (typographyLineHeight.light.length > 0)
      console.log(
        `    ✓ cdr-text-line-height.css (${spacingComponent.light.length} tokens)`
      );
    if (typographySizeStatic.light.length > 0)
      console.log(
        `    ✓ cdr-text-size-static.css (${typographySizeStatic.light.length} tokens)`
      );
    if (typographySizeFluid.light.length > 0)
      console.log(
        `    ✓ cdr-text-size-fluid.css (${typographySizeFluid.light.length} tokens)`
      );
    if (typographyWeight.light.length > 0)
      console.log(
        `    ✓ cdr-text-wight.css (${spacingLayout.light.length} tokens)`
      );

    console.log(`  ✓ dist/themes/rei-dot-com/css/cdr-dark.css (index)`);
    if (colorSurface.dark.length > 0)
      console.log(
        `    ✓ cdr-color-surface.css (${colorSurface.dark.length} tokens)`
      );
    if (colorText.dark.length > 0)
      console.log(`    ✓ cdr-color-text.css (${colorText.dark.length} tokens)`);
    if (colorBorder.dark.length > 0)
      console.log(
        `    ✓ cdr-color-border.css (${colorBorder.dark.length} tokens)`
      );
    if (spacingScale.dark.length > 0)
      console.log(
        `    ✓ cdr-spacing-scale.css (${spacingScale.dark.length} tokens)`
      );
    if (spacingComponent.dark.length > 0)
      console.log(
        `    ✓ cdr-spacing-component.css (${spacingComponent.dark.length} tokens)`
      );
    if (spacingLayout.dark.length > 0)
      console.log(
        `    ✓ cdr-spacing-layout.css (${spacingLayout.dark.length} tokens)`
      );
    if (typographyFamily.dark.length > 0)
      console.log(
        `    ✓ cdr-text-family.css (${spacingComponent.light.length} tokens)`
      );
    if (typographyLetterSpacing.dark.length > 0)
      console.log(
        `    ✓ cdr-text-letter-spacing.css (${spacingLayout.light.length} tokens)`
      );
    if (typographyLineHeight.dark.length > 0)
      console.log(
        `    ✓ cdr-text-line-height.css (${spacingComponent.light.length} tokens)`
      );
    if (typographySizeStatic.dark.length > 0)
      console.log(
        `    ✓ cdr-text-size-static.css (${typographySizeStatic.dark.length} tokens)`
      );
    if (typographySizeFluid.dark.length > 0)
      console.log(
        `    ✓ cdr-text-size-fluid.css (${typographySizeFluid.dark.length} tokens)`
      );
    if (typographyWeight.dark.length > 0)
      console.log(
        `    ✓ cdr-text-wight.css (${spacingLayout.light.length} tokens)`
      );
  },

  undo: (_dictionary, config) => {
    const buildPath = config.buildPath ?? "dist/themes/rei-dot-com/css/";
    const filesToRemove = [
      "cdr-light.css",
      "cdr-dark.css",
      "light/cdr-color-surface.css",
      "light/cdr-color-text.css",
      "light/cdr-color-border.css",
      "light/cdr-spacing-scale.css",
      "light/cdr-spacing-component.css",
      "light/cdr-spacing-layout.css",
      "dark/cdr-color-surface.css",
      "dark/cdr-color-text.css",
      "dark/cdr-color-border.css",
      "dark/cdr-spacing-scale.css",
      "dark/cdr-spacing-component.css",
      "dark/cdr-spacing-layout.css",
    ];
    filesToRemove.forEach((f) => {
      const p = path.join(buildPath, f);
      if (fs.existsSync(p)) fs.rmSync(p);
    });
    // Clean up directories if empty
    ["light", "dark"].forEach((dir) => {
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
