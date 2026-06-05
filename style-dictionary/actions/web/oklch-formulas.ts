/// <reference path="../../types/culori.d.ts" />

import { parse, converter } from 'culori';

const toOklch = converter('oklch');

/**
 * Custom OKLCH formulas from Cedar design spec
 *
 * Formula:
 *   C(L) = Cmin + (Cmax - Cmin) * (1 - ((L - Lo) / W)^2)
 *
 * Where:
 *   - L: Lightness (0-1 in formula, 0-100 in OKLCH)
 *   - C(L): Chroma at lightness L
 *   - Cmax: Chroma Peak
 *   - Lo: Lightness level at Chroma Peak
 *   - W: Width of curve (Wlight for L >= Lo, Wdark for L <= Lo)
 *   - Cmin: Chroma floor (Clight-min for light side, Cdark-min for dark side)
 *   - Lmax: 0.98
 *   - Lmin: 0.20
 */

export type ColorFamily = {
  hue: number;
  cmax: number;
  lo: number;
  wlight: number;
  clightMin: number;
  wdark: number;
  cdarkMin: number;
  lmax: number;
  lmin: number;
};

export const COLOR_FAMILIES: Record<string, ColorFamily> = {
  'alpine-lake-blue': {
    hue: 259,
    cmax: 0.13,
    lo: 0.55,
    wlight: 0.65,
    clightMin: 0.025,
    wdark: 0.30,
    cdarkMin: 0.0625,
    lmax: 0.98,
    lmin: 0.20,
  },
  'info-blue': {
    hue: 200,
    cmax: 0.08,
    lo: 0.60,
    wlight: 0.45,
    clightMin: 0.0075,
    wdark: 0.30,
    cdarkMin: 0.03,
    lmax: 0.98,
    lmin: 0.20,
  },
  'blue-spruce-green': {
    hue: 166,
    cmax: 0.10,
    lo: 0.71,
    wlight: 0.265,
    clightMin: 0.01,
    wdark: 0.43,
    cdarkMin: 0.04,
    lmax: 0.98,
    lmin: 0.20,
  },
  'success-green': {
    hue: 146,
    cmax: 0.12,
    lo: 0.54,
    wlight: 0.65,
    clightMin: 0.015,
    wdark: 0.30,
    cdarkMin: 0.005,
    lmax: 0.98,
    lmin: 0.20,
  },
  'warm-grey': {
    hue: 82,
    cmax: 0.0185,
    lo: 0.52,
    wlight: 0.465,
    clightMin: 0.0015,
    wdark: 0.335,
    cdarkMin: 0.005,
    lmax: 0.98,
    lmin: 0.20,
  },
  'warning-yellow': {
    hue: 73,
    cmax: 0.15,
    lo: 0.62,
    wlight: 0.37,
    clightMin: 0.015,
    wdark: 0.25,
    cdarkMin: 0.05,
    lmax: 0.98,
    lmin: 0.20,
  },
  'error-red': {
    hue: 30,
    cmax: 0.18,
    lo: 0.52,
    wlight: 0.60,
    clightMin: 0.015,
    wdark: 0.35,
    cdarkMin: 0.08,
    lmax: 0.98,
    lmin: 0.20,
  },
  'sale-red': {
    hue: 34,
    cmax: 0.19,
    lo: 0.55,
    wlight: 0.42,
    clightMin: 0.015,
    wdark: 0.325,
    cdarkMin: 0.09,
    lmax: 0.98,
    lmin: 0.20,
  },
};

/**
 * Authoritative OKLCH values per color family per step from the Cedar design spec.
 *
 * These are the final L (lightness) and C (chroma) values that designers have
 * approved. The pipeline uses these directly instead of:
 *   - Deriving L from hex via culori (hex is a quantized sRGB approximation)
 *   - Computing C from the parabolic formula (designers hand-tune individual stops)
 *
 * The chroma formula (calculateChroma) describes the *overall curve shape* and is
 * used as a fallback when no spec entry exists. But for known palette steps, the
 * spec values below are authoritative.
 *
 * Steps: 010 (warm-grey only), 100–1200 in increments of 100.
 * H (hue) is fixed per family in COLOR_FAMILIES and not repeated here.
 */
export const SPEC_OKLCH: Record<string, Record<string, { l: number; c: number }>> = {
  'alpine-lake-blue': {
    '100':  { l: 0.98,  c: 0.025  }, '200':  { l: 0.93,  c: 0.042  },
    '300':  { l: 0.88,  c: 0.056  }, '400':  { l: 0.82,  c: 0.071  },
    '500':  { l: 0.76,  c: 0.083  }, '600':  { l: 0.70,  c: 0.094  },
    '700':  { l: 0.62,  c: 0.105  }, '800':  { l: 0.55,  c: 0.130  },
    '900':  { l: 0.48,  c: 0.122  }, '1000': { l: 0.40,  c: 0.104  },
    '1100': { l: 0.30,  c: 0.078  }, '1200': { l: 0.20,  c: 0.0625 },
  },
  'info-blue': {
    '100':  { l: 0.975, c: 0.0075 }, '200':  { l: 0.95,  c: 0.015  },
    '300':  { l: 0.92,  c: 0.024  }, '400':  { l: 0.88,  c: 0.034  },
    '500':  { l: 0.83,  c: 0.044  }, '600':  { l: 0.78,  c: 0.053  },
    '700':  { l: 0.70,  c: 0.062  }, '800':  { l: 0.60,  c: 0.080  },
    '900':  { l: 0.54,  c: 0.075  }, '1000': { l: 0.44,  c: 0.063  },
    '1100': { l: 0.33,  c: 0.047  }, '1200': { l: 0.25,  c: 0.030  },
  },
  'blue-spruce-green': {
    '100':  { l: 0.975, c: 0.010  }, '200':  { l: 0.95,  c: 0.025  },
    '300':  { l: 0.92,  c: 0.044  }, '400':  { l: 0.87,  c: 0.066  },
    '500':  { l: 0.82,  c: 0.081  }, '600':  { l: 0.78,  c: 0.091  },
    '700':  { l: 0.74,  c: 0.098  }, '800':  { l: 0.71,  c: 0.10   },
    '900':  { l: 0.62,  c: 0.097  }, '1000': { l: 0.52,  c: 0.089  },
    '1100': { l: 0.395, c: 0.071  }, '1200': { l: 0.28,  c: 0.040  },
  },
  'success-green': {
    '100':  { l: 0.98,  c: 0.015  }, '200':  { l: 0.93,  c: 0.030  },
    '300':  { l: 0.88,  c: 0.045  }, '400':  { l: 0.82,  c: 0.063  },
    '500':  { l: 0.76,  c: 0.079  }, '600':  { l: 0.62,  c: 0.110  },
    '700':  { l: 0.54,  c: 0.120  }, '800':  { l: 0.46,  c: 0.110  },
    '900':  { l: 0.46,  c: 0.110  }, '1000': { l: 0.38,  c: 0.086  },
    '1100': { l: 0.28,  c: 0.038  }, '1200': { l: 0.18,  c: 0.005  },
  },
  'warm-grey': {
    '010':  { l: 0.985, c: 0.0015 },
    '100':  { l: 0.955, c: 0.0036 }, '200':  { l: 0.915, c: 0.0062 },
    '300':  { l: 0.865, c: 0.0091 }, '400':  { l: 0.800, c: 0.0123 },
    '500':  { l: 0.74,  c: 0.0147 }, '600':  { l: 0.66,  c: 0.0170 },
    '700':  { l: 0.52,  c: 0.0185 }, '800':  { l: 0.44,  c: 0.0177 },
    '900':  { l: 0.38,  c: 0.0161 }, '1000': { l: 0.32,  c: 0.0137 },
    '1100': { l: 0.25,  c: 0.0097 }, '1200': { l: 0.185, c: 0.005  },
  },
  'warning-yellow': {
    '100':  { l: 0.99,  c: 0.015  }, '200':  { l: 0.97,  c: 0.033  },
    '300':  { l: 0.94,  c: 0.056  }, '400':  { l: 0.90,  c: 0.083  },
    '500':  { l: 0.85,  c: 0.107  }, '600':  { l: 0.78,  c: 0.131  },
    '700':  { l: 0.70,  c: 0.145  }, '800':  { l: 0.62,  c: 0.150  },
    '900':  { l: 0.54,  c: 0.140  }, '1000': { l: 0.44,  c: 0.121  },
    '1100': { l: 0.33,  c: 0.094  }, '1200': { l: 0.25,  c: 0.050  },
  },
  'error-red': {
    '100':  { l: 0.98,  c: 0.015  }, '200':  { l: 0.93,  c: 0.041  },
    '300':  { l: 0.88,  c: 0.066  }, '400':  { l: 0.82,  c: 0.094  },
    '500':  { l: 0.76,  c: 0.118  }, '600':  { l: 0.70,  c: 0.139  },
    '700':  { l: 0.62,  c: 0.160  }, '800':  { l: 0.52,  c: 0.180  },
    '900':  { l: 0.44,  c: 0.167  }, '1000': { l: 0.36,  c: 0.145  },
    '1100': { l: 0.28,  c: 0.115  }, '1200': { l: 0.20,  c: 0.080  },
  },
  'sale-red': {
    '100':  { l: 0.97,  c: 0.015  }, '200':  { l: 0.94,  c: 0.039  },
    '300':  { l: 0.91,  c: 0.061  }, '400':  { l: 0.87,  c: 0.088  },
    '500':  { l: 0.82,  c: 0.118  }, '600':  { l: 0.75,  c: 0.150  },
    '700':  { l: 0.66,  c: 0.178  }, '800':  { l: 0.55,  c: 0.190  },
    '900':  { l: 0.48,  c: 0.185  }, '1000': { l: 0.40,  c: 0.169  },
    '1100': { l: 0.32,  c: 0.14   }, '1200': { l: 0.225, c: 0.090  },
  },
};

/**
 * Calculate chroma at a given lightness using the design spec formula
 */
export function calculateChroma(l: number, family: ColorFamily): number {
  // Clamp lightness to valid range
  const clampedL = Math.max(family.lmin, Math.min(family.lmax, l));

  if (clampedL >= family.lo) {
    // Light side formula
    const width = family.wlight;
    const cmin = family.clightMin;
    const normalizedL = (clampedL - family.lo) / width;
    const chroma = cmin + (family.cmax - cmin) * (1 - normalizedL * normalizedL);
    return Math.max(cmin, chroma);
  } else {
    // Dark side formula
    const width = family.wdark;
    const cmin = family.cdarkMin;
    const normalizedL = (clampedL - family.lo) / width;
    const chroma = cmin + (family.cmax - cmin) * (1 - normalizedL * normalizedL);
    return Math.max(cmin, chroma);
  }
}

/**
 * Format number with precision, handling -0
 */
function formatNumber(value: number, precision: number): string {
  const rounded = Number(value.toFixed(precision));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/**
 * Convert hex to OKLCH using custom design spec formulas
 * This replaces culori's direct conversion with Cedar's custom lightness curves
 *
 * @param hex - The hex color value to convert
 * @param colorFamily - The color family name from token schema (e.g., 'warm-grey', 'alpine-lake-blue')
 *                   If not provided, falls back to culori's default conversion
 * @param step - The palette step (e.g., '100', '010'). When provided and a
 *               spec-lightness entry exists, the authoritative design-spec L is
 *               used instead of deriving L from the hex via culori.
 */
export function hexToCustomOklch(hex: string, colorFamily?: string, step?: string): string {
  const family = colorFamily ? COLOR_FAMILIES[colorFamily] : undefined;

  if (!family) {
    // If no family specified or family not found, fall back to culori
    // This handles colors like pure white, black, or unmapped colors
    const parsed = parse(hex);
    if (!parsed) {
      throw new Error(`[oklch] Could not parse color value "${hex}".`);
    }

    // For unmapped colors, use culori's direct conversion
    const oklch = toOklch(parsed) as { l?: number; c?: number; h?: number; alpha?: number } | undefined;

    if (!oklch || typeof oklch.l !== 'number' || typeof oklch.c !== 'number') {
      throw new Error(`[oklch] Could not convert color value "${hex}" to oklch().`);
    }

    const lightness = formatNumber(Math.min(100, Math.max(0, oklch.l * 100)), 3);
    const chroma = formatNumber(Math.max(0, oklch.c), 4);
    const hue = typeof oklch.h === 'number' && Number.isFinite(oklch.h)
      ? formatNumber(((oklch.h % 360) + 360) % 360, 2)
      : '0';
    const alpha = typeof oklch.alpha === 'number' && oklch.alpha < 1
      ? ` / ${formatNumber(Math.min(1, Math.max(0, oklch.alpha)), 3)}`
      : '';

    return `oklch(${lightness}% ${chroma} ${hue}${alpha})`;
  }

  // Use culori to parse the hex (needed for alpha detection)
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`[oklch] Could not parse color value "${hex}".`);
  }

  const oklch = toOklch(parsed) as { l?: number; c?: number; h?: number; alpha?: number } | undefined;

  if (!oklch || typeof oklch.l !== 'number') {
    throw new Error(`[oklch] Could not convert color value "${hex}" to oklch().`);
  }

  // Prefer authoritative design-spec L and C when available.
  const specEntry = (step && colorFamily)
    ? SPEC_OKLCH[colorFamily]?.[step]
    : undefined;
  const l = specEntry?.l ?? oklch.l;

  // Use spec chroma if available; otherwise compute from the parabolic formula.
  const chroma = specEntry?.c ?? calculateChroma(l, family);

  // Format OKLCH string
  const lightness = formatNumber(Math.min(100, Math.max(0, l * 100)), 3);
  const chromaFormatted = formatNumber(chroma, 4);
  const hue = formatNumber(family.hue, 2);

  // Handle alpha if present
  const alpha = typeof oklch.alpha === 'number' && oklch.alpha < 1
    ? ` / ${formatNumber(Math.min(1, Math.max(0, oklch.alpha)), 3)}`
    : '';

  return `oklch(${lightness}% ${chromaFormatted} ${hue}${alpha})`;
}
