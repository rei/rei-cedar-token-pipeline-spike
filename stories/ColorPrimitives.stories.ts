import type { StoryObj, Meta } from "@storybook/html";
import { loadPrimitiveColors } from "./lib/load-tokens.js";
import { asyncStory, breadcrumb, sectionHeader, BASE_STYLES_COMMON } from "./lib/story-helpers.js";

type ColorSwatchArgs = Record<string, never>;

const meta: Meta<ColorSwatchArgs> = {
  title: "Tokens/Color/Primitives",
};

export default meta;

type Story = StoryObj<ColorSwatchArgs>;

// ─── Shared design system ─────────────────────────────────────────────────────

const BASE_STYLES = BASE_STYLES_COMMON + `
  /* ── Swatch panorama (full-width strip) ── */
  .swatch-strip {
    display: flex;
    width: 100%;
    overflow: hidden;
    border-radius: 3px;
    height: 80px;
    border: 1px solid var(--rule);
  }
  .strip-segment {
    flex: 1;
    position: relative;
    transition: flex 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: default;
  }
  .strip-segment:hover { flex: 2.5; }
  .strip-segment:not(:last-child) {
    border-right: 1px solid rgba(255,255,255,0.18);
  }
  .strip-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.3rem 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.5625rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
  .strip-segment:hover .strip-label { opacity: 1; }

  /* ── Token table ── */
  .token-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.75rem;
  }
  .token-table thead tr {
    border-bottom: 1px solid var(--rule-heavy);
  }
  .token-table th {
    font-family: var(--font-sans);
    font-size: 0.5625rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-faint);
    text-align: left;
    padding: 0 0 0.5rem;
  }
  .token-table th:last-child { text-align: right; }
  .token-table tbody tr {
    border-bottom: 1px solid var(--rule);
    transition: background 0.15s ease;
  }
  .token-table tbody tr:last-child { border-bottom: none; }
  .token-table tbody tr:hover { background: rgba(46,46,43,0.03); }
  .token-table td {
    padding: 0.625rem 0;
    vertical-align: middle;
  }
  .td-swatch {
    width: 36px;
    padding-right: 0.75rem !important;
  }
  .swatch-chip {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--rule-heavy);
    display: inline-block;
  }
  .td-token {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .td-hex {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--ink-muted);
    text-align: right;
    letter-spacing: 0.04em;
  }

  /* ── Section spacing ── */
  .token-section { margin-bottom: 3.5rem; }

  /* ── All Primitives layout ── */
  .primitives-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem 4rem;
  }
  @media (max-width: 700px) {
    .primitives-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Rendering helpers ────────────────────────────────────────────────────────

interface Swatch {
  name: string;
  value: string;
}

function needsDarkLabel(hex: string): boolean {
  const cleanHex = hex.slice(0, 7);
  const r = parseInt(cleanHex.slice(1, 3), 16);
  const g = parseInt(cleanHex.slice(3, 5), 16);
  const b = parseInt(cleanHex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

function strip(swatches: Swatch[]): string {
  return `
    <div class="swatch-strip">
      ${swatches.map((s) => {
        const dark = needsDarkLabel(s.value.slice(0, 7));
        return `
          <div class="strip-segment" style="background:${s.value};">
            <div class="strip-label" style="color:${dark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)"}; background:${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.2)"};">
              ${s.value.toUpperCase()}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function table(swatches: Swatch[]): string {
  return `
    <table class="token-table">
      <thead>
        <tr>
          <th style="width:36px;"></th>
          <th>Token</th>
          <th>Hex</th>
        </tr>
      </thead>
      <tbody>
        ${swatches.map((s) => `
          <tr>
            <td class="td-swatch">
              <span class="swatch-chip" style="background:${s.value};"></span>
            </td>
            <td class="td-token">${s.name}</td>
            <td class="td-hex">${s.value.toUpperCase()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function groupBlock(title: string, swatches: Swatch[]): string {
  return `
    <div class="group-header">
      <span class="group-pip"></span>
      <span class="group-name">${title}</span>
      <span class="group-rule"></span>
    </div>
    ${strip(swatches)}
    ${table(swatches)}
  `;
}

// ─── Stories ─────────────────────────────────────────────────────────────────

export const NeutralWarmGrey: Story = {
  name: "Neutral / Warm Grey",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const warmGrey = colors.filter((c) => c.name.includes("warm-grey"));

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Primitives", "Neutral / Warm Grey")}
        <div class="token-section">
          ${sectionHeader("Neutral Colors", "Warm Grey", warmGrey.length)}
          ${groupBlock("Warm Grey Scale", warmGrey)}
        </div>
      </div>
    `;
  }),
};

export const NeutralBaseNeutrals: Story = {
  name: "Neutral / Base Neutrals",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const baseNeutrals = colors.filter((c) => c.name.includes("base-neutrals"));

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Primitives", "Neutral / Base Neutrals")}
        <div class="token-section">
          ${sectionHeader("Neutral Colors", "Base Neutrals", baseNeutrals.length)}
          ${groupBlock("Base Neutrals", baseNeutrals)}
        </div>
      </div>
    `;
  }),
};

export const BrandBlue: Story = {
  name: "Brand / Blue",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const blue = colors.filter((c) => c.name.includes("brand-palette") && c.name.includes(".blue"));

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Blue")}
        <div class="token-section">
          ${sectionHeader("Brand Colors", "Blue", blue.length)}
          ${groupBlock("Blue Scale", blue)}
        </div>
      </div>
    `;
  }),
};

export const BrandRed: Story = {
  name: "Brand / Red",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const red = colors.filter((c) => c.name.includes("brand-palette") && c.name.includes(".red"));

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Red")}
        <div class="token-section">
          ${sectionHeader("Brand Colors", "Red", red.length)}
          ${groupBlock("Red Scale", red)}
        </div>
      </div>
    `;
  }),
};

export const BrandGreen: Story = {
  name: "Brand / Green",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const green = colors.filter((c) => c.name.includes("brand-palette") && c.name.includes(".green"));

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Green")}
        <div class="token-section">
          ${sectionHeader("Brand Colors", "Green", green.length)}
          ${groupBlock("Green Scale", green)}
        </div>
      </div>
    `;
  }),
};

export const BrandYellow: Story = {
  name: "Brand / Yellow",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const yellow = colors.filter((c) => c.name.includes("brand-palette") && c.name.includes(".yellow"));

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Yellow")}
        <div class="token-section">
          ${sectionHeader("Brand Colors", "Yellow", yellow.length)}
          ${groupBlock("Yellow Scale", yellow)}
        </div>
      </div>
    `;
  }),
};

export const AllPrimitives: Story = {
  name: "All Primitives",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const warmGrey = colors.filter((c) => c.name.includes("warm-grey"));
    const baseNeutrals = colors.filter((c) => c.name.includes("base-neutrals"));
    const blue = colors.filter((c) => c.name.includes("brand-palette") && c.name.includes(".blue"));
    const red = colors.filter((c) => c.name.includes("brand-palette") && c.name.includes(".red"));
    const green = colors.filter((c) => c.name.includes("brand-palette") && c.name.includes(".green"));
    const yellow = colors.filter((c) => c.name.includes("brand-palette") && c.name.includes(".yellow"));

    const total = colors.length;

    return `
      <style>${BASE_STYLES}</style>
      <div class="page">
        ${breadcrumb("Cedar Tokens", "Color", "Primitives")}

        <div style="display:flex; align-items:baseline; justify-content:space-between; margin-bottom:2.5rem;">
          <div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.375rem;">REI Cedar Design System</div>
            <div style="font-family:var(--font-sans); font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.03em; line-height:1;">Color<br>Primitives</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:4rem; font-weight:800; color:rgba(46,46,43,0.06); line-height:1; letter-spacing:-0.06em;">${total}</div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-faint); margin-top:0.25rem;">tokens</div>
          </div>
        </div>

        <div style="height:1px; background:var(--rule-heavy); margin-bottom:3rem;"></div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">01</div>
          ${sectionHeader("Neutral Colors", "Warm Grey + Base Neutrals", warmGrey.length + baseNeutrals.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>
              ${groupBlock("Warm Grey", warmGrey)}
            </div>
            <div>
              ${groupBlock("Base Neutrals", baseNeutrals)}
            </div>
          </div>
        </div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">02</div>
          ${sectionHeader("Brand Colors", "Blue · Red · Green · Yellow", blue.length + red.length + green.length + yellow.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>${groupBlock("Blue", blue)}</div>
            <div>${groupBlock("Red", red)}</div>
            <div>${groupBlock("Green", green)}</div>
            <div>${groupBlock("Yellow", yellow)}</div>
          </div>
        </div>
      </div>
    `;
  }),
};
