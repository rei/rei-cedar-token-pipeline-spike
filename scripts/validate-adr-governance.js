import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const adrDir = path.join(repoRoot, "architecture", "ADR");
const architectureReadme = path.join(repoRoot, "architecture", "README.md");

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

const adrPrimaryFiles = getAdrFiles();

if (adrPrimaryFiles.length === 0) {
  fail("No primary ADR files found in architecture/ADR");
} else {
  checkSequential(adrPrimaryFiles);
  checkStatuses(adrPrimaryFiles);
  checkReadmeIndex(adrPrimaryFiles);
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("ADR governance check passed");
