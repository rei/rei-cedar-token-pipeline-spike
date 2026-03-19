import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { webCssAction } from "./web-css-transform";

describe("webCssAction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("warns when a semantic color category is unknown", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const buildPath = fs.mkdtempSync(path.join(os.tmpdir(), "web-css-action-"));

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
});
