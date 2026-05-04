import type { Meta, StoryObj } from "@storybook/html";

type ConsumerContractArgs = Record<string, never>;

const meta: Meta<ConsumerContractArgs> = {
  title: "Tokens/Consumer/Contracts",
};

export default meta;
type Story = StoryObj<ConsumerContractArgs>;

type DocsMap = Record<string, { summary?: string; usage?: string; design?: string }>;

function asyncStory(fn: () => Promise<string>): () => HTMLElement {
  return () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px;background:#f5f2eb;";
    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:0.85rem;color:#736e65">
        Loading contract reference…
      </div>`;

    fn()
      .then((html) => {
        container.innerHTML = html;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = `
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:0.85rem;color:#be342d">
            Error loading contract reference: ${escapeHtml(msg)}
          </div>`;
      });

    return container;
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper: #f5f2eb;
    --ink: #1a1a18;
    --ink-mid: #2e2e2b;
    --ink-muted: #736e65;
    --ink-faint: #b2ab9f;
    --rule: rgba(46,46,43,0.14);
    --rule-heavy: rgba(46,46,43,0.28);
  }

  .page { padding: 2.75rem 3rem 3.5rem; max-width: 1200px; color: var(--ink); background: var(--paper); }
  .eyebrow { font-family: 'Syne', sans-serif; font-size: 0.625rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 0.4rem; }
  .title { font-family: 'Syne', sans-serif; font-size: 2.1rem; line-height: 1; letter-spacing: -0.03em; font-weight: 800; }
  .lede { margin-top: 0.85rem; max-width: 78ch; font-family: 'DM Mono', monospace; font-size: 0.78rem; line-height: 1.6; color: var(--ink-muted); }

  .grid { margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; }
  .card { border: 1px solid var(--rule); background: #fbfaf7; border-radius: 8px; overflow: hidden; }
  .card-head { padding: 0.75rem 0.95rem; border-bottom: 1px solid var(--rule); }
  .card-kicker { font-family: 'Syne', sans-serif; font-size: 0.56rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-faint); }
  .card-title { margin-top: 0.15rem; font-family: 'Syne', sans-serif; font-size: 0.98rem; font-weight: 700; color: var(--ink-mid); }

  pre { margin: 0; padding: 0.9rem 1rem; overflow: auto; font-family: 'DM Mono', monospace; font-size: 0.68rem; line-height: 1.6; color: #1c1c1c; }

  .docs-list { display: grid; gap: 0.7rem; padding: 0.8rem 1rem 1rem; }
  .docs-item { border: 1px solid var(--rule); border-radius: 6px; padding: 0.55rem 0.65rem; background: #fff; }
  .token-name { font-family: 'DM Mono', monospace; font-size: 0.66rem; color: var(--ink-faint); margin-bottom: 0.2rem; }
  .summary { font-family: 'Syne', sans-serif; font-size: 0.86rem; color: var(--ink-mid); line-height: 1.3; }
  .usage { margin-top: 0.28rem; font-family: 'DM Mono', monospace; font-size: 0.66rem; color: var(--ink-muted); line-height: 1.5; }

  .foot { margin-top: 1.2rem; font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--ink-faint); }

  @media (max-width: 900px) {
    .page { padding: 1.6rem 1.25rem 2rem; }
    .grid { grid-template-columns: 1fr; }
  }
`;

export const ConsumerReference: Story = {
  name: "Contract: type",
  render: asyncStory(async () => {
    const base = window.location.pathname.replace(/\/[^/]*$/, "/");

    const [docsRes, valuesRes] = await Promise.all([
      fetch(`${base}meta/foundations/cdr-color-text.docs.json`),
      fetch(`${base}normalized/current.json`),
    ]);

    if (!docsRes.ok) {
      throw new Error(`Failed to fetch docs metadata: ${docsRes.status}`);
    }
    if (!valuesRes.ok) {
      throw new Error(`Failed to fetch normalized values: ${valuesRes.status}`);
    }

    const docsMap = (await docsRes.json()) as DocsMap;
    const normalized = (await valuesRes.json()) as Record<string, unknown>;

    const textDefault =
      (normalized.color as any)?.modes?.default?.text ??
      (normalized.color as any)?.text ??
      {};

    const valueSample = {
      "color-text-base": String(textDefault.base?.$value ?? ""),
      "color-text-subtle": String(textDefault.subtle?.$value ?? ""),
      "color-text-link": String(textDefault.link?.$value ?? ""),
      "color-text-link-hover": String(textDefault["link-hover"]?.$value ?? ""),
    };

    const docsEntries = Object.entries(docsMap).slice(0, 4);

    const typeSnippet = `import type { CdrColorTextTokens } from "@rei/cdr-tokens/types/foundations/cdr-color-text";
import type { CdrColorTextTokenDocs } from "@rei/cdr-tokens/types/foundations/cdr-color-text.docs";

// Generated token value map
declare const textValues: CdrColorTextTokens;

// Generated docs map keyed by token name
declare const textDocs: CdrColorTextTokenDocs;

const tokenName = "color-text-base" as const;

const tokenValue = textValues[tokenName];
const tokenSummary = textDocs[tokenName]?.summary;
const tokenUsage = textDocs[tokenName]?.usage;`;

    const dtsSnippet = `export interface CdrColorTextTokens {
  /**
   * Primary text color for body content and headings.
   * @usage Use for all default body copy, headings, and labels.
   * @design Anchors the text scale at maximum legibility.
   */
  "color-text-base": string;
}`;

    return `
      <style>${BASE_STYLES}</style>
      <section class="page">
        <div class="eyebrow">Consumer Contract Reference</div>
        <h1 class="title">Contract: type</h1>
        <p class="lede">
          Type definitions are generated alongside Cedar token modules. In this build, IDE hover/help comes from
          token JSDoc in the generated <code>.d.ts</code> plus token documentation maps in <code>*.docs.d.ts</code>.
          This page reflects the current generated artifacts used by Storybook.
        </p>

        <div class="grid">
          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Type Contract</div>
              <div class="card-title">How Consumers Type Values + Usage Docs</div>
            </div>
            <pre>${escapeHtml(typeSnippet)}</pre>
          </article>

          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Usage Documentation</div>
              <div class="card-title">What Consumers Actually Need To Read</div>
            </div>
            <div class="docs-list">
              ${docsEntries
                .map(([tokenName, docs]) => {
                  const summary = docs.summary ? escapeHtml(docs.summary) : "No summary";
                  const usage = docs.usage ? `<div class=\"usage\">usage: ${escapeHtml(docs.usage)}</div>` : "";
                  const design = docs.design ? `<div class=\"usage\">design: ${escapeHtml(docs.design)}</div>` : "";
                  return `
                    <div class="docs-item">
                      <div class="token-name">${escapeHtml(tokenName)}</div>
                      <div class="summary">${summary}</div>
                      ${usage}
                      ${design}
                    </div>
                  `;
                })
                .join("")}
            </div>
          </article>
        </div>

        <div class="grid" style="margin-top:1rem;">
          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Generated .d.ts</div>
              <div class="card-title">What IDE Hover Surfaces</div>
            </div>
            <pre>${escapeHtml(dtsSnippet)} </pre>
          </article>

          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Value Snapshot</div>
              <div class="card-title">Resolved Token Values For Active Module</div>
            </div>
            <div class="docs-list">
              ${Object.entries(valueSample)
                .map(([tokenName, value]) => `
                  <div class="docs-item">
                    <div class="token-name">${escapeHtml(tokenName)}</div>
                    <div class="summary">${escapeHtml(value)}</div>
                    <div class="usage">paired docs: ${escapeHtml(docsMap[tokenName]?.usage ?? "No usage guidance yet")}</div>
                  </div>
                `)
                .join("")}
            </div>
          </article>
        </div>

        <p class="foot">
          Current generated contract: token interfaces include full JSDoc metadata — summary, usage, design guidance, plus resolved <code>@value</code> and CSS variable names via <code>@cssvar</code> tags.
        </p>
      </section>
    `;
  }),
};
