import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type {
  CanonicalRoot,
  CanonicalTokenGroup,
  CanonicalColorToken,
} from "../types/canonical-token.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Deep merges groups and sanitizes leaf nodes (tokens).
 */
function recursiveTokensLookUp(
  tokensData: CanonicalTokenGroup
): CanonicalTokenGroup {
  let recursiveObject: CanonicalTokenGroup = {};
  const currentKeys = Object.keys(tokensData);

  for (const key of currentKeys) {
    const currentObject: CanonicalTokenGroup | CanonicalColorToken =
      tokensData[key];

    if (
      currentObject &&
      typeof currentObject === "object" &&
      "$value" in currentObject
    ) {
      const { $value, $type } = currentObject as CanonicalColorToken;

      recursiveObject[key] = {
        $value: $value.replace(/\{/g, "{color."),
        $type,
      };
    } else {
      recursiveObject[key] = {
        ...recursiveTokensLookUp(currentObject),
      } as CanonicalTokenGroup;
    }
  }

  return recursiveObject;
}

export function normalizeAlias() {
  try {
    const pathToFile = path.join(
      __dirname,
      "../../../",
      "/data/raw-figma-alias.json"
    );
    const data = fs.readFileSync(pathToFile, { encoding: "utf-8" });
    const parsedData = JSON.parse(data);
    let nestedObject: CanonicalRoot = { color: {} };

    nestedObject.color = {
      ...nestedObject.color,
      ...recursiveTokensLookUp(parsedData.color),
    };

    return nestedObject;
  } catch (error) {
    console.error("Error reading raw-figma-alias file: ", error);
  }
}
