import{b as p}from"./load-tokens--fInEjBR.js";const w={title:"Tokens/Spacing/Fluid"};function v(a){return()=>{const n=document.createElement("div");return n.style.cssText="min-height:200px;background:#f5f2eb;",n.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token data…
      </div>`,a().then(e=>{n.innerHTML=e}).catch(e=>{const i=e instanceof Error?e.message:String(e);n.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading tokens: ${i}
          </div>`}),n}}const g=`
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
`;function f(...a){return`
    <nav class="breadcrumb">
      ${a.map((n,e)=>{const i=e===a.length-1;return`<span class="bc-seg${i?" bc-cur":""}">${n}</span>${i?"":'<span class="bc-sep">/</span>'}`}).join("")}
    </nav>
  `}function c(a,n,e){return`
    <div class="section-header">
      <span class="section-label">${a}</span>
      <span class="section-title">${n}</span>
      <span class="section-count">${e} tokens</span>
    </div>
  `}function s(a){return`<div class="cat-header"><span class="cat-pip"></span><span class="cat-name">${a}</span><span class="cat-rule"></span></div>`}function u(a){const n=a.match(/clamp\(\s*([\d.]+)px\s*,\s*.+?,\s*([\d.]+)px\s*\)/);return n?{min:parseFloat(n[1]),max:parseFloat(n[2])}:null}function b(a){const n=a.filter(t=>t.kind==="fluid"),e=Math.max(...n.map(t=>u(t.value)?.max??0));return`
    <div class="fluid-grid">
      <div class="fluid-grid-header">
        <div>Range</div><div>Token</div><div>CSS clamp()</div><div style="text-align:right">Type</div>
      </div>
      ${n.map(t=>{const o=u(t.value),h=t.path.split(".").pop()??t.path;return o&&o.min/e*100,`
      <div class="frow-bar-wrap">
        <div class="frow-bar-track">
          <div class="frow-bar-fill" style="left:0%;width:${(o?o.max/e*100:0).toFixed(1)}%;"></div>
        </div>
        <div class="frow-bar-labels">
          <span>${o?.min??""}px</span>
          <span>${o?.max??""}px</span>
        </div>
      </div>
      <div class="frow-name">${h}</div>
      <div class="frow-clamp">${t.value}</div>
      <div class="frow-kind"><span class="frow-badge fluid">fluid</span></div>
    `}).join("")}
    </div>
  `}function m(a,n){const e=a.filter(t=>t.kind==="alias"&&t.path.startsWith(`spacing.${n}.`));return e.length===0?"":`
    <div class="alias-grid">
      <div class="alias-grid-header">
        <div>Alias</div><div>Resolves to</div><div>CSS clamp()</div>
      </div>
      ${e.map(t=>`
      <div class="arow-cell arow-name">${t.path.split(".").pop()??t.path}</div>
      <div class="arow-cell arow-ref">${t.aliasRef??""}</div>
      <div class="arow-cell">${t.value}</div>
    `).join("")}
    </div>
  `}const r={name:"Scale",render:v(async()=>{const a=await p(),n=a.filter(e=>e.kind==="fluid");return`
      <style>${g}</style>
      <div class="page">
        ${f("Cedar Tokens","Spacing","Fluid","Scale")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Spacing<br>Scale</div>
          </div>
          <div>
            <div class="page-meta-count">${n.length}</div>
            <div class="page-meta-label">fluid scale tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        ${c("Fluid Spacing","Scale Tokens",n.length)}

        <div class="demo-note">
          These tokens use CSS <code>clamp()</code> to fluidly scale between a minimum
          (at 320px viewport) and maximum value (at their saturation breakpoint).
          They are <strong>web-only</strong> — platforms that do not support fluid values
          should consume the static fallback from the <code>$type: "dimension"</code> tokens instead.
        </div>

        ${s("Scale")}
        ${b(a)}

        ${s("Live Demo — resize your browser to see fluid scaling")}
        <div class="demo-section">
          <div class="demo-label">Token bars (proportional to max value)</div>
          ${n.map(e=>{const i=e.path.split(".").pop()??e.path;return`
              <div class="demo-row">
                <div class="demo-bar" style="width:${e.value};"></div>
                <span class="demo-row-label">${i} — ${e.value}</span>
              </div>
            `}).join("")}
        </div>
      </div>
    `})},l={name:"Aliases (Component & Layout)",render:v(async()=>{const a=await p(),n=a.filter(e=>e.kind==="alias");return`
      <style>${g}</style>
      <div class="page">
        ${f("Cedar Tokens","Spacing","Fluid","Aliases")}
        ${c("Fluid Spacing","Alias Tokens",n.length)}

        <div class="demo-note">
          Alias tokens reference scale tokens (e.g. <code>spacing.component.xs → spacing.scale.-50</code>).
          Their resolved <code>clamp()</code> value is shown for convenience.
          On non-web platforms, resolve the alias to a static px value at the target breakpoint.
        </div>

        ${s("Component")}
        ${m(a,"component")}

        ${s("Layout")}
        ${m(a,"layout")}

        ${s("Live Demo")}
        <div class="demo-section">
          ${n.map(e=>(e.path.split(".").pop()??e.path,`
              <div class="demo-row">
                <div class="demo-bar" style="width:${e.value};"></div>
                <span class="demo-row-label">${e.path.replace("spacing.","")} (${e.scaleKey})</span>
              </div>
            `)).join("")}
        </div>
      </div>
    `})},d={name:"All Spacing Tokens",render:v(async()=>{const a=await p(),n=a.filter(i=>i.kind==="fluid"),e=a.filter(i=>i.kind==="alias");return`
      <style>${g}</style>
      <div class="page">
        ${f("Cedar Tokens","Spacing","Fluid")}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Spacing<br>Fluid</div>
          </div>
          <div>
            <div class="page-meta-count">${a.length}</div>
            <div class="page-meta-label">${n.length} scale · ${e.length} aliases</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        ${c("Scale","Fluid Tokens",n.length)}
        ${b(a)}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3rem 0 2rem;"></div>

        ${c("Aliases","Component",e.filter(i=>i.path.startsWith("spacing.component.")).length)}
        ${s("Component")}
        ${m(a,"component")}

        ${s("Layout")}
        ${m(a,"layout")}
      </div>
    `})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "Scale",
  render: asyncStory(async () => {
    const tokens = await loadSpacingTokens();
    const scaleTokens = tokens.filter(t => t.kind === "fluid");
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Spacing", "Fluid", "Scale")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Spacing<br>Scale</div>
          </div>
          <div>
            <div class="page-meta-count">\${scaleTokens.length}</div>
            <div class="page-meta-label">fluid scale tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        \${sectionHeader("Fluid Spacing", "Scale Tokens", scaleTokens.length)}

        <div class="demo-note">
          These tokens use CSS <code>clamp()</code> to fluidly scale between a minimum
          (at 320px viewport) and maximum value (at their saturation breakpoint).
          They are <strong>web-only</strong> — platforms that do not support fluid values
          should consume the static fallback from the <code>$type: "dimension"</code> tokens instead.
        </div>

        \${catHeader("Scale")}
        \${fluidGrid(tokens)}

        \${catHeader("Live Demo — resize your browser to see fluid scaling")}
        <div class="demo-section">
          <div class="demo-label">Token bars (proportional to max value)</div>
          \${scaleTokens.map(tok => {
      const scaleKey = tok.path.split(".").pop() ?? tok.path;
      return \`
              <div class="demo-row">
                <div class="demo-bar" style="width:\${tok.value};"></div>
                <span class="demo-row-label">\${scaleKey} — \${tok.value}</span>
              </div>
            \`;
    }).join("")}
        </div>
      </div>
    \`;
  })
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Aliases (Component & Layout)",
  render: asyncStory(async () => {
    const tokens = await loadSpacingTokens();
    const aliasTokens = tokens.filter(t => t.kind === "alias");
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Spacing", "Fluid", "Aliases")}
        \${sectionHeader("Fluid Spacing", "Alias Tokens", aliasTokens.length)}

        <div class="demo-note">
          Alias tokens reference scale tokens (e.g. <code>spacing.component.xs → spacing.scale.-50</code>).
          Their resolved <code>clamp()</code> value is shown for convenience.
          On non-web platforms, resolve the alias to a static px value at the target breakpoint.
        </div>

        \${catHeader("Component")}
        \${aliasGrid(tokens, "component")}

        \${catHeader("Layout")}
        \${aliasGrid(tokens, "layout")}

        \${catHeader("Live Demo")}
        <div class="demo-section">
          \${aliasTokens.map(tok => {
      const name = tok.path.split(".").pop() ?? tok.path;
      return \`
              <div class="demo-row">
                <div class="demo-bar" style="width:\${tok.value};"></div>
                <span class="demo-row-label">\${tok.path.replace("spacing.", "")} (\${tok.scaleKey})</span>
              </div>
            \`;
    }).join("")}
        </div>
      </div>
    \`;
  })
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "All Spacing Tokens",
  render: asyncStory(async () => {
    const tokens = await loadSpacingTokens();
    const scaleTokens = tokens.filter(t => t.kind === "fluid");
    const aliasTokens = tokens.filter(t => t.kind === "alias");
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Spacing", "Fluid")}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Spacing<br>Fluid</div>
          </div>
          <div>
            <div class="page-meta-count">\${tokens.length}</div>
            <div class="page-meta-label">\${scaleTokens.length} scale · \${aliasTokens.length} aliases</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        \${sectionHeader("Scale", "Fluid Tokens", scaleTokens.length)}
        \${fluidGrid(tokens)}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3rem 0 2rem;"></div>

        \${sectionHeader("Aliases", "Component", aliasTokens.filter(t => t.path.startsWith("spacing.component.")).length)}
        \${catHeader("Component")}
        \${aliasGrid(tokens, "component")}

        \${catHeader("Layout")}
        \${aliasGrid(tokens, "layout")}
      </div>
    \`;
  })
}`,...d.parameters?.docs?.source}}};const x=["Scale","Aliases","AllSpacing"];export{l as Aliases,d as AllSpacing,r as Scale,x as __namedExportsOrder,w as default};
