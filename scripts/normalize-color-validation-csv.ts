import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COLOR_REFERENCE_HEADERS,
  FAMILY_PARAMETER_HEADERS,
  normalizeColorReferences,
  normalizeFamilyParameters,
  parseCsvRecords,
  recordsToCsv,
  validateColorReferenceData,
} from "../style-dictionary/validation/color-reference.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(rootDir, "assets");
const parameterInput = path.join(assetsDir, "color-family-parameters.csv");
const referenceInput = path.join(assetsDir, "color-output-references.csv");
const parameterOutput = path.join(assetsDir, "normalized-color-family-parameters.csv");
const referenceOutput = path.join(assetsDir, "normalized-color-output-references.csv");

function main(): void {
  const parameters = normalizeFamilyParameters(
    parseCsvRecords(
      fs.readFileSync(parameterInput, "utf8"),
      FAMILY_PARAMETER_HEADERS,
      parameterInput,
    ),
  );
  const references = normalizeColorReferences(
    parseCsvRecords(
      fs.readFileSync(referenceInput, "utf8"),
      COLOR_REFERENCE_HEADERS,
      referenceInput,
    ),
  );

  fs.writeFileSync(parameterOutput, recordsToCsv(FAMILY_PARAMETER_HEADERS, parameters));
  fs.writeFileSync(referenceOutput, recordsToCsv(COLOR_REFERENCE_HEADERS, references));

  const issues = validateColorReferenceData(parameters, references);
  console.log(
    `Normalized ${parameters.length} family parameter rows and ${references.length} color reference rows.`,
  );

  if (issues.length > 0) {
    console.warn(`Found ${issues.length} reference data issue(s):`);
    for (const issue of issues) console.warn(`  - ${issue}`);
  }

  if (process.env.COLOR_REFERENCE_STRICT === "1" && issues.length > 0) {
    process.exitCode = 1;
  }
}

main();
