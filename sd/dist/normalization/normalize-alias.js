import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { recursiveAliasTokensLookUp } from "../utils/recursiveAliasTokensLookUp.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
export function normalizeAlias() {
    try {
        const pathToFile = path.join(__dirname, "../../../", "/data/alias.color.light.json");
        const data = fs.readFileSync(pathToFile, { encoding: "utf-8" });
        const parsedData = JSON.parse(data);
        const nestedObject = {
            success: true,
            data: { color: {} },
        };
        nestedObject.data.color = {
            ...nestedObject.data.color,
            ...recursiveAliasTokensLookUp(parsedData.color),
        };
        return nestedObject;
    }
    catch (error) {
        console.error("Error reading raw-figma-alias file: ", error);
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
    }
}
