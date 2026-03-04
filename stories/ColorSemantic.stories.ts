import type { StoryObj, Meta } from "@storybook/html";
import { loadColorTokens } from "./lib/load-tokens.js";

type SemanticTokenArgs = Record<string, never>;

const meta: Meta<SemanticTokenArgs> = {
  title: "Tokens/Color/Semantic",
};

export default meta;

type Story = StoryObj<SemanticTokenArgs>;

// ─── Async story wrapper ──────────────────────────────────────────────────────

function asyncStory(
  fn: () => Promise<string>,
): () => HTMLElement {
  return () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px;background:#f5f2eb;";

    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token data…
      </div>`;

    fn()
      .then((html) => {
        container.innerHTML = html;
      })
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

// ─── Shared design tokens ─────────────────────────────────────────────────────

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
    --accent-mid:  #406eb5;
    --font-mono:   'DM Mono', 'Courier New', monospace;
    --font-sans:   'Syne', system-ui, sans-serif;
  }

  body { background: var(--paper); color: var(--ink); font-family: var(--font-mono); -webkit-font-smoothing: antialiased; }

  .page { padding: 3rem 3.5rem 4rem; max-width: 980px; }

  /* ── Breadcrumb ── */
  .breadcrumb { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 2.5rem; }
  .bc-segment { font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.625rem; }
  .bc-current { color: var(--ink-muted); }

  /* ── Section header ── */
  .section-header { display: flex; align-items: baseline; gap: 1.5rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid var(--rule-heavy); }
  .section-label  { font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title  { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count  { font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-faint); margin-left: auto; }

  /* ── Group header ── */
  .group-header  { display: flex; align-items: center; gap: 0.625rem; margin: 2rem 0 1rem; }
  .group-pip     { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); }
  .group-name    { font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-muted); }
  .group-rule    { flex: 1; height: 1px; background: var(--rule); }

  /* ── Semantic token row ── */
  .token-grid {
    display: grid;
    grid-template-columns: 52px 1fr 1fr auto;
    align-items: center;
    gap: 0 1.25rem;
  }
  .token-grid-header {
    font-family: var(--font-sans);
    font-size: 0.5625rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-faint);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--rule-heavy);
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 52px 1fr 1fr auto;
    gap: 0 1.25rem;
  }
  .token-row-inner {
    display: contents;
  }
  .token-row-inner:hover .trow-token,
  .token-row-inner:hover .trow-ref,
  .token-row-inner:hover .trow-hex { background: rgba(46,46,43,0.03); }

  .trow-chip-wrap {
    padding: 0.625rem 0;
    border-bottom: 1px solid var(--rule);
  }
  .trow-chip {
    width: 36px;
    height: 36px;
    border-radius: 3px;
    border: 1px solid var(--rule-heavy);
    display: block;
  }
  .trow-token {
    padding: 0.625rem 0;
    border-bottom: 1px solid var(--rule);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .trow-ref {
    padding: 0.625rem 0;
    border-bottom: 1px solid var(--rule);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-style: italic;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .trow-ref::before {
    content: '→';
    font-style: normal;
    color: var(--ink-faint);
    font-size: 0.55rem;
  }
  .trow-hex {
    padding: 0.625rem 0;
    border-bottom: 1px solid var(--rule);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--ink-muted);
    letter-spacing: 0.04em;
    text-align: right;
  }

  /* ── Demo surfaces ── */
  .demo-card {
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--rule);
    margin-top: 0.25rem;
  }
  .demo-layer {
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .demo-layer-label {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    opacity: 0.55;
  }
  .demo-layer-desc {
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    opacity: 0.45;
    letter-spacing: 0.04em;
  }
  .demo-divider { height: 1px; }

  /* ── Text demo ── */
  .text-demo {
    background: #ffffff;
    border: 1px solid #b2ab9f;
    border-radius: 4px;
    padding: 2rem 2rem 1.75rem;
    margin-top: 0.25rem;
  }
  .text-demo-headline {
    font-family: var(--font-sans);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }
  .text-demo-body {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  .text-demo-link {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }
  .text-demo-hover-note {
    display: inline-block;
    margin-left: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.5625rem;
    letter-spacing: 0.06em;
    opacity: 0.7;
    vertical-align: middle;
  }
  .text-demo-divider {
    height: 1px;
    margin: 1.25rem 0;
  }

  /* ── Border demo ── */
  .border-demo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 0.25rem;
  }
  .border-demo-cell {
    background: var(--paper);
    border-radius: 4px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .border-demo-label {
    font-family: var(--font-mono);
    font-size: 0.5625rem;
    color: var(--ink-faint);
    letter-spacing: 0.06em;
  }
  .border-demo-desc {
    font-family: var(--font-sans);
    font-size: 0.75rem;
    color: var(--ink-muted);
    font-weight: 500;
  }

  /* ── All semantic overview ── */
  .overview-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 2.5rem;
  }
  .section-block { margin-bottom: 3rem; }
  .deco-index {
    font-family: var(--font-sans);
    font-size: 5rem;
    font-weight: 800;
    color: rgba(46,46,43,0.045);
    line-height: 1;
    position: absolute;
    right: 0;
    top: -0.5rem;
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.04em;
  }

  @media (max-width: 700px) {
    .page { padding: 2rem 1.5rem 3rem; }
    .token-grid, .token-grid-header { grid-template-columns: 44px 1fr auto; }
    .trow-ref { display: none; }
    .border-demo-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function breadcrumb(...parts: string[]): string {
  return `
    <nav class="breadcrumb">
      ${parts.map((p, i) => {
        const last = i === parts.length - 1;
        return `<span class="bc-segment${last ? " bc-current" : ""}">${p}</span>${last ? "" : '<span class="bc-sep">/</span>'}`;
      }).join("")}
    </nav>
  `;
}

function sectionHeader(category: string, title: string, count: number): string {
  return `
    <div class="section-header">
      <span class="section-label">${category}</span>
      <span class="section-title">${title}</span>
      <span class="section-count">${count} tokens</span>
    </div>
  `;
}

function tokenGrid(
  tokens: Map<string, { hex: string; ref: string }>,
  keys: string[],
): string {
  return `
    <div class="token-grid">
      <div class="token-grid-header">
        <div></div>
        <div>Token</div>
        <div>Resolves to</div>
        <div style="text-align:right;">Hex</div>
      </div>
      ${keys.map((key) => {
        const data = tokens.get(key);
        if (!data) return "";
        const { hex, ref } = data;
        return `
          <div class="trow-chip-wrap">
            <span class="trow-chip" style="background:${hex};"></span>
          </div>
          <div class="trow-token">${key}</div>
          <div class="trow-ref">${ref}</div>
          <div class="trow-hex">${hex.slice(0, 7).toUpperCase()}</div>
        `;
      }).join("")}
    </div>
  `;
}

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Surface: Story = {
  name: "Surface",
  render: asyncStory(async () => {
    const tokens = await loadColorTokens();
    const surfaceKeys = ["color.surface.base", "color.surface.raised"];
    const surface = tokens.get("color.surface.base");

    if (!surface) return "<p>No tokens loaded</p>";

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Semantic", "Surface")}
        ${sectionHeader("Semantic Colors", "Surface", 2)}

        ${tokenGrid(tokens, surfaceKeys)}

        <div class="group-header" style="margin-top:2.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Live Preview</span>
          <span class="group-rule"></span>
        </div>

        <div class="demo-card">
          <div class="demo-layer" style="background:${tokens.get("color.surface.base")?.hex};">
            <span class="demo-layer-label" style="color:${tokens.get("color.text.base")?.hex};">color.surface.base</span>
            <span class="demo-layer-desc" style="color:${tokens.get("color.text.subtle")?.hex};">Base — page background, modal backdrop</span>
          </div>
          <div class="demo-divider" style="background:${tokens.get("color.border.subtle")?.hex};"></div>
          <div class="demo-layer" style="background:${tokens.get("color.surface.raised")?.hex};">
            <span class="demo-layer-label" style="color:${tokens.get("color.text.base")?.hex};">color.surface.raised</span>
            <span class="demo-layer-desc" style="color:${tokens.get("color.text.subtle")?.hex};">Raised — cards, sidebars, dropdowns</span>
          </div>
        </div>
      </div>
    `;
  }),
};

export const Text: Story = {
  name: "Text",
  render: asyncStory(async () => {
    const tokens = await loadColorTokens();
    const textKeys = ["color.text.base", "color.text.subtle", "color.text.link", "color.text.link-hover"];

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Semantic", "Text")}
        ${sectionHeader("Semantic Colors", "Text", 4)}

        ${tokenGrid(tokens, textKeys)}

        <div class="group-header" style="margin-top:2.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Live Preview</span>
          <span class="group-rule"></span>
        </div>

        <div class="text-demo">
          <div class="text-demo-headline" style="color:${tokens.get("color.text.base")?.hex};">
            Gear up for your next adventure.
          </div>
          <div class="text-demo-body" style="color:${tokens.get("color.text.subtle")?.hex};">
            From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside. Explore our curated collections, built for every terrain.
          </div>
          <div>
            <a class="text-demo-link" href="#" style="color:${tokens.get("color.text.link")?.hex};">View all collections</a>
            <span class="text-demo-hover-note" style="color:${tokens.get("color.text.link-hover")?.hex};">hover → ${tokens.get("color.text.link-hover")?.hex.slice(0, 7).toUpperCase()}</span>
          </div>
          <div class="text-demo-divider" style="background:${tokens.get("color.border.base")?.hex};"></div>
          <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
            ${textKeys.map((key) => {
              const data = tokens.get(key);
              return `
                <div style="display:flex;align-items:center;gap:0.4rem;">
                  <span style="width:8px;height:8px;border-radius:50%;border:1px solid var(--rule-heavy);flex-shrink:0;background:${data?.hex};"></span>
                  <span style="font-family:var(--font-mono);font-size:0.5625rem;color:var(--ink-faint);letter-spacing:0.04em;">${key}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }),
};

export const Border: Story = {
  name: "Border",
  render: asyncStory(async () => {
    const tokens = await loadColorTokens();
    const borderKeys = ["color.border.base", "color.border.subtle"];

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Semantic", "Border")}
        ${sectionHeader("Semantic Colors", "Border", 2)}

        ${tokenGrid(tokens, borderKeys)}

        <div class="group-header" style="margin-top:2.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Live Preview</span>
          <span class="group-rule"></span>
        </div>

        <div class="border-demo-grid">
          <div class="border-demo-cell" style="border:1.5px solid ${tokens.get("color.border.base")?.hex};">
            <div class="border-demo-label">color.border.base</div>
            <div class="border-demo-desc" style="color:${tokens.get("color.text.subtle")?.hex};">Default — cards, inputs, containers</div>
            <div style="margin-top:0.75rem; height:1px; background:${tokens.get("color.border.base")?.hex};"></div>
            <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--ink-faint); letter-spacing:0.06em; margin-top:0.25rem;">${tokens.get("color.border.base")?.hex.slice(0, 7).toUpperCase()}</div>
          </div>
          <div class="border-demo-cell" style="border:1.5px solid ${tokens.get("color.border.subtle")?.hex};">
            <div class="border-demo-label">color.border.subtle</div>
            <div class="border-demo-desc" style="color:${tokens.get("color.text.subtle")?.hex};">Subtle — dividers, section separators</div>
            <div style="margin-top:0.75rem; height:1px; background:${tokens.get("color.border.subtle")?.hex};"></div>
            <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--ink-faint); letter-spacing:0.06em; margin-top:0.25rem;">${tokens.get("color.border.subtle")?.hex.slice(0, 7).toUpperCase()}</div>
          </div>
        </div>

        <div style="margin-top:1rem; padding:1.5rem; background:${tokens.get("color.surface.raised")?.hex}; border-radius:4px; border-top:3px solid ${tokens.get("color.border.base")?.hex};">
          <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.5rem;">Usage note</div>
          <div style="font-family:var(--font-sans); font-size:0.8125rem; color:${tokens.get("color.text.subtle")?.hex}; line-height:1.6;">
            Use <code style="font-family:var(--font-mono); font-size:0.75rem; color:${tokens.get("color.text.base")?.hex};">border.base</code> for interactive and structural boundaries. Use <code style="font-family:var(--font-mono); font-size:0.75rem; color:${tokens.get("color.text.base")?.hex};">border.subtle</code> for low-emphasis visual separators that shouldn't compete with content.
          </div>
        </div>
      </div>
    `;
  }),
};

export const AllSemantic: Story = {
  name: "All Semantic Tokens",
  render: asyncStory(async () => {
    const tokens = await loadColorTokens();
    const total = tokens.size;
    const surfaceKeys = ["color.surface.base", "color.surface.raised"];
    const textKeys = ["color.text.base", "color.text.subtle", "color.text.link", "color.text.link-hover"];
    const borderKeys = ["color.border.base", "color.border.subtle"];

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Semantic")}

        <div class="overview-header">
          <div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.375rem;">REI Cedar Design System</div>
            <div style="font-family:var(--font-sans); font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.03em; line-height:1;">Color<br>Semantic</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:4rem; font-weight:800; color:rgba(46,46,43,0.06); line-height:1; letter-spacing:-0.06em;">${total}</div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-faint); margin-top:0.25rem;">alias tokens</div>
          </div>
        </div>

        <div style="height:1px; background:var(--rule-heavy); margin-bottom:3rem;"></div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">01</div>
          ${sectionHeader("Semantic", "Surface", 2)}
          <div style="margin-top:1.25rem;">${tokenGrid(tokens, surfaceKeys)}</div>
          <div style="margin-top:1.25rem;" class="demo-card">
            <div class="demo-layer" style="background:${tokens.get("color.surface.base")?.hex};">
              <span class="demo-layer-label" style="color:${tokens.get("color.text.base")?.hex};">surface.base</span>
              <span class="demo-layer-desc" style="color:${tokens.get("color.text.subtle")?.hex};">Page background</span>
            </div>
            <div class="demo-divider" style="background:${tokens.get("color.border.subtle")?.hex};"></div>
            <div class="demo-layer" style="background:${tokens.get("color.surface.raised")?.hex};">
              <span class="demo-layer-label" style="color:${tokens.get("color.text.base")?.hex};">surface.raised</span>
              <span class="demo-layer-desc" style="color:${tokens.get("color.text.subtle")?.hex};">Cards &amp; panels</span>
            </div>
          </div>
        </div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">02</div>
          ${sectionHeader("Semantic", "Text", 4)}
          <div style="margin-top:1.25rem;">${tokenGrid(tokens, textKeys)}</div>
        </div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">03</div>
          ${sectionHeader("Semantic", "Border", 2)}
          <div style="margin-top:1.25rem;">${tokenGrid(tokens, borderKeys)}</div>
        </div>
      </div>
    `;
  }),
};
