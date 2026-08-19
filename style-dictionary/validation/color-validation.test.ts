import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { converter, parse } from "culori";
import {
  COLOR_REFERENCE_HEADERS,
  COLOR_VALIDATION_TOLERANCES,
  FAMILY_PARAMETER_HEADERS,
  canonicalFamilyName,
  deltaE,
  normalizeColorReferences,
  normalizeFamilyParameters,
  parseCsvRecords,
  referenceOklch,
  validateColorReferenceData,
  type ColorFamilyParameter,
  type ColorReference,
  parseHexRgb,
} from "./color-reference.js";
import {
  COLOR_FAMILIES,
  buildCustomOklch,
  hexToCustomOklch,
  LMAX,
  LMIN,
} from "../actions/web/oklch-formulas.js";

type JsonRecord = Record<string, unknown>;
type ColorToken = { $value?: unknown };
type ValidationStatus = "PASS" | "FAIL" | "ERROR";

type WebResult = {
  row: ColorReference;
  sourceHex?: string;
  sourceHexDiff?: boolean;
  generated?: ReturnType<typeof buildCustomOklch>;
  delta?: number;
  status: ValidationStatus;
  error?: string;
};

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const assetsDir = path.join(rootDir, "assets");
const tokensDir = path.join(rootDir, "tokens");
const parameterPath = path.join(assetsDir, "normalized-color-family-parameters.csv");
const referencePath = path.join(assetsDir, "normalized-color-output-references.csv");
const sourcePathByAppearance = {
  default: path.join(tokensDir, "options.color.web-light.json"),
  light: path.join(tokensDir, "options.color.web-light.json"),
  dark: path.join(tokensDir, "options.color.web-dark.json"),
} as const;

const sourceFamilyAliases: Record<string, string> = {
  "highlight-lichen": "lichen",
  "appex-moss": "apex-moss",
  "new-sale-red": "sale-red",
};

const toP3 = converter("p3");
const toRgb = converter("rgb");

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as JsonRecord;
}

function readReferences(): {
  parameters: ColorFamilyParameter[];
  references: ColorReference[];
} {
  const parameters = normalizeFamilyParameters(
    parseCsvRecords(
      fs.readFileSync(parameterPath, "utf8"),
      FAMILY_PARAMETER_HEADERS,
      parameterPath,
    ),
  );
  const references = normalizeColorReferences(
    parseCsvRecords(fs.readFileSync(referencePath, "utf8"), COLOR_REFERENCE_HEADERS, referencePath),
  );

  return { parameters, references };
}

const { parameters, references } = readReferences();
const sourceByAppearance = new Map<string, JsonRecord>();
for (const [appearance, filePath] of Object.entries(sourcePathByAppearance)) {
  sourceByAppearance.set(appearance, readJson(filePath));
}

function getSourceHex(row: ColorReference): string | undefined {
  const source = sourceByAppearance.get(row.appearance) ?? sourceByAppearance.get("default");
  const sourceFamily = sourceFamilyAliases[row.family] ?? row.family;
  const family = source?.[sourceFamily];
  if (!family || typeof family !== "object") return undefined;

  const token = (family as JsonRecord)[row.step] as ColorToken | undefined;
  return typeof token?.$value === "string" ? token.$value.toLowerCase() : undefined;
}

function round(value: number, precision: number): number {
  return Number(value.toFixed(precision));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function generatedWebOklch(row: ColorReference, sourceHex: string) {
  const cssValue = hexToCustomOklch(sourceHex, row.family);
  const parsed = parse(cssValue);
  if (!parsed || parsed.mode !== "oklch") {
    throw new Error(`Could not parse generated web value ${cssValue}.`);
  }
  return parsed as ReturnType<typeof referenceOklch>;
}

function generatedP3(row: ColorReference, sourceHex: string) {
  const oklch = buildCustomOklch(sourceHex, row.family);
  const p3 = toP3(oklch) as { r?: number; g?: number; b?: number; alpha?: number } | undefined;
  if (!p3 || typeof p3.r !== "number" || typeof p3.g !== "number" || typeof p3.b !== "number") {
    throw new Error(`Could not convert ${row.token_name} to Display P3.`);
  }

  return {
    mode: "p3" as const,
    r: round(clamp01(p3.r), 4),
    g: round(clamp01(p3.g), 4),
    b: round(clamp01(p3.b), 4),
    alpha: round(typeof p3.alpha === "number" ? p3.alpha : 1, 3),
  };
}

function generatedAndroidSrgb(sourceHex: string) {
  if (sourceHex.startsWith("#")) return parseHexRgb(sourceHex);

  const parsed = parse(sourceHex);
  if (!parsed) return undefined;
  const rgb = toRgb(parsed) as { r?: number; g?: number; b?: number; alpha?: number } | undefined;
  if (!rgb || typeof rgb.r !== "number" || typeof rgb.g !== "number" || typeof rgb.b !== "number") {
    return undefined;
  }

  return {
    mode: "rgb" as const,
    r: Math.round(clamp01(rgb.r) * 255) / 255,
    g: Math.round(clamp01(rgb.g) * 255) / 255,
    b: Math.round(clamp01(rgb.b) * 255) / 255,
    alpha: typeof rgb.alpha === "number" ? rgb.alpha : 1,
  };
}

function expectedAndroid(row: ColorReference) {
  if (row.android_strategy === "srgb") return parseHexRgb(row.android_hex);
  if (row.android_strategy === "p3") {
    return {
      mode: "p3" as const,
      r: Number(row.android_r),
      g: Number(row.android_g),
      b: Number(row.android_b),
      alpha: Number(row.android_alpha),
    };
  }
  return undefined;
}

function webResult(row: ColorReference): WebResult {
  const sourceHex = getSourceHex(row);
  if (!sourceHex) {
    return {
      row,
      status: "ERROR",
      error: `No source token found for ${row.family}/${row.step}/${row.appearance}.`,
    };
  }

  try {
    const generated = generatedWebOklch(row, sourceHex);
    const delta = deltaE(generated, referenceOklch(row));
    return {
      row,
      sourceHex,
      sourceHexDiff: sourceHex !== row.design_hex,
      generated,
      delta,
      status: delta <= COLOR_VALIDATION_TOLERANCES.web ? "PASS" : "FAIL",
    };
  } catch (error) {
    return {
      row,
      sourceHex,
      status: "ERROR",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function parameterMismatches(row: ColorFamilyParameter): string[] {
  const family = COLOR_FAMILIES[row.family];
  if (!family) return [`${row.family}: missing COLOR_FAMILIES entry.`];

  const mismatches: string[] = [];
  const checks: Array<[keyof ColorFamilyParameter, keyof typeof family]> = [
    ["hue", "hue"],
    ["cmax", "cmax"],
    ["lo", "lo"],
    ["wlight", "wlight"],
    ["clight_min", "clightMin"],
    ["wdark", "wdark"],
    ["cdark_min", "cdarkMin"],
  ];

  for (const [csvField, codeField] of checks) {
    if (row[csvField] === "") continue;
    const expected = Number(row[csvField]);
    const actual = family[codeField];
    if (Math.abs(expected - actual) > 1e-9) {
      mismatches.push(`${row.family}.${csvField}: design=${expected}, code=${actual}`);
    }
  }

  if (row.lmin !== "" && Math.abs(Number(row.lmin) - LMIN) > 1e-9) {
    mismatches.push(`${row.family}.lmin: design=${row.lmin}, code=${LMIN}`);
  }
  if (row.lmax !== "" && Math.abs(Number(row.lmax) - LMAX) > 1e-9) {
    mismatches.push(`${row.family}.lmax: design=${row.lmax}, code=${LMAX}`);
  }

  return mismatches;
}

const webResults = references.map(webResult);
const iosReferences = references.filter((row) => row.ios_reference_status === "provided");
const androidReferences = references.filter((row) => row.android_reference_status === "provided");

function reportResults(): void {
  const grouped = new Map<string, WebResult[]>();
  for (const result of webResults) {
    const familyResults = grouped.get(result.row.family) ?? [];
    familyResults.push(result);
    grouped.set(result.row.family, familyResults);
  }

  console.log("\n[color-validation] Web OKLCH report (CIEDE2000)");
  for (const [family, familyResults] of grouped) {
    const details = familyResults
      .map((result) => {
        const delta = typeof result.delta === "number" ? result.delta.toFixed(3) : result.status;
        const status = result.sourceHexDiff ? `${result.status}*` : result.status;
        return `${result.row.step}:${status}[${delta}]`;
      })
      .join(" ");
    console.log(`  ${family}: ${details}`);
  }

  const passCount = webResults.filter((result) => result.status === "PASS").length;
  console.log(
    `[color-validation] web=${passCount}/${webResults.length} passing; ` +
      `iOS references=${iosReferences.length}; Android references=${androidReferences.length}.`,
  );
  console.log(
    "[color-validation] * indicates the repository hex differs from the Figma display hex; " +
      "the authoritative comparison is the v1.8 OKLCH value.",
  );
}

describe("color reference fixtures", () => {
  it("are normalized and structurally valid", () => {
    const issues = validateColorReferenceData(parameters, references);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  for (const row of parameters) {
    it(`matches design formula parameters for ${row.family}`, () => {
      const mismatches = parameterMismatches(row);
      expect(mismatches, mismatches.join("\n")).toEqual([]);
    });
  }

  it("contains canonical family names only", () => {
    const nonCanonical = [...new Set(references.map((row) => row.family))].filter(
      (family) => canonicalFamilyName(family) !== family,
    );
    expect(nonCanonical).toEqual([]);
  });
});

describe("web OKLCH design references", () => {
  for (const result of webResults) {
    const { row } = result;

    it(`${row.family}/${row.step} matches the design OKLCH reference`, () => {
      expect(result.sourceHex, result.error).toBeDefined();
      expect(result.delta, result.error).toBeDefined();
      expect(result.delta, `${row.token_name}: ΔE exceeded web tolerance`).toBeLessThanOrEqual(
        COLOR_VALIDATION_TOLERANCES.web,
      );
    });
  }
});

describe("iOS Display P3 design references", () => {
  if (iosReferences.length === 0) {
    it("reports that no design P3 references were supplied", () => {
      expect(iosReferences).toHaveLength(0);
      console.log("[color-validation] iOS P3 validation not run: no design references supplied.");
    });
  } else {
    for (const row of iosReferences) {
      it(`${row.family}/${row.step} matches the design Display P3 reference`, () => {
        const sourceHex = getSourceHex(row);
        expect(sourceHex).toBeDefined();
        if (!sourceHex) return;

        const generated = generatedP3(row, sourceHex);
        const expected = {
          mode: "p3" as const,
          r: Number(row.ios_p3_r),
          g: Number(row.ios_p3_g),
          b: Number(row.ios_p3_b),
          alpha: Number(row.ios_p3_alpha),
        };
        const difference = deltaE(generated, expected);
        expect(difference, `${row.token_name}: ΔE exceeded iOS tolerance`).toBeLessThanOrEqual(
          COLOR_VALIDATION_TOLERANCES.ios,
        );
      });
    }
  }
});

describe("Android design references", () => {
  if (androidReferences.length === 0) {
    it("reports that no Android references were supplied", () => {
      expect(androidReferences).toHaveLength(0);
      console.log("[color-validation] Android validation not run: no design references supplied.");
    });
  } else {
    for (const row of androidReferences) {
      it(`${row.family}/${row.step} matches the design Android reference`, () => {
        const sourceHex = getSourceHex(row);
        expect(sourceHex).toBeDefined();
        if (!sourceHex) return;

        const generated =
          row.android_strategy === "p3"
            ? generatedP3(row, sourceHex)
            : generatedAndroidSrgb(sourceHex);
        const expected = expectedAndroid(row);
        expect(generated).toBeDefined();
        expect(expected).toBeDefined();
        if (!generated || !expected) return;

        const difference = deltaE(generated, expected);
        expect(difference, `${row.token_name}: ΔE exceeded Android tolerance`).toBeLessThanOrEqual(
          COLOR_VALIDATION_TOLERANCES.android,
        );
      });
    }
  }
});

afterAll(reportResults);
