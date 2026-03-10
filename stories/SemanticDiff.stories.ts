/**
 * SemanticDiff.stories.ts
 *
 * Storybook stories for the Cedar token semantic diff feature.
 * All stories fetch dist/normalized/baseline.json and dist/normalized/current.json
 * at runtime, so they always reflect the latest token changes.
 *
 * Stories:
 *   FullDiff      — shows all changes between baseline and current
 *   NoChanges     — demonstrates the empty-state UI (no diff entries)
 *   LiveDiff      — same as FullDiff; name indicates it's live/dynamic
 *   AllDiffCases  — purely static synthetic fixtures showing all 8 diff kinds
 */

import type { StoryObj } from "@storybook/html";
import { computeDiff } from "./lib/diff-engine.js";
import { renderDiffPage } from "./lib/diff-render.js";

// ─── Type shim ───────────────────────────────────────────────────────────────

type Meta = {
  title: string;
  render: () => string | Promise<string> | HTMLElement;
};

const meta: Meta = {
  title: "Cedar Tokens / Semantic Diff",
  render: () => "",
};

export default meta;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Wrap a promise-based render so Storybook receives an HTMLElement. */
function asyncStory(
  fn: () => Promise<string>,
): () => HTMLElement {
  return () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px";

    // Loading placeholder
    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token diff…
      </div>`;

    fn()
      .then((html) => {
        container.innerHTML = html;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = `
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading diff: ${msg}
          </div>`;
      });

    return container;
  };
}

// ─── Story: FullDiff ──────────────────────────────────────────────────────────

const NOT_FOUND_HTML = `
<div style="
  background:#f5f2eb;color:#2e2e2b;font-family:'DM Mono',monospace;
  min-height:100vh;padding:40px 32px;box-sizing:border-box
">
  <div style="max-width:560px">
    <div style="font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      color:#736e65;margin-bottom:6px;font-family:'Syne',sans-serif">
      Cedar Design Tokens — Token Diff
    </div>
    <h1 style="margin:0 0 24px;font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;
      letter-spacing:-.02em;border-bottom:2px solid #2e2e2b;padding-bottom:12px">
      Snapshot files not found
    </h1>
    <p style="line-height:1.6;margin:0 0 16px">
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/baseline.json</code>
      and/or
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/current.json</code>
      could not be fetched. The files must exist before the story can load.
    </p>
    <p style="font-size:.8rem;color:#736e65;margin:0 0 20px;line-height:1.6">
      To generate snapshot files, run the token normalization and snapshot commands:
    </p>
    <div style="background:#2e2e2b;color:#edeae3;border-radius:6px;padding:16px 20px;
      font-size:.82rem;line-height:1.8">
      <div style="color:#736e65;margin-bottom:4px;font-size:.7rem;
        letter-spacing:.08em;text-transform:uppercase">Generate snapshots</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:normalize</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:snapshot baseline</div>
      <div style="color:#736e65;margin:4px 0"># make changes to tokens, then:</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:snapshot current</div>
      <div style="color:#736e65;margin:4px 0"># restart Storybook to pick up the new files:</div>
      <div><span style="color:#3b8349">$</span> pnpm storybook</div>
    </div>
  </div>
</div>`;

// ─── Story: NoChanges ─────────────────────────────────────────────────────────

export const NoChanges: StoryObj = {
  name: "No Changes",
  render: asyncStory(async () => {
    const base = window.location.pathname.replace(/\/[^/]*$/, "/");
    const res = await fetch(`${base}normalized/baseline.json`);

    if (res.status === 404) {
      return NOT_FOUND_HTML;
    }

    if (!res.ok) throw new Error(`baseline.json: ${res.status} ${res.statusText}`);

    const baseline = (await res.json()) as Record<string, unknown>;
    // Compare baseline with itself (no changes)
    const entries = computeDiff(baseline, baseline);
    return renderDiffPage(entries, {
      baselineLabel: "v1.0.0",
      currentLabel: "v1.0.0",
    });
  }),
};

// ─── Story: LiveDiff ──────────────────────────────────────────────────────────

/**
 * Fetches both JSON snapshots from the static server at runtime.
 * This story displays **all token changes** across all categories:
 * - Primitive token values (hex colors, sizing, etc.)
 * - Semantic token aliases (text, surface, border, etc.)
 * - Spacing and other sections
 * - Structural changes (added/removed groups)
 *
 * The diff includes 8 kinds of changes:
 * - added, removed (token-level)
 * - changed-value, changed-alias (token modifications)
 * - alias-to-value, value-to-alias (structural type changes)
 * - group-added, group-removed (section-level changes)
 */
export const LiveDiff: StoryObj = {
  name: "Live Diff (fetched)",
  render: asyncStory(async () => {
    // Derive the base URL from the current page so this works both locally
    // (served from /) and on GH Pages (served from a sub-path like
    // /rei-cedar-token-pipeline-spike/pr/update-tokens/).
    // window.location.pathname inside the Storybook iframe is something like
    // /rei-cedar-token-pipeline-spike/pr/update-tokens/iframe.html so stripping
    // the filename gives us the correct base to resolve normalized/ against.
    const base = window.location.pathname.replace(/\/[^/]*$/, "/");
    const [baseRes, currRes] = await Promise.all([
      fetch(`${base}normalized/baseline.json`),
      fetch(`${base}normalized/current.json`),
    ]);

    if (baseRes.status === 404 || currRes.status === 404) {
      return NOT_FOUND_HTML;
    }

    if (!baseRes.ok) throw new Error(`baseline.json: ${baseRes.status} ${baseRes.statusText}`);
    if (!currRes.ok) throw new Error(`current.json: ${currRes.status} ${currRes.statusText}`);

    const baseline = (await baseRes.json()) as Record<string, unknown>;
    const current = (await currRes.json()) as Record<string, unknown>;

    const entries = computeDiff(baseline, current);
    return renderDiffPage(entries, {
      baselineLabel: "baseline.json",
      currentLabel: "current.json",
    });
  }),
};

// ─── Story: AllDiffCases ─────────────────────────────────────────────────────

/**
 * Purely static story using hardcoded synthetic token trees.
 * Demonstrates every possible DiffKind side-by-side so the diff UI can be
 * reviewed without needing real snapshot files.
 *
 * Covered kinds (all 8):
 *   added          — token exists only in current
 *   removed        — token exists only in baseline
 *   changed-value  — primitive hex or fluid value changed
 *   changed-alias  — alias target reference changed
 *   alias-to-value — was an alias, now a raw value
 *   value-to-alias — was a raw value, now an alias
 *   group-added    — entire subtree is new in current
 *   group-removed  — entire subtree gone from current
 *
 * Value types covered:
 *   hex colors (#RRGGBB / #RRGGBBAA)
 *   fluid spacing clamp() values
 *   alias references {path.to.token}
 */
export const AllDiffCases: StoryObj = {
  name: "All Diff Cases",
  render: () => {
    // ── Synthetic baseline token tree ────────────────────────────────────────
    //
    // Organised so that:
    //   • color.modes.default.*  → semantic color aliases (depth-3 section)
    //   • color.neutral-palette.* → primitive hex colors (depth-2 section)
    //   • spacing.scale.*        → fluid clamp() values  (depth-2 section)
    //   • spacing.component.*    → raw px values          (depth-2 section)
    //   • legacy.*               → entire group to be removed
    //
    const baseline: Record<string, unknown> = {
      color: {
        modes: {
          default: {
            text: {
              // changed-alias: alias target will change
              link:    { $value: "{color.neutral-palette.blue.600}", $type: "color" },
              // alias-to-value: was alias, becomes raw hex
              heading: { $value: "{color.neutral-palette.warm-grey.900}", $type: "color" },
              // removed: will disappear in current
              inverse: { $value: "{color.neutral-palette.warm-grey.50}", $type: "color" },
            },
            surface: {
              // changed-value: hex will change to a different hex
              base:    { $value: "#f5f2eb", $type: "color" },
              // value-to-alias: was raw hex, becomes alias
              overlay: { $value: "#2e2e2b33", $type: "color" },
            },
          },
        },
        "neutral-palette": {
          "warm-grey": {
            // changed-value: hex lightness shift
            "100": { $value: "#edeae3", $type: "color" },
            // unchanged — should not appear in diff
            "50":  { $value: "#f5f2eb", $type: "color" },
          },
        },
      },
      spacing: {
        scale: {
          // changed-value: fluid clamp expression will change
          "-50": { $value: "clamp(4px, 0.3571vw + 2.857px, 8px)",  $type: "spacing" },
          // unchanged
          "0":   { $value: "clamp(8px, 0.7143vw + 5.714px, 16px)", $type: "spacing" },
        },
        component: {
          // removed: will disappear in current
          "button-padding-x": { $value: "16px", $type: "spacing" },
        },
      },
      // group-removed: this entire subtree is absent in current
      legacy: {
        "icon-size": { $value: "20px", $type: "sizing" },
        "icon-size-lg": { $value: "28px", $type: "sizing" },
      },
    };

    // ── Synthetic current token tree ─────────────────────────────────────────
    const current: Record<string, unknown> = {
      color: {
        modes: {
          default: {
            text: {
              // changed-alias: target changed from blue.600 → blue.700
              link:    { $value: "{color.neutral-palette.blue.700}", $type: "color" },
              // alias-to-value: now a raw hex instead of alias
              heading: { $value: "#1a1a18", $type: "color" },
              // added: brand-new token in current
              muted:   { $value: "{color.neutral-palette.warm-grey.500}", $type: "color" },
              // (inverse is gone → removed)
            },
            surface: {
              // changed-value: hex changed
              base:    { $value: "#f8f6f0", $type: "color" },
              // value-to-alias: now an alias
              overlay: { $value: "{color.neutral-palette.warm-grey.900}", $type: "color" },
            },
          },
        },
        "neutral-palette": {
          "warm-grey": {
            // changed-value
            "100": { $value: "#e8e4dc", $type: "color" },
            // unchanged
            "50":  { $value: "#f5f2eb", $type: "color" },
          },
        },
      },
      spacing: {
        scale: {
          // changed-value: fluid expression tightened
          "-50": { $value: "clamp(2px, 0.2232vw + 1.786px, 6px)",  $type: "spacing" },
          // unchanged
          "0":   { $value: "clamp(8px, 0.7143vw + 5.714px, 16px)", $type: "spacing" },
        },
        component: {
          // (button-padding-x removed)
        },
        // group-added: entirely new subtree
        layout: {
          "content-max-width": { $value: "1280px", $type: "sizing" },
          "sidebar-width":     { $value: "280px",  $type: "sizing" },
        },
      },
      // (legacy group is gone → group-removed)
    };

    const entries = computeDiff(baseline, current);
    return renderDiffPage(entries, {
      baselineLabel: "v2.0.0 (synthetic)",
      currentLabel:  "v2.1.0 (synthetic)",
    });
  },
};
