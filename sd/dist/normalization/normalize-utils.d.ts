/**
 * normalize-utils.ts
 *
 * Pure functions extracted from normalize.ts so they can be unit-tested
 * without hitting the filesystem.
 */
export type TokenNode = {
    [key: string]: TokenNode;
} | {
    $value: string | number | boolean;
    $type: string;
};
export type ParsedFile = {
    file: string;
    data: Record<string, unknown>;
};
type ClampData = {
    min: number;
    max: number;
    ideal: string;
};
export type SpacingClampMap = Map<string, ClampData>;
export declare function isLeaf(node: unknown): node is {
    $value: string | number | boolean;
    $type: string;
    [k: string]: unknown;
};
/**
 * Inspect every parsed file and build a map from bare collection root
 * (e.g. "neutral-palette") to the canonical section it belongs to (e.g. "color").
 *
 * The section is derived from the second segment of the filename:
 *   options.color.light.json  → section "color"
 *   alias.color.light.json    → section "color"
 *   spacing.default.json      → section "default" … but the top-level key IS
 *                               "spacing", so it maps to itself.
 *
 * Rules:
 *   - If a file's top-level key matches the filename-derived section name,
 *     it IS the section wrapper → map it and all its children to that section.
 *   - Otherwise the top-level key is a bare collection → map it to the
 *     filename-derived section.
 */
export declare function buildCollectionToSection(parsed: ParsedFile[]): Map<string, string>;
/**
 * Recursively strip Figma metadata and rewrite bare alias references so they
 * resolve correctly after nesting under section keys.
 *
 * Two main transformations:
 *   1. Strip $extensions and $description (Figma-specific metadata)
 *   2. Rewrite bare alias references with their section prefix if needed.
 *      This prepares aliases for the section-nested canonical tree where
 *      collections like "neutral-palette" are nested under "color".
 *
 * Examples:
 *   "{neutral-palette.warm-grey.100}" → "{color.neutral-palette.warm-grey.100}"
 *   "{spacing.sm}" → "{spacing.sm}" (already a section root, no change)
 *   "{color.text.link}" → "{color.text.link}" (already prefixed, no change)
 *
 * The collectionToSection map (built from filename analysis) tells us which
 * section each collection belongs to. If a bare reference's first segment
 * (e.g. "neutral-palette") is a collection, we prefix it with its section
 * (e.g. "color.") so the reference resolves in the nested tree.
 */
export declare function clean(node: Record<string, unknown>, collectionToSection: Map<string, string>): TokenNode;
/**
 * Restructure cleaned file output so all collections are nested under their
 * canonical section keys. This creates the final hierarchical canonical tree.
 *
 * Why nested sections?
 *   The Figma sync produces files with different structures:
 *   - alias.color.light.json: { "color": { "surface": {...}, "text": {...} } }
 *   - options.color.light.json: { "neutral-palette": {...}, "brand-palette": {...} }
 *
 *   To keep aliases resolvable and the tree organized, we nest everything
 *   under section keys:
 *   - Alias tokens (already section-wrapped) stay as-is
 *   - Option collections (bare) get nested under their section
 *
 * Nesting rules (using collectionToSection map):
 *   - If map.get(key) === key:
 *     → key IS a section wrapper (e.g. "color" from alias.color.light.json).
 *       Keep at top level: { "color": { children } }
 *   - If map.get(key) !== key (and not undefined):
 *     → key is a bare collection (e.g. "neutral-palette" from options.color.light.json).
 *       Nest under its section: { "color": { "neutral-palette": {...} } }
 *
 * Multiple files can contribute to the same section (e.g. both options.color.*
 * and alias.color.* nest under "color"), so top-level keys that map to the
 * same section are merged together via deepMerge.
 *
 * Example results:
 *   Input:  { "neutral-palette": {...}, "brand-palette": {...} } (bare collections)
 *   Output: { "color": { "neutral-palette": {...}, "brand-palette": {...} } }
 *
 *   Input:  { "color": { "surface": {...}, "text": {...} } } (section wrapper)
 *   Output: { "color": { "surface": {...}, "text": {...} } } (unchanged)
 */
export declare function nestUnderSections(cleaned: Record<string, unknown>, collectionToSection: Map<string, string>): Record<string, unknown>;
/** Deep-merge src into dest (dest is mutated). Later files win on conflicts. */
export declare function deepMerge(dest: Record<string, unknown>, src: Record<string, unknown>): void;
export declare function buildSpacingClampData(spacingFiles: ParsedFile[]): SpacingClampMap;
export {};
