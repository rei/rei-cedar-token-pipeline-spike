import{l as i}from"./load-tokens-DhudGKqy.js";const S={title:"Tokens/Color/Primitives"};function l(r){return()=>{const e=document.createElement("div");return e.style.cssText="min-height:200px;background:#f5f2eb;",e.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token data…
      </div>`,r().then(n=>{e.innerHTML=n}).catch(n=>{const s=n instanceof Error?n.message:String(n);e.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading tokens: ${s}
          </div>`}),e}}const d=`
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper:      #f5f2eb;
    --ink:        #1a1a18;
    --ink-mid:    #2e2e2b;
    --ink-muted:  #736e65;
    --ink-faint:  #b2ab9f;
    --rule:       rgba(46, 46, 43, 0.12);
    --rule-heavy: rgba(46, 46, 43, 0.28);
    --accent:     #0b2d60;
    --accent-mid: #406eb5;
    --font-mono:  'DM Mono', 'Courier New', monospace;
    --font-sans:  'Syne', system-ui, sans-serif;
  }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-mono);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Page shell ── */
  .page {
    padding: 3rem 3.5rem 4rem;
    max-width: 960px;
  }

  /* ── Section header ── */
  .section-header {
    display: flex;
    align-items: baseline;
    gap: 1.5rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1.5px solid var(--rule-heavy);
  }
  .section-label {
    font-family: var(--font-sans);
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  .section-title {
    font-family: var(--font-sans);
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .section-count {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--ink-faint);
    margin-left: auto;
  }

  /* ── Group header ── */
  .group-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin: 2rem 0 1rem;
  }
  .group-pip {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--ink-muted);
  }
  .group-name {
    font-family: var(--font-sans);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  .group-rule {
    flex: 1;
    height: 1px;
    background: var(--rule);
  }

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

  /* ── Breadcrumb ── */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 2.5rem;
  }
  .bc-segment {
    font-family: var(--font-sans);
    font-size: 0.5625rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  .bc-sep { color: var(--rule-heavy); font-size: 0.625rem; }
  .bc-current { color: var(--ink-muted); }

  /* ── Decorative index number ── */
  .deco-index {
    font-family: var(--font-sans);
    font-size: 5rem;
    font-weight: 800;
    color: rgba(46,46,43,0.04);
    line-height: 1;
    position: absolute;
    right: 0;
    top: -0.5rem;
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.04em;
  }

  /* ── All Primitives layout ── */
  .primitives-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem 4rem;
  }
  @media (max-width: 700px) {
    .primitives-grid { grid-template-columns: 1fr; }
    .page { padding: 2rem 1.5rem 3rem; }
  }
`;function $(r){const e=parseInt(r.slice(1,3),16),n=parseInt(r.slice(3,5),16),s=parseInt(r.slice(5,7),16);return(e*299+n*587+s*114)/1e3>140}function B(r){return`
    <div class="swatch-strip">
      ${r.map(e=>{const n=$(e.value.slice(0,7));return`
          <div class="strip-segment" style="background:${e.value};">
            <div class="strip-label" style="color:${n?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.8)"}; background:${n?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.2)"};">
              ${e.value.slice(0,9).toUpperCase()}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function x(r){return`
    <table class="token-table">
      <thead>
        <tr>
          <th style="width:36px;"></th>
          <th>Token</th>
          <th>Hex</th>
        </tr>
      </thead>
      <tbody>
        ${r.map(e=>`
          <tr>
            <td class="td-swatch">
              <span class="swatch-chip" style="background:${e.value};"></span>
            </td>
            <td class="td-token">${e.name}</td>
            <td class="td-hex">${e.value.slice(0,9).toUpperCase()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}function a(r,e){return`
    <div class="group-header">
      <span class="group-pip"></span>
      <span class="group-name">${r}</span>
      <span class="group-rule"></span>
    </div>
    ${B(e)}
    ${x(e)}
  `}function o(r,e,n){return`
    <div class="section-header">
      <span class="section-label">${r}</span>
      <span class="section-title">${e}</span>
      <span class="section-count">${n} tokens</span>
    </div>
  `}function c(...r){return`
    <nav class="breadcrumb">
      ${r.map((e,n)=>{const s=n===r.length-1;return`
          <span class="bc-segment${s?" bc-current":""}">${e}</span>
          ${s?"":'<span class="bc-sep">/</span>'}
        `}).join("")}
    </nav>
  `}const m={name:"Neutral / Warm Grey",render:l(async()=>{const e=(await i()).filter(n=>n.name.includes("warm-grey"));return`
      <style>${d}</style>
      <div class="page">
        ${c("Cedar Tokens","Color","Primitives","Neutral / Warm Grey")}
        <div class="token-section">
          ${o("Neutral Colors","Warm Grey",e.length)}
          ${a("Warm Grey Scale",e)}
        </div>
      </div>
    `})},u={name:"Neutral / Base Neutrals",render:l(async()=>{const e=(await i()).filter(n=>n.name.includes("base-neutrals"));return`
      <style>${d}</style>
      <div class="page">
        ${c("Cedar Tokens","Color","Primitives","Neutral / Base Neutrals")}
        <div class="token-section">
          ${o("Neutral Colors","Base Neutrals",e.length)}
          ${a("Base Neutrals",e)}
        </div>
      </div>
    `})},p={name:"Brand / Blue",render:l(async()=>{const e=(await i()).filter(n=>n.name.includes("brand-palette")&&n.name.includes(".blue"));return`
      <style>${d}</style>
      <div class="page">
        ${c("Cedar Tokens","Color","Primitives","Brand / Blue")}
        <div class="token-section">
          ${o("Brand Colors","Blue",e.length)}
          ${a("Blue Scale",e)}
        </div>
      </div>
    `})},v={name:"Brand / Red",render:l(async()=>{const e=(await i()).filter(n=>n.name.includes("brand-palette")&&n.name.includes(".red"));return`
      <style>${d}</style>
      <div class="page">
        ${c("Cedar Tokens","Color","Primitives","Brand / Red")}
        <div class="token-section">
          ${o("Brand Colors","Red",e.length)}
          ${a("Red Scale",e)}
        </div>
      </div>
    `})},g={name:"Brand / Green",render:l(async()=>{const e=(await i()).filter(n=>n.name.includes("brand-palette")&&n.name.includes(".green"));return`
      <style>${d}</style>
      <div class="page">
        ${c("Cedar Tokens","Color","Primitives","Brand / Green")}
        <div class="token-section">
          ${o("Brand Colors","Green",e.length)}
          ${a("Green Scale",e)}
        </div>
      </div>
    `})},f={name:"Brand / Yellow",render:l(async()=>{const e=(await i()).filter(n=>n.name.includes("brand-palette")&&n.name.includes(".yellow"));return`
      <style>${d}</style>
      <div class="page">
        ${c("Cedar Tokens","Color","Primitives","Brand / Yellow")}
        <div class="token-section">
          ${o("Brand Colors","Yellow",e.length)}
          ${a("Yellow Scale",e)}
        </div>
      </div>
    `})},y={name:"All Primitives",render:l(async()=>{const r=await i(),e=r.filter(t=>t.name.includes("warm-grey")),n=r.filter(t=>t.name.includes("base-neutrals")),s=r.filter(t=>t.name.includes("brand-palette")&&t.name.includes(".blue")),b=r.filter(t=>t.name.includes("brand-palette")&&t.name.includes(".red")),h=r.filter(t=>t.name.includes("brand-palette")&&t.name.includes(".green")),k=r.filter(t=>t.name.includes("brand-palette")&&t.name.includes(".yellow")),w=r.length;return`
      <style>${d}</style>
      <div class="page">
        ${c("Cedar Tokens","Color","Primitives")}

        <div style="display:flex; align-items:baseline; justify-content:space-between; margin-bottom:2.5rem;">
          <div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.375rem;">REI Cedar Design System</div>
            <div style="font-family:var(--font-sans); font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.03em; line-height:1;">Color<br>Primitives</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:4rem; font-weight:800; color:rgba(46,46,43,0.06); line-height:1; letter-spacing:-0.06em;">${w}</div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-faint); margin-top:0.25rem;">tokens</div>
          </div>
        </div>

        <div style="height:1px; background:var(--rule-heavy); margin-bottom:3rem;"></div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">01</div>
          ${o("Neutral Colors","Warm Grey + Base Neutrals",e.length+n.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>
              ${a("Warm Grey",e)}
            </div>
            <div>
              ${a("Base Neutrals",n)}
            </div>
          </div>
        </div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">02</div>
          ${o("Brand Colors","Blue · Red · Green · Yellow",s.length+b.length+h.length+k.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>${a("Blue",s)}</div>
            <div>${a("Red",b)}</div>
            <div>${a("Green",h)}</div>
            <div>${a("Yellow",k)}</div>
          </div>
        </div>
      </div>
    `})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Neutral / Warm Grey",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const warmGrey = colors.filter(c => c.name.includes("warm-grey"));
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Neutral / Warm Grey")}
        <div class="token-section">
          \${sectionHeader("Neutral Colors", "Warm Grey", warmGrey.length)}
          \${groupBlock("Warm Grey Scale", warmGrey)}
        </div>
      </div>
    \`;
  })
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Neutral / Base Neutrals",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const baseNeutrals = colors.filter(c => c.name.includes("base-neutrals"));
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Neutral / Base Neutrals")}
        <div class="token-section">
          \${sectionHeader("Neutral Colors", "Base Neutrals", baseNeutrals.length)}
          \${groupBlock("Base Neutrals", baseNeutrals)}
        </div>
      </div>
    \`;
  })
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "Brand / Blue",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const blue = colors.filter(c => c.name.includes("brand-palette") && c.name.includes(".blue"));
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Blue")}
        <div class="token-section">
          \${sectionHeader("Brand Colors", "Blue", blue.length)}
          \${groupBlock("Blue Scale", blue)}
        </div>
      </div>
    \`;
  })
}`,...p.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: "Brand / Red",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const red = colors.filter(c => c.name.includes("brand-palette") && c.name.includes(".red"));
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Red")}
        <div class="token-section">
          \${sectionHeader("Brand Colors", "Red", red.length)}
          \${groupBlock("Red Scale", red)}
        </div>
      </div>
    \`;
  })
}`,...v.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Brand / Green",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const green = colors.filter(c => c.name.includes("brand-palette") && c.name.includes(".green"));
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Green")}
        <div class="token-section">
          \${sectionHeader("Brand Colors", "Green", green.length)}
          \${groupBlock("Green Scale", green)}
        </div>
      </div>
    \`;
  })
}`,...g.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Brand / Yellow",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const yellow = colors.filter(c => c.name.includes("brand-palette") && c.name.includes(".yellow"));
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Yellow")}
        <div class="token-section">
          \${sectionHeader("Brand Colors", "Yellow", yellow.length)}
          \${groupBlock("Yellow Scale", yellow)}
        </div>
      </div>
    \`;
  })
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: "All Primitives",
  render: asyncStory(async () => {
    const colors = await loadPrimitiveColors();
    const warmGrey = colors.filter(c => c.name.includes("warm-grey"));
    const baseNeutrals = colors.filter(c => c.name.includes("base-neutrals"));
    const blue = colors.filter(c => c.name.includes("brand-palette") && c.name.includes(".blue"));
    const red = colors.filter(c => c.name.includes("brand-palette") && c.name.includes(".red"));
    const green = colors.filter(c => c.name.includes("brand-palette") && c.name.includes(".green"));
    const yellow = colors.filter(c => c.name.includes("brand-palette") && c.name.includes(".yellow"));
    const total = colors.length;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives")}

        <div style="display:flex; align-items:baseline; justify-content:space-between; margin-bottom:2.5rem;">
          <div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.375rem;">REI Cedar Design System</div>
            <div style="font-family:var(--font-sans); font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.03em; line-height:1;">Color<br>Primitives</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:4rem; font-weight:800; color:rgba(46,46,43,0.06); line-height:1; letter-spacing:-0.06em;">\${total}</div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-faint); margin-top:0.25rem;">tokens</div>
          </div>
        </div>

        <div style="height:1px; background:var(--rule-heavy); margin-bottom:3rem;"></div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">01</div>
          \${sectionHeader("Neutral Colors", "Warm Grey + Base Neutrals", warmGrey.length + baseNeutrals.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>
              \${groupBlock("Warm Grey", warmGrey)}
            </div>
            <div>
              \${groupBlock("Base Neutrals", baseNeutrals)}
            </div>
          </div>
        </div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">02</div>
          \${sectionHeader("Brand Colors", "Blue · Red · Green · Yellow", blue.length + red.length + green.length + yellow.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>\${groupBlock("Blue", blue)}</div>
            <div>\${groupBlock("Red", red)}</div>
            <div>\${groupBlock("Green", green)}</div>
            <div>\${groupBlock("Yellow", yellow)}</div>
          </div>
        </div>
      </div>
    \`;
  })
}`,...y.parameters?.docs?.source}}};const N=["NeutralWarmGrey","NeutralBaseNeutrals","BrandBlue","BrandRed","BrandGreen","BrandYellow","AllPrimitives"];export{y as AllPrimitives,p as BrandBlue,g as BrandGreen,v as BrandRed,f as BrandYellow,u as NeutralBaseNeutrals,m as NeutralWarmGrey,N as __namedExportsOrder,S as default};
