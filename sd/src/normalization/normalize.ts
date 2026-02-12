import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { normalizeOptions } from "./normalize-options.js";
import { normalizeAlias } from "./normalize-alias.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const optionsVariables = normalizeOptions();
  const variablesAliases = normalizeAlias();
  const filePath = path.join(__dirname, "../../", "/tokens/canonical.json");
  const directoryPath = path.dirname(filePath);
  let mergedObject = { color: {} };

  mergedObject.color = {
    ...optionsVariables?.color,
    ...variablesAliases?.color,
  };

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(mergedObject, null, 2), "utf-8");

  console.log(`Successfully created: ${filePath}`);
} catch (error) {
  console.error("Error creating canonical.json file: ", error);
}
