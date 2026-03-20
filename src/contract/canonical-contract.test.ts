import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type JsonObject = Record<string, unknown>;
type Violation = {
  tokenPath: string;
  ruleId: string;
  adr: string;
  expected: string;
  actual: string;
};

const canonicalPath = path.resolve(process.cwd(), "canonical/tokens.json");

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

function isColorOptionAlias(value: unknown): value is string {
  return typeof value === "string" && /^\{color\.option\.[^}]+\}$/.test(value);
}

function isPlainPathString(value: unknown): value is string {
  return typeof value === "string" && !value.includes("{") && !value.includes("}");
}

function walkTokenLeaves(
  node: unknown,
  pathParts: string[],
  visit: (leaf: JsonObject, path: string[]) => void,
) {
  if (!isObject(node)) return;

  if ("$value" in node && "$type" in node) {
    visit(node, pathParts);
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    walkTokenLeaves(value, [...pathParts, key], visit);
  }
}

function stringifyActual(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
}

function pushViolation(
  violations: Violation[],
  tokenPath: string,
  ruleId: string,
  adr: string,
  expected: string,
  actual: unknown,
) {
  violations.push({
    tokenPath,
    ruleId,
    adr,
    expected,
    actual: stringifyActual(actual),
  });
}

function formatViolationReport(violations: Violation[]): string {
  const lines = [
    `Canonical contract violations: ${violations.length}`,
    "",
    "Each item shows what changed vs expectation. If intentional, update the referenced ADR(s) and this contract suite in the same PR.",
    "",
  ];

  violations.forEach((v, index) => {
    lines.push(
      `${index + 1}. [${v.ruleId}] ${v.tokenPath}`,
      `   ADR: ${v.adr}`,
      `   Expected: ${v.expected}`,
      `   Actual: ${v.actual}`,
      "",
    );
  });

  return lines.join("\n");
}

describe("canonical contract invariants", () => {
  it("matches ADR-0001/0002 canonical structure and color token rules", () => {
    const canonical = JSON.parse(fs.readFileSync(canonicalPath, "utf8")) as JsonObject;
    const violations: Violation[] = [];

    if (!isObject(canonical.color)) {
      pushViolation(
        violations,
        "color",
        "ROOT_COLOR_OBJECT",
        "ADR-0001",
        "canonical root contains a color object",
        canonical.color,
      );
    }

    const color = (canonical.color as JsonObject | undefined) ?? {};

    if ("primitives" in color) {
      pushViolation(
        violations,
        "color.primitives",
        "FORBID_COLOR_PRIMITIVES",
        "ADR-0001/ADR-0002",
        "color.primitives is absent in canonical output",
        color.primitives,
      );
    }

    if (!isObject(color.option)) {
      pushViolation(
        violations,
        "color.option",
        "MISSING_COLOR_OPTION",
        "ADR-0001",
        "color.option exists as object",
        color.option,
      );
    }

    if (!isObject(color.modes)) {
      pushViolation(
        violations,
        "color.modes",
        "MISSING_COLOR_MODES",
        "ADR-0001/ADR-0002",
        "color.modes exists as object",
        color.modes,
      );
    }

    walkTokenLeaves(color.option, ["color", "option"], (leaf, pathParts) => {
      const tokenPath = pathParts.join(".");

      if (leaf.$type !== "color") {
        pushViolation(
          violations,
          tokenPath,
          "OPTION_TYPE_COLOR",
          "ADR-0001",
          '$type is "color"',
          leaf.$type,
        );
      }

      if (!isHexColor(leaf.$value)) {
        pushViolation(
          violations,
          tokenPath,
          "OPTION_VALUE_HEX",
          "ADR-0001",
          "$value is hex color (#RRGGBB or #RRGGBBAA)",
          leaf.$value,
        );
      }

      if ("$resolved" in leaf) {
        pushViolation(
          violations,
          tokenPath,
          "NO_TOP_LEVEL_RESOLVED",
          "ADR-0001",
          "no top-level $resolved field",
          leaf.$resolved,
        );
      }

      const cedar = (leaf.$extensions as JsonObject | undefined)?.cedar;
      if (!isObject(cedar)) return;

      const appearances = cedar.appearances;
      if (isObject(appearances)) {
        for (const [appearance, value] of Object.entries(appearances)) {
          if (!isHexColor(value)) {
            pushViolation(
              violations,
              `${tokenPath}.$extensions.cedar.appearances.${appearance}`,
              "APPEARANCE_HEX",
              "ADR-0001",
              "appearance override is hex color",
              value,
            );
          }
        }
      }

      const platformOverrides = cedar.platformOverrides;
      if (isObject(platformOverrides)) {
        for (const [platform, overrides] of Object.entries(platformOverrides)) {
          if (!isObject(overrides)) {
            pushViolation(
              violations,
              `${tokenPath}.$extensions.cedar.platformOverrides.${platform}`,
              "PLATFORM_OVERRIDES_OBJECT",
              "ADR-0001",
              "platformOverrides.<platform> is object",
              overrides,
            );
          }

          if (!isObject(overrides)) continue;
          for (const [appearance, value] of Object.entries(overrides)) {
            if (!isHexColor(value)) {
              pushViolation(
                violations,
                `${tokenPath}.$extensions.cedar.platformOverrides.${platform}.${appearance}`,
                "PLATFORM_OVERRIDE_HEX",
                "ADR-0001",
                "platform override is hex color",
                value,
              );
            }
          }
        }
      }
    });

    walkTokenLeaves(color.modes, ["color", "modes"], (leaf, pathParts) => {
      const tokenPath = pathParts.join(".");

      if (leaf.$type !== "color") {
        pushViolation(
          violations,
          tokenPath,
          "ALIAS_TYPE_COLOR",
          "ADR-0001",
          '$type is "color"',
          leaf.$type,
        );
      }

      if (!isColorOptionAlias(leaf.$value)) {
        pushViolation(
          violations,
          tokenPath,
          "ALIAS_REFERENCE_FORMAT",
          "ADR-0001/ADR-0002",
          "$value references {color.option.*}",
          leaf.$value,
        );
      }

      const cedar = (leaf.$extensions as JsonObject | undefined)?.cedar;
      if (!isObject(cedar)) {
        pushViolation(
          violations,
          `${tokenPath}.$extensions.cedar`,
          "ALIAS_CEDAR_REQUIRED",
          "ADR-0001",
          "$extensions.cedar exists",
          cedar,
        );
      }
      if (!isObject(cedar)) return;

      for (const platform of ["ios", "web"]) {
        const platformValue = cedar[platform];
        if (!isObject(platformValue)) {
          pushViolation(
            violations,
            `${tokenPath}.$extensions.cedar.${platform}`,
            "ALIAS_PLATFORM_REQUIRED",
            "ADR-0001/ADR-0005",
            `${platform} object with light and dark keys`,
            platformValue,
          );
        }

        if (!isObject(platformValue)) continue;
        for (const appearance of ["light", "dark"]) {
          const pathValue = platformValue[appearance];
          if (!isPlainPathString(pathValue)) {
            pushViolation(
              violations,
              `${tokenPath}.$extensions.cedar.${platform}.${appearance}`,
              "ALIAS_PLATFORM_PATH_PLAIN",
              "ADR-0005",
              "plain dot-path string without brace syntax",
              pathValue,
            );
          }
        }
      }

      const resolved = cedar.resolved;
      if (isObject(resolved)) {
        for (const [platform, appearances] of Object.entries(resolved)) {
          if (!isObject(appearances)) {
            pushViolation(
              violations,
              `${tokenPath}.$extensions.cedar.resolved.${platform}`,
              "RESOLVED_PLATFORM_OBJECT",
              "ADR-0011",
              "resolved.<platform> is object",
              appearances,
            );
          }
          if (!isObject(appearances)) continue;

          for (const [appearance, value] of Object.entries(appearances)) {
            if (!isHexColor(value)) {
              pushViolation(
                violations,
                `${tokenPath}.$extensions.cedar.resolved.${platform}.${appearance}`,
                "RESOLVED_HEX",
                "ADR-0011",
                "resolved value is hex color",
                value,
              );
            }
          }
        }
      }
    });

    expect(violations, formatViolationReport(violations)).toHaveLength(0);
  });
});
