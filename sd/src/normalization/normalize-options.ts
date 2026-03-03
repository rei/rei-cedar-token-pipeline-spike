import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { recursiveTokensLookUp } from "../utils/recursiveTokensLookUp.js";
import type { NormalizeSuccess, NormalizeError } from "../types/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function normalizeOptions() {
  try {
    const pathToFile = path.join(
      __dirname,
      "../../../",
      "/data/raw-figma-options.json"
    );
    const data = fs.readFileSync(pathToFile, { encoding: "utf-8" });
    const parsedData = JSON.parse(data);
    const tokensGroups = Object.keys(parsedData);
    const nestedObject: NormalizeSuccess = {
      success: true,
      data: { color: {} },
    };

    tokensGroups.forEach((group: string) => {
      nestedObject.data.color[group] = {
        ...recursiveTokensLookUp(parsedData[group]),
      };
    });

    return nestedObject;
  } catch (error) {
    console.error("Error reading raw-figma-options file: ", error);
    const message = error instanceof Error ? error.message : String(error);

    return { success: false, error: message } as NormalizeError;
  }
}
