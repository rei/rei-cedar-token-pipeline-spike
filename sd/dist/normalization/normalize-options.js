import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { recursiveJoinTokens } from "../utils/recursiveJoinTokens.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
export function normalizeOptions() {
    try {
        const pathToIosFile = path.join(__dirname, "../../../", "/data/options.color.ios.json");
        const pathToWebFile = path.join(__dirname, "../../../", "/data/options.color.web.json");
        // iOS mode data
        const iosData = fs.readFileSync(pathToIosFile, { encoding: "utf-8" });
        const parsedIosData = JSON.parse(iosData);
        // Web mode data
        const webData = fs.readFileSync(pathToWebFile, { encoding: "utf-8" });
        const parsedWebData = JSON.parse(webData);
        const webTokensGroups = Object.keys(parsedWebData);
        const nestedObject = {
            success: true,
            data: { color: {} },
        };
        webTokensGroups.forEach((group) => {
            nestedObject.data.color[group] = {
                ...recursiveJoinTokens(parsedWebData[group], parsedIosData[group]),
            };
        });
        return nestedObject;
    }
    catch (error) {
        console.error("Error reading raw-figma-options file: ", error);
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
    }
}
