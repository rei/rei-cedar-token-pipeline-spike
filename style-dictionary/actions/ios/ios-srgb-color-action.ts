import fs from 'node:fs';
import path from 'node:path';
import type { Action } from 'style-dictionary/types';
import { parse } from 'culori';
import { iosSrgbColorsetFormatter } from '../../formats/ios/ios-srgb-colorset.js';
import { type CedarOptionNode, getTokenAtPath, resolveOptionHex } from '../../utils/option-resolver.js';

type CedarPlatformRefs = {
  light: string;
  dark: string;
};

function formatNumber(value: number, precision: number): string {
  const rounded = Number(value.toFixed(precision));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function hexToSrgbComponents(hex: string) {
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`[ios-srgb-colorset] Could not parse color value "${hex}"`);
  }

  const r = typeof parsed.r === 'number' ? formatNumber(parsed.r, 4) : '0';
  const g = typeof parsed.g === 'number' ? formatNumber(parsed.g, 4) : '0';
  const b = typeof parsed.b === 'number' ? formatNumber(parsed.b, 4) : '0';
  const alpha = typeof parsed.alpha === 'number' ? formatNumber(parsed.alpha, 3) : '1.000';

  return { red: r, green: g, blue: b, alpha };
}

function hexToSrgb(hex: string) {
  return { "sRGB": hexToSrgbComponents(hex) };
}

function hasLightDarkStrings(
  value: unknown
): value is { light: string; dark: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { light?: unknown }).light === "string" &&
    typeof (value as { dark?: unknown }).dark === "string"
  );
}

function writeColorset(
  assetRoot: string,
  token: { name: string },
  lightHex: string,
  darkHex: string
) {
  const transformedToken = {
    ...token,
    value: {
      light: hexToSrgb(lightHex),
      dark: hexToSrgb(darkHex),
    },
  };

  const folderPath = path.join(assetRoot, `cdr-${token.name}.colorset`);
  fs.mkdirSync(folderPath, { recursive: true });
  fs.writeFileSync(
    path.join(folderPath, "Contents.json"),
    iosSrgbColorsetFormatter(transformedToken)
  );
}

export const iosSrgbColorsetAction: Action = {
  name: "ios-srgb-colorset",

  do: (dictionary, config) => {
    const buildPath = config.buildPath ?? "dist/themes/rei-dot-com/ios-cocoapods/";
    const assetRoot = path.join(buildPath, "CdrColors.xcassets");

    fs.mkdirSync(assetRoot, { recursive: true });

    fs.writeFileSync(
      path.join(assetRoot, "Contents.json"),
      JSON.stringify({ info: { author: "xcode", version: 1 } }, null, 2)
    );

    const colorTokens = dictionary.allTokens.filter(
      (token) =>
        token.path[0] === "color" &&
        token.path[1] === "modes" &&
        token.path[2] === "default" &&
        token.$type === "color"
    );

    colorTokens.forEach((token) => {
      const resolved = (
        token.$extensions as
          | { cedar?: { resolved?: { ios?: unknown } } }
          | undefined
      )?.cedar?.resolved?.ios;

      if (hasLightDarkStrings(resolved)) {
        writeColorset(assetRoot, token, resolved.light, resolved.dark);
        return;
      }

      const iosCedar = (
        token.$extensions as { cedar?: { ios?: unknown } } | undefined
      )?.cedar?.ios;

      if (!hasLightDarkStrings(iosCedar)) {
        throw new Error(
          `Token ${token.name}: $extensions.cedar.ios must be { light, dark } path strings. ` +
            `Got: ${JSON.stringify(iosCedar)}. ` +
            `Ensure normalize.ts mergeColorVariants ran correctly.`
        );
      }

      const lightRefPath = (iosCedar as CedarPlatformRefs).light;
      const darkRefPath = (iosCedar as CedarPlatformRefs).dark;

      const lightOptionNode = getTokenAtPath(
        dictionary.tokens,
        lightRefPath
      ) as CedarOptionNode | undefined;
      const darkOptionNode = getTokenAtPath(dictionary.tokens, darkRefPath) as
        | CedarOptionNode
        | undefined;

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

      const lightHex = resolveOptionHex(lightOptionNode, "ios", "light");
      const darkHex = resolveOptionHex(darkOptionNode, "ios", "dark");

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
    const buildPath = config.buildPath ?? "dist/themes/rei-dot-com/ios-cocoapods/";
    const assetRoot = path.join(buildPath, "CdrColors.xcassets");
    if (fs.existsSync(assetRoot)) {
      fs.rmSync(assetRoot, { recursive: true, force: true });
    }
  },
};
