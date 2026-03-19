import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const adrDir = path.join(repoRoot, "architecture", "ADR");
const architectureReadme = path.join(repoRoot, "architecture", "README.md");
const canonicalFile = path.join(repoRoot, "canonical", "tokens.json");

const allowedStatuses = new Set([
  "Proposed",
  "Draft",
  "Planned",
  "Accepted",
  "Implemented",
  "Superseded",
]);

function fail(message) {
  console.error(`ADR governance check failed: ${message}`);
  process.exitCode = 1;
}

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function isHexColor(value) {
  return typeof value === "string" && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

function isColorOptionAlias(value) {
  return typeof value === "string" && /^\{color\.option\.[^}]+\}$/.test(value);
}

function isPlainPathString(value) {
  return typeof value === "string" && !value.includes("{") && !value.includes("}");
}

function walkTokenLeaves(node, pathParts, visit) {
  if (!isObject(node)) return;

  if ("$value" in node && "$type" in node) {
    visit(node, pathParts);
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    walkTokenLeaves(value, [...pathParts, key], visit);
  }
}

function parseStatus(content) {
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    if (/^##\s+Status\s*$/i.test(lines[i].trim())) {
      const next = lines[i + 1]?.trim();
      if (next) return next;
    }
  }

  const bullet = lines.find((line) => /^-\s*Status\s*:\s*/i.test(line.trim()));
  if (bullet) {
    const match = bullet.match(/^-\s*Status\s*:\s*(.+)$/i);
    return match?.[1]?.trim();
  }

  return null;
}

function getAdrFiles() {
  const all = fs.readdirSync(adrDir).filter((file) => file.endsWith(".md"));
  const primary = all.filter((file) => /^adr-\d{4}-.+\.md$/i.test(file) && !/addendum/i.test(file));
  return primary.sort();
}

function checkSequential(primaryFiles) {
  const nums = primaryFiles.map((file) => Number(file.match(/^adr-(\d{4})-/i)?.[1]));
  const min = Math.min(...nums);
  const max = Math.max(...nums);

  if (min !== 1) {
    fail(`ADR sequence should start at 0001, found ${String(min).padStart(4, "0")}`);
  }

  const missing = [];
  for (let i = min; i <= max; i += 1) {
    if (!nums.includes(i)) missing.push(i);
  }

  if (missing.length > 0) {
    fail(
      `Missing ADR numbers: ${missing.map((n) => String(n).padStart(4, "0")).join(", ")}`,
    );
  }
}

function checkStatuses(primaryFiles) {
  for (const file of primaryFiles) {
    const fullPath = path.join(adrDir, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const status = parseStatus(content);

    if (!status) {
      fail(`${file} is missing a parsable status`);
      continue;
    }

    if (!allowedStatuses.has(status)) {
      fail(
        `${file} has unsupported status "${status}". Allowed: ${Array.from(allowedStatuses).join(", ")}`,
      );
    }
  }
}

function checkReadmeIndex(primaryFiles) {
  const readme = fs.readFileSync(architectureReadme, "utf8");

  for (const file of primaryFiles) {
    const rel = `./ADR/${file}`;
    if (!readme.includes(rel)) {
      fail(`architecture/README.md ADR table is missing ${rel}`);
    }
  }
}

function checkCanonicalAgainstAdr() {
  if (!fs.existsSync(canonicalFile)) {
    fail(`Missing canonical file at canonical/tokens.json`);
    return;
  }

  let canonical;
  try {
    canonical = JSON.parse(fs.readFileSync(canonicalFile, "utf8"));
  } catch {
    fail(`canonical/tokens.json is not valid JSON`);
    return;
  }

  if (!isObject(canonical.color)) {
    fail(`canonical/tokens.json missing color root`);
    return;
  }

  const color = canonical.color;

  if ("primitives" in color) {
    fail(`canonical color.primitives must not exist (ADR-0001/0002)`);
  }

  if (!isObject(color.option)) {
    fail(`canonical color.option missing or invalid`);
    return;
  }

  if (!isObject(color.modes)) {
    fail(`canonical color.modes missing or invalid`);
    return;
  }

  // ADR-0001 option token invariants
  walkTokenLeaves(color.option, ["color", "option"], (leaf, pathParts) => {
    const tokenPath = pathParts.join(".");

    if (leaf.$type !== "color") {
      fail(`${tokenPath} must have $type "color"`);
    }

    if (!isHexColor(leaf.$value)) {
      fail(`${tokenPath} option token must have hex $value, got: ${JSON.stringify(leaf.$value)}`);
    }

    if ("$resolved" in leaf) {
      fail(`${tokenPath} must not use top-level $resolved; use $extensions.cedar.*`);
    }

    const cedar = leaf.$extensions?.cedar;
    if (!isObject(cedar)) return;

    if (isObject(cedar.appearances)) {
      for (const [appearance, value] of Object.entries(cedar.appearances)) {
        if (!isHexColor(value)) {
          fail(`${tokenPath} cedar.appearances.${appearance} must be hex color`);
        }
      }
    }

    if (isObject(cedar.platformOverrides)) {
      for (const [platform, overrides] of Object.entries(cedar.platformOverrides)) {
        if (!isObject(overrides)) {
          fail(`${tokenPath} cedar.platformOverrides.${platform} must be an object`);
          continue;
        }

        for (const [appearance, value] of Object.entries(overrides)) {
          if (!isHexColor(value)) {
            fail(
              `${tokenPath} cedar.platformOverrides.${platform}.${appearance} must be hex color`,
            );
          }
        }
      }
    }
  });

  // ADR-0001 alias token invariants
  walkTokenLeaves(color.modes, ["color", "modes"], (leaf, pathParts) => {
    const tokenPath = pathParts.join(".");

    if (leaf.$type !== "color") {
      fail(`${tokenPath} must have $type "color"`);
    }

    if (!isColorOptionAlias(leaf.$value)) {
      fail(
        `${tokenPath} alias token must reference {color.option.*}, got: ${JSON.stringify(leaf.$value)}`,
      );
    }

    const cedar = leaf.$extensions?.cedar;
    if (!isObject(cedar)) {
      fail(`${tokenPath} alias token missing $extensions.cedar`);
      return;
    }

    for (const platform of ["ios", "web"]) {
      if (!isObject(cedar[platform])) {
        fail(`${tokenPath} missing $extensions.cedar.${platform}`);
        continue;
      }

      for (const appearance of ["light", "dark"]) {
        const pathValue = cedar[platform][appearance];
        if (!isPlainPathString(pathValue)) {
          fail(
            `${tokenPath} $extensions.cedar.${platform}.${appearance} must be plain path string (no braces)`,
          );
        }
      }
    }

    if (isObject(cedar.resolved)) {
      for (const [platform, appearances] of Object.entries(cedar.resolved)) {
        if (!isObject(appearances)) {
          fail(`${tokenPath} $extensions.cedar.resolved.${platform} must be object`);
          continue;
        }

        for (const [appearance, value] of Object.entries(appearances)) {
          if (!isHexColor(value)) {
            fail(`${tokenPath} $extensions.cedar.resolved.${platform}.${appearance} must be hex color`);
          }
        }
      }
    }
  });
}

const adrPrimaryFiles = getAdrFiles();

if (adrPrimaryFiles.length === 0) {
  fail("No primary ADR files found in architecture/ADR");
} else {
  checkSequential(adrPrimaryFiles);
  checkStatuses(adrPrimaryFiles);
  checkReadmeIndex(adrPrimaryFiles);
  checkCanonicalAgainstAdr();
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("ADR governance check passed");
