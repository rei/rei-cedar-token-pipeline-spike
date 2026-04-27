import { describe, expect, it } from "vitest";
import {
  createSemanticTokenContract,
  mergeMetadata,
  validateMetadataManifest,
} from "./merge-metadata.js";
import type { TokenMetadataManifestFile } from "../types/token-metadata.js";

describe("semantic metadata merge", () => {
  it("attaches semantic metadata and emits a semantic contract", () => {
    const canonical: Record<string, unknown> = {
      color: {
        option: {
          neutral: {
            warm: {
              grey: {
                "100": { $type: "color", $value: "#edeae3" },
              },
            },
          },
        },
        modes: {
          default: {
            surface: {
              base: {
                $type: "color",
                $value: "{color.option.neutral.warm.grey.100}",
                $extensions: {
                  cedar: {
                    docs: {
                      summary: "Primary surface token.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const manifest: TokenMetadataManifestFile = {
      version: 1,
      tokens: {
        "color.modes.default.surface.base": {
          token: "background-primary",
          intent: "Primary surface behind content",
          role: "background",
          platformMap: {
            web: "surface-100",
            ios: "systemBackground",
            android: "surfaceContainer",
          },
          accessibility: {
            minContrast: 4.5,
          },
          introducedIn: "5.0",
          status: "stable",
          usage: "Use for primary page and container backgrounds.",
        },
      },
    };

    expect(validateMetadataManifest(canonical, manifest)).toEqual([]);

    const mergedCount = mergeMetadata(canonical, manifest);
    expect(mergedCount).toBe(1);

    const semantic = (canonical.color as any).modes.default.surface.base.$extensions.cedar
      .semantic as { token: string; docs?: { summary?: string } };
    const governance = (canonical.color as any).modes.default.surface.base.$extensions.cedar
      .governance as { status?: string; usage?: string };

    expect(semantic.token).toBe("background-primary");
    expect(semantic.docs?.summary).toBe("Primary surface token.");
    expect(governance.status).toBe("stable");
    expect((canonical.color as any).modes.default.surface.base.$extensions.cedar.docs.summary).toBe(
      "Primary surface token.",
    );

    const contract = createSemanticTokenContract(canonical);
    expect(contract.tokens["color.modes.default.surface.base"]?.platformMap?.ios).toBe(
      "systemBackground",
    );
    expect(contract.tokens["color.modes.default.surface.base"]?.docs?.summary).toBe(
      "Primary surface token.",
    );
    expect(contract.tokens["color.option.neutral.warm.grey.100"]).toBeUndefined();
  });

  it("reports invalid semantic metadata", () => {
    const canonical: Record<string, unknown> = {
      color: {
        modes: {
          default: {
            surface: {
              base: { $type: "color", $value: "{color.option.neutral.warm.grey.100}" },
            },
          },
        },
      },
    };

    const manifest: TokenMetadataManifestFile = {
      version: 1,
      tokens: {
        "color.modes.default.surface.base": {
          token: "Background Primary",
          accessibility: { minContrast: 0 },
        },
        "color.modes.default.surface.missing": {
          token: "background-missing",
        },
      },
    };

    const issues = validateMetadataManifest(canonical, manifest);
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["TOKEN_NAME_GRAMMAR", "MIN_CONTRAST", "ORPHANED_METADATA"]),
    );
  });

  it("warns when governance fields required by ADR docs are incomplete", () => {
    const canonical: Record<string, unknown> = {
      color: {
        modes: {
          default: {
            surface: {
              base: {
                $type: "color",
                $value: "{color.option.neutral.warm.grey.100}",
              },
            },
          },
        },
      },
    };

    const manifest: TokenMetadataManifestFile = {
      version: 1,
      tokens: {
        "color.modes.default.surface.base": {
          token: "background-primary",
          status: "stable",
        },
      },
    };

    const issues = validateMetadataManifest(canonical, manifest);
    expect(issues.map((issue) => issue.code)).toContain("MISSING_USAGE");

    const noStatusManifest: TokenMetadataManifestFile = {
      version: 1,
      tokens: {
        "color.modes.default.surface.base": {
          token: "background-primary",
          usage: "Use for page surfaces.",
        },
      },
    };

    const noStatusIssues = validateMetadataManifest(canonical, noStatusManifest);
    expect(noStatusIssues.map((issue) => issue.code)).toContain("MISSING_STATUS");
  });
});
