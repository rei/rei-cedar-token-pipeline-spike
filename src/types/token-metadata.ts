/**
 * token-metadata.ts
 *
 * Governance data structure for semantic tokens. Keyed by canonical token path
 * (e.g., "color.modes.default.surface.base"), this is repo-authored and maintained
 * separately from Figma. Merged into canonical during normalization via
 * $extensions.cedar.governance.
 *
 * Philosophy:
 *   - Figma owns: primitive values, alias references, optional primitive summaries
 *   - Repo owns: status, badges, usage guidance, deprecation, migration, consumed-by, authority dates
 *   - Canonical is the merge: both Figma docs and repo governance are attached
 *   - Neither is the "source of truth" — together they are the complete token definition
 *
 * See ADR-0010 and the metadata merge step in src/normalization/normalize.ts.
 */

export interface TokenBadge {
  label: string;
  tone?: "stable" | "experimental" | "deprecated" | "info" | "success" | "warning" | "error";
}

export interface TokenMetadata {
  /**
   * "stable", "experimental", "deprecated", "unreviewed" (default if no entry).
   * Controls visibility, styling, and release readiness.
   */
  status?: "stable" | "experimental" | "deprecated" | "unreviewed";

  /**
   * Visual badges to render alongside token name (e.g., [stable], [semantic], [alpha]).
   * Falls back to status if absent.
   */
  badges?: TokenBadge[];

  /**
   * Short usage summary. Rendered in token table and detail view.
   * Complements Figma's $extensions.cedar.docs.usage (no conflict).
   */
  usage?: string;

  /**
   * Internal migration notes for deprecated tokens. When to remove, what to use instead.
   * Only populated for deprecated status.
   */
  deprecation?: {
    removedIn?: string; // e.g. "v2.0.0" or "Q4 2026"
    migrateToToken?: string; // e.g. "color.modes.default.surface.raised"
    reason?: string;
  };

  /**
   * Cedar components and product features that depend on this token.
   * Used for impact analysis and deprecation safety.
   */
  usedBy?: string[];

  /**
   * Figma collection and variable names for this token (informational).
   * Hydrated from normalization for easy reference in Storybook.
   */
  figma?: {
    collection?: string; // e.g., "Color / Semantic / Surface"
    variable?: string; // e.g., "surface.base"
  };

  /**
   * Notes for consumers (DSE + design team). e.g., design rationale,
   * production timing, known limitations, design-system-wide impact.
   */
  consumerNotes?: string;

  /**
   * ISO 8601 timestamp when this metadata was last reviewed or updated.
   * Used to surface stale governance entries.
   */
  lastChanged?: string;

  /**
   * Authority: who reviewed and approved this token governance.
   * e.g., "DSE Team", "Sarah (@design-systems)", "Cedar Core".
   */
  authority?: string;
}

/**
 * Keyed collection of token metadata, indexed by canonical token path.
 * Example keys:
 *   "color.modes.default.surface.base"
 *   "color.modes.default.surface.raised"
 *   "color.modes.sale.background"
 *   "spacing.layout.md"
 */
export type TokenMetadataManifest = Record<string, TokenMetadata>;
