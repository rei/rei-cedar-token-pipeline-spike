/**
 * SemanticDiff.stories.ts
 *
 * Storybook stories for the Cedar token semantic diff feature.
 *
 * Stories can compare the latest baseline/current snapshots from dist/normalized/
 * and browse archived timestamped snapshots from canonical/snapshots/.
 *
 * Stories:
 *   NoChanges     — demonstrates the empty-state UI (no diff entries)
 *   LiveDiff      — same as FullDiff; name indicates it's live/dynamic
 *   SnapshotCompare — choose one base snapshot and compare against up to 3 others
 *   AllDiffCases  — purely static synthetic fixtures showing all 8 diff kinds
 */

import type { StoryObj } from "@storybook/html";
import { computeDiff } from "./lib/diff-engine.js";
import { renderDiffPage, renderDiffPanel } from "./lib/diff-render.js";

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

interface SnapshotManifestEntry {
  id: string;
  createdAt: string;
  slot: "baseline" | "current";
  label: string;
  file: string;
}

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function storyBase(): string {
  return window.location.pathname.replace(/\/[^/]*$/, "/");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSnapshotLabel(entry: SnapshotManifestEntry): string {
  if (entry.label && entry.slot === "current") {
    const date = new Date(entry.label);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
  }

  const date = new Date(entry.createdAt);
  const formatted = Number.isNaN(date.getTime())
    ? entry.createdAt
    : date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
  return entry.slot === "current" ? formatted : `${formatted} (${entry.slot})`;
}

function optionMarkup(
  manifest: SnapshotManifestEntry[],
  selectedId: string,
  opts: { allowBlank?: boolean } = {},
): string {
  const blank = opts.allowBlank
    ? '<option value="">No comparison</option>'
    : "";
  return `${blank}${manifest
    .map((entry) => {
      const selected = entry.id === selectedId ? " selected" : "";
      return `<option value="${escapeHtml(entry.id)}"${selected}>${escapeHtml(formatSnapshotLabel(entry))}</option>`;
    })
    .join("")}`;
}

async function fetchJson<T>(relativePath: string): Promise<T> {
  const res = await fetch(`${storyBase()}${relativePath}`);
  if (!res.ok) {
    throw new Error(`${relativePath}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Wrap a promise-based render so Storybook receives an HTMLElement. */
function asyncStory(
  fn: () => Promise<string>,
): () => HTMLElement {
  return () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px";

    // Loading placeholder
    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading token diff…
      </div>`;

    fn()
      .then((html) => {
        container.innerHTML = html;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = `
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d">
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
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/baseline.json</code>,
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/current.json</code>
      and/or
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">canonical/snapshots/index.json</code>
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
    const base = storyBase();
    const [baseRes, currRes] = await Promise.all([fetch(`${base}normalized/baseline.json`), fetch(`${base}normalized/current.json`)]);

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

function renderSnapshotCompareShell(
  manifest: SnapshotManifestEntry[],
  baseId: string,
  compareIds: string[],
): string {
  const rows = manifest
    .slice(0, 12)
    .map(
      (entry) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'DM Mono',monospace;font-size:.8rem">${escapeHtml(formatSnapshotLabel(entry))}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'Syne',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#736e65">${escapeHtml(entry.slot)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'DM Mono',monospace;font-size:.72rem;color:#736e65">${escapeHtml(entry.id)}</td>
        </tr>`,
    )
    .join("");

  return `
${FONTS}
<div style="background:#f5f2eb;color:#2e2e2b;font-family:'DM Mono',monospace;min-height:100vh;padding:40px 32px;box-sizing:border-box;">
  <div style="max-width:1320px;margin:0 auto;display:grid;gap:24px;">
    <section style="background:#fbf9f4;border:1px solid #ccc9c1;border-radius:10px;padding:24px;display:grid;gap:18px;">
      <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-end;flex-wrap:wrap;">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;margin-bottom:6px;">Cedar Design Tokens</div>
          <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.05;">Snapshot Compare</h1>
          <p style="margin:10px 0 0;font-size:.92rem;line-height:1.6;color:#736e65;max-width:760px;">Pick one base snapshot and compare it against up to three archived snapshots. Each PR run adds timestamped entries to the snapshot archive.</p>
        </div>
        <div style="font-family:'DM Mono',monospace;font-size:.8rem;color:#736e65;">${manifest.length} archived snapshot${manifest.length === 1 ? "" : "s"}</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:14px;">
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Base snapshot</span>
          <select data-base-select style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${optionMarkup(manifest, baseId)}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 1</span>
          <select data-compare-select="0" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${optionMarkup(manifest, compareIds[0] ?? "", { allowBlank: true })}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 2</span>
          <select data-compare-select="1" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${optionMarkup(manifest, compareIds[1] ?? "", { allowBlank: true })}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 3</span>
          <select data-compare-select="2" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${optionMarkup(manifest, compareIds[2] ?? "", { allowBlank: true })}
          </select>
        </label>
      </div>

      <div data-compare-status style="font-size:.82rem;color:#736e65;"></div>
    </section>

    <section style="background:#fbf9f4;border:1px solid #ccc9c1;border-radius:10px;padding:20px;overflow:auto;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:10px;">
        <h2 style="margin:0;font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2e2e2b;">Stored snapshots</h2>
        <div style="font-size:.75rem;color:#736e65;">Newest first</div>
      </div>
      <table style="width:100%;border-collapse:collapse;min-width:720px;">
        <thead>
          <tr>
            <th style="padding:0 10px 8px 10px;text-align:left;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;border-bottom:1px solid #b2ab9f;">Timestamp</th>
            <th style="padding:0 10px 8px 10px;text-align:left;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;border-bottom:1px solid #b2ab9f;">Slot</th>
            <th style="padding:0 10px 8px 10px;text-align:left;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;border-bottom:1px solid #b2ab9f;">Id</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>

    <div data-compare-results style="display:grid;gap:20px;"></div>
  </div>
</div>`;
}

export const SnapshotCompare: StoryObj = {
  name: "Snapshot Compare",
  render: () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px;background:#f5f2eb;";
    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading snapshot archive…
      </div>`;

    void (async () => {
      try {
        const manifest = await fetchJson<SnapshotManifestEntry[]>("canonical/snapshots/index.json");

        if (manifest.length < 2) {
          container.innerHTML = NOT_FOUND_HTML;
          return;
        }

        const baseId = manifest[0]?.id ?? "";
        const compareIds = manifest.slice(1, 4).map((entry) => entry.id);
        container.innerHTML = renderSnapshotCompareShell(manifest, baseId, compareIds);

        const root = container;
        const baseSelect = root.querySelector<HTMLSelectElement>("[data-base-select]");
        const compareSelects = [...root.querySelectorAll<HTMLSelectElement>("[data-compare-select]")];
        const statusEl = root.querySelector<HTMLElement>("[data-compare-status]");
        const resultsEl = root.querySelector<HTMLElement>("[data-compare-results]");

        if (!baseSelect || compareSelects.length === 0 || !statusEl || !resultsEl) {
          throw new Error("Snapshot comparison controls failed to render.");
        }

        const manifestById = new Map(manifest.map((entry) => [entry.id, entry]));
        const cache = new Map<string, Promise<Record<string, unknown>>>();

        const loadSnapshot = (id: string): Promise<Record<string, unknown>> => {
          if (!cache.has(id)) {
            const entry = manifestById.get(id);
            if (!entry) throw new Error(`Unknown snapshot id: ${id}`);
            cache.set(id, fetchJson<Record<string, unknown>>(`canonical/${entry.file}`));
          }
          return cache.get(id)!;
        };

        const renderComparisons = async (): Promise<void> => {
          const selectedBase = baseSelect.value;
          const selectedTargets: string[] = [];

          for (const select of compareSelects) {
            const id = select.value;
            if (!id || id === selectedBase || selectedTargets.includes(id)) continue;
            selectedTargets.push(id);
            if (selectedTargets.length === 3) break;
          }

          if (!selectedBase) {
            statusEl.innerHTML = "Choose a base snapshot to start comparing.";
            resultsEl.innerHTML = "";
            return;
          }

          if (selectedTargets.length === 0) {
            statusEl.innerHTML = "Pick at least one comparison snapshot. Duplicate selections and the base snapshot are ignored.";
            resultsEl.innerHTML = "";
            return;
          }

          statusEl.innerHTML = `Comparing <strong>${selectedTargets.length}</strong> snapshot${selectedTargets.length === 1 ? "" : "s"} against the selected base.`;
          resultsEl.innerHTML = `<div style="padding:20px 0;color:#736e65;font-family:'DM Mono',monospace;">Computing diffs…</div>`;

          const baseTree = await loadSnapshot(selectedBase);
          const baseEntry = manifestById.get(selectedBase)!;

          const panels = await Promise.all(
            selectedTargets.map(async (targetId, index) => {
              const targetTree = await loadSnapshot(targetId);
              const targetEntry = manifestById.get(targetId)!;
              const entries = computeDiff(baseTree, targetTree);
              return renderDiffPanel(entries, {
                title: `Comparison ${index + 1}`,
                baselineLabel: formatSnapshotLabel(baseEntry),
                currentLabel: formatSnapshotLabel(targetEntry),
              });
            }),
          );

          resultsEl.innerHTML = panels.join("");
        };

        baseSelect.addEventListener("change", () => {
          void renderComparisons();
        });
        compareSelects.forEach((select) => {
          select.addEventListener("change", () => {
            void renderComparisons();
          });
        });

        await renderComparisons();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = `
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d;background:#f5f2eb;">
            Error loading snapshot archive: ${escapeHtml(msg)}
          </div>`;
      }
    })();

    return container;
  },
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
