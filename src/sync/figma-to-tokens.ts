import * as fs from "node:fs";
import FigmaApi from "../figma/api";
import { green } from "../utils";
import { tokenFilesFromLocalVariables } from "../tokens-export";
import { TokensFile } from "../types";

/**
 * Validates that a tokens file has the correct structure.
 *
 * @param tokensFile - The tokens file object to validate
 * @throws {Error} If the tokens file structure is invalid
 */
function validateTokensFile(tokensFile: TokensFile): void {
  if (!tokensFile || typeof tokensFile !== "object") {
    throw new Error("Invalid tokens file: must be an object");
  }

  if (Object.keys(tokensFile).length === 0) {
    throw new Error("Invalid tokens file: cannot be empty");
  }

  // Basic validation that we have token-like objects
  const hasValidTokens = Object.values(tokensFile).some((value) => {
    return value && typeof value === "object";
  });

  if (!hasValidTokens) {
    throw new Error("Invalid tokens file: no valid tokens found");
  }
}

/**
 * Syncs Figma variables to design token files.
 *
 * Reads local variables from a Figma file using the Figma REST API and converts them
 * into design token JSON files following the W3C Design Tokens specification.
 *
 * @throws {Error} If PERSONAL_ACCESS_TOKEN or FILE_KEY environment variables are missing
 */
async function syncFileToTokens(
  api: FigmaApi,
  fileKey: string,
  outputDir: string,
): Promise<number> {
  console.log(`\nFetching variables from Figma file: ${fileKey}...`);
  const localVariables = await api.getLocalVariables(fileKey);

  if (!localVariables.meta?.variables || Object.keys(localVariables.meta.variables).length === 0) {
    throw new Error(`No local variables found in Figma file: ${fileKey}`);
  }

  console.log(`Found ${Object.keys(localVariables.meta.variables).length} variables in ${fileKey}`);
  const tokensFiles = tokenFilesFromLocalVariables(localVariables);

  if (Object.keys(tokensFiles).length === 0) {
    throw new Error(`No token files generated from Figma file: ${fileKey}`);
  }

  // Create output directory with error handling
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to create output directory "${outputDir}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // Validate and write each token file
  let filesWritten = 0;
  for (const [fileName, fileContent] of Object.entries(tokensFiles)) {
    try {
      validateTokensFile(fileContent);

      const filePath = `${outputDir}/${fileName}`;
      const jsonContent = JSON.stringify(fileContent, null, 2);
      fs.writeFileSync(filePath, jsonContent, "utf-8");

      console.log(`✓ Wrote ${fileName}`);
      filesWritten++;
    } catch (error) {
      console.error(
        `✗ Failed to write ${fileName}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  return filesWritten;
}

async function main() {
  try {
    if (!process.env.PERSONAL_ACCESS_TOKEN) {
      throw new Error("PERSONAL_ACCESS_TOKEN environment variable is required");
    }

    // Support both FILE_KEYS (comma-separated) and legacy FILE_KEY (single)
    const rawKeys = process.env.FILE_KEYS || process.env.FILE_KEY;
    if (!rawKeys) {
      throw new Error("FILE_KEYS or FILE_KEY environment variable is required");
    }

    const fileKeys = rawKeys
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (fileKeys.length === 0) {
      throw new Error("No valid file keys provided");
    }

    let baseOutputDir = "tokens_new";
    const outputArgIdx = process.argv.indexOf("--output");
    if (outputArgIdx !== -1) {
      const providedDir = process.argv[outputArgIdx + 1];
      if (!providedDir) {
        throw new Error("--output flag requires a directory path");
      }
      baseOutputDir = providedDir;
    }

    const api = new FigmaApi(process.env.PERSONAL_ACCESS_TOKEN);
    let totalFilesWritten = 0;

    for (const fileKey of fileKeys) {
      const filesWritten = await syncFileToTokens(api, fileKey, baseOutputDir);
      totalFilesWritten += filesWritten;
    }

    console.log(
      green(
        `\n✅ Successfully wrote ${totalFilesWritten} token file(s) from ${fileKeys.length} Figma file(s) to the ${baseOutputDir} directory`,
      ),
    );
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
