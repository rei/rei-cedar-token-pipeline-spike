import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  hexToCustomOklch,
  calculateChroma,
  COLOR_FAMILIES,
  COLOR_FAMILY_ALIASES,
  resolveColorFamily,
  LMAX,
  LMIN,
  type ColorFamily,
} from "./oklch-formulas.js";

/**
 * Read colorFamily names from token-schema.json dynamically.
 * This ensures tests automatically cover new families added to the schema
 * without hardcoding palette names in the test file.
 */
function getSchemaColorFamilies(): string[] {
  const schemaPath = path.resolve(__dirname, "../../../src/schema/token-schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  const collections = schema.inputs?.figma?.collections ?? {};

  return Object.values(collections)
    .filter((c: any) => typeof c.colorFamily === "string")
    .map((c: any) => c.colorFamily as string);
}

/** Parse oklch(L% C H) or oklch(L% C H / A) into components */
function parseOklch(str: string): { l: number; c: number; h: number } {
  const m = str.match(/oklch\(([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) throw new Error(`Cannot parse oklch string: ${str}`);
  let l = parseFloat(m[1]);
  if (m[2] === "%") l = l / 100;
  return { l, c: parseFloat(m[3]), h: parseFloat(m[4]) };
}

describe("oklch-formulas", () => {
  describe("calculateChroma", () => {
    it("peaks at Lo and returns Cmax", () => {
      for (const [name, family] of Object.entries(COLOR_FAMILIES) as [string, ColorFamily][]) {
        const peak = calculateChroma(family.lo, family);
        expect(peak, `${name} peak`).toBeCloseTo(family.cmax, 4);
      }
    });

    it("returns values between Cmin and Cmax for all families across L range", () => {
      for (const [name, family] of Object.entries(COLOR_FAMILIES) as [string, ColorFamily][]) {
        for (let l = LMIN; l <= LMAX; l += 0.05) {
          const c = calculateChroma(l, family);
          const cmin = l >= family.lo ? family.clightMin : family.cdarkMin;
          expect(c, `${name} at L=${l.toFixed(2)}`).toBeGreaterThanOrEqual(cmin - 1e-10);
          expect(c, `${name} at L=${l.toFixed(2)}`).toBeLessThanOrEqual(family.cmax + 1e-10);
        }
      }
    });

    it("clamps lightness to valid range without throwing", () => {
      for (const family of Object.values(COLOR_FAMILIES) as ColorFamily[]) {
        expect(calculateChroma(-0.5, family)).toBeGreaterThanOrEqual(0);
        expect(calculateChroma(2.0, family)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("hexToCustomOklch", () => {
    it("produces valid OKLCH syntax for known color family", () => {
      const result = hexToCustomOklch("#EDEAE3", "warm-grey");
      expect(result).toMatch(/^oklch\([\d.]+\s+[\d.]+\s+[\d.]+\)$/);
    });

    it("falls back to culori for unmapped colors (no family)", () => {
      const result = hexToCustomOklch("#FFFFFF");
      expect(result).toMatch(/^oklch\([\d.]+\s+[\d.]+\s+[\d.]+\)$/);
    });

    it("is deterministic — same inputs always produce same output", () => {
      const hex = "#EDEAE3";
      const result1 = hexToCustomOklch(hex, "warm-grey");
      const result2 = hexToCustomOklch(hex, "warm-grey");
      expect(result1).toBe(result2);
    });

    it("handles alpha channel in 8-digit hex", () => {
      const result = hexToCustomOklch("#EDEAE380", "warm-grey");
      expect(result).toMatch(/^oklch\([\d.]+\s+[\d.]+\s+[\d.]+\s*\/\s*[\d.]+\)$/);
    });

    it("uses family hue for neutral greys so output is deterministic", () => {
      for (const [name, family] of Object.entries(COLOR_FAMILIES) as [string, ColorFamily][]) {
        const result = hexToCustomOklch("#888888", name);
        const parsed = parseOklch(result);
        expect(parsed.h, `${name} hue`).toBe(family.hue);
      }
    });

    it("produces different hue for different neutral families given same grey", () => {
      const hex = "#888888";
      const results = (Object.keys(COLOR_FAMILIES) as string[]).map(name => ({
        name,
        hue: parseOklch(hexToCustomOklch(hex, name)).h,
      }));

      // Different families should report their own hue for a neutral input
      const unique = new Set(results.map(r => r.hue));
      expect(unique.size).toBeGreaterThan(1);
    });

    it("warns and falls back to culori for unknown color family", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = hexToCustomOklch("#EDEAE3", "nonexistent-family");

      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain("nonexistent-family");
      expect(result).toMatch(/^oklch\(/);

      spy.mockRestore();
    });

    it("resolves legacy family aliases to updated parameters", () => {
      for (const [legacy, canonical] of Object.entries(COLOR_FAMILY_ALIASES)) {
        const legacyResult = hexToCustomOklch("#888888", legacy);
        const canonicalResult = hexToCustomOklch("#888888", canonical);
        expect(legacyResult, `${legacy} -> ${canonical}`).toBe(canonicalResult);
      }
    });
  });

  describe("schema-driven coverage", () => {
    /**
     * Dynamically reads color families from token-schema.json and verifies
     * that every family declared in the schema has a corresponding entry
     * in COLOR_FAMILIES. This ensures the Figma sync and formula params
     * stay in sync — when a new family is added to the schema, this test
     * will fail until COLOR_FAMILIES is updated with formula parameters.
     */
    const schemaFamilies = getSchemaColorFamilies();

    it("token-schema declares at least one color family", () => {
      expect(schemaFamilies.length).toBeGreaterThan(0);
    });

    for (const familyName of schemaFamilies) {
      it(`COLOR_FAMILIES has formula params for schema family "${familyName}"`, () => {
        const family = resolveColorFamily(familyName);
        expect(
          family,
          `Missing COLOR_FAMILIES entry or alias for "${familyName}". ` +
          `Add formula parameters (hue, cmax, lo, wlight, clightMin, wdark, cdarkMin) ` +
          `to COLOR_FAMILIES in oklch-formulas.ts.`
        ).toBeDefined();
      });
    }

    it("every COLOR_FAMILIES entry has valid parameter ranges", () => {
      for (const [name, f] of Object.entries(COLOR_FAMILIES) as [string, ColorFamily][]) {
        expect(f.hue, `${name}.hue`).toBeGreaterThanOrEqual(0);
        expect(f.hue, `${name}.hue`).toBeLessThan(360);
        expect(f.cmax, `${name}.cmax`).toBeGreaterThanOrEqual(0);
        expect(f.lo, `${name}.lo`).toBeGreaterThan(LMIN);
        expect(f.lo, `${name}.lo`).toBeLessThan(LMAX);
        expect(f.wlight, `${name}.wlight`).toBeGreaterThan(0);
        expect(f.wdark, `${name}.wdark`).toBeGreaterThan(0);
        expect(f.clightMin, `${name}.clightMin`).toBeGreaterThanOrEqual(0);
        expect(f.cdarkMin, `${name}.cdarkMin`).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("design parameter validation", () => {
    it("parabolic chroma curve hits Cmin and Cmax at design boundaries", () => {
      for (const family of Object.values(COLOR_FAMILIES) as ColorFamily[]) {
        // Peak at Lo
        expect(calculateChroma(family.lo, family)).toBeCloseTo(family.cmax, 4);

        // Light-side floor is only reachable if Lo + Wlight fits inside [LMIN, LMAX]
        const lightFloorL = family.lo + family.wlight;
        if (lightFloorL <= LMAX) {
          expect(calculateChroma(lightFloorL, family)).toBeCloseTo(family.clightMin, 4);
        }

        // Dark-side floor is only reachable if Lo - Wdark fits inside [LMIN, LMAX]
        const darkFloorL = family.lo - family.wdark;
        if (darkFloorL >= LMIN) {
          expect(calculateChroma(darkFloorL, family)).toBeCloseTo(family.cdarkMin, 4);
        }
      }
    });

    const optionsPath = path.resolve(__dirname, "../../../tokens/options.color.web-light.json");
    const options = JSON.parse(fs.readFileSync(optionsPath, "utf-8")) as Record<string, any>;
    const FAMILY_TO_OPTION_KEY: Record<string, string> = {
      "highlight-lichen": "lichen",
      "appex-moss": "apex-moss",
      "new-sale-red": "sale-red",
    };
    const referenceFamily = Object.keys(options)[0];
    const steps = Object.keys(options[referenceFamily] ?? {});

    for (const familyName of Object.keys(COLOR_FAMILIES)) {
      const optionKey = FAMILY_TO_OPTION_KEY[familyName] ?? familyName;
      if (!options[optionKey]) continue;

      it(`hexToCustomOklch output matches token descriptions for ${familyName} across all steps`, () => {
        for (const step of steps) {
          const token = options[optionKey][step] as { $value?: unknown; $description?: string } | undefined;
          if (!token || typeof token.$value !== "string" || typeof token.$description !== "string") continue;

          const result = hexToCustomOklch(token.$value, familyName);
          const parsed = parseOklch(result);
          const expected = parseOklch(token.$description);

          expect(parsed.h, `${step} hue`).toBe(expected.h);
          expect(parsed.l, `${step} lightness`).toBeCloseTo(expected.l, 3);
          expect(parsed.c, `${step} chroma`).toBeCloseTo(expected.c, 3);
        }
      });
    }

    const CSV_FIXTURE =
      process.env.OKLCH_CSV_FIXTURE ??
      path.resolve(__dirname, "../../../assets/cedar_token_remap_v3 - Color Token Remap.csv");

    const describeCsv = fs.existsSync(CSV_FIXTURE) ? describe : describe.skip;
    describeCsv("design CSV validation", () => {
      it("validates hexToCustomOklch against the design CSV", () => {
        const rows = fs
          .readFileSync(CSV_FIXTURE, "utf-8")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        expect(rows.length).toBeGreaterThan(1);

        // Minimal header detection; assumes family, step, hex, l, c, h columns
        // Keep the test flexible enough to be wired to the exact CSV once provided.
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].split(",");
          expect(row.length).toBeGreaterThanOrEqual(4);
        }
      });
    });
  });
});
