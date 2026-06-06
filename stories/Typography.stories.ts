import type { StoryObj, Meta } from "@storybook/html";
import {
  loadTypographyTokens,
  type TypographyToken,
} from "./lib/load-tokens.js";

type TypographyArgs = Record<string, never>;

const meta: Meta<TypographyArgs> = {
  title: "Tokens/Typography",
};

export default meta;
type Story = StoryObj<TypographyArgs>;

// ─── Async Story Wrapper ──────────────────────────────────────────────────────

function asyncStory(
  fn: () => Promise<string | HTMLElement>
): () => HTMLElement {
  return () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px;background:#f5f2eb;";
    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:0.85rem;color:#736e65">
        Loading normalized typography elements…
      </div>`;
    fn()
      .then((html) => {
        if (typeof html === "string") {
          container.innerHTML = html;
        } else {
          container.innerHTML = "";
          container.appendChild(html);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = `
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:0.85rem;color:#be342d">
            Error loading typography tokens: ${msg}
          </div>`;
      });
    return container;
  };
}

// ─── Document Presentation Stylesheet ─────────────────────────────────────────

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Syne:wght@400;500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper:       #f5f2eb;
    --ink:         #1a1a18;
    --ink-mid:     #2e2e2b;
    --ink-muted:   #736e65;
    --ink-faint:   #b2ab9f;
    --rule:        rgba(46, 46, 43, 0.12);
    --rule-heavy:  rgba(46, 46, 43, 0.28);
    --font-mono:   'DM Mono', 'Courier New', monospace;
    --font-sans:   'Syne', system-ui, sans-serif;
  }

  body { background: var(--paper); color: var(--ink); font-family: var(--font-mono); -webkit-font-smoothing: antialiased; }
  .page { padding: 3rem 3.5rem 5rem; max-width: 1100px; }

  .breadcrumb { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 2.5rem; }
  .bc-seg { font-family: var(--font-sans); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.75rem; }
  .bc-cur { color: var(--ink-muted); }

  .page-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 0; }
  .page-eyebrow { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 0.25rem; }
  .page-title { font-family: var(--font-sans); font-size: 2.25rem; font-weight: 800; color: var(--ink); letter-spacing: -0.04em; line-height: 1; }
  .page-meta-count { font-family: var(--font-mono); font-size: 3.5rem; font-weight: 800; color: rgba(46,46,43,0.06); line-height: 1; letter-spacing: -0.06em; }
  .page-meta-label { font-family: var(--font-sans); font-size: 0.625rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); margin-top: 0.15rem; text-align: right; }

  .section-header { display: flex; align-items: baseline; gap: 1.5rem; margin-bottom: 0.625rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid var(--rule-heavy); }
  .section-label  { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title  { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count  { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-faint); margin-left: auto; }

  .cat-header { display: flex; align-items: center; gap: 0.625rem; margin: 2.25rem 0 0.875rem; }
  .cat-pip { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); flex-shrink: 0; }
  .cat-name { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-muted); }
  .cat-rule { flex: 1; height: 1px; background: var(--rule); }

  .token-grid { display: grid; grid-template-columns: 1fr 2fr auto; align-items: center; gap: 0 1.5rem; }
  .token-grid-header {
    grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 2fr auto; gap: 0 1.5rem;
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-faint); padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule-heavy);
  }

  .trow-cell { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.8125rem; color: var(--ink-mid); }
  .trow-name { font-weight: 500; color: var(--ink); }
  .trow-value { font-size: 0.75rem; color: var(--ink-muted); word-break: break-all; }
  .trow-meta { text-align: right; }

  .trow-badge {
    display: inline-block; font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid var(--rule-heavy);
    border-radius: 2px; padding: 0.125rem 0.375rem; background: rgba(46,46,43,0.04); color: var(--ink-muted);
  }
  .trow-badge.string { border-color: #406eb5; color: #406eb5; background: rgba(64,110,181,0.05); }
  .trow-badge.number { border-color: #b2ab9f; color: var(--ink-mid); background: rgba(46,46,43,0.04); }

  .demo-note {
    font-family: var(--font-sans); font-size: 0.8125rem; color: var(--ink-muted); line-height: 1.6;
    border-left: 2px solid var(--rule-heavy); padding-left: 1rem; margin: 1.5rem 0 2.5rem;
  }

  .preview-card {
    background: #ffffff; border: 1px solid var(--rule-heavy); border-radius: 6px;
    padding: 2rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;
  }
`;

// ─── Document Presentation Layer Components ─────────────────────────────────

function breadcrumb(...parts: string[]): string {
  return `
    <nav class="breadcrumb">
      ${parts
        .map((p, i) => {
          const last = i === parts.length - 1;
          return `<span class="bc-seg${last ? " bc-cur" : ""}">${p}</span>${
            last ? "" : '<span class="bc-sep">/</span>'
          }`;
        })
        .join("")}
    </nav>
  `;
}

function sectionHeader(title: string, subtitle: string, count: number): string {
  return `
    <div class="section-header">
      <span class="section-label">${title}</span>
      <span class="section-title">${subtitle}</span>
      <span class="section-count">${count} token${count !== 1 ? "s" : ""}</span>
    </div>
  `;
}

function catHeader(name: string): string {
  return `
    <div class="cat-header">
      <span class="cat-pip"></span>
      <span class="cat-name">${name}</span>
      <span class="cat-rule"></span>
    </div>
  `;
}

function tokenTable(tokens: TypographyToken[]): string {
  const rows = tokens
    .map((tok) => {
      let displayValue = String(tok.value);
      if (tok.category === "family" && tok.fallback) {
        displayValue = `'${tok.value}', ${tok.fallback}`;
      } else if (tok.category === "size" || tok.category === "line-height") {
        displayValue = `${tok.value}px`;
      }

      return `
      <div class="trow-cell trow-name">${tok.name}</div>
      <div class="trow-cell trow-value">${displayValue}</div>
      <div class="trow-cell trow-meta">
        <span class="trow-badge ${tok.type}">${tok.type}</span>
      </div>
    `;
    })
    .join("");

  return `
    <div class="token-grid">
      <div class="token-grid-header">
        <div>Token String Mapping</div><div>Normalized Value</div><div style="text-align:right">Primitive Type</div>
      </div>
      ${rows}
    </div>
  `;
}

// ─── Stories ──────────────────────────────────────────────────────────────────
export const TypographyScale: Story = {
  name: "Typography Scales",
  render: asyncStory(async () => {
    const tokens = await loadTypographyTokens();

    const families = tokens.filter((t) => t.category === "family");
    const sizes = tokens.filter((t) => t.category === "size");
    const lineHeights = tokens.filter((t) => t.category === "line-height");

    const letterSpacing = tokens.filter((t) => t.category === "letter-spacing");
    const style = tokens.filter((t) => t.category === "style");
    const weight = tokens.filter((t) => t.category === "weight");

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Typography", "Foundations")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Typography<br>Foundations</div>
          </div>
          <div>
            <div class="page-meta-count">${tokens.length}</div>
            <div class="page-meta-label">Total Type Tokens</div>
          </div>
        </div>

        <div class="demo-note">
          This reference lists the normalized design variable outputs from the Figma normalization layer.
          The wrapper variables have been cleanly processed, dropping nested keys and mapping variant 
          properties into native structural design parameters.
        </div>

        ${catHeader("Font Families")}
        ${tokenTable(families)}

        ${catHeader("Font Sizes")}
        ${tokenTable(sizes)}

        ${catHeader("Line Heights")}
        ${tokenTable(lineHeights)}

        ${catHeader("Letter Spacing")}
        ${tokenTable(letterSpacing)}

        ${catHeader("Font Style")}
        ${tokenTable(style)}

        ${catHeader("Font Weight")}
        ${tokenTable(weight)}
      </div>
    `;
  }),
};

export const LiveTypographyPreview: Story = {
  name: "Live Rendering Preview",
  render: asyncStory(async () => {
    const tokens = await loadTypographyTokens();

    // Grab configuration maps to build inline styles safely
    const graphik = tokens.find((t) => t.name.includes("family-graphik"));
    const size600 =
      tokens.find((t) => t.name.includes("size-600"))?.[`value`] || 24;
    const lh600 =
      tokens.find((t) => t.name.includes("line-height-600"))?.[`value`] || 32;
    const size300 =
      tokens.find((t) => t.name.includes("size-300"))?.[`value`] || 16;
    const lh300 =
      tokens.find((t) => t.name.includes("line-height-300"))?.[`value`] || 24;

    const fontFamilyStyle = graphik
      ? `'${graphik.value}', ${graphik.fallback || "sans-serif"}`
      : "system-ui";

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Typography", "Live Preview")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">Visual Diagnostics Contract</div>
            <div class="page-title">Typography Rendering</div>
          </div>
        </div>

        <div class="demo-note">
          This container dynamically maps variables parsed by the 
          normalization layers into live typographic stacks.
        </div>

        ${sectionHeader(
          "Rendered Targets",
          "Typographic Combination Assertions",
          2
        )}

        <div class="preview-card" style="font-family: ${fontFamilyStyle};">
          <div>
            <span class="trow-badge number" style="margin-bottom: 0.5rem;">Heading (Size 600 / Line-Height 600)</span>
            <h2 style="font-size: ${size600}px; line-height: ${lh600}px; font-weight: 700; letter-spacing: -0.02em;">
              Explore the great outdoors in comfort.
            </h2>
          </div>
          <div style="margin-top: 1rem;">
            <span class="trow-badge number" style="margin-bottom: 0.5rem;">Body Text (Size 300 / Line-Height 300)</span>
            <p style="font-size: ${size300}px; line-height: ${lh300}px; color: var(--ink-mid);">
              Get expert advice, quality outdoor gear, and clothing for climbing, hiking, cycling, and more at REI. 
              Our normalization layer guarantees that variable spacing balances neatly against cross-platform target line-height specifications.
            </p>
          </div>
        </div>
      </div>
    `;
  }),
};
