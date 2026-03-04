const N={title:"Tokens/Color/Primitives"},s=`
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
`,o=[{name:"warm-grey.100",value:"#edeae3"},{name:"warm-grey.300",value:"#b2ab9f"},{name:"warm-grey.600",value:"#736e65"},{name:"warm-grey.900",value:"#2e2e2b"}],l=[{name:"base-neutrals.black",value:"#000000"},{name:"base-neutrals.white",value:"#ffffff"},{name:"base-neutrals.white-85",value:"#ffffffd9"},{name:"base-neutrals.white-75",value:"#ffffffbf"}],d=[{name:"blue.400",value:"#406eb5"},{name:"blue.600",value:"#0b2d60"}],c=[{name:"red.400",value:"#be342d"},{name:"red.600",value:"#610a0a"}],m=[{name:"green.400",value:"#3b8349"},{name:"green.600",value:"#1f513f"}],v=[{name:"yellow.400",value:"#ffbf59"},{name:"yellow.600",value:"#ffe7b3"},{name:"yellow.800",value:"#ede285"}];function k(e){const r=parseInt(e.slice(1,3),16),n=parseInt(e.slice(3,5),16),p=parseInt(e.slice(5,7),16);return(r*299+n*587+p*114)/1e3>140}function $(e){return`
    <div class="swatch-strip">
      ${e.map(r=>{const n=k(r.value.slice(0,7));return`
          <div class="strip-segment" style="background:${r.value};">
            <div class="strip-label" style="color:${n?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.8)"}; background:${n?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.2)"};">
              ${r.value.slice(0,7).toUpperCase()}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function R(e){return`
    <table class="token-table">
      <thead>
        <tr>
          <th style="width:36px;"></th>
          <th>Token</th>
          <th>Hex</th>
        </tr>
      </thead>
      <tbody>
        ${e.map(r=>`
          <tr>
            <td class="td-swatch">
              <span class="swatch-chip" style="background:${r.value};"></span>
            </td>
            <td class="td-token">${r.name}</td>
            <td class="td-hex">${r.value.slice(0,7).toUpperCase()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}function t(e,r){return`
    <div class="group-header">
      <span class="group-pip"></span>
      <span class="group-name">${e}</span>
      <span class="group-rule"></span>
    </div>
    ${$(r)}
    ${R(r)}
  `}function a(e,r,n){return`
    <div class="section-header">
      <span class="section-label">${e}</span>
      <span class="section-title">${r}</span>
      <span class="section-count">${n} tokens</span>
    </div>
  `}function i(...e){return`
    <nav class="breadcrumb">
      ${e.map((r,n)=>{const p=n===e.length-1;return`
          <span class="bc-segment${p?" bc-current":""}">${r}</span>
          ${p?"":'<span class="bc-sep">/</span>'}
        `}).join("")}
    </nav>
  `}const g={name:"Neutral / Warm Grey",render:()=>`
    <style>${s}</style>
    <div class="page">
      ${i("Cedar Tokens","Color","Primitives","Neutral / Warm Grey")}
      <div class="token-section">
        ${a("Neutral Colors","Warm Grey",o.length)}
        ${t("Warm Grey Scale",o)}
      </div>
    </div>
  `},u={name:"Neutral / Base Neutrals",render:()=>`
    <style>${s}</style>
    <div class="page">
      ${i("Cedar Tokens","Color","Primitives","Neutral / Base Neutrals")}
      <div class="token-section">
        ${a("Neutral Colors","Base Neutrals",l.length)}
        ${t("Base Neutrals",l)}
      </div>
    </div>
  `},f={name:"Brand / Blue",render:()=>`
    <style>${s}</style>
    <div class="page">
      ${i("Cedar Tokens","Color","Primitives","Brand / Blue")}
      <div class="token-section">
        ${a("Brand Colors","Blue",d.length)}
        ${t("Blue Scale",d)}
      </div>
    </div>
  `},b={name:"Brand / Red",render:()=>`
    <style>${s}</style>
    <div class="page">
      ${i("Cedar Tokens","Color","Primitives","Brand / Red")}
      <div class="token-section">
        ${a("Brand Colors","Red",c.length)}
        ${t("Red Scale",c)}
      </div>
    </div>
  `},h={name:"Brand / Green",render:()=>`
    <style>${s}</style>
    <div class="page">
      ${i("Cedar Tokens","Color","Primitives","Brand / Green")}
      <div class="token-section">
        ${a("Brand Colors","Green",m.length)}
        ${t("Green Scale",m)}
      </div>
    </div>
  `},y={name:"Brand / Yellow",render:()=>`
    <style>${s}</style>
    <div class="page">
      ${i("Cedar Tokens","Color","Primitives","Brand / Yellow")}
      <div class="token-section">
        ${a("Brand Colors","Yellow",v.length)}
        ${t("Yellow Scale",v)}
      </div>
    </div>
  `},B={name:"All Primitives",render:()=>{const e=o.length+l.length+d.length+c.length+m.length+v.length;return`
      <style>${s}</style>
      <div class="page">
        ${i("Cedar Tokens","Color","Primitives")}

        <div style="display:flex; align-items:baseline; justify-content:space-between; margin-bottom:2.5rem;">
          <div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.375rem;">REI Cedar Design System</div>
            <div style="font-family:var(--font-sans); font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.03em; line-height:1;">Color<br>Primitives</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:4rem; font-weight:800; color:rgba(46,46,43,0.06); line-height:1; letter-spacing:-0.06em;">${e}</div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-faint); margin-top:0.25rem;">tokens</div>
          </div>
        </div>

        <div style="height:1px; background:var(--rule-heavy); margin-bottom:3rem;"></div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">01</div>
          ${a("Neutral Colors","Warm Grey + Base Neutrals",o.length+l.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>
              ${t("Warm Grey",o)}
            </div>
            <div>
              ${t("Base Neutrals",l)}
            </div>
          </div>
        </div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">02</div>
          ${a("Brand Colors","Blue · Red · Green · Yellow",d.length+c.length+m.length+v.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>${t("Blue",d)}</div>
            <div>${t("Red",c)}</div>
            <div>${t("Green",m)}</div>
            <div>${t("Yellow",v)}</div>
          </div>
        </div>
      </div>
    `}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Neutral / Warm Grey",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Neutral / Warm Grey")}
      <div class="token-section">
        \${sectionHeader("Neutral Colors", "Warm Grey", WARM_GREY.length)}
        \${groupBlock("Warm Grey Scale", WARM_GREY)}
      </div>
    </div>
  \`
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Neutral / Base Neutrals",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Neutral / Base Neutrals")}
      <div class="token-section">
        \${sectionHeader("Neutral Colors", "Base Neutrals", BASE_NEUTRALS.length)}
        \${groupBlock("Base Neutrals", BASE_NEUTRALS)}
      </div>
    </div>
  \`
}`,...u.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Brand / Blue",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Blue")}
      <div class="token-section">
        \${sectionHeader("Brand Colors", "Blue", BRAND_BLUE.length)}
        \${groupBlock("Blue Scale", BRAND_BLUE)}
      </div>
    </div>
  \`
}`,...f.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "Brand / Red",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Red")}
      <div class="token-section">
        \${sectionHeader("Brand Colors", "Red", BRAND_RED.length)}
        \${groupBlock("Red Scale", BRAND_RED)}
      </div>
    </div>
  \`
}`,...b.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Brand / Green",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Green")}
      <div class="token-section">
        \${sectionHeader("Brand Colors", "Green", BRAND_GREEN.length)}
        \${groupBlock("Green Scale", BRAND_GREEN)}
      </div>
    </div>
  \`
}`,...h.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: "Brand / Yellow",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Yellow")}
      <div class="token-section">
        \${sectionHeader("Brand Colors", "Yellow", BRAND_YELLOW.length)}
        \${groupBlock("Yellow Scale", BRAND_YELLOW)}
      </div>
    </div>
  \`
}`,...y.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: "All Primitives",
  render: () => {
    const total = WARM_GREY.length + BASE_NEUTRALS.length + BRAND_BLUE.length + BRAND_RED.length + BRAND_GREEN.length + BRAND_YELLOW.length;
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
          \${sectionHeader("Neutral Colors", "Warm Grey + Base Neutrals", WARM_GREY.length + BASE_NEUTRALS.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>
              \${groupBlock("Warm Grey", WARM_GREY)}
            </div>
            <div>
              \${groupBlock("Base Neutrals", BASE_NEUTRALS)}
            </div>
          </div>
        </div>

        <div class="token-section" style="position:relative;">
          <div class="deco-index">02</div>
          \${sectionHeader("Brand Colors", "Blue · Red · Green · Yellow", BRAND_BLUE.length + BRAND_RED.length + BRAND_GREEN.length + BRAND_YELLOW.length)}
          <div class="primitives-grid" style="margin-top:1.5rem;">
            <div>\${groupBlock("Blue", BRAND_BLUE)}</div>
            <div>\${groupBlock("Red", BRAND_RED)}</div>
            <div>\${groupBlock("Green", BRAND_GREEN)}</div>
            <div>\${groupBlock("Yellow", BRAND_YELLOW)}</div>
          </div>
        </div>
      </div>
    \`;
  }
}`,...B.parameters?.docs?.source}}};const E=["NeutralWarmGrey","NeutralBaseNeutrals","BrandBlue","BrandRed","BrandGreen","BrandYellow","AllPrimitives"];export{B as AllPrimitives,f as BrandBlue,h as BrandGreen,b as BrandRed,y as BrandYellow,u as NeutralBaseNeutrals,g as NeutralWarmGrey,E as __namedExportsOrder,N as default};
