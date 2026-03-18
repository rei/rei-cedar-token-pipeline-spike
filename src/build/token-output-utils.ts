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
  createModuleDefinition("cdr-color-alias", (token) => {
    if (token.path[0] !== "color" || token.path[1] !== "modes" || token.path.length < 4) {
      return [];
    }

    return token.path.slice(3);
  }),
  createModuleDefinition("cdr-color-options", (token) => {
    if (token.path[0] !== "color" || token.path[1] !== "primitives" || token.path.length < 4) {
      return [];
    }

    return token.path.slice(3);
  }),
  createModuleDefinition("cdr-spacing-alias", (token) => {
    if (token.path[0] !== "spacing" || token.path[1] === "scale" || token.path.length < 3) {
      return [];
    }

    return token.path.slice(1);
  }),
  createModuleDefinition("cdr-spacing-fluid", (token) => {
    if (token.path[0] !== "spacing" || token.path[1] !== "scale" || token.path.length < 3) {
      return [];
    }

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
