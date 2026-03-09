/**
 * diff-render.ts
 *
 * HTML string rendering helpers for the semantic diff table.
 * Follows the editorial/cartographic design language used in the other stories:
 *   - Warm paper background (#f5f2eb)
 *   - Syne (display) + DM Mono (mono) from Google Fonts
 *   - Hairline rules, restrained colour, data-dense tables
 *   - Colour swatch chips for hex values
 *
 * Changed rows are highlighted; unchanged sections are collapsed by default
 * via a <details> element. Group-level structural changes get a banner row.
 */

import { type DiffEntry, type DiffKind, groupBySectionPath } from "./diff-engine.js";

// ─── Palette ────────────────────────────────────────────────────────────────

const COLOR = {
  paper: "#f5f2eb",
  ink: "#2e2e2b",
  inkFaint: "#736e65",
  rule: "#ccc9c1",
  added: "#d4edda",
  addedBorder: "#3b8349",
  removed: "#f8d7da",
  removedBorder: "#be342d",
  changed: "#fff3cd",
  changedBorder: "#c8a020",
  structural: "#e8e4f8",
  structuralBorder: "#5a4fcf",
  chip: "#00000018",
};

// ─── Kind metadata ───────────────────────────────────────────────────────────

interface KindMeta {
  label: string;
  badge: string;
  rowBg: string;
  rowBorder: string;
}

const KIND_META: Record<DiffKind, KindMeta> = {
  "added": {
    label: "Added",
    badge: `background:${COLOR.addedBorder};color:#fff`,
    rowBg: COLOR.added,
    rowBorder: COLOR.addedBorder,
  },
  "removed": {
    label: "Removed",
    badge: `background:${COLOR.removedBorder};color:#fff`,
    rowBg: COLOR.removed,
    rowBorder: COLOR.removedBorder,
  },
  "changed-value": {
    label: "Value changed",
    badge: `background:${COLOR.changedBorder};color:#fff`,
    rowBg: COLOR.changed,
    rowBorder: COLOR.changedBorder,
  },
  "changed-alias": {
    label: "Alias retargeted",
    badge: `background:${COLOR.changedBorder};color:#fff`,
    rowBg: COLOR.changed,
    rowBorder: COLOR.changedBorder,
  },
  "alias-to-value": {
    label: "Alias → Value",
    badge: `background:${COLOR.structuralBorder};color:#fff`,
    rowBg: COLOR.structural,
    rowBorder: COLOR.structuralBorder,
  },
  "value-to-alias": {
    label: "Value → Alias",
    badge: `background:${COLOR.structuralBorder};color:#fff`,
    rowBg: COLOR.structural,
    rowBorder: COLOR.structuralBorder,
  },
  "group-added": {
    label: "Group added",
    badge: `background:${COLOR.addedBorder};color:#fff`,
    rowBg: COLOR.added,
    rowBorder: COLOR.addedBorder,
  },
  "group-removed": {
    label: "Group removed",
    badge: `background:${COLOR.removedBorder};color:#fff`,
    rowBg: COLOR.removed,
    rowBorder: COLOR.removedBorder,
  },
};

// ─── Small helpers ───────────────────────────────────────────────────────────

function isHex(v: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(v.trim());
}

/** Render a colour swatch chip + the raw value string. */
function valueCell(value: string | null, strikethrough = false): string {
  if (value === null) return `<span style="color:${COLOR.inkFaint}">—</span>`;
  const strike = strikethrough
    ? `text-decoration:line-through;opacity:.55;`
    : "";
  const isFluid = value.trimStart().startsWith("clamp(");
  const chip = isHex(value)
    ? `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${value};border:1px solid ${COLOR.chip};vertical-align:middle;margin-right:6px;flex-shrink:0"></span>`
    : isFluid
    ? `<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:linear-gradient(90deg,#b2ab9f 0%,#2e2e2b 100%);border:1px solid ${COLOR.chip};vertical-align:middle;margin-right:6px;flex-shrink:0" title="fluid"></span>`
    : "";
  return `<span style="display:inline-flex;align-items:center;font-family:'DM Mono',monospace;font-size:.8rem;${strike}">${chip}${value}</span>`;
}

function badge(meta: KindMeta): string {
  return `<span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:.68rem;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap;${meta.badge}">${meta.label}</span>`;
}

function shortPath(path: string): string {
  // Show only the last two segments in the path column to save space
  const parts = path.split(".");
  const tail = parts.slice(-2).join(".");
  const head = parts.slice(0, -2).join(".");
  if (!head) return `<strong>${tail}</strong>`;
  return `<span style="color:${COLOR.inkFaint};font-size:.75rem">${head}.</span><strong>${tail}</strong>`;
}

// ─── Row renderers ───────────────────────────────────────────────────────────

function tokenRow(entry: DiffEntry): string {
  const meta = KIND_META[entry.kind];
  const isGroupKind =
    entry.kind === "group-added" || entry.kind === "group-removed";

  if (isGroupKind) {
    return `
      <tr style="background:${meta.rowBg};border-left:3px solid ${meta.rowBorder}">
        <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem" colspan="3">
          ${shortPath(entry.path)}
        </td>
        <td style="padding:8px 12px">${badge(meta)}</td>
      </tr>`;
  }

  const bVal = entry.baseline?.$value ?? null;
  const cVal = entry.current?.$value ?? null;

  return `
    <tr style="background:${meta.rowBg};border-left:3px solid ${meta.rowBorder}">
      <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem">${shortPath(entry.path)}</td>
      <td style="padding:8px 12px">${valueCell(bVal, entry.kind === "removed")}</td>
      <td style="padding:8px 12px">${valueCell(cVal, false)}</td>
      <td style="padding:8px 12px">${badge(meta)}</td>
    </tr>`;
}

// ─── Section block ────────────────────────────────────────────────────────────

function sectionBlock(section: string, entries: DiffEntry[]): string {
  const rows = entries.map(tokenRow).join("");
  const parts = section.split(".");

  // Build a human-readable label for the section header.
  // "color.modes.default"  → "default  [color mode]"
  // "color.text"           → "text"
  // "color.neutral-palette"→ "neutral-palette"
  // "spacing.component"    → "component"
  // "spacing.scale"        → "scale  [fluid]"
  let label: string;
  if (parts[0] === "color" && parts[1] === "modes" && parts[2]) {
    label = `${parts[2]} <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[color mode]</span>`;
  } else if (parts[0] === "spacing" && parts[1] === "scale") {
    label = `scale <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[fluid]</span>`;
  } else {
    const tail = parts.slice(1).join(" › ") || section;
    label = tail;
  }

  const countBadge = `<span style="margin-left:8px;font-size:.7rem;font-family:'DM Mono',monospace;color:${COLOR.inkFaint}">${entries.length} change${entries.length !== 1 ? "s" : ""}</span>`;

  return `
    <details open style="margin-bottom:1px">
      <summary style="
        list-style:none;
        cursor:pointer;
        padding:9px 16px;
        background:${COLOR.paper};
        border-top:1px solid ${COLOR.rule};
        border-bottom:1px solid ${COLOR.rule};
        font-family:'Syne',sans-serif;
        font-weight:700;
        font-size:.85rem;
        letter-spacing:.06em;
        text-transform:uppercase;
        color:${COLOR.ink};
        display:flex;
        align-items:center;
      ">
        <span style="margin-right:6px;font-size:.7rem;color:${COLOR.inkFaint}">▶</span>
        ${label}${countBadge}
      </summary>
      <table style="width:100%;border-collapse:collapse;font-size:.82rem">
        <thead>
          <tr style="background:${COLOR.paper};border-bottom:1px solid ${COLOR.rule}">
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${COLOR.inkFaint};width:35%">Token path</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${COLOR.inkFaint};width:25%">Baseline</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${COLOR.inkFaint};width:25%">Current</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${COLOR.inkFaint};width:15%">Change</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </details>`;
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

function summaryBar(entries: DiffEntry[]): string {
  const counts: Partial<Record<DiffKind, number>> = {};
  for (const e of entries) {
    counts[e.kind] = (counts[e.kind] ?? 0) + 1;
  }

  const pills: string[] = [];
  const order: DiffKind[] = [
    "added",
    "removed",
    "changed-value",
    "changed-alias",
    "alias-to-value",
    "value-to-alias",
    "group-added",
    "group-removed",
  ];
  for (const kind of order) {
    const n = counts[kind];
    if (!n) continue;
    const meta = KIND_META[kind];
    pills.push(
      `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;${meta.badge};font-size:.75rem;font-family:'DM Mono',monospace">
        <strong>${n}</strong> ${meta.label}
      </span>`,
    );
  }

  if (pills.length === 0) {
    return `<p style="font-family:'DM Mono',monospace;font-size:.85rem;color:${COLOR.inkFaint};padding:16px 0">No changes detected.</p>`;
  }

  return `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">${pills.join("")}</div>`;
}

// ─── Full diff page ───────────────────────────────────────────────────────────

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`;

export function renderDiffPage(
  entries: DiffEntry[],
  opts: { baselineLabel?: string; currentLabel?: string } = {},
): string {
  const { baselineLabel = "baseline", currentLabel = "current" } = opts;

  const sections = groupBySectionPath(entries);
  const sectionBlocks = [...sections.entries()]
    .map(([sec, ents]) => sectionBlock(sec, ents))
    .join("");

  const noChanges = entries.length === 0;

  return `
${FONTS}
<div style="
  background:${COLOR.paper};
  color:${COLOR.ink};
  font-family:'DM Mono',monospace;
  min-height:100vh;
  padding:40px 32px;
  box-sizing:border-box;
">
  <!-- Header -->
  <div style="margin-bottom:32px;border-bottom:2px solid ${COLOR.ink};padding-bottom:16px">
    <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${COLOR.inkFaint};margin-bottom:6px">Cedar Design Tokens</div>
    <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.1">Token Diff</h1>
    <div style="margin-top:8px;font-size:.78rem;color:${COLOR.inkFaint}">
      Comparing <code style="background:${COLOR.removedBorder}22;padding:1px 5px;border-radius:3px">${baselineLabel}</code>
      → <code style="background:${COLOR.addedBorder}22;padding:1px 5px;border-radius:3px">${currentLabel}</code>
    </div>
  </div>

  <!-- Summary pills -->
  ${summaryBar(entries)}

  <!-- Legend row -->
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:.72rem;font-family:'Syne',sans-serif;letter-spacing:.04em;color:${COLOR.inkFaint}">
    <span>● Sections are expanded by default — click to collapse</span>
    <span>● Unchanged tokens are not shown</span>
  </div>

  ${noChanges
    ? `<p style="font-size:.9rem;color:${COLOR.inkFaint}">Baseline and current are identical.</p>`
    : sectionBlocks}
</div>`;
}
