import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parse, converter } from "culori";

const toOklch = converter("oklch");

/**
 * Figma Color Spec Validation
 *
 * Validates that the hex values exported from Figma match the design spec's
 * intended OKLCH values. This catches transcription errors where a designer
 * or developer enters a hex value that doesn't match the formula output.
 *
 * The spec is defined as OKLCH (L, C, H) per family per step. The test
 * converts each Figma hex to OKLCH and asserts the values are within
 * tolerance of the spec.
 */

type SpecEntry = { l: number; c: number; h: number };

/**
 * Design spec OKLCH values per family per step.
 * Source: Cedar color system parabolic formula spec.
 */
const SPEC: Record<string, Record<string, SpecEntry>> = {
  "alpine-lake-blue": {
    "100": { l: 0.98, c: 0.025, h: 259 },
    "200": { l: 0.93, c: 0.042, h: 259 },
    "300": { l: 0.88, c: 0.056, h: 259 },
    "400": { l: 0.82, c: 0.071, h: 259 },
    "500": { l: 0.76, c: 0.083, h: 259 },
    "600": { l: 0.7, c: 0.094, h: 259 },
    "700": { l: 0.62, c: 0.105, h: 259 },
    "800": { l: 0.55, c: 0.13, h: 259 },
    "900": { l: 0.48, c: 0.122, h: 259 },
    "1000": { l: 0.4, c: 0.104, h: 259 },
    "1100": { l: 0.3, c: 0.078, h: 259 },
    "1200": { l: 0.2, c: 0.0625, h: 259 },
  },
  "info-blue": {
    "100": { l: 0.975, c: 0.0075, h: 200 },
    "200": { l: 0.95, c: 0.015, h: 200 },
    "300": { l: 0.92, c: 0.024, h: 200 },
    "400": { l: 0.88, c: 0.034, h: 200 },
    "500": { l: 0.83, c: 0.044, h: 200 },
    "600": { l: 0.78, c: 0.053, h: 200 },
    "700": { l: 0.7, c: 0.062, h: 200 },
    "800": { l: 0.6, c: 0.08, h: 200 },
    "900": { l: 0.54, c: 0.075, h: 200 },
    "1000": { l: 0.44, c: 0.063, h: 200 },
    "1100": { l: 0.33, c: 0.047, h: 200 },
    "1200": { l: 0.25, c: 0.03, h: 200 },
  },
  "blue-spruce-green": {
    "100": { l: 0.975, c: 0.01, h: 166 },
    "200": { l: 0.95, c: 0.025, h: 166 },
    "300": { l: 0.92, c: 0.044, h: 166 },
    "400": { l: 0.87, c: 0.066, h: 166 },
    "500": { l: 0.82, c: 0.081, h: 166 },
    "600": { l: 0.78, c: 0.091, h: 166 },
    "700": { l: 0.74, c: 0.098, h: 166 },
    "800": { l: 0.71, c: 0.1, h: 166 },
    "900": { l: 0.62, c: 0.097, h: 166 },
    "1000": { l: 0.52, c: 0.089, h: 166 },
    "1100": { l: 0.395, c: 0.071, h: 166 },
    "1200": { l: 0.28, c: 0.04, h: 166 },
  },
  "success-green": {
    "100": { l: 0.98, c: 0.015, h: 146 },
    "200": { l: 0.93, c: 0.03, h: 146 },
    "300": { l: 0.88, c: 0.045, h: 146 },
    "400": { l: 0.82, c: 0.063, h: 146 },
    "500": { l: 0.76, c: 0.079, h: 146 },
    "600": { l: 0.62, c: 0.11, h: 146 },
    "700": { l: 0.54, c: 0.12, h: 146 },
    "800": { l: 0.46, c: 0.11, h: 146 },
    "900": { l: 0.46, c: 0.11, h: 146 },
    "1000": { l: 0.38, c: 0.086, h: 146 },
    "1100": { l: 0.28, c: 0.038, h: 146 },
    "1200": { l: 0.18, c: 0.005, h: 146 },
  },
  "warm-grey": {
    "010": { l: 0.985, c: 0.0015, h: 82 },
    "100": { l: 0.955, c: 0.0036, h: 82 },
    "200": { l: 0.915, c: 0.0062, h: 82 },
    "300": { l: 0.865, c: 0.0091, h: 82 },
    "400": { l: 0.8, c: 0.0123, h: 82 },
    "500": { l: 0.74, c: 0.0147, h: 82 },
    "600": { l: 0.66, c: 0.017, h: 82 },
    "700": { l: 0.52, c: 0.0185, h: 82 },
    "800": { l: 0.44, c: 0.0177, h: 82 },
    "900": { l: 0.38, c: 0.0161, h: 82 },
    "1000": { l: 0.32, c: 0.0137, h: 82 },
    "1100": { l: 0.25, c: 0.0097, h: 82 },
    "1200": { l: 0.185, c: 0.005, h: 82 },
  },
  "warning-yellow": {
    "100": { l: 0.99, c: 0.015, h: 73 },
    "200": { l: 0.97, c: 0.033, h: 73 },
    "300": { l: 0.94, c: 0.056, h: 73 },
    "400": { l: 0.9, c: 0.083, h: 73 },
    "500": { l: 0.85, c: 0.107, h: 73 },
    "600": { l: 0.78, c: 0.131, h: 73 },
    "700": { l: 0.7, c: 0.145, h: 73 },
    "800": { l: 0.62, c: 0.15, h: 73 },
    "900": { l: 0.54, c: 0.14, h: 73 },
    "1000": { l: 0.44, c: 0.121, h: 73 },
    "1100": { l: 0.33, c: 0.094, h: 73 },
    "1200": { l: 0.25, c: 0.05, h: 73 },
  },
  "error-red": {
    "100": { l: 0.98, c: 0.015, h: 30 },
    "200": { l: 0.93, c: 0.041, h: 30 },
    "300": { l: 0.88, c: 0.066, h: 30 },
    "400": { l: 0.82, c: 0.094, h: 30 },
    "500": { l: 0.76, c: 0.118, h: 30 },
    "600": { l: 0.7, c: 0.139, h: 30 },
    "700": { l: 0.62, c: 0.16, h: 30 },
    "800": { l: 0.52, c: 0.18, h: 30 },
    "900": { l: 0.44, c: 0.167, h: 30 },
    "1000": { l: 0.36, c: 0.145, h: 30 },
    "1100": { l: 0.28, c: 0.115, h: 30 },
    "1200": { l: 0.2, c: 0.08, h: 30 },
  },
  "sale-red": {
    "100": { l: 0.97, c: 0.015, h: 34 },
    "200": { l: 0.94, c: 0.039, h: 34 },
    "300": { l: 0.91, c: 0.061, h: 34 },
    "400": { l: 0.87, c: 0.088, h: 34 },
    "500": { l: 0.82, c: 0.118, h: 34 },
    "600": { l: 0.75, c: 0.15, h: 34 },
    "700": { l: 0.66, c: 0.178, h: 34 },
    "800": { l: 0.55, c: 0.19, h: 34 },
    "900": { l: 0.48, c: 0.185, h: 34 },
    "1000": { l: 0.4, c: 0.169, h: 34 },
    "1100": { l: 0.32, c: 0.14, h: 34 },
    "1200": { l: 0.225, c: 0.09, h: 34 },
  },
};

/**
 * Tolerances for OKLCH component comparison.
 * Hex→OKLCH round-trip introduces quantization error from sRGB gamut mapping.
 * Chroma tolerance is wider for high-chroma colors that get clamped by sRGB gamut.
 */
const TOLERANCE = {
  l: 0.012, // ±1.2% lightness
  c: 0.015, // ±0.015 chroma (sRGB gamut clamping on high-chroma colors)
  h: 8, // ±8° hue (low-chroma colors can shift hue significantly when gamut-clamped)
};

function loadTokenFile(filename: string): Record<string, any> {
  const tokensDir = path.resolve(__dirname, "../../tokens");
  return JSON.parse(fs.readFileSync(path.join(tokensDir, filename), "utf-8"));
}

describe("figma color spec validation", () => {
  const webLight = loadTokenFile("options.color.web-light.json");

  for (const [family, steps] of Object.entries(SPEC)) {
    describe(family, () => {
      for (const [step, expected] of Object.entries(steps)) {
        it(`${step} hex matches spec oklch(${expected.l} ${expected.c} ${expected.h})`, () => {
          const tokenData = webLight[family]?.[step];
          expect(tokenData, `Missing token ${family}.${step}`).toBeDefined();

          const hex = tokenData.$value as string;
          const parsed = parse(hex);
          expect(parsed, `Could not parse hex "${hex}"`).toBeDefined();

          const oklch = toOklch(parsed!);
          expect(oklch, `Could not convert "${hex}" to OKLCH`).toBeDefined();

          const actualL = oklch!.l;
          const actualC = oklch!.c;
          const actualH = oklch!.h ?? 0;

          expect(
            Math.abs(actualL - expected.l),
            `${family}.${step} L: expected ~${expected.l}, got ${actualL.toFixed(4)} (hex: ${hex})`,
          ).toBeLessThan(TOLERANCE.l);

          expect(
            Math.abs(actualC - expected.c),
            `${family}.${step} C: expected ~${expected.c}, got ${actualC.toFixed(4)} (hex: ${hex})`,
          ).toBeLessThan(TOLERANCE.c);

          // Skip hue check for very low chroma (achromatic colors)
          if (expected.c > 0.005) {
            const hueDiff = Math.abs(((actualH - expected.h + 180) % 360) - 180);
            expect(
              hueDiff,
              `${family}.${step} H: expected ~${expected.h}, got ${actualH.toFixed(1)} (hex: ${hex})`,
            ).toBeLessThan(TOLERANCE.h);
          }
        });
      }
    });
  }
});
