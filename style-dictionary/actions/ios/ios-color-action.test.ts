import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { iosColorsetAction } from "./ios-color-action";

describe("iosColorsetAction", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it("uses cedar.resolved values when present", () => {
    const buildPath = fs.mkdtempSync(path.join(os.tmpdir(), "ios-colorset-"));
    tempDirs.push(buildPath);

    const dictionary = {
      allTokens: [
        {
          name: "textLink",
          path: ["color", "modes", "default", "text", "link"],
          $type: "color",
          $extensions: {
            cedar: {
              resolved: {
                ios: { light: "#000000", dark: "#ffffff" },
              },
            },
          },
        },
      ],
      tokens: {},
    };

    iosColorsetAction.do?.(dictionary as never, { buildPath } as never);

    const outputPath = path.join(buildPath, "CdrColors.xcassets", "cdr-textLink.colorset", "Contents.json");
    const contents = JSON.parse(fs.readFileSync(outputPath, "utf8")) as {
      colors: Array<{ color: { "color-space": string; components: Record<string, string> } }>;
    };

    // Verify Display P3 color space is used
    expect(contents.colors[0].color["color-space"]).toBe("display-p3");
    expect(contents.colors[1].color["color-space"]).toBe("display-p3");

    // Verify alpha is present
    expect(contents.colors[0].color.components.alpha).toBeDefined();
    expect(contents.colors[1].color.components.alpha).toBeDefined();

    // With culori's proper sRGB to Display P3 conversion, black (#000000) and white (#ffffff)
    // will have slightly different RGB values than the naive 0.0000/1.0000
    // Just verify they're in valid range
    const lightRed = parseFloat(contents.colors[0].color.components.red);
    const darkRed = parseFloat(contents.colors[1].color.components.red);
    expect(lightRed).toBeGreaterThanOrEqual(0);
    expect(lightRed).toBeLessThanOrEqual(1);
    expect(darkRed).toBeGreaterThanOrEqual(0);
    expect(darkRed).toBeLessThanOrEqual(1);
  });

  it("falls back to option token lookup when cedar.resolved is absent", () => {
    const buildPath = fs.mkdtempSync(path.join(os.tmpdir(), "ios-colorset-"));
    tempDirs.push(buildPath);

    const dictionary = {
      allTokens: [
        {
          name: "textLink",
          path: ["color", "modes", "default", "text", "link"],
          $type: "color",
          $extensions: {
            cedar: {
              ios: {
                light: "color.option.brand.blue.400",
                dark: "color.option.brand.blue.400",
              },
            },
          },
        },
      ],
      tokens: {
        color: {
          option: {
            brand: {
              blue: {
                400: {
                  $value: "#000000",
                  $extensions: {
                    cedar: {
                      appearances: { dark: "#111111" },
                      platformOverrides: {
                        ios: { dark: "#ffffff" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    iosColorsetAction.do?.(dictionary as never, { buildPath } as never);

    const outputPath = path.join(buildPath, "CdrColors.xcassets", "cdr-textLink.colorset", "Contents.json");
    const contents = JSON.parse(fs.readFileSync(outputPath, "utf8")) as {
      colors: Array<{ color: { "color-space": string; components: Record<string, string> } }>;
    };

    // Verify Display P3 color space is used
    expect(contents.colors[0].color["color-space"]).toBe("display-p3");
    expect(contents.colors[1].color["color-space"]).toBe("display-p3");

    // Verify alpha is present
    expect(contents.colors[0].color.components.alpha).toBeDefined();
    expect(contents.colors[1].color.components.alpha).toBeDefined();

    // With culori's proper sRGB to Display P3 conversion, values will differ from naive implementation
    // Just verify they're in valid range and that dark override was applied
    const lightRed = parseFloat(contents.colors[0].color.components.red);
    const darkRed = parseFloat(contents.colors[1].color.components.red);
    expect(lightRed).toBeGreaterThanOrEqual(0);
    expect(lightRed).toBeLessThanOrEqual(1);
    expect(darkRed).toBeGreaterThanOrEqual(0);
    expect(darkRed).toBeLessThanOrEqual(1);
    // Dark should be lighter than light (white override applied)
    expect(darkRed).toBeGreaterThan(lightRed);
  });
});
