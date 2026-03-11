import type { StoryObj, Meta } from "@storybook/html";
import { loadSpacingTokens, type SpacingToken } from "./lib/load-tokens.js";

type SpacingArgs = Record<string, never>;

const meta: Meta<SpacingArgs> = {
  title: "Tokens/Spacing/Fluid",
};

export default meta;
type Story = StoryObj<SpacingArgs>;

// ─── Async story wrapper ──────────────────────────────────────────────────────

function asyncStory(fn: () => Promise<string>): () => HTMLElement {
  return () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px;background:#f5f2eb;";
    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token data…
      </div>`;
    fn()
      .then((html) => { container.innerHTML = html; })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = `
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading tokens: ${msg}
          </div>`;
      });
    return container;
  };
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper:       #f5f2eb;
    --ink:         #1a1a18;
    --ink-mid:     #2e2e2b;
    --ink-muted:   #736e65;
    --ink-faint:   #b2ab9f;
    --rule:        rgba(46, 46, 43, 0.12);
    --rule-heavy:  rgba(46, 46, 43, 0.28);
    --accent:      #0b2d60;
    --font-mono:   'DM Mono', 'Courier New', monospace;
    --font-sans:   'Syne', system-ui, sans-serif;
    --fluid-grad:  linear-gradient(90deg, #b2ab9f 0%, #1a1a18 100%);
  }

  body { background: var(--paper); color: var(--ink); font-family: var(--font-mono); -webkit-font-smoothing: antialiased; }

  .page { padding: 3rem 3.5rem 5rem; max-width: 1100px; }

  /* Breadcrumb */
  .breadcrumb { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 2.5rem; }
  .bc-seg { font-family: var(--font-sans); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.75rem; }
  .bc-cur { color: var(--ink-muted); }

  /* Page title */
  .page-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 0; }
  .page-eyebrow { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 0.25rem; }
  .page-title { font-family: var(--font-sans); font-size: 2.25rem; font-weight: 800; color: var(--ink); letter-spacing: -0.04em; line-height: 1; }
  .page-meta-count { font-family: var(--font-mono); font-size: 3.5rem; font-weight: 800; color: rgba(46,46,43,0.06); line-height: 1; letter-spacing: -0.06em; }
  .page-meta-label { font-family: var(--font-sans); font-size: 0.625rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); margin-top: 0.15rem; text-align: right; }

  /* Section header */
  .section-header { display: flex; align-items: baseline; gap: 1.5rem; margin-bottom: 0.625rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid var(--rule-heavy); }
  .section-label  { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title  { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count  { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-faint); margin-left: auto; }

  /* Cat header */
  .cat-header { display: flex; align-items: center; gap: 0.625rem; margin: 2.25rem 0 0.875rem; }
  .cat-pip { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); flex-shrink: 0; }
  .cat-name { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-muted); }
  .cat-rule { flex: 1; height: 1px; background: var(--rule); }

  /* Fluid token grid */
  .fluid-grid { display: grid; grid-template-columns: auto 1fr 1fr auto; align-items: center; gap: 0 1.25rem; }
  .fluid-grid-header {
    grid-column: 1 / -1; display: grid; grid-template-columns: auto 1fr 1fr auto; gap: 0 1.25rem;
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-faint); padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule-heavy);
  }
  .frow-bar-wrap { padding: 0.75rem 0 0.625rem; border-bottom: 1px solid var(--rule); min-width: 120px; }
  /* Fixed-width outer track — full column width */
  .frow-bar-track {
    position: relative; height: 6px; border-radius: 3px;
    background: var(--rule); width: 100%; max-width: 240px;
  }
  /* Filled portion: starts at min-pct, ends at max-pct */
  .frow-bar-fill {
    position: absolute; top: 0; bottom: 0; border-radius: 3px;
    background: linear-gradient(90deg, var(--ink-faint) 0%, var(--ink) 100%);
  }
  /* Labels below the bar, flush left/right of the fill */
  .frow-bar-labels {
    display: flex; justify-content: space-between; margin-top: 4px; max-width: 240px;
    font-family: var(--font-mono); font-size: 0.5625rem; color: var(--ink-faint); white-space: nowrap;
  }
  .frow-name  { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 500; color: var(--ink); }
  .frow-clamp { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-muted); word-break: break-all; }
  .frow-kind  { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); text-align: right; }
  .frow-badge {
    display: inline-block; font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase;
    border: 1px solid var(--rule-heavy); border-radius: 2px; padding: 0.125rem 0.375rem;
    background: rgba(46,46,43,0.04); color: var(--ink-muted);
  }
  .frow-badge.fluid { border-color: var(--accent); color: var(--accent); background: rgba(11,45,96,0.06); }

  /* Live demo bar */
  .demo-section { margin-top: 2.5rem; }
  .demo-label { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 0.875rem; }
  .demo-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.625rem; }
  .demo-bar { height: 20px; border-radius: 3px; background: var(--ink-mid); flex-shrink: 0; transition: width 0.3s ease; }
  .demo-row-label { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-muted); white-space: nowrap; }
  .demo-note {
    font-family: var(--font-sans); font-size: 0.8125rem; color: var(--ink-muted); line-height: 1.6;
    border-left: 2px solid var(--rule-heavy); padding-left: 1rem; margin-top: 1.5rem;
  }

  /* Alias table */
  .alias-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; gap: 0 1.25rem; }
  .alias-grid-header {
    grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0 1.25rem;
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-faint); padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule-heavy);
  }
  .arow-cell { padding: 0.5rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-muted); }
  .arow-name { color: var(--ink); font-weight: 500; font-size: 0.8125rem; }
  .arow-ref { font-style: italic; }
  .arow-ref::before { content: '→ '; color: var(--ink-faint); font-style: normal; }

  @media (max-width: 700px) {
    .page { padding: 2rem 1.25rem 3rem; }
    .fluid-grid, .fluid-grid-header { grid-template-columns: auto 1fr auto; }
    .frow-clamp { display: none; }
    .alias-grid, .alias-grid-header { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function breadcrumb(...parts: string[]): string {
  return `
    <nav class="breadcrumb">
      ${parts.map((p, i) => {
        const last = i === parts.length - 1;
        return `<span class="bc-seg${last ? " bc-cur" : ""}">${p}</span>${last ? "" : '<span class="bc-sep">/</span>'}`;
      }).join("")}
    </nav>
  `;
}

function sectionHeader(label: string, title: string, count: number): string {
  return `
    <div class="section-header">
      <span class="section-label">${label}</span>
      <span class="section-title">${title}</span>
      <span class="section-count">${count} tokens</span>
    </div>
  `;
}

function catHeader(name: string): string {
  return `<div class="cat-header"><span class="cat-pip"></span><span class="cat-name">${name}</span><span class="cat-rule"></span></div>`;
}

/** Parse a clamp() string into { min, max } px values for the visualisation bar. */
function parseClamp(clamp: string): { min: number; max: number } | null {
  const m = clamp.match(/clamp\(\s*([\d.]+)px\s*,\s*.+?,\s*([\d.]+)px\s*\)/);
  if (!m) return null;
  return { min: parseFloat(m[1]), max: parseFloat(m[2]) };
}

function fluidGrid(tokens: SpacingToken[]): string {
  const scaleTokens = tokens.filter((t) => t.kind === "fluid");
  const maxVal = Math.max(...scaleTokens.map((t) => parseClamp(t.value)?.max ?? 0));

  const rows = scaleTokens.map((tok) => {
    const parsed = parseClamp(tok.value);
    const scaleKey = tok.path.split(".").pop() ?? tok.path;
    // Express min/max as percentages of the largest max in the set
    const minPct = parsed ? (parsed.min / maxVal) * 100 : 0;
    const maxPct = parsed ? (parsed.max / maxVal) * 100 : 0;
    return `
      <div class="frow-bar-wrap">
        <div class="frow-bar-track">
          <div class="frow-bar-fill" style="left:0%;width:${maxPct.toFixed(1)}%;"></div>
        </div>
        <div class="frow-bar-labels">
          <span>${parsed?.min ?? ""}px</span>
          <span>${parsed?.max ?? ""}px</span>
        </div>
      </div>
      <div class="frow-name">${scaleKey}</div>
      <div class="frow-clamp">${tok.value}</div>
      <div class="frow-kind"><span class="frow-badge fluid">fluid</span></div>
    `;
  }).join("");

  return `
    <div class="fluid-grid">
      <div class="fluid-grid-header">
        <div>Range</div><div>Token</div><div>CSS clamp()</div><div style="text-align:right">Type</div>
      </div>
      ${rows}
    </div>
  `;
}

function aliasGrid(tokens: SpacingToken[], group: "component" | "layout"): string {
  const grouped = tokens.filter((t) => t.kind === "alias" && t.path.startsWith(`spacing.${group}.`));
  if (grouped.length === 0) return "";

  const rows = grouped.map((tok) => {
    const name = tok.path.split(".").pop() ?? tok.path;
    return `
      <div class="arow-cell arow-name">${name}</div>
      <div class="arow-cell arow-ref">${tok.aliasRef ?? ""}</div>
      <div class="arow-cell">${tok.value}</div>
    `;
  }).join("");

  return `
    <div class="alias-grid">
      <div class="alias-grid-header">
        <div>Alias</div><div>Resolves to</div><div>CSS clamp()</div>
      </div>
      ${rows}
    </div>
  `;
}

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Scale: Story = {
  name: "Scale",
  render: asyncStory(async () => {
    const tokens = await loadSpacingTokens();
    const scaleTokens = tokens.filter((t) => t.kind === "fluid");

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Spacing", "Fluid", "Scale")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Spacing<br>Scale</div>
          </div>
          <div>
            <div class="page-meta-count">${scaleTokens.length}</div>
            <div class="page-meta-label">fluid scale tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        ${sectionHeader("Fluid Spacing", "Scale Tokens", scaleTokens.length)}

        <div class="demo-note">
          These tokens use CSS <code>clamp()</code> to fluidly scale between a minimum
          (at 320px viewport) and maximum value (at their saturation breakpoint).
          They are <strong>web-only</strong> — platforms that do not support fluid values
          should consume the static fallback from the <code>$type: "dimension"</code> tokens instead.
        </div>

        ${catHeader("Scale")}
        ${fluidGrid(tokens)}

        ${catHeader("Live Demo — resize your browser to see fluid scaling")}
        <div class="demo-section">
          <div class="demo-label">Token bars (proportional to max value)</div>
          ${scaleTokens.map((tok) => {
            const scaleKey = tok.path.split(".").pop() ?? tok.path;
            return `
              <div class="demo-row">
                <div class="demo-bar" style="width:${tok.value};"></div>
                <span class="demo-row-label">${scaleKey} — ${tok.value}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }),
};

export const Aliases: Story = {
  name: "Aliases (Component & Layout)",
  render: asyncStory(async () => {
    const tokens = await loadSpacingTokens();
    const aliasTokens = tokens.filter((t) => t.kind === "alias");

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Spacing", "Fluid", "Aliases")}
        ${sectionHeader("Fluid Spacing", "Alias Tokens", aliasTokens.length)}

        <div class="demo-note">
          Alias tokens reference scale tokens (e.g. <code>spacing.component.xs → spacing.scale.-50</code>).
          Their resolved <code>clamp()</code> value is shown for convenience.
          On non-web platforms, resolve the alias to a static px value at the target breakpoint.
        </div>

        ${catHeader("Component")}
        ${aliasGrid(tokens, "component")}

        ${catHeader("Layout")}
        ${aliasGrid(tokens, "layout")}

        ${catHeader("Live Demo")}
        <div class="demo-section">
          ${aliasTokens.map((tok) => {
            const name = tok.path.split(".").pop() ?? tok.path;
            return `
              <div class="demo-row">
                <div class="demo-bar" style="width:${tok.value};"></div>
                <span class="demo-row-label">${tok.path.replace("spacing.", "")} (${tok.scaleKey})</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }),
};

export const AllSpacing: Story = {
  name: "All Spacing Tokens",
  render: asyncStory(async () => {
    const tokens = await loadSpacingTokens();
    const scaleTokens = tokens.filter((t) => t.kind === "fluid");
    const aliasTokens = tokens.filter((t) => t.kind === "alias");

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Spacing", "Fluid")}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Spacing<br>Fluid</div>
          </div>
          <div>
            <div class="page-meta-count">${tokens.length}</div>
            <div class="page-meta-label">${scaleTokens.length} scale · ${aliasTokens.length} aliases</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        ${sectionHeader("Scale", "Fluid Tokens", scaleTokens.length)}
        ${fluidGrid(tokens)}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3rem 0 2rem;"></div>

        ${sectionHeader("Aliases", "Component", aliasTokens.filter(t => t.path.startsWith("spacing.component.")).length)}
        ${catHeader("Component")}
        ${aliasGrid(tokens, "component")}

        ${catHeader("Layout")}
        ${aliasGrid(tokens, "layout")}
      </div>
    `;
  }),
};
