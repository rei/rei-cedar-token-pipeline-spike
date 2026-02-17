import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { recursiveTokensLookUp } from "../utils/recursiveTokensLookUp.js";
import type { NormalizeSuccess, NormalizeError } from "../types/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function normalizeAlias() {
  try {
    const pathToFile = path.join(
      __dirname,
      "../../../",
      "/data/raw-figma-alias.json"
    );
    const data = fs.readFileSync(pathToFile, { encoding: "utf-8" });
    const parsedData = JSON.parse(data);
    const nestedObject: NormalizeSuccess = {
      success: true,
      data: { color: {} },
    };

    nestedObject.data.color = {
      ...nestedObject.data.color,
      ...recursiveTokensLookUp(parsedData.color, true),
    };

    return nestedObject;
  } catch (error) {
    console.error("Error reading raw-figma-alias file: ", error);
    const message = error instanceof Error ? error.message : String(error);

    return { success: false, error: message } as NormalizeError;
  }
}
