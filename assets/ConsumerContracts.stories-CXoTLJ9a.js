import{t as e}from"./chunk-BvrOYcoh.js";function t(e){return()=>{let t=document.createElement(`div`);return t.style.cssText=`min-height:200px;background:#f5f2eb;`,t.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:0.85rem;color:#736e65">
        Loading contract reference…
      </div>`,e().then(e=>{t.innerHTML=e}).catch(e=>{t.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:0.85rem;color:#be342d">
            Error loading contract reference: ${n(e instanceof Error?e.message:String(e))}
          </div>`}),t}}function n(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}var r,i,a,o;e((()=>{r={title:`Tokens/Consumer/Contracts`},i=`
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
`,a={name:`Consumer Type + Docs Contract`,render:t(async()=>{let e=window.location.pathname.replace(/\/[^/]*$/,`/`),[t,r]=await Promise.all([fetch(`${e}meta/foundations/cdr-color-text.docs.json`),fetch(`${e}normalized/current.json`)]);if(!t.ok)throw Error(`Failed to fetch docs metadata: ${t.status}`);if(!r.ok)throw Error(`Failed to fetch normalized values: ${r.status}`);let a=await t.json(),o=await r.json(),s=o.color?.modes?.default?.text??o.color?.text??{},c={"color-text-base":String(s.base?.$value??``),"color-text-subtle":String(s.subtle?.$value??``),"color-text-link":String(s.link?.$value??``),"color-text-link-hover":String(s[`link-hover`]?.$value??``)},l=Object.entries(a).slice(0,4);return`
      <style>${i}</style>
      <section class="page">
        <div class="eyebrow">Consumer Contract Reference</div>
        <h1 class="title">Usage Guidance + Typed Token Access</h1>
        <p class="lede">
          This reference demonstrates the consumer-facing contract that matters in practice: typed token access,
          token intent, and usage guidance generated from the pipeline. The goal is to help designers and engineers
          choose the right token quickly, not inspect raw transport artifacts.
        </p>

        <div class="grid">
          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Type Contract</div>
              <div class="card-title">How Consumers Type Values + Usage Docs</div>
            </div>
            <pre>${n(`import type {
  CdrColorTextTokenName,
  CdrColorTextTokens,
  CdrColorTextTokenDocs,
} from "@rei/cdr-tokens/types";

const values: CdrColorTextTokens = {
  "color-text-base": "{color.option.neutral.warm.grey.900}",
  "color-text-subtle": "{color.option.neutral.warm.grey.600}",
  "color-text-link": "{color.option.brand.blue.600}",
  "color-text-link-hover": "{color.option.brand.blue.400}",
  "color-text-sale": "{color.option.brand.red.400}",
};

const docs: CdrColorTextTokenDocs = {
  "color-text-link": {
    summary: "Text color for interactive links and inline navigation.",
    usage: "Use for hyperlinks and inline anchors.",
  },
};`)}</pre>
          </article>

          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Usage Documentation</div>
              <div class="card-title">What Consumers Actually Need To Read</div>
            </div>
            <div class="docs-list">
              ${l.map(([e,t])=>{let r=t.summary?n(t.summary):`No summary`,i=t.usage?`<div class=\"usage\">usage: ${n(t.usage)}</div>`:``,a=t.design?`<div class=\"usage\">design: ${n(t.design)}</div>`:``;return`
                    <div class="docs-item">
                      <div class="token-name">${n(e)}</div>
                      <div class="summary">${r}</div>
                      ${i}
                      ${a}
                    </div>
                  `}).join(``)}
            </div>
          </article>
        </div>

        <div class="grid" style="margin-top:1rem;">
          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Recommended Consumption</div>
              <div class="card-title">Use Typed Maps, Then Read Usage Guidance</div>
            </div>
            <pre>${n(`import type {
  CdrColorTextTokens,
  CdrColorTextTokenDocs,
} from "@rei/cdr-tokens/types";

function getTextTokenDocs(
  values: CdrColorTextTokens,
  docs: CdrColorTextTokenDocs,
  tokenName: keyof CdrColorTextTokens,
) {
  return {
    value: values[tokenName],
    summary: docs[tokenName]?.summary,
    usage: docs[tokenName]?.usage,
  };
}

const base = getTextTokenDocs(values, docs, "color-text-base");`)} </pre>
          </article>

          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Value Snapshot</div>
              <div class="card-title">Resolved Token Values For Active Module</div>
            </div>
            <div class="docs-list">
              ${Object.entries(c).map(([e,t])=>`
                  <div class="docs-item">
                    <div class="token-name">${n(e)}</div>
                    <div class="summary">${n(t)}</div>
                    <div class="usage">paired docs: ${n(a[e]?.usage??`No usage guidance yet`)}</div>
                  </div>
                `).join(``)}
            </div>
          </article>
        </div>

        <p class="foot">
          Files served in Storybook: /meta/foundations/*.docs.json and /types/* for generated type artifacts.
        </p>
      </section>
    `})},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: "Consumer Type + Docs Contract",
  render: asyncStory(async () => {
    const base = window.location.pathname.replace(/\\/[^/]*$/, "/");
    const [docsRes, valuesRes] = await Promise.all([fetch(\`\${base}meta/foundations/cdr-color-text.docs.json\`), fetch(\`\${base}normalized/current.json\`)]);
    if (!docsRes.ok) {
      throw new Error(\`Failed to fetch docs metadata: \${docsRes.status}\`);
    }
    if (!valuesRes.ok) {
      throw new Error(\`Failed to fetch normalized values: \${valuesRes.status}\`);
    }
    const docsMap = (await docsRes.json()) as DocsMap;
    const normalized = (await valuesRes.json()) as Record<string, unknown>;
    const textDefault = (normalized.color as any)?.modes?.default?.text ?? (normalized.color as any)?.text ?? {};
    const valueSample = {
      "color-text-base": String(textDefault.base?.$value ?? ""),
      "color-text-subtle": String(textDefault.subtle?.$value ?? ""),
      "color-text-link": String(textDefault.link?.$value ?? ""),
      "color-text-link-hover": String(textDefault["link-hover"]?.$value ?? "")
    };
    const docsEntries = Object.entries(docsMap).slice(0, 4);
    const typeSnippet = \`import type {
  CdrColorTextTokenName,
  CdrColorTextTokens,
  CdrColorTextTokenDocs,
} from "@rei/cdr-tokens/types";

const values: CdrColorTextTokens = {
  "color-text-base": "{color.option.neutral.warm.grey.900}",
  "color-text-subtle": "{color.option.neutral.warm.grey.600}",
  "color-text-link": "{color.option.brand.blue.600}",
  "color-text-link-hover": "{color.option.brand.blue.400}",
  "color-text-sale": "{color.option.brand.red.400}",
};

const docs: CdrColorTextTokenDocs = {
  "color-text-link": {
    summary: "Text color for interactive links and inline navigation.",
    usage: "Use for hyperlinks and inline anchors.",
  },
};\`;
    return \`
      <style>\${BASE_STYLES}</style>
      <section class="page">
        <div class="eyebrow">Consumer Contract Reference</div>
        <h1 class="title">Usage Guidance + Typed Token Access</h1>
        <p class="lede">
          This reference demonstrates the consumer-facing contract that matters in practice: typed token access,
          token intent, and usage guidance generated from the pipeline. The goal is to help designers and engineers
          choose the right token quickly, not inspect raw transport artifacts.
        </p>

        <div class="grid">
          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Type Contract</div>
              <div class="card-title">How Consumers Type Values + Usage Docs</div>
            </div>
            <pre>\${escapeHtml(typeSnippet)}</pre>
          </article>

          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Usage Documentation</div>
              <div class="card-title">What Consumers Actually Need To Read</div>
            </div>
            <div class="docs-list">
              \${docsEntries.map(([tokenName, docs]) => {
      const summary = docs.summary ? escapeHtml(docs.summary) : "No summary";
      const usage = docs.usage ? \`<div class=\\"usage\\">usage: \${escapeHtml(docs.usage)}</div>\` : "";
      const design = docs.design ? \`<div class=\\"usage\\">design: \${escapeHtml(docs.design)}</div>\` : "";
      return \`
                    <div class="docs-item">
                      <div class="token-name">\${escapeHtml(tokenName)}</div>
                      <div class="summary">\${summary}</div>
                      \${usage}
                      \${design}
                    </div>
                  \`;
    }).join("")}
            </div>
          </article>
        </div>

        <div class="grid" style="margin-top:1rem;">
          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Recommended Consumption</div>
              <div class="card-title">Use Typed Maps, Then Read Usage Guidance</div>
            </div>
            <pre>\${escapeHtml(\`import type {
  CdrColorTextTokens,
  CdrColorTextTokenDocs,
} from "@rei/cdr-tokens/types";

function getTextTokenDocs(
  values: CdrColorTextTokens,
  docs: CdrColorTextTokenDocs,
  tokenName: keyof CdrColorTextTokens,
) {
  return {
    value: values[tokenName],
    summary: docs[tokenName]?.summary,
    usage: docs[tokenName]?.usage,
  };
}

const base = getTextTokenDocs(values, docs, "color-text-base");\`)} </pre>
          </article>

          <article class="card">
            <div class="card-head">
              <div class="card-kicker">Value Snapshot</div>
              <div class="card-title">Resolved Token Values For Active Module</div>
            </div>
            <div class="docs-list">
              \${Object.entries(valueSample).map(([tokenName, value]) => \`
                  <div class="docs-item">
                    <div class="token-name">\${escapeHtml(tokenName)}</div>
                    <div class="summary">\${escapeHtml(value)}</div>
                    <div class="usage">paired docs: \${escapeHtml(docsMap[tokenName]?.usage ?? "No usage guidance yet")}</div>
                  </div>
                \`).join("")}
            </div>
          </article>
        </div>

        <p class="foot">
          Files served in Storybook: /meta/foundations/*.docs.json and /types/* for generated type artifacts.
        </p>
      </section>
    \`;
  })
}`,...a.parameters?.docs?.source}}},o=[`ConsumerReference`]}))();export{a as ConsumerReference,o as __namedExportsOrder,r as default};