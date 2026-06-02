/**
 * normalize.ts
 *
 * Reads every *.json file from tokens/, normalizes them into a canonical tree,
 * and writes the result to sd/tokens/canonical.json.
 *
 * Normalization pipeline:
 *   1. Parse all JSON files from the tokens/ directory
 *   2. Analyze filenames to build a collectionToSection map
 *      (e.g. "neutral-palette" → "color")
 *   3. For each file:
 *      a. clean()           → strip Figma metadata, rewrite bare alias references
 *      b. nestUnderSections → rearrange so all keys nest under section keys
 *      c. deepMerge         → accumulate into the canonical tree
 *   4. Write canonical.json with section-nested structure
 *
 * Input file naming convention (from Figma sync):
 *   {collection}.{section}.{mode}.json
 *   Examples:
 *   - options.color.light.json   → bare color collections (neutral-palette, brand-palette)
 *   - alias.color.light.json     → semantic color tokens (text, surface, border)
 *   - spacing.default.json       → spacing dimensions
 *   - typography.font.regular.json → typography tokens
 *
 * Output canonical.json structure:
 *   {
 *     "color": {
 *       "neutral-palette": { ... },    ← from options.color.light.json
 *       "brand-palette": { ... },      ← from options.color.light.json
 *       "text": { ... },               ← from alias.color.light.json
 *       "surface": { ... },            ← from alias.color.light.json
 *       "border": { ... }              ← from alias.color.light.json
 *     },
 *     "spacing": { ... },              ← from spacing.default.json
 *     ...
 *   }
 *
 * All alias references are rewritten to point into this nested structure:
 *   "{neutral-palette.blue.600}" → "{color.neutral-palette.blue.600}"
 *   "{spacing.sm}" → "{spacing.sm}" (no change, already at section level)
 */
export {};
