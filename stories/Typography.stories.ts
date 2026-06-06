import type { StoryObj, Meta } from "@storybook/html";
import {
  loadTypographyTokens,
  type TypographyToken,
} from "./lib/load-tokens.js";

type TypographyArgs = Record<string, never>;

const meta: Meta<TypographyArgs> = {
  title: "Tokens/Typography/Primitives",
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

  .token-grid { display: grid; grid-template-columns: minmax(160px, 1fr) 2fr minmax(80px, 1fr) auto; align-items: center; gap: 0 1.5rem; }
  .token-grid-header {
    grid-column: 1 / -1; display: grid; grid-template-columns: minmax(160px, 1fr) 2fr minmax(80px, 1fr) auto; gap: 0 1.5rem;
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-faint); padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule-heavy);
  }

  .trow-cell { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.8125rem; color: var(--ink-mid); }
  .trow-name { font-weight: 500; color: var(--ink); font-size: 0.6875rem; }
  .trow-preview { overflow: hidden; color: var(--ink); }
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

const SAMPLE_TEXT = "The quick brown fox";
const SAMPLE_TEXT_LONG = "Explore the outdoors in comfort and style.";

/**
 * Build the inline style for a live preview sample based on the token category.
 */
function previewStyle(tok: TypographyToken): string {
  const base = "font-size:16px;line-height:1.5;font-family:system-ui,sans-serif;";
  switch (tok.category) {
    case "family": {
      const stack = tok.fallback
        ? `'${tok.value}',${tok.fallback}`
        : `'${tok.value}',sans-serif`;
      return `${base}font-family:${stack};`;
    }
    case "size":
      return `font-family:system-ui,sans-serif;font-size:${tok.value}px;line-height:1.3;`;
    case "weight":
      return `${base}font-weight:${tok.value};`;
    case "style":
      return `${base}font-style:${tok.value};`;
    case "line-height":
      return `font-family:system-ui,sans-serif;font-size:14px;line-height:${tok.value}px;`;
    case "letter-spacing":
      return `${base}letter-spacing:${tok.value}px;`;
    default:
      return base;
  }
}

function tokenTable(tokens: TypographyToken[]): string {
  const rows = tokens
    .map((tok) => {
      let displayValue = String(tok.value);
      if (tok.category === "family" && tok.fallback) {
        displayValue = `'${tok.value}',${tok.fallback}`;
      } else if (tok.category === "size" || tok.category === "line-height") {
        displayValue = `${tok.value}px`;
      } else if (tok.category === "letter-spacing") {
        displayValue = `${tok.value}px`;
      }

      const sample = tok.category === "line-height" ? SAMPLE_TEXT_LONG : SAMPLE_TEXT;

      return `
      <div class="trow-cell trow-name">${tok.name}</div>
      <div class="trow-cell trow-preview">
        <span style="${previewStyle(tok)}">${sample}</span>
      </div>
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
        <div>Token</div><div>Preview</div><div>Value</div><div style="text-align:right">Type</div>
      </div>
      ${rows}
    </div>
  `;
}

// ─── Per-category story builder ───────────────────────────────────────────────

function categoryStory(
  category: TypographyToken["category"],
  displayName: string,
): Story {
  return {
    name: displayName,
    render: asyncStory(async () => {
      const tokens = await loadTypographyTokens();
      const filtered = tokens.filter((t) => t.category === category);

      return `
        <style>${BASE_STYLES}</style>
        <div class="page">
          ${breadcrumb("Cedar Tokens", "Typography", "Primitives", displayName)}
          <div class="page-title-row">
            <div>
              <div class="page-eyebrow">Option Tokens</div>
              <div class="page-title">${displayName}</div>
            </div>
            <div>
              <div class="page-meta-count">${filtered.length}</div>
              <div class="page-meta-label">tokens</div>
            </div>
          </div>
          <div style="margin-top:2rem">
            ${tokenTable(filtered)}
          </div>
        </div>
      `;
    }),
  };
}

// ─── Individual category stories ──────────────────────────────────────────────

export const FontFamily: Story = categoryStory("family", "Font Family");
export const FontSize: Story = categoryStory("size", "Font Size");
export const LineHeight: Story = categoryStory("line-height", "Line Height");
export const LetterSpacing: Story = categoryStory("letter-spacing", "Letter Spacing");
export const FontStyle: Story = categoryStory("style", "Font Style");
export const FontWeight: Story = categoryStory("weight", "Font Weight");

// ─── Combined view ────────────────────────────────────────────────────────────

export const AllPrimitives: Story = {
  name: "All Primitives",
  render: asyncStory(async () => {
    const tokens = await loadTypographyTokens();

    const categories: { key: TypographyToken["category"]; label: string }[] = [
      { key: "family", label: "Font Families" },
      { key: "size", label: "Font Sizes" },
      { key: "line-height", label: "Line Heights" },
      { key: "letter-spacing", label: "Letter Spacing" },
      { key: "style", label: "Font Style" },
      { key: "weight", label: "Font Weight" },
    ];

    const sections = categories
      .map(({ key, label }) => {
        const filtered = tokens.filter((t) => t.category === key);
        if (filtered.length === 0) return "";
        return `${catHeader(label)}\n${tokenTable(filtered)}`;
      })
      .join("");

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Typography", "Primitives", "All")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Typography<br>Primitives</div>
          </div>
          <div>
            <div class="page-meta-count">${tokens.length}</div>
            <div class="page-meta-label">Total Tokens</div>
          </div>
        </div>
        <div class="demo-note">
          All primitive typography option tokens from the Figma normalization layer.
        </div>
        ${sections}
      </div>
    `;
  }),
};

// ─── Live rendering preview ───────────────────────────────────────────────────

export const LiveRenderingPreview: Story = {
  name: "Live Rendering Preview",
  render: asyncStory(async () => {
    const tokens = await loadTypographyTokens();

    const graphik = tokens.find((t) => t.name.includes("family-graphik"));
    const sizeHeading =
      tokens.find((t) => t.name.includes("size-500"))?.value || 24;
    const lhHeading =
      tokens.find((t) => t.name.includes("line-height-5"))?.value || 32;
    const sizeBody =
      tokens.find((t) => t.name.includes("size-200"))?.value || 16;
    const lhBody =
      tokens.find((t) => t.name.includes("line-height-2"))?.value || 24;

    const fontFamilyStyle = graphik
      ? `'${graphik.value}', ${graphik.fallback || "sans-serif"}`
      : "system-ui";

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Typography", "Primitives", "Live Preview")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">Visual Diagnostics Contract</div>
            <div class="page-title">Typography Rendering</div>
          </div>
        </div>

        <div class="demo-note">
          Live typographic rendering using actual token values from the pipeline.
        </div>

        ${sectionHeader(
          "Rendered Targets",
          "Typographic Combination Assertions",
          2
        )}

        <div class="preview-card" style="font-family: ${fontFamilyStyle};">
          <div>
            <span class="trow-badge number" style="margin-bottom: 0.5rem;">Heading (Size 500 / Line-Height 5)</span>
            <h2 style="font-size: ${sizeHeading}px; line-height: ${lhHeading}px; font-weight: 700; letter-spacing: -0.02em;">
              Explore the great outdoors in comfort.
            </h2>
          </div>
          <div style="margin-top: 1rem;">
            <span class="trow-badge number" style="margin-bottom: 0.5rem;">Body Text (Size 200 / Line-Height 2)</span>
            <p style="font-size: ${sizeBody}px; line-height: ${lhBody}px; color: var(--ink-mid);">
              Get expert advice, quality outdoor gear, and clothing for climbing, hiking, cycling, and more at REI. 
              Our normalization layer guarantees that variable spacing balances neatly against cross-platform target line-height specifications.
            </p>
          </div>
        </div>
      </div>
    `;
  }),
};
