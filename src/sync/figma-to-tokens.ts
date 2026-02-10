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
async function main() {
  try {
    if (!process.env.PERSONAL_ACCESS_TOKEN || !process.env.FILE_KEY) {
      throw new Error("PERSONAL_ACCESS_TOKEN and FILE_KEY environment variables are required");
    }
    const fileKey = process.env.FILE_KEY;

    console.log(`Fetching variables from Figma file: ${fileKey}...`);
    const api = new FigmaApi(process.env.PERSONAL_ACCESS_TOKEN);
    const localVariables = await api.getLocalVariables(fileKey);

    if (
      !localVariables.meta?.variables ||
      Object.keys(localVariables.meta.variables).length === 0
    ) {
      throw new Error("No local variables found in the Figma file");
    }

    console.log(`Found ${Object.keys(localVariables.meta.variables).length} variables`);
    const tokensFiles = tokenFilesFromLocalVariables(localVariables);

    if (Object.keys(tokensFiles).length === 0) {
      throw new Error("No token files generated from Figma variables");
    }

    let outputDir = "tokens_new";
    const outputArgIdx = process.argv.indexOf("--output");
    if (outputArgIdx !== -1) {
      const providedDir = process.argv[outputArgIdx + 1];
      if (!providedDir) {
        throw new Error("--output flag requires a directory path");
      }
      outputDir = providedDir;
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
        // Validate token file structure
        validateTokensFile(fileContent);

        // Write file with error handling
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

    console.log(
      green(`\n✅ Successfully wrote ${filesWritten} token file(s) to the ${outputDir} directory`),
    );
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
