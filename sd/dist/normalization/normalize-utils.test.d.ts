/**
 * normalize-utils.test.ts
 *
 * Unit tests for the pure normalization helpers: clean, deepMerge,
 * buildCollectionToSection.
 *
 * Covers:
 *  - Stripping $extensions / $description
 *  - Preserving $value / $type on all token types (color, dimension, fontFamily, boolean)
 *  - Alias rewriting for color collections (bare → prefixed)
 *  - Alias references that already point to a section root are left unchanged
 *  - Spacing tokens: aliases within spacing stay as-is
 *  - Typography tokens: string and number $values
 *  - Deep merge: sibling keys merged, conflicts resolved (last-write-wins)
 *  - buildCollectionToSection: alias file, options file, spacing file, typography file
 */
export {};
