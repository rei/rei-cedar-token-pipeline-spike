import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type {
  SemanticTokenContract,
  SemanticTokenContractEntry,
  TokenDocumentation,
  TokenMetadata,
  TokenMetadataManifest,
  TokenMetadataManifestFile,
  TokenStability,
  TokenStatus,
} from "../types/token-metadata.js";

interface TokenLeaf {
  $value: string | number | boolean;
  $type: string;
  $extensions?: {
    cedar?: {
      docs?: TokenDocumentation;
      semantic?: SemanticTokenContractEntry;
      governance?: TokenMetadata;
      [key: string]: unknown;
    };
  };
}

export interface LoadedMetadataManifest {
  filePath: string;
  manifest: TokenMetadataManifestFile;
}

export interface MetadataValidationIssue {
  severity: "warn" | "error";
  code:
    | "ORPHANED_METADATA"
    | "TOKEN_NAME_GRAMMAR"
    | "MIN_CONTRAST"
    | "DEPRECATION_STATE"
    | "MISSING_PLATFORM_MAP"
    | "REFERENCE_GRAMMAR"
    | "MISSING_STATUS"
    | "MISSING_USAGE";
  path: string;
  message: string;
}

const METADATA_CANDIDATES = ["tokens.yaml", "tokens.yml", "tokens.json"];
const SEMANTIC_CONTRACT_SCHEMA = "https://rei.com/cedar/semantic-token-contract.schema.json";
const TOKEN_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN_REF_RE = /^[a-z0-9]+(?:[-.][a-z0-9]+)*$/;
const REQUIRED_PLATFORM_MAP = ["web", "ios", "android"] as const;

function isTokenLeaf(value: unknown): value is TokenLeaf {
  return (
    typeof value === "object" &&
    value !== null &&
    "$value" in value &&
    typeof (value as any).$value !== "undefined" &&
    "$type" in value &&
    typeof (value as any).$type === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isModeObject(value: unknown): value is { value: string; overlay?: string } {
  return isRecord(value) && typeof value.value === "string";
}

function normalizeStatus(status?: TokenStatus): TokenStatus {
  return status ?? "unreviewed";
}

function normalizeStability(metadata: TokenMetadata): TokenStability {
  if (metadata.stability) return metadata.stability;
  if (metadata.status === "deprecated") return "deprecated";
  if (metadata.status === "experimental") return "experimental";
  return "stable";
}

function canonicalPathToTokenSlug(pathKey: string): string {
  const parts = pathKey.split(".");
  const normalized =
    parts[0] === "color" && parts[1] === "modes" && parts.length > 4
      ? parts.slice(3)
      : parts.slice(1);
  return normalized.join("-");
}

function sortObjectDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => sortObjectDeep(entry)) as T;
  }

  if (!isRecord(value)) {
    return value;
  }

  const sortedEntries = Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => [key, sortObjectDeep(child)]);

  return Object.fromEntries(sortedEntries) as T;
}

function normalizeManifest(parsed: unknown): TokenMetadataManifestFile {
  if (!isRecord(parsed)) {
    throw new Error("Semantic token metadata must be an object.");
  }

  if (isRecord(parsed.tokens)) {
    return {
      $schema: typeof parsed.$schema === "string" ? parsed.$schema : undefined,
      version: typeof parsed.version === "number" ? parsed.version : 1,
      tokens: parsed.tokens as TokenMetadataManifest,
    };
  }

  return {
    version: 1,
    tokens: parsed as TokenMetadataManifest,
  };
}

export function loadMetadataManifest(metadataDir: string): LoadedMetadataManifest | null {
  for (const fileName of METADATA_CANDIDATES) {
    const filePath = path.join(metadataDir, fileName);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = fileName.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);

    return {
      filePath,
      manifest: normalizeManifest(parsed),
    };
  }

  return null;
}

export function collectCanonicalTokenPaths(canonical: Record<string, unknown>): Set<string> {
  const paths = new Set<string>();

  function walk(node: unknown, pathParts: string[]): void {
    if (isTokenLeaf(node)) {
      paths.add(pathParts.join("."));
      return;
    }

    if (!isRecord(node)) {
      return;
    }

    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$")) {
        continue;
      }
      walk(child, [...pathParts, key]);
    }
  }

  walk(canonical, []);
  return paths;
}

export function validateMetadataManifest(
  canonical: Record<string, unknown>,
  manifest: TokenMetadataManifestFile,
): MetadataValidationIssue[] {
  const issues: MetadataValidationIssue[] = [];
  const canonicalPaths = collectCanonicalTokenPaths(canonical);

  for (const [pathKey, metadata] of Object.entries(manifest.tokens)) {
    if (!canonicalPaths.has(pathKey)) {
      issues.push({
        severity: "error",
        code: "ORPHANED_METADATA",
        path: pathKey,
        message: `Metadata entry does not match a canonical token path: ${pathKey}`,
      });
      continue;
    }

    if (metadata.token && !TOKEN_SLUG_RE.test(metadata.token)) {
      issues.push({
        severity: "error",
        code: "TOKEN_NAME_GRAMMAR",
        path: pathKey,
        message: `token must be kebab-case and cannot override Figma naming semantics: ${metadata.token}`,
      });
    }

    if (!metadata.status) {
      issues.push({
        severity: "warn",
        code: "MISSING_STATUS",
        path: pathKey,
        message: `metadata entry is missing required status for ${pathKey}`,
      });
    }

    if (metadata.status !== "unreviewed" && !metadata.usage) {
      issues.push({
        severity: "warn",
        code: "MISSING_USAGE",
        path: pathKey,
        message: `metadata entry should include usage guidance when status is not unreviewed for ${pathKey}`,
      });
    }

    if (
      typeof metadata.accessibility?.minContrast === "number" &&
      metadata.accessibility.minContrast <= 0
    ) {
      issues.push({
        severity: "error",
        code: "MIN_CONTRAST",
        path: pathKey,
        message: `accessibility.minContrast must be greater than 0 for ${pathKey}`,
      });
    }

    if (metadata.deprecatedIn !== undefined && metadata.deprecatedIn !== null) {
      const stability = normalizeStability(metadata);
      if (stability !== "deprecated" && metadata.status !== "deprecated") {
        issues.push({
          severity: "error",
          code: "DEPRECATION_STATE",
          path: pathKey,
          message: `deprecatedIn requires status/stability to be deprecated for ${pathKey}`,
        });
      }
    }

    if (!pathKey.includes(".option.")) {
      const missingPlatformMap = REQUIRED_PLATFORM_MAP.some(
        (platform) => !metadata.platformMap?.[platform],
      );
      if (missingPlatformMap) {
        issues.push({
          severity: "warn",
          code: "MISSING_PLATFORM_MAP",
          path: pathKey,
          message: `semantic token is missing one or more platformMap entries for web, ios, or android: ${pathKey}`,
        });
      }
    }

    for (const reference of [
      metadata.derivedFrom,
      ...Object.values(metadata.states ?? {}),
      ...(metadata.accessibility?.allowedText ?? []),
      ...(metadata.accessibility?.disallowedText ?? []),
    ]) {
      if (typeof reference === "string" && !TOKEN_REF_RE.test(reference)) {
        issues.push({
          severity: "error",
          code: "REFERENCE_GRAMMAR",
          path: pathKey,
          message: `metadata reference must use dot or kebab grammar only: ${reference}`,
        });
      }
    }
  }

  return issues;
}

function buildSemanticEntry(pathKey: string, node: TokenLeaf, metadata?: TokenMetadata) {
  const safeMetadata = metadata ?? {};
  const status = normalizeStatus(safeMetadata.status);
  const stability = normalizeStability(safeMetadata);
  const value = node.$value;
  const alias = typeof value === "string" && value.startsWith("{") ? value : undefined;

  const entry: SemanticTokenContractEntry = {
    ...safeMetadata,
    token: safeMetadata.token ?? canonicalPathToTokenSlug(pathKey),
    canonicalPath: pathKey,
    value,
    type: node.$type,
    alias,
    docs: node.$extensions?.cedar?.docs,
    status,
    stability,
  };

  const normalizedModes = entry.modes
    ? Object.fromEntries(
        Object.entries(entry.modes).map(([modeName, modeValue]) => [
          modeName,
          isModeObject(modeValue) ? sortObjectDeep(modeValue) : modeValue,
        ]),
      )
    : undefined;

  return sortObjectDeep({
    ...entry,
    ...(normalizedModes ? { modes: normalizedModes } : {}),
  });
}

function shouldAttachSemanticEntry(pathKey: string, metadata?: TokenMetadata): boolean {
  if (metadata) {
    return true;
  }
  return !pathKey.includes(".option.");
}

/**
 * Traverse the canonical tree and attach governance metadata.
 * Returns count of metadata entries actually merged (for logging).
 *
 * Keys are dot-notation canonical paths:
 *   "color.modes.default.surface.base"
 *   "spacing.scale.-50"
 *   etc.
 */
export function mergeMetadata(
  canonical: Record<string, unknown>,
  manifest: TokenMetadataManifestFile,
): number {
  let mergedCount = 0;

  function walk(node: unknown, path: string[]): void {
    if (isTokenLeaf(node)) {
      const pathKey = path.join(".");
      const metadata = manifest.tokens[pathKey];
      if (shouldAttachSemanticEntry(pathKey, metadata)) {
        if (!node.$extensions) node.$extensions = {};
        if (!node.$extensions.cedar) node.$extensions.cedar = {};

        const semantic = buildSemanticEntry(pathKey, node, metadata);
        node.$extensions.cedar.semantic = semantic;
        if (metadata) {
          node.$extensions.cedar.governance = metadata;
        }
        mergedCount++;
      }
      return;
    }

    if (!isRecord(node)) {
      return;
    }

    for (const [key, child] of Object.entries(node)) {
      // Skip metadata keys
      if (key.startsWith("$")) {
        continue;
      }
      walk(child, [...path, key]);
    }
  }

  walk(canonical, []);
  return mergedCount;
}

export function createSemanticTokenContract(
  canonical: Record<string, unknown>,
): SemanticTokenContract {
  const tokens: Record<string, SemanticTokenContractEntry> = {};

  function walk(node: unknown, path: string[]): void {
    if (isTokenLeaf(node)) {
      const pathKey = path.join(".");
      const semantic = node.$extensions?.cedar?.semantic;
      if (semantic && !pathKey.includes(".option.")) {
        tokens[pathKey] = sortObjectDeep(semantic);
      }
      return;
    }

    if (!isRecord(node)) {
      return;
    }

    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$")) {
        continue;
      }
      walk(child, [...path, key]);
    }
  }

  walk(canonical, []);

  return {
    $schema: SEMANTIC_CONTRACT_SCHEMA,
    version: 1,
    tokens: sortObjectDeep(tokens),
  };
}
