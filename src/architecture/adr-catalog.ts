import fs from "node:fs";
import path from "node:path";

export const ADR_STATUS_VALUES = [
  "Proposed",
  "Draft",
  "Planned",
  "Accepted",
  "Implemented",
  "Superseded",
] as const;

export type AdrStatus = (typeof ADR_STATUS_VALUES)[number];

export interface AdrCatalogEntry {
  fileName: string;
  filePath: string;
  adrSlug: string;
  adrNumber: string;
  id: string;
  title: string;
  statusRaw: string;
  status: AdrStatus;
  isAddendum: boolean;
  sections: string[];
  hasContext: boolean;
  hasDecision: boolean;
  hasConsequences: boolean;
  hasRelatedDocuments: boolean;
  context: string | null;
  decision: string | null;
  consequences: string | null;
  relatedDocuments: string[];
  references: string[];
}

export interface AdrCatalog {
  version: string;
  sourceDir: string;
  entries: AdrCatalogEntry[];
}

function normalizeStatus(statusRaw: string): AdrStatus {
  const trimmed = statusRaw.trim();
  const head = trimmed.split(/\s+/)[0] ?? "";
  const normalized = head.charAt(0).toUpperCase() + head.slice(1).toLowerCase();

  if (ADR_STATUS_VALUES.includes(normalized as AdrStatus)) {
    return normalized as AdrStatus;
  }

  throw new Error(
    `Unsupported ADR status \"${statusRaw}\". Allowed values: ${ADR_STATUS_VALUES.join(", ")}`,
  );
}

function extractFirstHeading(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (!match) {
    throw new Error("ADR is missing a level-1 title heading");
  }
  return match[1].trim();
}

function extractAdrNumber(fileName: string): string {
  const match = fileName.match(/^adr-(\d{4})-/i);
  if (!match) {
    throw new Error(`ADR file name does not match expected pattern: ${fileName}`);
  }
  return match[1];
}

function extractStatus(markdown: string, fileName: string): string {
  const statusHeading = markdown.match(/^##\s+Status\s*$/im);
  if (!statusHeading || statusHeading.index === undefined) {
    const inlineStatusMatch = markdown.match(/^-\s*Status:\s*(.+)$/im);
    if (inlineStatusMatch?.[1]) {
      return inlineStatusMatch[1].trim();
    }

    throw new Error(`${fileName}: missing status metadata (## Status or - Status: ...)`);
  }

  const after = markdown.slice(statusHeading.index + statusHeading[0].length);
  const lines = after.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("---")) continue;
    return trimmed;
  }

  throw new Error(`${fileName}: status section is present but empty`);
}

function collectSectionNames(markdown: string): string[] {
  const matches = [...markdown.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((m) => m[1].trim());
}

function extractSectionBody(markdown: string, heading: string): string | null {
  const lines = markdown.split("\n");
  const headingPattern = new RegExp(
    `^##\\s+${heading.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*$`,
    "i",
  );

  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (headingPattern.test(lines[i])) {
      start = i + 1;
      break;
    }
  }

  if (start === -1) {
    return null;
  }

  let end = lines.length;
  for (let i = start; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const body = lines.slice(start, end).join("\n").trim();
  return body || null;
}

function extractMarkdownLinks(markdown: string): string[] {
  const links = [...markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((m) => m[1]);
  return [...new Set(links)];
}

function extractRelatedDocuments(markdown: string): string[] {
  const section =
    extractSectionBody(markdown, "Related documents") ?? extractSectionBody(markdown, "References");
  if (!section) return [];

  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));

  return lines.map((line) => line.slice(2).trim()).filter(Boolean);
}

export function buildAdrCatalog(repositoryRoot: string): AdrCatalog {
  const adrDir = path.join(repositoryRoot, "architecture", "ADR");
  const entries: AdrCatalogEntry[] = [];

  const files = fs
    .readdirSync(adrDir)
    .filter((name) => /^adr-\d{4}.*\.md$/i.test(name))
    .sort((a, b) => a.localeCompare(b));

  for (const fileName of files) {
    const fullPath = path.join(adrDir, fileName);
    const markdown = fs.readFileSync(fullPath, "utf8");

    const title = extractFirstHeading(markdown);
    const statusRaw = extractStatus(markdown, fileName);
    const status = normalizeStatus(statusRaw);
    const sections = collectSectionNames(markdown);
    const context = extractSectionBody(markdown, "Context");
    const decision = extractSectionBody(markdown, "Decision");
    const consequences = extractSectionBody(markdown, "Consequences");

    entries.push({
      fileName,
      filePath: `architecture/ADR/${fileName}`,
      adrSlug: fileName.replace(/\.md$/i, ""),
      adrNumber: extractAdrNumber(fileName),
      id: title,
      title,
      statusRaw,
      status,
      isAddendum: /addendum/i.test(title) || /addendum/i.test(fileName),
      sections,
      hasContext: context !== null,
      hasDecision: decision !== null,
      hasConsequences: consequences !== null,
      hasRelatedDocuments:
        extractSectionBody(markdown, "Related documents") !== null ||
        extractSectionBody(markdown, "References") !== null,
      context,
      decision,
      consequences,
      relatedDocuments: extractRelatedDocuments(markdown),
      references: extractMarkdownLinks(markdown),
    });
  }

  return {
    version: "1.0.0",
    sourceDir: "architecture/ADR",
    entries,
  };
}
