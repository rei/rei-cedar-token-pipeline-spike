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
 * Convert hex to OKLCH using custom design spec formulas.
 *
 * Resolution tiers:
 *   1. If colorFamily is provided and found in COLOR_FAMILIES → use culori hex→L
 *      plus the parabolic chroma formula with the family's fixed hue.
 *   2. If colorFamily is provided but NOT found → log a warning and fall back
 *      to culori's default OKLCH conversion (no custom chroma).
 *   3. If colorFamily is omitted → culori passthrough (Storybook, previews, etc.)
 *
 * @param hex - The hex color value to convert
 * @param colorFamily - The color family name from token schema (e.g., 'warm-grey', 'alpine-lake-blue').
 *                      If not provided, falls back to culori's default conversion.
 */
export function hexToCustomOklch(hex: string, colorFamily?: string): string {
  const family = colorFamily ? COLOR_FAMILIES[colorFamily] : undefined;

  if (colorFamily && !family) {
    console.warn(
      `[oklch] Unknown color family "${colorFamily}". ` +
      `Add an entry to COLOR_FAMILIES in oklch-formulas.ts. Falling back to culori default.`
    );
  }

  // Parse hex via culori (needed for L and alpha detection)
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`[oklch] Could not parse color value "${hex}".`);
  }

  const oklch = toOklch(parsed) as { l?: number; c?: number; h?: number; alpha?: number } | undefined;

  if (!oklch || typeof oklch.l !== 'number' || typeof oklch.c !== 'number') {
    throw new Error(`[oklch] Could not convert color value "${hex}" to oklch().`);
  }

  // Handle alpha if present
  const alpha = typeof oklch.alpha === 'number' && oklch.alpha < 1
    ? ` / ${formatNumber(Math.min(1, Math.max(0, oklch.alpha)), 3)}`
    : '';

  if (!family) {
    // Culori passthrough — no custom chroma
    const lightness = formatNumber(Math.min(100, Math.max(0, oklch.l * 100)), 3);
    const chroma = formatNumber(Math.max(0, oklch.c), 4);
    const hue = typeof oklch.h === 'number' && Number.isFinite(oklch.h)
      ? formatNumber(((oklch.h % 360) + 360) % 360, 2)
      : '0';

    return `oklch(${lightness}% ${chroma} ${hue}${alpha})`;
  }

  // Custom formula path: culori L + parabolic chroma + fixed hue
  const l = oklch.l;
  const chroma = calculateChroma(l, family);

  const lightness = formatNumber(Math.min(100, Math.max(0, l * 100)), 3);
  const chromaFormatted = formatNumber(chroma, 4);
  const hue = formatNumber(family.hue, 2);

  return `oklch(${lightness}% ${chromaFormatted} ${hue}${alpha})`;
}
