/**
 * normalize-utils.test.ts
 *
 * Unit tests for the pure normalization helpers: clean, deepMerge,
 * buildCollectionToSection.
 *
 * Covers:
 *  - Stripping $extensions / $description
 *  - Preserving $value / $type on all token types (color, dimension, fontFamily, boolean)
 *  - Alias rewriting for color collections (bare → prefixed)
 *  - Alias references that already point to a section root are left unchanged
 *  - Spacing tokens: aliases within spacing stay as-is
 *  - Typography tokens: string and number $values
 *  - Deep merge: sibling keys merged, conflicts resolved (last-write-wins)
 *  - buildCollectionToSection: alias file, options file, spacing file, typography file
 */

import { describe, it, expect } from "vitest";
import { clean, deepMerge, buildCollectionToSection, nestUnderSections, joinPlatformTokens } from "./normalize-utils.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const FIGMA_LEAF = (value: unknown, type = "color") => ({
  $value: value,
  $type: type,
  $description: "ignore me",
  $extensions: { "com.figma": { hiddenFromPublishing: false } },
});

// ─── buildCollectionToSection ─────────────────────────────────────────────────

describe("buildCollectionToSection", () => {
  it("maps bare collection keys to the section derived from the filename", () => {
    const parsed = [
      {
        file: "options.color.light.json",
        data: { "neutral-palette": {}, "brand-palette": {} },
      },
    ];
    const map = buildCollectionToSection(parsed);
    expect(map.get("neutral-palette")).toBe("color");
    expect(map.get("brand-palette")).toBe("color");
  });

  it("maps a section-wrapper key and its children when topKey matches filename section", () => {
    const parsed = [
      {
        file: "alias.color.light.json",
        data: { color: { surface: {}, text: {}, border: {} } },
      },
    ];
    const map = buildCollectionToSection(parsed);
    expect(map.get("color")).toBe("color");
    expect(map.get("surface")).toBe("color");
    expect(map.get("text")).toBe("color");
    expect(map.get("border")).toBe("color");
  });

  it("maps spacing collection to itself when topKey matches filename section", () => {
    const parsed = [
      {
        file: "spacing.default.json",
        data: { spacing: { sm: {}, md: {}, lg: {} } },
      },
    ];
    const map = buildCollectionToSection(parsed);
    expect(map.get("spacing")).toBe("spacing");
    expect(map.get("sm")).toBe("spacing");
  });

  it("maps typography bare collections to the filename-derived section", () => {
    const parsed = [
      {
        file: "typography.font.regular.json",
        data: { "font-size": {}, "font-weight": {}, "font-family": {} },
      },
    ];
    const map = buildCollectionToSection(parsed);
    expect(map.get("font-size")).toBe("font");
    expect(map.get("font-weight")).toBe("font");
    expect(map.get("font-family")).toBe("font");
  });

  it("handles multiple files correctly", () => {
    const parsed = [
      { file: "options.color.light.json", data: { "neutral-palette": {}, "brand-palette": {} } },
      { file: "alias.color.light.json", data: { color: { surface: {}, text: {} } } },
      { file: "spacing.default.json", data: { spacing: { sm: {}, md: {} } } },
    ];
    const map = buildCollectionToSection(parsed);
    expect(map.get("neutral-palette")).toBe("color");
    expect(map.get("brand-palette")).toBe("color");
    expect(map.get("color")).toBe("color");
    expect(map.get("surface")).toBe("color");
    expect(map.get("spacing")).toBe("spacing");
    expect(map.get("sm")).toBe("spacing");
  });
});

// ─── clean ────────────────────────────────────────────────────────────────────

describe("clean", () => {
  it("strips $extensions and $description from leaf tokens", () => {
    const map = new Map<string, string>();
    const input = { token: FIGMA_LEAF("#ff0000") };
    const result = clean(input, map) as Record<string, unknown>;
    expect(result.token).toEqual({ $value: "#ff0000", $type: "color" });
    expect((result.token as Record<string, unknown>).$extensions).toBeUndefined();
    expect((result.token as Record<string, unknown>).$description).toBeUndefined();
  });

  it("preserves $value and $type for color tokens", () => {
    const map = new Map<string, string>();
    const input = { primary: FIGMA_LEAF("#0b2d60") };
    const result = clean(input, map) as Record<string, unknown>;
    expect(result.primary).toEqual({ $value: "#0b2d60", $type: "color" });
  });

  it("preserves numeric $value for dimension/spacing tokens", () => {
    const map = new Map<string, string>();
    const input = { sm: FIGMA_LEAF(8, "dimension") };
    const result = clean(input, map) as Record<string, unknown>;
    expect(result.sm).toEqual({ $value: "8", $type: "dimension" });
  });

  it("preserves string $value for fontFamily tokens", () => {
    const map = new Map<string, string>();
    const input = { body: FIGMA_LEAF("Inter", "fontFamily") };
    const result = clean(input, map) as Record<string, unknown>;
    expect(result.body).toEqual({ $value: "Inter", $type: "fontFamily" });
  });

  it("preserves boolean $value for tokens", () => {
    const map = new Map<string, string>();
    const input = { visible: FIGMA_LEAF(true, "boolean") };
    const result = clean(input, map) as Record<string, unknown>;
    expect(result.visible).toEqual({ $value: "true", $type: "boolean" });
  });

  it("rewrites bare color alias references with the section prefix", () => {
    const map = new Map([
      ["neutral-palette", "color"],
      ["brand-palette", "color"],
    ]);
    const input = {
      color: {
        surface: {
          base: FIGMA_LEAF("{neutral-palette.base-neutrals.white}"),
        },
      },
    };
    const result = clean(input, map) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result.color.surface.base).toEqual({
      $value: "{color.neutral-palette.base-neutrals.white}",
      $type: "color",
    });
  });

  it("does NOT rewrite alias references that already point to a section root", () => {
    // "color" maps to itself — no double-prefixing
    const map = new Map([["color", "color"]]);
    const input = {
      text: { link: FIGMA_LEAF("{color.brand-palette.blue.600}") },
    };
    const result = clean(input, map) as Record<string, Record<string, unknown>>;
    expect((result.text.link as Record<string, unknown>).$value).toBe(
      "{color.brand-palette.blue.600}",
    );
  });

  it("does NOT rewrite spacing alias references that reference the spacing section", () => {
    const map = new Map([
      ["spacing", "spacing"],
      ["sm", "spacing"],
    ]);
    const input = {
      spacing: {
        component: { button: FIGMA_LEAF("{spacing.sm}", "dimension") },
      },
    };
    const result = clean(input, map) as Record<string, Record<string, Record<string, unknown>>>;
    expect((result.spacing.component.button as Record<string, unknown>).$value).toBe(
      "{spacing.sm}",
    );
  });

  it("handles deeply nested token groups", () => {
    const map = new Map<string, string>();
    const input = {
      a: { b: { c: { d: FIGMA_LEAF("#123456") } } },
    };
    const result = clean(input, map) as Record<string, Record<string, Record<string, Record<string, unknown>>>>;
    expect(result.a.b.c.d).toEqual({ $value: "#123456", $type: "color" });
  });
});

// ─── deepMerge ────────────────────────────────────────────────────────────────

describe("deepMerge", () => {
  it("merges non-overlapping top-level keys", () => {
    const dest = { a: { x: 1 } };
    deepMerge(dest, { b: { y: 2 } });
    expect(dest).toEqual({ a: { x: 1 }, b: { y: 2 } });
  });

  it("deep-merges overlapping group keys without clobbering siblings", () => {
    const dest = { color: { surface: { base: "#fff" } } };
    deepMerge(dest as Record<string, unknown>, { color: { text: { base: "#000" } } } as Record<string, unknown>);
    expect((dest.color as Record<string, unknown>)).toEqual({
      surface: { base: "#fff" },
      text: { base: "#000" },
    });
  });

  it("later values overwrite earlier leaf values on conflict", () => {
    const dest: Record<string, unknown> = {
      color: { surface: { base: { $value: "#fff", $type: "color" } } },
    };
    deepMerge(dest, {
      color: { surface: { base: { $value: "#f5f2eb", $type: "color" } } },
    } as Record<string, unknown>);
    expect(
      ((dest.color as Record<string, unknown>).surface as Record<string, unknown>).base,
    ).toEqual({ $value: "#f5f2eb", $type: "color" });
  });

  it("does not mutate the src object", () => {
    const dest: Record<string, unknown> = {};
    const src = { a: { b: 1 } };
    deepMerge(dest, src as Record<string, unknown>);
    expect(src).toEqual({ a: { b: 1 } });
  });
});

// ─── nestUnderSections ───────────────────────────────────────────────────────

describe("nestUnderSections", () => {
  it("nests bare collections under their section (options file)", () => {
    const parsed = [
      {
        file: "options.color.light.json",
        data: { "neutral-palette": {}, "brand-palette": {} },
      },
    ];
    const map = buildCollectionToSection(parsed);
    const cleaned = { "neutral-palette": { white: { $value: "#fff", $type: "color" } }, "brand-palette": {} };
    const result = nestUnderSections(cleaned, map);
    expect(Object.keys(result)).toEqual(["color"]);
    expect(Object.keys(result.color as object)).toContain("neutral-palette");
    expect(Object.keys(result.color as object)).toContain("brand-palette");
  });

  it("keeps section wrapper keys at the top level (alias file)", () => {
    const parsed = [
      {
        file: "alias.color.light.json",
        data: { color: { surface: {}, text: {} } },
      },
    ];
    const map = buildCollectionToSection(parsed);
    const cleaned = { color: { surface: { base: { $value: "#fff", $type: "color" } }, text: {} } };
    const result = nestUnderSections(cleaned, map);
    expect(Object.keys(result)).toEqual(["color"]);
    expect((result.color as Record<string, unknown>).surface).toBeDefined();
  });

  it("merges bare collections and wrapper children under the same section key", () => {
    const parsed = [
      { file: "options.color.light.json", data: { "neutral-palette": {} } },
      { file: "alias.color.light.json", data: { color: { text: {} } } },
    ];
    const map = buildCollectionToSection(parsed);

    const cleanedOptions = { "neutral-palette": { white: { $value: "#fff", $type: "color" } } };
    const cleanedAlias = { color: { text: { link: { $value: "{color.neutral-palette.white}", $type: "color" } } } };

    const canonical: Record<string, unknown> = {};
    deepMerge(canonical, nestUnderSections(cleanedOptions, map));
    deepMerge(canonical, nestUnderSections(cleanedAlias, map));

    // Both should be under "color"
    expect(Object.keys(canonical)).toEqual(["color"]);
    const colorSection = canonical.color as Record<string, unknown>;
    expect(colorSection["neutral-palette"]).toBeDefined();
    expect(colorSection.text).toBeDefined();
  });

  it("nests spacing section wrapper unchanged", () => {
    const parsed = [
      { file: "spacing.default.json", data: { spacing: { sm: {}, md: {} } } },
    ];
    const map = buildCollectionToSection(parsed);
    const cleaned = { spacing: { sm: { $value: "4", $type: "dimension" } } };
    const result = nestUnderSections(cleaned, map);
    expect(Object.keys(result)).toEqual(["spacing"]);
    expect((result.spacing as Record<string, unknown>).sm).toBeDefined();
  });
});

// ─── Integration: clean + nestUnderSections + deepMerge ──────────────────────

describe("clean + nestUnderSections + deepMerge integration", () => {
  it("produces a section-nested canonical tree from a realistic multi-file token set", () => {
    const parsed = [
      {
        file: "options.color.light.json",
        data: {
          "neutral-palette": {
            white: FIGMA_LEAF("#ffffff"),
          },
          "brand-palette": {
            blue: { "600": FIGMA_LEAF("#0b2d60") },
          },
        },
      },
      {
        file: "alias.color.light.json",
        data: {
          color: {
            text: {
              link: FIGMA_LEAF("{brand-palette.blue.600}"),
            },
          },
        },
      },
      {
        file: "spacing.default.json",
        data: {
          spacing: {
            sm: FIGMA_LEAF(4, "dimension"),
            component: {
              button: FIGMA_LEAF("{spacing.sm}", "dimension"),
            },
          },
        },
      },
    ];

    const collectionToSection = buildCollectionToSection(parsed);
    const canonical: Record<string, unknown> = {};

    for (const { data } of parsed) {
      const cleaned = clean(data, collectionToSection);
      const nested = nestUnderSections(cleaned as Record<string, unknown>, collectionToSection);
      deepMerge(canonical, nested);
    }

    // Top-level keys should only be section names
    expect(Object.keys(canonical).sort()).toEqual(["color", "spacing"]);

    // Options collections are nested under "color"
    const colorSection = canonical.color as Record<string, unknown>;
    expect(colorSection["neutral-palette"]).toBeDefined();
    expect(colorSection["brand-palette"]).toBeDefined();

    // Alias tokens are also under "color"
    const textLink = (colorSection.text as Record<string, unknown>).link as Record<string, unknown>;
    expect(textLink.$value).toBe("{color.brand-palette.blue.600}");
    expect(textLink.$extensions).toBeUndefined();

    // Spacing alias pointing to its own section should NOT be prefixed
    const spacingSection = canonical.spacing as Record<string, unknown>;
    const buttonSpacing = (spacingSection.component as Record<string, unknown>).button as Record<string, unknown>;
    expect(buttonSpacing.$value).toBe("{spacing.sm}");
    expect(buttonSpacing.$type).toBe("dimension");

    // Raw spacing value is preserved
    const sm = spacingSection.sm as Record<string, unknown>;
    expect(sm.$value).toBe("4");
    expect(sm.$type).toBe("dimension");
  });
});

// ─── joinPlatformTokens ───────────────────────────────────────────────────────

describe("joinPlatformTokens", () => {
  const leaf = (value: string, type = "color") => ({ $value: value, $type: type });

  it("merges web and iOS leaf tokens into a { web, ios } value", () => {
    const web = { "100": leaf("#edeae3") };
    const ios = { "100": leaf("#2E2E2B") };
    const result = joinPlatformTokens(web, ios) as Record<string, unknown>;
    expect(result["100"]).toEqual({ $value: { web: "#edeae3", ios: "#2E2E2B" }, $type: "color" });
  });

  it("falls back to web value when iOS value is empty string", () => {
    const web = { white: leaf("#ffffff") };
    const ios = { white: leaf("") };
    const result = joinPlatformTokens(web, ios) as Record<string, unknown>;
    expect(result.white).toEqual({ $value: { web: "#ffffff", ios: "#ffffff" }, $type: "color" });
  });

  it("handles 8-digit hex (alpha channel) correctly", () => {
    const web = { "white-85": leaf("#ffffffd9") };
    const ios = { "white-85": leaf("#ffffffd9") };
    const result = joinPlatformTokens(web, ios) as Record<string, unknown>;
    expect(result["white-85"]).toEqual({ $value: { web: "#ffffffd9", ios: "#ffffffd9" }, $type: "color" });
  });

  it("recurses into nested token groups", () => {
    const web = { "neutral-palette": { "warm-grey": { "100": leaf("#edeae3") } } };
    const ios = { "neutral-palette": { "warm-grey": { "100": leaf("#2E2E2B") } } };
    const result = joinPlatformTokens(web, ios) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result["neutral-palette"]["warm-grey"]["100"]).toEqual({
      $value: { web: "#edeae3", ios: "#2E2E2B" },
      $type: "color",
    });
  });

  it("uses web token as-is when iOS key is missing", () => {
    const web = { extra: leaf("#000000") };
    const ios = {};
    const result = joinPlatformTokens(web, ios) as Record<string, unknown>;
    expect(result.extra).toEqual({ $value: "#000000", $type: "color" });
  });

  it("uses iOS token as-is when web key is missing", () => {
    const web = {};
    const ios = { extra: leaf("#111111") };
    const result = joinPlatformTokens(web, ios) as Record<string, unknown>;
    expect(result.extra).toEqual({ $value: "#111111", $type: "color" });
  });

  it("throws when web value is an invalid hex string", () => {
    const web = { bad: leaf("not-a-color") };
    const ios = { bad: leaf("#ffffff") };
    expect(() => joinPlatformTokens(web, ios)).toThrow(
      /invalid web value "not-a-color"/,
    );
  });

  it("throws when iOS value is an invalid hex string", () => {
    const web = { bad: leaf("#ffffff") };
    const ios = { bad: leaf("oops") };
    expect(() => joinPlatformTokens(web, ios)).toThrow(
      /invalid iOS value "oops"/,
    );
  });

  it("error message includes the token path", () => {
    const web = { palette: { "50": leaf("invalid") } };
    const ios = { palette: { "50": leaf("#ffffff") } };
    expect(() => joinPlatformTokens(web, ios)).toThrow(/palette\.50/);
  });

  it("throws when web value is missing (empty string, non-fallback path)", () => {
    const web = { missing: leaf("") };
    const ios = { missing: leaf("#ffffff") };
    // empty web str → validation error
    expect(() => joinPlatformTokens(web, ios)).toThrow(
      /missing required "web" value/,
    );
  });
});
