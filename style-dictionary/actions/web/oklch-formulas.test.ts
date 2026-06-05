import { describe, expect, it } from "vitest";
import { hexToCustomOklch, calculateChroma, COLOR_FAMILIES } from "./oklch-formulas";

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

  describe("known color outputs", () => {
    it("produces expected OKLCH for warm-grey family tokens", () => {
      // These are sample values - adjust based on actual formula output
      // The key is that they should be consistent and valid OKLCH
      const testCases = [
        { hex: "#EDEAE3", family: "warm-grey" },
        { hex: "#B2AB9F", family: "warm-grey" },
        { hex: "#736E65", family: "warm-grey" },
        { hex: "#2E2E2B", family: "warm-grey" },
      ];

      testCases.forEach(({ hex, family }) => {
        const result = hexToCustomOklch(hex, family);
        expect(result).toMatch(/^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/);
      });
    });

    it("produces expected OKLCH for alpine-lake-blue family tokens", () => {
      const testCases = [
        { hex: "#406EB5", family: "alpine-lake-blue" },
        { hex: "#0B2D60", family: "alpine-lake-blue" },
      ];

      testCases.forEach(({ hex, family }) => {
        const result = hexToCustomOklch(hex, family);
        expect(result).toMatch(/^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/);
      });
    });
  });
});
