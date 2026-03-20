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
      colors: Array<{ color: { components: Record<string, string> } }>;
    };

    expect(contents.colors[0].color.components.red).toBe("0.0000");
    expect(contents.colors[1].color.components.red).toBe("1.0000");
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
      colors: Array<{ color: { components: Record<string, string> } }>;
    };

    expect(contents.colors[0].color.components.red).toBe("0.0000");
    expect(contents.colors[1].color.components.red).toBe("1.0000");
  });
});
