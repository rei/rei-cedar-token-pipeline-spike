import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { webCssAction } from "./web-css-transform";

describe("webCssAction", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it("warns when a semantic color category is unknown", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const buildPath = fs.mkdtempSync(path.join(os.tmpdir(), "web-css-action-"));
    tempDirs.push(buildPath);

    const dictionary = {
      allTokens: [
        {
          name: "accentBase",
          path: ["color", "modes", "default", "accent", "base"],
          $type: "color",
          $extensions: {
            cedar: {
              resolved: {
                web: { light: "#111111", dark: "#222222" },
              },
            },
          },
        },
      ],
      tokens: {},
    };

    webCssAction.do?.(dictionary as any, { buildPath } as any);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("unknown semantic color category")
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("accent"));
  });

  it("writes theme index files with imports relative to dist/css", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const buildPath = fs.mkdtempSync(path.join(os.tmpdir(), "web-css-action-"));
    tempDirs.push(buildPath);

    const dictionary = {
      allTokens: [
        {
          name: "surfaceBase",
          path: ["color", "modes", "default", "surface", "base"],
          $type: "color",
          $extensions: {
            cedar: {
              resolved: {
                web: { light: "#ffffff", dark: "#111111" },
              },
            },
          },
        },
      ],
      tokens: {},
    };

    webCssAction.do?.(dictionary as any, { buildPath } as any);

    const lightIndex = fs.readFileSync(path.join(buildPath, "light.css"), "utf8");
    const darkIndex = fs.readFileSync(path.join(buildPath, "dark.css"), "utf8");

    expect(lightIndex).toContain("@import './light/color-surface.css';");
    expect(darkIndex).toContain("@import './dark/color-surface.css';");
    expect(lightIndex).not.toContain("@import './color-surface.css';");
    expect(darkIndex).not.toContain("@import './color-surface.css';");
  });

  it("throws when web option refs are missing", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const buildPath = fs.mkdtempSync(path.join(os.tmpdir(), "web-css-action-"));
    tempDirs.push(buildPath);

    const dictionary = {
      allTokens: [
        {
          name: "textBase",
          path: ["color", "modes", "default", "text", "base"],
          $type: "color",
          $extensions: { cedar: {} },
        },
      ],
      tokens: {},
    };

    expect(() => webCssAction.do?.(dictionary as any, { buildPath } as any)).toThrow(
      "missing $extensions.cedar.web",
    );
  });

  it("resolves dark values from the dark option node", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const buildPath = fs.mkdtempSync(path.join(os.tmpdir(), "web-css-action-"));
    tempDirs.push(buildPath);

    const dictionary = {
      allTokens: [
        {
          name: "textLink",
          path: ["color", "modes", "default", "text", "link"],
          $type: "color",
          $extensions: {
            cedar: {
              web: {
                light: "color.option.brand.blue.400",
                dark: "color.option.brand.blue.600",
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
                  $value: "#123456",
                  $extensions: {
                    cedar: {
                      appearances: {
                        dark: "#999999",
                      },
                    },
                  },
                },
                600: {
                  $value: "#222222",
                  $extensions: {
                    cedar: {
                      appearances: {
                        dark: "#abcdef",
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

    webCssAction.do?.(dictionary as any, { buildPath } as any);

    const darkTextCss = fs.readFileSync(path.join(buildPath, "dark", "color-text.css"), "utf8");
    expect(darkTextCss).toContain("--cdr-text-link: #abcdef;");
    expect(darkTextCss).not.toContain("--cdr-text-link: #999999;");
  });
});
