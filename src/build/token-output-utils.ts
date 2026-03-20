import type { DesignTokens, Dictionary, TransformedToken } from "style-dictionary/types";

export interface ModuleDefinition {
  theme: string;
  responsibility: string;
  moduleFileName: string;
  interfaceName: string;
  unionTypeName: string;
  matchesToken: (token: TransformedToken) => boolean;
  getTokenName: (token: TransformedToken) => string;
}

interface TokenLeaf {
  $value: string | number | boolean;
  $type: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTokenLeaf(value: unknown): value is TokenLeaf {
  return isRecord(value) && "$value" in value && "$type" in value;
}

function toPascalCase(value: string): string {
  const parts = value.match(/[a-zA-Z0-9]+/g) ?? [];

  return parts
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function createModuleDefinition(
  moduleFileName: string,
  getRelativePath: (token: TransformedToken) => string[],
) {
  const typeBaseName = toPascalCase(moduleFileName);

  return {
    theme: "rei-dot-com",
    responsibility: "foundations",
    moduleFileName,
    interfaceName: `${typeBaseName}Tokens`,
    unionTypeName: `${typeBaseName}TokenName`,
    matchesToken: (token: TransformedToken) => getRelativePath(token).length > 0,
    getTokenName: (token: TransformedToken) => getRelativePath(token).join("-"),
  } satisfies ModuleDefinition;
}

const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // Color semantic categories
  createModuleDefinition("cdr-color-surface", (token) => {
    if (token.path[0] !== "color" || token.path[1] !== "modes" || token.path[3] !== "surface") {
      return [];
    }
    // token path: color.modes.default.surface.base → return ["base"]
    return token.path.slice(4);
  }),
  createModuleDefinition("cdr-color-text", (token) => {
    if (token.path[0] !== "color" || token.path[1] !== "modes" || token.path[3] !== "text") {
      return [];
    }
    // token path: color.modes.default.text.base → return ["base"]
    return token.path.slice(4);
  }),
  createModuleDefinition("cdr-color-border", (token) => {
    if (token.path[0] !== "color" || token.path[1] !== "modes" || token.path[3] !== "border") {
      return [];
    }
    // token path: color.modes.default.border.base → return ["base"]
    return token.path.slice(4);
  }),

  // Spacing semantic categories
  createModuleDefinition("cdr-spacing-scale", (token) => {
    if (token.path[0] !== "spacing" || token.path[1] !== "scale" || token.path.length < 3) {
      return [];
    }
    // token path: spacing.scale.-50 → return ["-50"]
    return token.path.slice(2);
  }),
  createModuleDefinition("cdr-spacing-component", (token) => {
    if (token.path[0] !== "spacing" || token.path[1] !== "component" || token.path.length < 3) {
      return [];
    }
    // token path: spacing.component.sm → return ["sm"]
    return token.path.slice(2);
  }),
  createModuleDefinition("cdr-spacing-layout", (token) => {
    if (token.path[0] !== "spacing" || token.path[1] !== "layout" || token.path.length < 3) {
      return [];
    }
    // token path: spacing.layout.sm → return ["sm"]
    return token.path.slice(2);
  }),
];

function collectLeafPaths(tokens: DesignTokens): string[][] {
  const leafPaths: string[][] = [];

  const visit = (node: unknown, currentPath: string[]) => {
    if (isTokenLeaf(node)) {
      leafPaths.push(currentPath);
      return;
    }

    if (!isRecord(node)) {
      return;
    }

    for (const [key, child] of Object.entries(node)) {
      visit(child, [...currentPath, key]);
    }
  };

  visit(tokens, []);

  return leafPaths;
}

export function collectModuleDefinitions(tokens: DesignTokens): ModuleDefinition[] {
  const leafPaths = collectLeafPaths(tokens);

  return MODULE_DEFINITIONS.filter((moduleDefinition) =>
    leafPaths.some((path) => moduleDefinition.matchesToken({ path } as TransformedToken)),
  );
}

export function getModuleTokenNames(
  dictionary: Dictionary,
  moduleDefinition: ModuleDefinition,
): string[] {
  return Array.from(
    new Set(
      dictionary.allTokens
        .filter((token) => moduleDefinition.matchesToken(token))
        .map((token) => moduleDefinition.getTokenName(token)),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

export function getModuleTokensByName(
  dictionary: Dictionary,
  moduleDefinition: ModuleDefinition,
): Map<string, TransformedToken> {
  const byName = new Map<string, TransformedToken>();

  dictionary.allTokens
    .filter((token) => moduleDefinition.matchesToken(token))
    .forEach((token) => {
      const tokenName = moduleDefinition.getTokenName(token);
      if (!byName.has(tokenName)) {
        byName.set(tokenName, token);
      }
    });

  return byName;
}
