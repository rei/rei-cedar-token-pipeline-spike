const p={title:"Tokens/Color/Semantic"},e={"surface.base":{hex:"#ffffff",ref:"Neutral Colors → base-neutrals.white"},"surface.raised":{hex:"#edeae3",ref:"Neutral Colors → warm-grey.100"},"text.base":{hex:"#2e2e2b",ref:"Neutral Colors → warm-grey.900"},"text.subtle":{hex:"#736e65",ref:"Neutral Colors → warm-grey.600"},"text.link":{hex:"#0b2d60",ref:"Brand Colors → blue.600"},"text.link-hover":{hex:"#406eb5",ref:"Brand Colors → blue.400"},"border.base":{hex:"#b2ab9f",ref:"Neutral Colors → warm-grey.300"},"border.subtle":{hex:"#edeae3",ref:"Neutral Colors → warm-grey.100"}},m=`
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
    color: #2e2e2b;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }
  .text-demo-body {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: #736e65;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  .text-demo-link {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: #0b2d60;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }
  .text-demo-hover-note {
    display: inline-block;
    margin-left: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.5625rem;
    color: #406eb5;
    letter-spacing: 0.06em;
    opacity: 0.7;
    vertical-align: middle;
  }
  .text-demo-divider {
    height: 1px;
    background: #edeae3;
    margin: 1.25rem 0;
  }
  .text-demo-tokens-row {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .text-token-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .text-token-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid var(--rule-heavy);
    flex-shrink: 0;
  }
  .text-token-name {
    font-family: var(--font-mono);
    font-size: 0.5625rem;
    color: var(--ink-faint);
    letter-spacing: 0.04em;
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
`;function v(...r){return`
    <nav class="breadcrumb">
      ${r.map((t,o)=>{const n=o===r.length-1;return`<span class="bc-segment${n?" bc-current":""}">${t}</span>${n?"":'<span class="bc-sep">/</span>'}`}).join("")}
    </nav>
  `}function s(r,t,o){return`
    <div class="section-header">
      <span class="section-label">${r}</span>
      <span class="section-title">${t}</span>
      <span class="section-count">${o} tokens</span>
    </div>
  `}function a(r){return`
    <div class="token-grid">
      <div class="token-grid-header">
        <div></div>
        <div>Token</div>
        <div>Resolves to</div>
        <div style="text-align:right;">Hex</div>
      </div>
      ${r.map(t=>{const{hex:o,ref:n}=e[t];return`
          <div class="trow-chip-wrap">
            <span class="trow-chip" style="background:${o};"></span>
          </div>
          <div class="trow-token">color.${t}</div>
          <div class="trow-ref">${n}</div>
          <div class="trow-hex">${o.slice(0,7).toUpperCase()}</div>
        `}).join("")}
    </div>
  `}const i={name:"Surface",render:()=>`
    <style>${m}</style>
    <div class="page">
      ${v("Cedar Tokens","Color","Semantic","Surface")}
      ${s("Semantic Colors","Surface",2)}

      ${a(["surface.base","surface.raised"])}

      <div class="group-header" style="margin-top:2.5rem;">
        <span class="group-pip"></span>
        <span class="group-name">Live Preview</span>
        <span class="group-rule"></span>
      </div>

      <div class="demo-card">
        <div class="demo-layer" style="background:${e["surface.base"].hex};">
          <span class="demo-layer-label" style="color:${e["text.base"].hex};">color.surface.base</span>
          <span class="demo-layer-desc" style="color:${e["text.subtle"].hex};">Base — page background, modal backdrop</span>
        </div>
        <div class="demo-divider" style="background:${e["border.subtle"].hex};"></div>
        <div class="demo-layer" style="background:${e["surface.raised"].hex};">
          <span class="demo-layer-label" style="color:${e["text.base"].hex};">color.surface.raised</span>
          <span class="demo-layer-desc" style="color:${e["text.subtle"].hex};">Raised — cards, sidebars, dropdowns</span>
        </div>
      </div>
    </div>
  `},d={name:"Text",render:()=>`
    <style>${m}</style>
    <div class="page">
      ${v("Cedar Tokens","Color","Semantic","Text")}
      ${s("Semantic Colors","Text",4)}

      ${a(["text.base","text.subtle","text.link","text.link-hover"])}

      <div class="group-header" style="margin-top:2.5rem;">
        <span class="group-pip"></span>
        <span class="group-name">Live Preview</span>
        <span class="group-rule"></span>
      </div>

      <div class="text-demo">
        <div class="text-demo-headline" style="color:${e["text.base"].hex};">
          Gear up for your next adventure.
        </div>
        <div class="text-demo-body" style="color:${e["text.subtle"].hex};">
          From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside. Explore our curated collections, built for every terrain.
        </div>
        <div>
          <a class="text-demo-link" href="#" style="color:${e["text.link"].hex};">View all collections</a>
          <span class="text-demo-hover-note">hover → ${e["text.link-hover"].hex.toUpperCase()}</span>
        </div>
        <div class="text-demo-divider" style="background:${e["border.base"].hex};"></div>
        <div class="text-demo-tokens-row">
          ${["text.base","text.subtle","text.link","text.link-hover"].map(r=>`
            <div class="text-token-chip">
              <span class="text-token-dot" style="background:${e[r].hex};"></span>
              <span class="text-token-name">color.${r}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `},l={name:"Border",render:()=>`
    <style>${m}</style>
    <div class="page">
      ${v("Cedar Tokens","Color","Semantic","Border")}
      ${s("Semantic Colors","Border",2)}

      ${a(["border.base","border.subtle"])}

      <div class="group-header" style="margin-top:2.5rem;">
        <span class="group-pip"></span>
        <span class="group-name">Live Preview</span>
        <span class="group-rule"></span>
      </div>

      <div class="border-demo-grid">
        <div class="border-demo-cell" style="border:1.5px solid ${e["border.base"].hex};">
          <div class="border-demo-label">color.border.base</div>
          <div class="border-demo-desc" style="color:${e["text.subtle"].hex};">Default — cards, inputs, containers</div>
          <div style="margin-top:0.75rem; height:1px; background:${e["border.base"].hex};"></div>
          <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--ink-faint); letter-spacing:0.06em; margin-top:0.25rem;">${e["border.base"].hex.toUpperCase()}</div>
        </div>
        <div class="border-demo-cell" style="border:1.5px solid ${e["border.subtle"].hex};">
          <div class="border-demo-label">color.border.subtle</div>
          <div class="border-demo-desc" style="color:${e["text.subtle"].hex};">Subtle — dividers, section separators</div>
          <div style="margin-top:0.75rem; height:1px; background:${e["border.subtle"].hex};"></div>
          <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--ink-faint); letter-spacing:0.06em; margin-top:0.25rem;">${e["border.subtle"].hex.toUpperCase()}</div>
        </div>
      </div>

      <div style="margin-top:1rem; padding:1.5rem; background:${e["surface.raised"].hex}; border-radius:4px; border-top:3px solid ${e["border.base"].hex};">
        <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.5rem;">Usage note</div>
        <div style="font-family:var(--font-sans); font-size:0.8125rem; color:${e["text.subtle"].hex}; line-height:1.6;">
          Use <code style="font-family:var(--font-mono); font-size:0.75rem; color:${e["text.base"].hex};">border.base</code> for interactive and structural boundaries. Use <code style="font-family:var(--font-mono); font-size:0.75rem; color:${e["text.base"].hex};">border.subtle</code> for low-emphasis visual separators that shouldn't compete with content.
        </div>
      </div>
    </div>
  `},c={name:"All Semantic Tokens",render:()=>{const r=Object.keys(e).length;return`
      <style>${m}</style>
      <div class="page">
        ${v("Cedar Tokens","Color","Semantic")}

        <div class="overview-header">
          <div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.375rem;">REI Cedar Design System</div>
            <div style="font-family:var(--font-sans); font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.03em; line-height:1;">Color<br>Semantic</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:4rem; font-weight:800; color:rgba(46,46,43,0.06); line-height:1; letter-spacing:-0.06em;">${r}</div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-faint); margin-top:0.25rem;">alias tokens</div>
          </div>
        </div>

        <div style="height:1px; background:var(--rule-heavy); margin-bottom:3rem;"></div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">01</div>
          ${s("Semantic","Surface",2)}
          <div style="margin-top:1.25rem;">${a(["surface.base","surface.raised"])}</div>
          <div style="margin-top:1.25rem;" class="demo-card">
            <div class="demo-layer" style="background:${e["surface.base"].hex};">
              <span class="demo-layer-label" style="color:${e["text.base"].hex};">surface.base</span>
              <span class="demo-layer-desc" style="color:${e["text.subtle"].hex};">Page background</span>
            </div>
            <div class="demo-divider" style="background:${e["border.subtle"].hex};"></div>
            <div class="demo-layer" style="background:${e["surface.raised"].hex};">
              <span class="demo-layer-label" style="color:${e["text.base"].hex};">surface.raised</span>
              <span class="demo-layer-desc" style="color:${e["text.subtle"].hex};">Cards &amp; panels</span>
            </div>
          </div>
        </div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">02</div>
          ${s("Semantic","Text",4)}
          <div style="margin-top:1.25rem;">${a(["text.base","text.subtle","text.link","text.link-hover"])}</div>
          <div class="text-demo" style="margin-top:1.25rem;">
            <div class="text-demo-headline" style="color:${e["text.base"].hex};">Gear up for your next adventure.</div>
            <div class="text-demo-body" style="color:${e["text.subtle"].hex};">Explore our curated collections, built for every terrain and condition.</div>
            <a class="text-demo-link" href="#" style="color:${e["text.link"].hex};">View all collections</a>
            <span class="text-demo-hover-note">hover → ${e["text.link-hover"].hex.toUpperCase()}</span>
          </div>
        </div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">03</div>
          ${s("Semantic","Border",2)}
          <div style="margin-top:1.25rem;">${a(["border.base","border.subtle"])}</div>
          <div class="border-demo-grid" style="margin-top:1.25rem;">
            <div class="border-demo-cell" style="border:1.5px solid ${e["border.base"].hex};">
              <div class="border-demo-label">border.base</div>
              <div class="border-demo-desc" style="color:${e["text.subtle"].hex};">Cards, inputs, containers</div>
            </div>
            <div class="border-demo-cell" style="border:1.5px solid ${e["border.subtle"].hex};">
              <div class="border-demo-label">border.subtle</div>
              <div class="border-demo-desc" style="color:${e["text.subtle"].hex};">Dividers, separators</div>
            </div>
          </div>
        </div>
      </div>
    `}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Surface",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Surface")}
      \${sectionHeader("Semantic Colors", "Surface", 2)}

      \${tokenGrid(["surface.base", "surface.raised"])}

      <div class="group-header" style="margin-top:2.5rem;">
        <span class="group-pip"></span>
        <span class="group-name">Live Preview</span>
        <span class="group-rule"></span>
      </div>

      <div class="demo-card">
        <div class="demo-layer" style="background:\${R["surface.base"].hex};">
          <span class="demo-layer-label" style="color:\${R["text.base"].hex};">color.surface.base</span>
          <span class="demo-layer-desc" style="color:\${R["text.subtle"].hex};">Base — page background, modal backdrop</span>
        </div>
        <div class="demo-divider" style="background:\${R["border.subtle"].hex};"></div>
        <div class="demo-layer" style="background:\${R["surface.raised"].hex};">
          <span class="demo-layer-label" style="color:\${R["text.base"].hex};">color.surface.raised</span>
          <span class="demo-layer-desc" style="color:\${R["text.subtle"].hex};">Raised — cards, sidebars, dropdowns</span>
        </div>
      </div>
    </div>
  \`
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Text",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Text")}
      \${sectionHeader("Semantic Colors", "Text", 4)}

      \${tokenGrid(["text.base", "text.subtle", "text.link", "text.link-hover"])}

      <div class="group-header" style="margin-top:2.5rem;">
        <span class="group-pip"></span>
        <span class="group-name">Live Preview</span>
        <span class="group-rule"></span>
      </div>

      <div class="text-demo">
        <div class="text-demo-headline" style="color:\${R["text.base"].hex};">
          Gear up for your next adventure.
        </div>
        <div class="text-demo-body" style="color:\${R["text.subtle"].hex};">
          From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside. Explore our curated collections, built for every terrain.
        </div>
        <div>
          <a class="text-demo-link" href="#" style="color:\${R["text.link"].hex};">View all collections</a>
          <span class="text-demo-hover-note">hover → \${R["text.link-hover"].hex.toUpperCase()}</span>
        </div>
        <div class="text-demo-divider" style="background:\${R["border.base"].hex};"></div>
        <div class="text-demo-tokens-row">
          \${(["text.base", "text.subtle", "text.link", "text.link-hover"] as TokenKey[]).map(key => \`
            <div class="text-token-chip">
              <span class="text-token-dot" style="background:\${R[key].hex};"></span>
              <span class="text-token-name">color.\${key}</span>
            </div>
          \`).join("")}
        </div>
      </div>
    </div>
  \`
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Border",
  render: () => \`
    <style>\${BASE_STYLES}</style>
    <div class="page">
      \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Border")}
      \${sectionHeader("Semantic Colors", "Border", 2)}

      \${tokenGrid(["border.base", "border.subtle"])}

      <div class="group-header" style="margin-top:2.5rem;">
        <span class="group-pip"></span>
        <span class="group-name">Live Preview</span>
        <span class="group-rule"></span>
      </div>

      <div class="border-demo-grid">
        <div class="border-demo-cell" style="border:1.5px solid \${R["border.base"].hex};">
          <div class="border-demo-label">color.border.base</div>
          <div class="border-demo-desc" style="color:\${R["text.subtle"].hex};">Default — cards, inputs, containers</div>
          <div style="margin-top:0.75rem; height:1px; background:\${R["border.base"].hex};"></div>
          <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--ink-faint); letter-spacing:0.06em; margin-top:0.25rem;">\${R["border.base"].hex.toUpperCase()}</div>
        </div>
        <div class="border-demo-cell" style="border:1.5px solid \${R["border.subtle"].hex};">
          <div class="border-demo-label">color.border.subtle</div>
          <div class="border-demo-desc" style="color:\${R["text.subtle"].hex};">Subtle — dividers, section separators</div>
          <div style="margin-top:0.75rem; height:1px; background:\${R["border.subtle"].hex};"></div>
          <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--ink-faint); letter-spacing:0.06em; margin-top:0.25rem;">\${R["border.subtle"].hex.toUpperCase()}</div>
        </div>
      </div>

      <div style="margin-top:1rem; padding:1.5rem; background:\${R["surface.raised"].hex}; border-radius:4px; border-top:3px solid \${R["border.base"].hex};">
        <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.5rem;">Usage note</div>
        <div style="font-family:var(--font-sans); font-size:0.8125rem; color:\${R["text.subtle"].hex}; line-height:1.6;">
          Use <code style="font-family:var(--font-mono); font-size:0.75rem; color:\${R["text.base"].hex};">border.base</code> for interactive and structural boundaries. Use <code style="font-family:var(--font-mono); font-size:0.75rem; color:\${R["text.base"].hex};">border.subtle</code> for low-emphasis visual separators that shouldn't compete with content.
        </div>
      </div>
    </div>
  \`
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "All Semantic Tokens",
  render: () => {
    const total = Object.keys(R).length;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Semantic")}

        <div class="overview-header">
          <div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:0.375rem;">REI Cedar Design System</div>
            <div style="font-family:var(--font-sans); font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.03em; line-height:1;">Color<br>Semantic</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:4rem; font-weight:800; color:rgba(46,46,43,0.06); line-height:1; letter-spacing:-0.06em;">\${total}</div>
            <div style="font-family:var(--font-sans); font-size:0.5625rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-faint); margin-top:0.25rem;">alias tokens</div>
          </div>
        </div>

        <div style="height:1px; background:var(--rule-heavy); margin-bottom:3rem;"></div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">01</div>
          \${sectionHeader("Semantic", "Surface", 2)}
          <div style="margin-top:1.25rem;">\${tokenGrid(["surface.base", "surface.raised"])}</div>
          <div style="margin-top:1.25rem;" class="demo-card">
            <div class="demo-layer" style="background:\${R["surface.base"].hex};">
              <span class="demo-layer-label" style="color:\${R["text.base"].hex};">surface.base</span>
              <span class="demo-layer-desc" style="color:\${R["text.subtle"].hex};">Page background</span>
            </div>
            <div class="demo-divider" style="background:\${R["border.subtle"].hex};"></div>
            <div class="demo-layer" style="background:\${R["surface.raised"].hex};">
              <span class="demo-layer-label" style="color:\${R["text.base"].hex};">surface.raised</span>
              <span class="demo-layer-desc" style="color:\${R["text.subtle"].hex};">Cards &amp; panels</span>
            </div>
          </div>
        </div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">02</div>
          \${sectionHeader("Semantic", "Text", 4)}
          <div style="margin-top:1.25rem;">\${tokenGrid(["text.base", "text.subtle", "text.link", "text.link-hover"])}</div>
          <div class="text-demo" style="margin-top:1.25rem;">
            <div class="text-demo-headline" style="color:\${R["text.base"].hex};">Gear up for your next adventure.</div>
            <div class="text-demo-body" style="color:\${R["text.subtle"].hex};">Explore our curated collections, built for every terrain and condition.</div>
            <a class="text-demo-link" href="#" style="color:\${R["text.link"].hex};">View all collections</a>
            <span class="text-demo-hover-note">hover → \${R["text.link-hover"].hex.toUpperCase()}</span>
          </div>
        </div>

        <div class="section-block" style="position:relative;">
          <div class="deco-index">03</div>
          \${sectionHeader("Semantic", "Border", 2)}
          <div style="margin-top:1.25rem;">\${tokenGrid(["border.base", "border.subtle"])}</div>
          <div class="border-demo-grid" style="margin-top:1.25rem;">
            <div class="border-demo-cell" style="border:1.5px solid \${R["border.base"].hex};">
              <div class="border-demo-label">border.base</div>
              <div class="border-demo-desc" style="color:\${R["text.subtle"].hex};">Cards, inputs, containers</div>
            </div>
            <div class="border-demo-cell" style="border:1.5px solid \${R["border.subtle"].hex};">
              <div class="border-demo-label">border.subtle</div>
              <div class="border-demo-desc" style="color:\${R["text.subtle"].hex};">Dividers, separators</div>
            </div>
          </div>
        </div>
      </div>
    \`;
  }
}`,...c.parameters?.docs?.source}}};const b=["Surface","Text","Border","AllSemantic"];export{c as AllSemantic,l as Border,i as Surface,d as Text,b as __namedExportsOrder,p as default};
