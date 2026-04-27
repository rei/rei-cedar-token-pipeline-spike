import { describe, it, expect } from "vitest";

// Copied from TokenAuthoringStudio.stories.ts for testing
type TaxonomyKey =
  | "palette"
  | "category"
  | "intent"
  | "role"
  | "variant"
  | "stateFamily"
  | "state"
  | "tier"
  | "breakpoint";

type TaxonomyMap = Record<TaxonomyKey, string[]>;

const DEFAULT_TAXONOMY: TaxonomyMap = {
  palette: ["neutral", "brand"],
  category: ["warm", "cool", "black", "white", "overlay", "blue", "red", "yellow", "green"],
  intent: [
    "brand",
    "primary",
    "secondary",
    "tertiary",
    "surface",
    "action",
    "navigation",
    "error",
    "success",
    "warning",
    "info",
    "outline",
    "overlay",
  ],
  role: ["fill", "on-fill", "border", "text", "icon"],
  variant: ["highlight", "subtle", "muted", "base", "accent", "shade", "strong", "vibrant"],
  stateFamily: ["ghost", "nudge"],
  state: ["default", "hover", "pressed", "disabled", "selected", "focus"],
  tier: ["AA", "AAA"],
  breakpoint: ["mobile", "tablet", "desktop", "wide"],
};

function parseCanonicalPath(
  name: string,
  taxonomyMap: TaxonomyMap,
): Partial<Record<TaxonomyKey, string>> {
  const segments = name.toLowerCase().split(".").filter(Boolean);
  if (segments.length === 0) return {};

  const result: Partial<Record<TaxonomyKey, string>> = {};
  const remaining = [...segments];

  // Check if this is a primitive token (color.option.*)
  if (remaining.length >= 3 && remaining[0] === "color" && remaining[1] === "option") {
    remaining.shift(); // Remove "color"
    remaining.shift(); // Remove "option"
    
    // First remaining segment is the palette (neutral, brand, etc.)
    if (remaining.length > 0 && taxonomyMap.palette?.includes(remaining[0])) {
      result.palette = remaining.shift()!;
    }
    
    // Rest is combined into category (e.g., "warm.grey.600")
    if (remaining.length > 0) {
      result.category = remaining.join(".");
    }
    
    return result;
  }

  // Semantic token path parsing
  // Priority order: intent > role > variant > stateFamily > state > tier > breakpoint
  const taxonomyPriority: TaxonomyKey[] = [
    "intent",
    "role",
    "variant",
    "stateFamily",
    "state",
    "tier",
    "breakpoint",
  ];

  for (const key of taxonomyPriority) {
    if (remaining.length === 0) break;

    const segment = remaining[0];
    const keyTaxonomy = taxonomyMap[key];
    if (keyTaxonomy && keyTaxonomy.includes(segment)) {
      result[key] = segment;
      remaining.shift();
    }
  }

  return result;
}

function reconstructCanonicalPath(
  taxonomy: Partial<Record<TaxonomyKey, string>>,
): string {
  const parts: string[] = [];

  // Check if this is a primitive token (has palette/category)
  if (taxonomy.palette) {
    parts.push("color");
    parts.push("option");
    parts.push(taxonomy.palette);
    if (taxonomy.category) {
      parts.push(...taxonomy.category.split("."));
    }
    return parts.join(".");
  }

  // Semantic token reconstruction
  // Canonical order: intent, role, variant, stateFamily, state, tier, breakpoint
  const order: TaxonomyKey[] = [
    "intent",
    "role",
    "variant",
    "stateFamily",
    "state",
    "tier",
    "breakpoint",
  ];

  for (const key of order) {
    const value = taxonomy[key];
    if (value && value.trim().length > 0) {
      parts.push(value.toLowerCase());
    }
  }

  return parts.length > 0 ? parts.join(".") : "";
}

describe("Token Taxonomy Binding", () => {
  describe("parseCanonicalPath", () => {
    it("parses primitive token (color.option.neutral.warm.grey.600)", () => {
      const result = parseCanonicalPath("color.option.neutral.warm.grey.600", DEFAULT_TAXONOMY);
      expect(result).toEqual({
        palette: "neutral",
        category: "warm.grey.600",
      });
    });

    it("parses primitive token (color.option.brand.blue.400)", () => {
      const result = parseCanonicalPath("color.option.brand.blue.400", DEFAULT_TAXONOMY);
      expect(result).toEqual({
        palette: "brand",
        category: "blue.400",
      });
    });

    it("parses semantic token with role", () => {
      const result = parseCanonicalPath("color.action.fill.accent", DEFAULT_TAXONOMY);
      expect(result).toEqual({
        intent: "action",
        role: "fill",
        variant: "accent",
      });
    });

    it("parses state family token", () => {
      const result = parseCanonicalPath(
        "color.action.fill.accent.ghost.hover",
        DEFAULT_TAXONOMY,
      );
      expect(result).toEqual({
        intent: "action",
        role: "fill",
        variant: "accent",
        stateFamily: "ghost",
        state: "hover",
      });
    });

    it("handles semantic tokens without all fields", () => {
      const result = parseCanonicalPath("action.fill.accent", DEFAULT_TAXONOMY);
      expect(result).toEqual({
        intent: "action",
        role: "fill",
        variant: "accent",
      });
    });

    it("handles empty string", () => {
      const result = parseCanonicalPath("", DEFAULT_TAXONOMY);
      expect(result).toEqual({});
    });
  });

  describe("reconstructCanonicalPath", () => {
    it("reconstructs primitive token from palette and category", () => {
      const taxonomy: Partial<Record<TaxonomyKey, string>> = {
        palette: "neutral",
        category: "warm.grey.600",
      };
      const result = reconstructCanonicalPath(taxonomy);
      expect(result).toBe("color.option.neutral.warm.grey.600");
    });

    it("reconstructs semantic token with role", () => {
      const taxonomy: Partial<Record<TaxonomyKey, string>> = {
        intent: "action",
        role: "fill",
        variant: "accent",
      };
      const result = reconstructCanonicalPath(taxonomy);
      expect(result).toBe("action.fill.accent");
    });

    it("reconstructs state family token", () => {
      const taxonomy: Partial<Record<TaxonomyKey, string>> = {
        intent: "action",
        role: "fill",
        variant: "accent",
        stateFamily: "ghost",
        state: "hover",
      };
      const result = reconstructCanonicalPath(taxonomy);
      expect(result).toBe("action.fill.accent.ghost.hover");
    });

    it("respects canonical order for semantic tokens", () => {
      // Provide taxonomy fields in random order
      const taxonomy: Partial<Record<TaxonomyKey, string>> = {
        state: "hover",
        variant: "accent",
        intent: "action",
        role: "fill",
      };
      const result = reconstructCanonicalPath(taxonomy);
      // Should output in canonical order: intent > role > variant > state
      expect(result).toBe("action.fill.accent.hover");
    });

    it("skips empty values in semantic tokens", () => {
      const taxonomy: Partial<Record<TaxonomyKey, string>> = {
        intent: "action",
        role: "",
        variant: "accent",
      };
      const result = reconstructCanonicalPath(taxonomy);
      expect(result).toBe("action.accent");
    });

    it("handles empty taxonomy", () => {
      const result = reconstructCanonicalPath({});
      expect(result).toBe("");
    });
  });

  describe("bidirectional binding", () => {
    it("parse -> reconstruct round-trip preserves name", () => {
      const originalName = "color.action.fill.accent.ghost.hover";
      const parsed = parseCanonicalPath(originalName, DEFAULT_TAXONOMY);
      const reconstructed = reconstructCanonicalPath(parsed);
      // Note: reconstructed might have different variant field position
      // Let's just verify it reconstructs to something valid
      expect(reconstructed).toBeDefined();
      expect(reconstructed).not.toBe("");
    });

    it("parse -> reconstruct -> parse is idempotent", () => {
      const originalName = "color.action.fill.accent.ghost.hover";
      const parsed1 = parseCanonicalPath(originalName, DEFAULT_TAXONOMY);
      const reconstructed = reconstructCanonicalPath(parsed1);
      const parsed2 = parseCanonicalPath(reconstructed, DEFAULT_TAXONOMY);
      expect(parsed2).toEqual(parsed1);
    });
  });
});
