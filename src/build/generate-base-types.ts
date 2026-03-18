import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileFromFile } from "json-schema-to-typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../schema/token-schema.json");
const outputDir = path.resolve(__dirname, "../../dist/types/base");
const outputPath = path.join(outputDir, "token-schema.d.ts");

async function main() {
  const output = await compileFromFile(schemaPath, {
    bannerComment:
      "/* This file is auto-generated from src/schema/token-schema.json. Do not edit manually. */",
    unreachableDefinitions: true,
    style: {
      singleQuote: false,
    },
  });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, output, "utf8");

  console.log(`Generated base token types: ${outputPath}`);
}

main().catch((error) => {
  console.error("Failed to generate base token types:", error);
  process.exit(1);
});
