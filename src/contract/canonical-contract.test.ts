import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type JsonObject = Record<string, unknown>;

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

describe("canonical contract invariants", () => {
  it("matches ADR-0001/0002 canonical structure and color token rules", () => {
    const canonical = JSON.parse(fs.readFileSync(canonicalPath, "utf8")) as JsonObject;

    expect(isObject(canonical.color)).toBe(true);
    const color = canonical.color as JsonObject;

    expect("primitives" in color).toBe(false);
    expect(isObject(color.option)).toBe(true);
    expect(isObject(color.modes)).toBe(true);

    walkTokenLeaves(color.option, ["color", "option"], (leaf, pathParts) => {
      const tokenPath = pathParts.join(".");

      expect(leaf.$type, `${tokenPath} must be color token`).toBe("color");
      expect(isHexColor(leaf.$value), `${tokenPath} must use hex $value`).toBe(true);
      expect("$resolved" in leaf, `${tokenPath} must not use top-level $resolved`).toBe(false);

      const cedar = (leaf.$extensions as JsonObject | undefined)?.cedar;
      if (!isObject(cedar)) return;

      const appearances = cedar.appearances;
      if (isObject(appearances)) {
        for (const [appearance, value] of Object.entries(appearances)) {
          expect(
            isHexColor(value),
            `${tokenPath} cedar.appearances.${appearance} must be hex color`,
          ).toBe(true);
        }
      }

      const platformOverrides = cedar.platformOverrides;
      if (isObject(platformOverrides)) {
        for (const [platform, overrides] of Object.entries(platformOverrides)) {
          expect(
            isObject(overrides),
            `${tokenPath} platformOverrides.${platform} must be object`,
          ).toBe(true);

          if (!isObject(overrides)) continue;
          for (const [appearance, value] of Object.entries(overrides)) {
            expect(
              isHexColor(value),
              `${tokenPath} platformOverrides.${platform}.${appearance} must be hex color`,
            ).toBe(true);
          }
        }
      }
    });

    walkTokenLeaves(color.modes, ["color", "modes"], (leaf, pathParts) => {
      const tokenPath = pathParts.join(".");

      expect(leaf.$type, `${tokenPath} must be color token`).toBe("color");
      expect(isColorOptionAlias(leaf.$value), `${tokenPath} must reference {color.option.*}`).toBe(
        true,
      );

      const cedar = (leaf.$extensions as JsonObject | undefined)?.cedar;
      expect(isObject(cedar), `${tokenPath} missing $extensions.cedar`).toBe(true);
      if (!isObject(cedar)) return;

      for (const platform of ["ios", "web"]) {
        const platformValue = cedar[platform];
        expect(isObject(platformValue), `${tokenPath} missing $extensions.cedar.${platform}`).toBe(
          true,
        );

        if (!isObject(platformValue)) continue;
        for (const appearance of ["light", "dark"]) {
          const pathValue = platformValue[appearance];
          expect(
            isPlainPathString(pathValue),
            `${tokenPath} ${platform}.${appearance} must be plain path string (no braces)`,
          ).toBe(true);
        }
      }

      const resolved = cedar.resolved;
      if (isObject(resolved)) {
        for (const [platform, appearances] of Object.entries(resolved)) {
          expect(isObject(appearances), `${tokenPath} resolved.${platform} must be object`).toBe(
            true,
          );
          if (!isObject(appearances)) continue;

          for (const [appearance, value] of Object.entries(appearances)) {
            expect(
              isHexColor(value),
              `${tokenPath} resolved.${platform}.${appearance} must be hex color`,
            ).toBe(true);
          }
        }
      }
    });
  });
});
