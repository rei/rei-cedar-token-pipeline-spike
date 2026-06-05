import { describe, expect, it } from "vitest";
import { hexToCustomOklch, calculateChroma, COLOR_FAMILIES, SPEC_OKLCH } from "./oklch-formulas";

describe("oklch-formulas", () => {
  describe("calculateChroma", () => {
    it("calculates chroma for warm-grey family at different lightness levels", () => {
      const family = COLOR_FAMILIES["warm-grey"];
      expect(family).toBeDefined();

      // At peak lightness (lo), should get cmax
      const peakChroma = calculateChroma(family.lo, family);
      expect(peakChroma).toBeCloseTo(family.cmax, 4);

      // At extremes, should be close to cmin (formula is a curve, not exact at boundaries)
      const minChroma = calculateChroma(family.lmin, family);
      expect(minChroma).toBeGreaterThan(0);
      expect(minChroma).toBeLessThan(family.cmax);

      const maxChroma = calculateChroma(family.lmax, family);
      expect(maxChroma).toBeGreaterThan(0);
      expect(maxChroma).toBeLessThan(family.cmax);
    });

    it("clamps lightness to valid range", () => {
      const family = COLOR_FAMILIES["warm-grey"];
      const belowMin = calculateChroma(-0.5, family);
      const aboveMax = calculateChroma(2.0, family);

      // Should not throw and should produce valid chroma
      expect(belowMin).toBeGreaterThanOrEqual(0);
      expect(aboveMax).toBeGreaterThanOrEqual(0);
    });

    it("produces non-negative chroma values", () => {
      const family = COLOR_FAMILIES["warm-grey"];
      for (let l = 0; l <= 1; l += 0.1) {
        const chroma = calculateChroma(l, family);
        expect(chroma).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("hexToCustomOklch", () => {
    it("produces valid OKLCH syntax for known color family", () => {
      const result = hexToCustomOklch("#EDEAE3", "warm-grey");
      expect(result).toMatch(/^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/);
    });

    it("falls back to culori for unmapped colors", () => {
      const result = hexToCustomOklch("#FFFFFF");
      expect(result).toMatch(/^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/);
    });

    it("is deterministic - same hex produces same output", () => {
      const hex = "#EDEAE3";
      const family = "warm-grey";
      const result1 = hexToCustomOklch(hex, family);
      const result2 = hexToCustomOklch(hex, family);
      expect(result1).toBe(result2);
    });

    it("handles alpha channel in hex", () => {
      const result = hexToCustomOklch("#EDEAE380", "warm-grey");
      expect(result).toMatch(/^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?\)$/);
    });

    it("uses family hue when color family is provided", () => {
      const family = COLOR_FAMILIES["warm-grey"];
      const result = hexToCustomOklch("#EDEAE3", "warm-grey");
      // Extract hue from oklch(L% C H) format
      const match = result.match(/oklch\([^ ]+\s+[^ ]+\s+([\d.]+)\)/);
      expect(match).toBeTruthy();
      if (match) {
        const hue = parseFloat(match[1]);
        expect(hue).toBeCloseTo(family.hue, 1);
      }
    });

    it("produces different chroma for different families with same lightness", () => {
      const hex = "#888888";
      const warmGreyResult = hexToCustomOklch(hex, "warm-grey");
      const alpineBlueResult = hexToCustomOklch(hex, "alpine-lake-blue");

      // Extract chroma values
      const warmGreyMatch = warmGreyResult.match(/oklch\([^ ]+\s+([\d.]+)\s+/);
      const alpineBlueMatch = alpineBlueResult.match(/oklch\([^ ]+\s+([\d.]+)\s+/);

      expect(warmGreyMatch).toBeTruthy();
      expect(alpineBlueMatch).toBeTruthy();

      if (warmGreyMatch && alpineBlueMatch) {
        const warmGreyChroma = parseFloat(warmGreyMatch[1]);
        const alpineBlueChroma = parseFloat(alpineBlueMatch[1]);
        // Different families should produce different chroma values
        expect(warmGreyChroma).not.toBe(alpineBlueChroma);
      }
    });

    it("handles invalid color family gracefully", () => {
      const result = hexToCustomOklch("#EDEAE3", "nonexistent-family");
      // Should fall back to culori default
      expect(result).toMatch(/^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/);
    });
  });

  describe("design-intent OKLCH values", () => {
    /**
     * Expected OKLCH values from Cedar design spec.
     *
     * When a step is provided, hexToCustomOklch uses the authoritative
     * design-spec lightness (SPEC_LIGHTNESS) instead of culori's hex→L,
     * so the output should match the spec exactly.
     */
    const DESIGN_SPEC: Array<{ hex: string; family: string; step: string; expected: string }> = [
      // ── warm-grey (hue: 82) ──────────────────────────────────────────────
      { hex: "#FAFAF9", family: "warm-grey",         step: "010",  expected: "oklch(0.985 0.0015 82)" },
      { hex: "#F1F0ED", family: "warm-grey",         step: "100",  expected: "oklch(0.955 0.0036 82)" },
      { hex: "#E5E3DE", family: "warm-grey",         step: "200",  expected: "oklch(0.915 0.0062 82)" },
      { hex: "#D6D2CC", family: "warm-grey",         step: "300",  expected: "oklch(0.865 0.0091 82)" },
      { hex: "#C2BDB5", family: "warm-grey",         step: "400",  expected: "oklch(0.800 0.0123 82)" },
      { hex: "#AFAAA1", family: "warm-grey",         step: "500",  expected: "oklch(0.74 0.0147 82)" },
      { hex: "#979187", family: "warm-grey",         step: "600",  expected: "oklch(0.66 0.0170 82)" },
      { hex: "#6F685D", family: "warm-grey",         step: "700",  expected: "oklch(0.52 0.0185 82)" },
      { hex: "#575248", family: "warm-grey",         step: "800",  expected: "oklch(0.44 0.0177 82)" },
      { hex: "#474239", family: "warm-grey",         step: "900",  expected: "oklch(0.38 0.0161 82)" },
      { hex: "#36322B", family: "warm-grey",         step: "1000", expected: "oklch(0.32 0.0137 82)" },
      { hex: "#24211C", family: "warm-grey",         step: "1100", expected: "oklch(0.25 0.0097 82)" },
      { hex: "#141210", family: "warm-grey",         step: "1200", expected: "oklch(0.185 0.005 82)" },

      // ── alpine-lake-blue (hue: 259) ──────────────────────────────────────
      { hex: "#EFF9FF", family: "alpine-lake-blue",  step: "100",  expected: "oklch(0.98 0.025 259)" },
      { hex: "#D7E9FF", family: "alpine-lake-blue",  step: "200",  expected: "oklch(0.93 0.042 259)" },
      { hex: "#C2D9FD", family: "alpine-lake-blue",  step: "300",  expected: "oklch(0.88 0.056 259)" },
      { hex: "#A9C6F3", family: "alpine-lake-blue",  step: "400",  expected: "oklch(0.82 0.071 259)" },
      { hex: "#91B3E6", family: "alpine-lake-blue",  step: "500",  expected: "oklch(0.76 0.083 259)" },
      { hex: "#7BA0D9", family: "alpine-lake-blue",  step: "600",  expected: "oklch(0.70 0.094 259)" },
      { hex: "#5F87C5", family: "alpine-lake-blue",  step: "700",  expected: "oklch(0.62 0.105 259)" },
      { hex: "#4070BC", family: "alpine-lake-blue",  step: "800",  expected: "oklch(0.55 0.130 259)" },
      { hex: "#305CA1", family: "alpine-lake-blue",  step: "900",  expected: "oklch(0.48 0.122 259)" },
      { hex: "#22467F", family: "alpine-lake-blue",  step: "1000", expected: "oklch(0.40 0.104 259)" },
      { hex: "#142D54", family: "alpine-lake-blue",  step: "1100", expected: "oklch(0.30 0.078 259)" },
      { hex: "#041532", family: "alpine-lake-blue",  step: "1200", expected: "oklch(0.20 0.0625 259)" },

      // ── info-blue (hue: 200) ─────────────────────────────────────────────
      { hex: "#F1F8F9", family: "info-blue",         step: "100",  expected: "oklch(0.975 0.0075 200)" },
      { hex: "#E4F2F2", family: "info-blue",         step: "200",  expected: "oklch(0.95 0.015 200)" },
      { hex: "#D3EAEB", family: "info-blue",         step: "300",  expected: "oklch(0.92 0.024 200)" },
      { hex: "#BFDFE0", family: "info-blue",         step: "400",  expected: "oklch(0.88 0.034 200)" },
      { hex: "#A7D1D3", family: "info-blue",         step: "500",  expected: "oklch(0.83 0.044 200)" },
      { hex: "#90C2C5", family: "info-blue",         step: "600",  expected: "oklch(0.78 0.053 200)" },
      { hex: "#6FAAAE", family: "info-blue",         step: "700",  expected: "oklch(0.70 0.062 200)" },
      { hex: "#3B8F93", family: "info-blue",         step: "800",  expected: "oklch(0.60 0.080 200)" },
      { hex: "#2E7C80", family: "info-blue",         step: "900",  expected: "oklch(0.54 0.075 200)" },
      { hex: "#1E5D60", family: "info-blue",         step: "1000", expected: "oklch(0.44 0.063 200)" },
      { hex: "#113D3F", family: "info-blue",         step: "1100", expected: "oklch(0.33 0.047 200)" },
      { hex: "#0E2627", family: "info-blue",         step: "1200", expected: "oklch(0.25 0.030 200)" },

      // ── blue-spruce-green (hue: 166) ─────────────────────────────────────
      { hex: "#F1F9F5", family: "blue-spruce-green", step: "100",  expected: "oklch(0.975 0.010 166)" },
      { hex: "#E4F2F2", family: "blue-spruce-green", step: "200",  expected: "oklch(0.95 0.025 166)" },
      { hex: "#D3EAEB", family: "blue-spruce-green", step: "300",  expected: "oklch(0.92 0.044 166)" },
      { hex: "#BFDFE0", family: "blue-spruce-green", step: "400",  expected: "oklch(0.87 0.066 166)" },
      { hex: "#A7D1D3", family: "blue-spruce-green", step: "500",  expected: "oklch(0.82 0.081 166)" },
      { hex: "#90C2C5", family: "blue-spruce-green", step: "600",  expected: "oklch(0.78 0.091 166)" },
      { hex: "#6FAAAE", family: "blue-spruce-green", step: "700",  expected: "oklch(0.74 0.098 166)" },
      { hex: "#3B8F93", family: "blue-spruce-green", step: "800",  expected: "oklch(0.71 0.10 166)" },
      { hex: "#2E7C80", family: "blue-spruce-green", step: "900",  expected: "oklch(0.62 0.097 166)" },
      { hex: "#1E5D60", family: "blue-spruce-green", step: "1000", expected: "oklch(0.52 0.089 166)" },
      { hex: "#113D3F", family: "blue-spruce-green", step: "1100", expected: "oklch(0.395 0.071 166)" },
      { hex: "#0E2627", family: "blue-spruce-green", step: "1200", expected: "oklch(0.28 0.040 166)" },

      // ── success-green (hue: 146) ─────────────────────────────────────────
      { hex: "#F2FBF3", family: "success-green",     step: "100",  expected: "oklch(0.98 0.015 146)" },
      { hex: "#DCEEDC", family: "success-green",     step: "200",  expected: "oklch(0.93 0.030 146)" },
      { hex: "#C5E0C6", family: "success-green",     step: "300",  expected: "oklch(0.88 0.045 146)" },
      { hex: "#ABD0AC", family: "success-green",     step: "400",  expected: "oklch(0.82 0.063 146)" },
      { hex: "#91BF93", family: "success-green",     step: "500",  expected: "oklch(0.76 0.079 146)" },
      { hex: "#78AE7B", family: "success-green",     step: "600",  expected: "oklch(0.62 0.110 146)" },
      { hex: "#57985D", family: "success-green",     step: "700",  expected: "oklch(0.54 0.120 146)" },
      { hex: "#398141", family: "success-green",     step: "800",  expected: "oklch(0.46 0.110 146)" },
      { hex: "#27682F", family: "success-green",     step: "900",  expected: "oklch(0.46 0.110 146)" },
      { hex: "#1F4E24", family: "success-green",     step: "1000", expected: "oklch(0.38 0.086 146)" },
      { hex: "#1C2E1D", family: "success-green",     step: "1100", expected: "oklch(0.28 0.038 146)" },
      { hex: "#101210", family: "success-green",     step: "1200", expected: "oklch(0.18 0.005 146)" },

      // ── warning-yellow (hue: 73) ─────────────────────────────────────────
      { hex: "#FFFAF1", family: "warning-yellow",    step: "100",  expected: "oklch(0.99 0.015 73)" },
      { hex: "#FFF2DD", family: "warning-yellow",    step: "200",  expected: "oklch(0.97 0.033 73)" },
      { hex: "#FFE6C3", family: "warning-yellow",    step: "300",  expected: "oklch(0.94 0.056 73)" },
      { hex: "#FFD6A1", family: "warning-yellow",    step: "400",  expected: "oklch(0.90 0.083 73)" },
      { hex: "#F9C37D", family: "warning-yellow",    step: "500",  expected: "oklch(0.85 0.107 73)" },
      { hex: "#EAA94E", family: "warning-yellow",    step: "600",  expected: "oklch(0.78 0.131 73)" },
      { hex: "#D48E13", family: "warning-yellow",    step: "700",  expected: "oklch(0.70 0.145 73)" },
      { hex: "#BB7400", family: "warning-yellow",    step: "800",  expected: "oklch(0.62 0.150 73)" },
      { hex: "#9D5F00", family: "warning-yellow",    step: "900",  expected: "oklch(0.54 0.140 73)" },
      { hex: "#774600", family: "warning-yellow",    step: "1000", expected: "oklch(0.44 0.121 73)" },
      { hex: "#502C00", family: "warning-yellow",    step: "1100", expected: "oklch(0.33 0.094 73)" },
      { hex: "#301D02", family: "warning-yellow",    step: "1200", expected: "oklch(0.25 0.050 73)" },

      // ── error-red (hue: 30) ──────────────────────────────────────────────
      { hex: "#FFF5F2", family: "error-red",         step: "100",  expected: "oklch(0.98 0.015 30)" },
      { hex: "#FFD2D8", family: "error-red",         step: "200",  expected: "oklch(0.93 0.041 30)" },
      { hex: "#FFC8BE", family: "error-red",         step: "300",  expected: "oklch(0.88 0.066 30)" },
      { hex: "#FBADA0", family: "error-red",         step: "400",  expected: "oklch(0.82 0.094 30)" },
      { hex: "#F39484", family: "error-red",         step: "500",  expected: "oklch(0.76 0.118 30)" },
      { hex: "#E87A69", family: "error-red",         step: "600",  expected: "oklch(0.70 0.139 30)" },
      { hex: "#D55948", family: "error-red",         step: "700",  expected: "oklch(0.62 0.160 30)" },
      { hex: "#BA2D1F", family: "error-red",         step: "800",  expected: "oklch(0.52 0.180 30)" },
      { hex: "#9A160A", family: "error-red",         step: "900",  expected: "oklch(0.44 0.167 30)" },
      { hex: "#770400", family: "error-red",         step: "1000", expected: "oklch(0.36 0.145 30)" },
      { hex: "#540000", family: "error-red",         step: "1100", expected: "oklch(0.28 0.115 30)" },
      { hex: "#320100", family: "error-red",         step: "1200", expected: "oklch(0.20 0.080 30)" },

      // ── sale-red (hue: 34) ───────────────────────────────────────────────
      { hex: "#FFF2EF", family: "sale-red",          step: "100",  expected: "oklch(0.97 0.015 34)" },
      { hex: "#FFE3DA", family: "sale-red",          step: "200",  expected: "oklch(0.94 0.039 34)" },
      { hex: "#FFD4C7", family: "sale-red",          step: "300",  expected: "oklch(0.91 0.061 34)" },
      { hex: "#FFC0AE", family: "sale-red",          step: "400",  expected: "oklch(0.87 0.088 34)" },
      { hex: "#FFA891", family: "sale-red",          step: "500",  expected: "oklch(0.82 0.118 34)" },
      { hex: "#FE876C", family: "sale-red",          step: "600",  expected: "oklch(0.75 0.150 34)" },
      { hex: "#EA6041", family: "sale-red",          step: "700",  expected: "oklch(0.66 0.178 34)" },
      { hex: "#C8340E", family: "sale-red",          step: "800",  expected: "oklch(0.55 0.190 34)" },
      { hex: "#AD1A00", family: "sale-red",          step: "900",  expected: "oklch(0.48 0.185 34)" },
      { hex: "#8C0000", family: "sale-red",          step: "1000", expected: "oklch(0.40 0.169 34)" },
      { hex: "#680000", family: "sale-red",          step: "1100", expected: "oklch(0.32 0.14 34)" },
      { hex: "#3C0200", family: "sale-red",          step: "1200", expected: "oklch(0.225 0.090 34)" },
    ];

    function parseOklch(str: string): { l: number; c: number; h: number } {
      const m = str.match(/oklch\(([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/);
      if (!m) throw new Error(`Cannot parse oklch string: ${str}`);
      let l = parseFloat(m[1]);
      // Normalize: if the value has a % suffix it's already 0-100; divide by 100
      // to get 0-1 scale. If no %, the spec uses 0-1 directly.
      if (m[2] === "%") l = l / 100;
      return { l, c: parseFloat(m[3]), h: parseFloat(m[4]) };
    }

    for (const { hex, family, step, expected } of DESIGN_SPEC) {
      const stepLabel = `${family}-${step}`;

      it(`${stepLabel} → matches design spec`, () => {
        const actual = hexToCustomOklch(hex, family, step);
        const exp = parseOklch(expected);
        const act = parseOklch(actual);

        // With spec-L, lightness and chroma should be exact (within float precision).
        expect(act.l).toBeCloseTo(exp.l, 3);
        expect(act.c).toBeCloseTo(exp.c, 4);

        // Hue: fixed per family, must be exact.
        expect(act.h).toBe(exp.h);
      });
    }
  });

  describe("formula parameter parity with design spec", () => {
    it("all 8 color families are defined", () => {
      const expectedFamilies = [
        "alpine-lake-blue", "info-blue", "blue-spruce-green", "success-green",
        "warm-grey", "warning-yellow", "error-red", "sale-red",
      ];
      for (const name of expectedFamilies) {
        expect(COLOR_FAMILIES[name], `Missing family: ${name}`).toBeDefined();
      }
    });

    it("formula parameters match design spec", () => {
      const spec: Record<string, Partial<typeof COLOR_FAMILIES[string]>> = {
        "alpine-lake-blue": { hue: 259, cmax: 0.13, lo: 0.55, wlight: 0.65, clightMin: 0.025, wdark: 0.30, cdarkMin: 0.0625 },
        "info-blue":        { hue: 200, cmax: 0.08, lo: 0.60, wlight: 0.45, clightMin: 0.0075, wdark: 0.30, cdarkMin: 0.03 },
        "blue-spruce-green":{ hue: 166, cmax: 0.10, lo: 0.71, wlight: 0.265, clightMin: 0.01, wdark: 0.43, cdarkMin: 0.04 },
        "success-green":    { hue: 146, cmax: 0.12, lo: 0.54, wlight: 0.65, clightMin: 0.015, wdark: 0.30, cdarkMin: 0.005 },
        "warm-grey":        { hue: 82,  cmax: 0.0185, lo: 0.52, wlight: 0.465, clightMin: 0.0015, wdark: 0.335, cdarkMin: 0.005 },
        "warning-yellow":   { hue: 73,  cmax: 0.15, lo: 0.62, wlight: 0.37, clightMin: 0.015, wdark: 0.25, cdarkMin: 0.05 },
        "error-red":        { hue: 30,  cmax: 0.18, lo: 0.52, wlight: 0.60, clightMin: 0.015, wdark: 0.35, cdarkMin: 0.08 },
        "sale-red":         { hue: 34,  cmax: 0.19, lo: 0.55, wlight: 0.42, clightMin: 0.015, wdark: 0.325, cdarkMin: 0.09 },
      };

      for (const [name, params] of Object.entries(spec)) {
        const actual = COLOR_FAMILIES[name];
        for (const [key, value] of Object.entries(params)) {
          expect(actual[key as keyof typeof actual], `${name}.${key}`).toBe(value);
        }
      }
    });
  });
});
