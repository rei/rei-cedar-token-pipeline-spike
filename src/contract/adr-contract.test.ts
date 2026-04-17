import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADR_STATUS_VALUES,
  buildAdrCatalog,
  type AdrCatalog,
} from "../architecture/adr-catalog.js";

const root = process.cwd();
const catalogPath = path.join(root, "architecture", "adr-catalog.json");
const architectureReadmePath = path.join(root, "architecture", "README.md");

function loadCatalogFromDisk(): AdrCatalog {
  return JSON.parse(fs.readFileSync(catalogPath, "utf8")) as AdrCatalog;
}

function extractAdrLinksFromArchitectureIndex(markdown: string): string[] {
  const links = [...markdown.matchAll(/\(\.\/ADR\/(adr-\d{4}[^)]+\.md)\)/gi)].map(
    (m) => `architecture/ADR/${m[1]}`,
  );
  return [...new Set(links)].sort((a, b) => a.localeCompare(b));
}

describe("ADR machine-readable catalog contract", () => {
  it("has valid entries with supported status values", () => {
    const catalog = loadCatalogFromDisk();

    expect(catalog.version).toBe("1.0.0");
    expect(catalog.sourceDir).toBe("architecture/ADR");
    expect(catalog.entries.length).toBeGreaterThan(0);

    for (const entry of catalog.entries) {
      expect(entry.filePath.startsWith("architecture/ADR/adr-")).toBe(true);
      expect(entry.title.length).toBeGreaterThan(0);
      expect(ADR_STATUS_VALUES).toContain(entry.status);
      expect(entry.statusRaw.length).toBeGreaterThan(0);

      // Keep baseline requirements pragmatic so older ADRs can migrate incrementally.
      if (!entry.isAddendum) {
        expect(entry.hasContext).toBe(true);
      }

      // Decisions should be explicit for ADRs that are already adopted or shipped.
      if (entry.status === "Accepted" || entry.status === "Implemented") {
        expect(entry.hasDecision).toBe(true);
      }
    }
  });

  it("is synchronized with ADR markdown sources", () => {
    const generated = buildAdrCatalog(root);
    const stored = loadCatalogFromDisk();

    expect(stored).toEqual(generated);
  });

  it("is synchronized with architecture README ADR index links", () => {
    const catalog = loadCatalogFromDisk();
    const architectureReadme = fs.readFileSync(architectureReadmePath, "utf8");

    const readmeLinks = extractAdrLinksFromArchitectureIndex(architectureReadme);
    const catalogLinks = catalog.entries
      .map((entry) => entry.filePath)
      .sort((a, b) => a.localeCompare(b));

    expect(readmeLinks).toEqual(catalogLinks);
  });
});
