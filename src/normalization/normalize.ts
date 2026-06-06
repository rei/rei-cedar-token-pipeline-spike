/**
 * normalize.ts
 *
 * Reads every *.json file from tokens/, normalizes them into a canonical tree,
 * and writes the result to canonical/tokens.json.
 *
 * Pipeline steps (each is a standalone function):
 *   1. loadSchema        — Load Figma Input Contract from token-schema.json
 *   2. readTokenFiles    — Parse all JSON files from tokens/
 *   3. partitionFiles    — Separate into spacing, option-color, alias, and platform files
 *   4. processSpacing    — Fluid clamp(), static, and platform spacing
 *   5. processOptionColors — Build color.option tree and platform lookup table
 *   6. processAliasFiles — Clean, nest, and merge alias/other files
 *   7. mergeColorVariants — Attach resolved values and $meta to alias tokens
 *   8. mergeMetadata     — Merge repo-owned governance metadata
 *   9. writeCanonical    — Write canonical/tokens.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
  buildCollectionToSection,
  clean,
  nestUnderSections,
  deepMerge,
  extractColorMode,
  extractPrimitiveMode,
  buildSpacingClamp,
  applyTokenMapping,
  buildOptionTree,
  expandHyphenatedTokens,
  fixStaticReferencePaths,
  type TokenMapping,
} from "./normalize-utils.js";
import { mergeColorVariants } from "./color-variants.js";
import { reportValidationIssues, validateFigmaInputs } from "./normalize-validation.js";
import { mergeMetadata } from "./merge-metadata.js";
import type { TokenMetadataManifest } from "../types/token-metadata.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensDir = path.resolve(__dirname, "../../tokens");
const outFile = path.resolve(__dirname, "../../canonical/tokens.json");
const schemaFile = path.resolve(__dirname, "../../src/schema/token-schema.json");
const metadataFile = path.resolve(__dirname, "../../metadata/tokens.json");

type ParsedFile = { file: string; data: Record<string, unknown> };

const SPACING_BP_RE = /^spacing.scale\.(\d+)\.json$/;

// ─── Pipeline steps ──────────────────────────────────────────────────────────

function loadSchema(): TokenMapping {
  if (!fs.existsSync(schemaFile)) {
    throw new Error(
      `Token schema not found at ${schemaFile}. ` +
        `This file is required — see ADR-0003 (Figma Input Contract).`,
    );
  }
  const schema = JSON.parse(fs.readFileSync(schemaFile, "utf-8"));
  const figmaInputs = schema?.inputs?.figma;
  if (
    typeof figmaInputs !== "object" ||
    figmaInputs === null ||
    typeof figmaInputs.collections !== "object" ||
    figmaInputs.collections === null
  ) {
    throw new Error(
      `Invalid Figma input contract in ${schemaFile}. ` +
        `Expected inputs.figma.collections to be an object. ` +
        `Fix src/schema/token-schema.json to match ADR-0003.`,
    );
  }
  return figmaInputs as TokenMapping;
}

function readTokenFiles(): ParsedFile[] {
  const files = fs
    .readdirSync(tokensDir)
    .filter((f) => f.endsWith(".json") && f !== "canonical.json")
    .sort((left, right) => left.localeCompare(right));

  if (files.length === 0) {
    throw new Error(`No JSON files found in ${tokensDir}. Run the Figma sync first.`);
  }

  return files.map((file) => ({
    file,
    data: JSON.parse(fs.readFileSync(path.join(tokensDir, file), "utf-8")) as Record<
      string,
      unknown
    >,
  }));
}

function partitionFiles(parsed: ParsedFile[]) {
  return {
    spacingBpFiles: parsed.filter(({ file }) => SPACING_BP_RE.test(file)),
    spacingStaticFiles: parsed.filter(
      ({ file }) => file.includes("spacing") && file.includes("static"),
    ),
    optionColorFiles: parsed.filter(({ file }) => extractPrimitiveMode(file) !== null),
    spacingPlatformFiles: parsed.filter(
      ({ file }) => file === "alias.spacing.web.json" || file === "alias.spacing.ios.json",
    ),
    typographyFiles: parsed.filter(({ file }) => file.startsWith("options.text.")),
    otherFiles: parsed.filter(
      ({ file }) =>
        !SPACING_BP_RE.test(file) &&
        extractPrimitiveMode(file) === null &&
        file !== "alias.spacing.web.json" &&
        file !== "alias.spacing.ios.json" &&
        file !== "spacing.static.default.json" &&
        !file.startsWith("options.text."),
    ),
  };
}

function processSpacing(
  canonical: Record<string, unknown>,
  spacingBpFiles: ParsedFile[],
  spacingStaticFiles: ParsedFile[],
  spacingPlatformFiles: ParsedFile[],
) {
  // Fluid spacing from breakpoint files
  if (spacingBpFiles.length > 0) {
    const parsedBps = spacingBpFiles.map(({ file, data }) => ({
      breakpoint: parseInt(SPACING_BP_RE.exec(file)![1], 10),
      data,
    }));
    const fluidSpacing = buildSpacingClamp(parsedBps);
    deepMerge(canonical, fluidSpacing);
    const bpList = parsedBps
      .map((p) => p.breakpoint)
      .sort((a, b) => a - b)
      .join(", ");
    console.log(
      `  ✓ spacing.[${bpList}].json → fluid clamp() values (${spacingBpFiles.length} breakpoints)`,
    );
  }

  // Static spacing (iOS)
  if (spacingStaticFiles.length > 0) {
    if (!canonical.spacing) canonical.spacing = {};
    const collectionToSection = buildCollectionToSection(spacingStaticFiles);
    const { data } = Object.values(clean(spacingStaticFiles, collectionToSection))[0];
    deepMerge(canonical, expandHyphenatedTokens(data));
  }

  // Platform spacing scales
  if (spacingPlatformFiles.length > 0) {
    if (!canonical.spacing) canonical.spacing = {};
    const spacingTarget = canonical.spacing as Record<string, any>;

    for (const { file, data } of spacingPlatformFiles) {
      let platformName = file.split(".")[2];
      platformName = platformName.includes("web") ? "web" : "ios";
      const spaceSource = data as Record<string, any>;

      for (const [tokenGroupKey, tokenData] of Object.entries(spaceSource.spacing)) {
        const rawTokenGroup = tokenData as Record<string, any>;

        for (const [tokenKey, tokenData] of Object.entries(rawTokenGroup)) {
          if (!spacingTarget[tokenGroupKey]) spacingTarget[tokenGroupKey] = {};

          if (!spacingTarget[tokenGroupKey][tokenKey]) {
            spacingTarget[tokenGroupKey][tokenKey] = {
              $type: tokenData.$type || "number",
              $value: tokenData.$value,
              $description: tokenData.$description || "",
              $extensions: {
                cedar: {
                  ios: {
                    dark: fixStaticReferencePaths(tokenData.$value),
                    light: fixStaticReferencePaths(tokenData.$value),
                  },
                  web: {
                    dark: fixStaticReferencePaths(tokenData.$value),
                    light: fixStaticReferencePaths(tokenData.$value),
                  },
                },
              },
            };
          }

          if (platformName === "web") {
            spacingTarget[tokenGroupKey][tokenKey].$value = tokenData.$value;
          }

          spacingTarget[tokenGroupKey][tokenKey].$extensions.cedar[platformName] = {
            dark: fixStaticReferencePaths(tokenData.$value),
            light: fixStaticReferencePaths(tokenData.$value),
          };
        }
      }
    }
    console.log(`  ✓ Normalized platform files into canonical spacing`);
  }
}

function processOptionColors(
  canonical: Record<string, unknown>,
  optionColorFiles: ParsedFile[],
  tokenMapping: TokenMapping,
): Map<string, Record<string, string>> {
  const platformLookup = new Map<string, Record<string, string>>();
  const canonicalFallbackEntries: Array<{
    canonicalPath: string;
    token: { $type: string; $value: string };
  }> = [];

  const canonicalFallbackMode = optionColorFiles.find(
    ({ file }) => extractPrimitiveMode(file) === "web-light",
  )
    ? "web-light"
    : (extractPrimitiveMode(optionColorFiles[0]?.file) ?? null);

  for (const { file, data } of optionColorFiles) {
    const primitiveMode = extractPrimitiveMode(file)!;
    const lookup: Record<string, string> = {};

    for (const [collectionName, collectionData] of Object.entries(data)) {
      const entry = tokenMapping.collections[collectionName];
      if (!entry) {
        throw new Error(
          `[normalize] Figma collection "${collectionName}" (from ${file}) has no entry ` +
            `in src/schema/token-schema.json (inputs.figma.collections). ` +
            `Add an "inputs.figma.collections.${collectionName}" entry.`,
        );
      }

      const mapped = applyTokenMapping(
        collectionName,
        collectionData as Record<string, unknown>,
        entry,
        primitiveMode,
      );

      for (const { canonicalPath, token } of mapped) {
        lookup[canonicalPath] = token.$value;
      }

      if (primitiveMode === canonicalFallbackMode) {
        canonicalFallbackEntries.push(...mapped);
      }
    }

    platformLookup.set(primitiveMode, lookup);
    console.log(`  ✓ ${file} [primitives: ${primitiveMode}] (${Object.keys(data).join(", ")})`);
  }

  if (canonicalFallbackEntries.length > 0) {
    deepMerge(canonical, buildOptionTree(canonicalFallbackEntries));
  }

  return platformLookup;
}

function processAliasFiles(
  canonical: Record<string, unknown>,
  otherFiles: ParsedFile[],
  tokenMapping: TokenMapping,
) {
  const collectionToSection = buildCollectionToSection(otherFiles);

  for (const { file, data } of otherFiles) {
    const cleaned = clean(data, collectionToSection, tokenMapping);
    const colorMode = extractColorMode(file);
    const nested = nestUnderSections(
      cleaned as Record<string, unknown>,
      collectionToSection,
      colorMode,
    );

    const modeLabel = colorMode ? ` [mode: ${colorMode}]` : "";
    console.log(`  ✓ ${file}${modeLabel} (${Object.keys(data).join(", ")})`);
    deepMerge(canonical, nested);
  }
}

function processMetadata(canonical: Record<string, unknown>) {
  if (fs.existsSync(metadataFile)) {
    const metadata = JSON.parse(fs.readFileSync(metadataFile, "utf-8")) as TokenMetadataManifest;
    const count = mergeMetadata(canonical, metadata);
    console.log(`  ✓ metadata/tokens.json [governance: ${count} token(s)]`);
  } else {
    console.log(
      `  ⊘ metadata/tokens.json not found (optional). All tokens will be unmarked/unreviewed.`,
    );
  }
}

function processTypography(canonical: Record<string, unknown>, typographyFiles: ParsedFile[]) {
  if (typographyFiles.length === 0) return;

  const typographyTree: Record<string, any> = { text: {} };

  for (const { file, data } of typographyFiles) {
    // Extract the property and variant name, discarding optional file-version suffixes (e.g., _2)
    const match = file.match(/options\.text\.([\w-]+)\.(\w+?)(?:_\d+)?\.json$/);
    if (!match) continue;

    const [_, subProperty, variantName] = match;
    // Hyphenated names like "letter-spacing" map to nested paths: text.letter.spacing
    const pathSegments = subProperty.split("-");
    let propertyData: any = (data as Record<string, any>).text;
    for (const seg of pathSegments) {
      propertyData = propertyData?.[seg];
    }
    if (!propertyData) continue;

    if (!typographyTree.text[subProperty]) {
      typographyTree.text[subProperty] = {};
    }

    for (const [tokenKey, tokenLeaf] of Object.entries(propertyData)) {
      const leaf = tokenLeaf as Record<string, any>;

      if (!typographyTree.text[subProperty][tokenKey]) {
        typographyTree.text[subProperty][tokenKey] = {
          $type: leaf.$type || "string",
          $value: "",
          $extensions: { cedar: {} },
        };
      }

      const targetToken = typographyTree.text[subProperty][tokenKey];

      if (variantName === "default") {
        targetToken.$value = leaf.$value;
        if (leaf.$type) targetToken.$type = leaf.$type;
      } else {
        targetToken.$extensions.cedar[variantName] = leaf.$value;
      }

      if (leaf.$description && !targetToken.$description) {
        targetToken.$description = leaf.$description;
      }
    }
  }

  deepMerge(canonical, typographyTree);
  console.log(
    `  ✓ Normalized ${typographyFiles.length} typography file(s) directly into canonical text tree`,
  );
}

function writeCanonical(canonical: Record<string, unknown>, fileCount: number) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(canonical, null, 2), "utf-8");

  console.log(`\nSuccessfully created: ${outFile}`);
  console.log(
    `  ${fileCount} file(s) merged, ${
      Object.keys(canonical).length
    } top-level section(s): ${Object.keys(canonical).join(", ")}`,
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

try {
  const tokenMapping = loadSchema();
  const parsed = readTokenFiles();
  const {
    spacingBpFiles,
    spacingStaticFiles,
    spacingPlatformFiles,
    optionColorFiles,
    typographyFiles,
    otherFiles,
  } = partitionFiles(parsed);

  const validationIssues = validateFigmaInputs({
    parsedFiles: parsed,
    optionColorFiles,
    otherFiles,
    tokenMapping,
  });
  reportValidationIssues(validationIssues);

  const canonical: Record<string, unknown> = {};

  processSpacing(canonical, spacingBpFiles, spacingStaticFiles, spacingPlatformFiles);
  const platformLookup = processOptionColors(canonical, optionColorFiles, tokenMapping);
  processAliasFiles(canonical, otherFiles, tokenMapping);
  mergeColorVariants(canonical, platformLookup);
  processTypography(canonical, typographyFiles);
  processMetadata(canonical);
  writeCanonical(canonical, parsed.length);
} catch (error) {
  console.error("Error creating canonical/tokens.json:", error);
  process.exit(1);
}
