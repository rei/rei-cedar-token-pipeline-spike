import{l as v}from"./load-tokens--fInEjBR.js";const D={title:"Tokens/Color/Primitives"};function A(a){a.querySelectorAll("[data-tabs-scope]").forEach(e=>{const n=e.querySelectorAll(".mode-tab"),t=e.querySelectorAll(".mode-panel");n.forEach(r=>{r.addEventListener("click",()=>{const d=r.dataset.mode;n.forEach(o=>o.classList.toggle("active",o.dataset.mode===d)),t.forEach(o=>o.classList.toggle("active",o.dataset.mode===d))})})})}function f(a){return()=>{const e=document.createElement("div");return e.style.cssText="min-height:200px;background:#f5f2eb;",e.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token data…
      </div>`,a().then(n=>{e.innerHTML=n,A(e)}).catch(n=>{const t=n instanceof Error?n.message:String(n);e.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading tokens: ${t}
          </div>`}),e}}const b=`
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
  .page { padding: 3rem 3.5rem 4rem; max-width: 1000px; }

  /* ── Breadcrumb ── */
  .breadcrumb { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 2.5rem; }
  .bc-segment { font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.625rem; }
  .bc-current { color: var(--ink-muted); }

  /* ── Page title ── */
  .page-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; }
  .page-eyebrow { font-family: var(--font-sans); font-size: 0.5rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 0.25rem; }
  .page-title { font-family: var(--font-sans); font-size: 2rem; font-weight: 800; color: var(--ink); letter-spacing: -0.04em; line-height: 1; }
  .page-meta { text-align: right; }
  .page-meta-count { font-family: var(--font-mono); font-size: 3.5rem; font-weight: 800; color: rgba(46,46,43,0.06); line-height: 1; letter-spacing: -0.06em; }
  .page-meta-label { font-family: var(--font-sans); font-size: 0.5rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); margin-top: 0.15rem; }

  /* ── Mode tabs ── */
  .mode-tabs { display: flex; gap: 0; border-bottom: 1.5px solid var(--rule-heavy); margin: 2.5rem 0 2rem; }
  .mode-tab {
    font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase;
    padding: 0.625rem 1.125rem 0.5625rem;
    color: var(--ink-faint); border: none; background: none; cursor: pointer;
    border-bottom: 2px solid transparent; margin-bottom: -1.5px;
    transition: color 0.15s, border-color 0.15s;
  }
  .mode-tab.active { color: var(--ink); border-bottom-color: var(--ink); }
  .mode-panel { display: none; }
  .mode-panel.active { display: block; }

  /* ── Section header ── */
  .section-header {
    display: flex; align-items: baseline; gap: 1.5rem;
    margin-bottom: 0.5rem; padding-bottom: 0.5rem;
    border-bottom: 1.5px solid var(--rule-heavy);
  }
  .section-label { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count { font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-faint); margin-left: auto; }

  /* ── Group header ── */
  .group-header { display: flex; align-items: center; gap: 0.625rem; margin: 2rem 0 1rem; }
  .group-pip { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); }
  .group-name { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-muted); }
  .group-rule { flex: 1; height: 1px; background: var(--rule); }

  /* ── Swatch panorama strip ── */
  .swatch-strip {
    display: flex; width: 100%; overflow: hidden; border-radius: 3px;
    height: 80px; border: 1px solid var(--rule);
  }
  .strip-segment {
    flex: 1; position: relative;
    transition: flex 0.35s cubic-bezier(0.16, 1, 0.3, 1); cursor: default;
  }
  .strip-segment:hover { flex: 2.5; }
  .strip-segment:not(:last-child) { border-right: 1px solid rgba(255,255,255,0.18); }
  .strip-label {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 0.3rem 0.5rem; font-family: var(--font-mono); font-size: 0.5625rem; font-weight: 500;
    white-space: nowrap; overflow: hidden; opacity: 0;
    transition: opacity 0.2s ease; pointer-events: none;
  }
  .strip-segment:hover .strip-label { opacity: 1; }

  /* ── Token table ── */
  .token-table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; }
  .token-table thead tr { border-bottom: 1px solid var(--rule-heavy); }
  .token-table th {
    font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 600;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-faint);
    text-align: left; padding: 0 0 0.5rem;
  }
  .token-table th:last-child { text-align: right; }
  .token-table tbody tr { border-bottom: 1px solid var(--rule); transition: background 0.15s ease; }
  .token-table tbody tr:last-child { border-bottom: none; }
  .token-table tbody tr:hover { background: rgba(46,46,43,0.03); }
  .token-table td { padding: 0.625rem 0; vertical-align: middle; }
  .td-swatch { width: 36px; padding-right: 0.75rem !important; }
  .swatch-chip { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--rule-heavy); display: inline-block; }
  .td-token { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
  .td-hex { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-muted); text-align: right; letter-spacing: 0.04em; }

  /* ── Section spacing ── */
  .token-section { margin-bottom: 3.5rem; }

  /* ── Decorative index ── */
  .deco-index {
    font-family: var(--font-sans); font-size: 5rem; font-weight: 800;
    color: rgba(46,46,43,0.04); line-height: 1; position: absolute;
    right: 0; top: -0.5rem; pointer-events: none; user-select: none; letter-spacing: -0.04em;
  }

  /* ── All Primitives layout ── */
  .primitives-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem 4rem; }

  /* ── Cross-mode comparison ── */
  .compare-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.6875rem; }
  .compare-table th {
    font-family: var(--font-sans); font-size: 0.5rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--ink-faint); text-align: left; padding: 0.5rem 0.75rem 0.5rem 0;
    border-bottom: 1.5px solid var(--rule-heavy); white-space: nowrap;
  }
  .compare-table th.mode-col { text-align: center; padding: 0.5rem 0.875rem; }
  .compare-table td { padding: 0.5rem 0.75rem 0.5rem 0; border-bottom: 1px solid var(--rule); vertical-align: middle; }
  .compare-table td.mode-val { text-align: center; padding: 0.5rem 0.875rem; }
  .compare-table tr:hover td { background: rgba(46,46,43,0.025); }
  .cmp-chip-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
  .cmp-chip { width: 30px; height: 30px; border-radius: 3px; border: 1px solid var(--rule-heavy); display: block; flex-shrink: 0; }
  .cmp-hex { font-family: var(--font-mono); font-size: 0.5rem; color: var(--ink-faint); letter-spacing: 0.03em; }
  .cmp-mode-badge {
    display: inline-block; font-family: var(--font-sans); font-size: 0.4375rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-muted);
    border: 1px solid var(--rule-heavy); border-radius: 2px; padding: 0.125rem 0.375rem;
    background: rgba(46,46,43,0.04);
  }

  @media (max-width: 700px) {
    .primitives-grid { grid-template-columns: 1fr; }
    .page { padding: 2rem 1.5rem 3rem; }
    .compare-table th.mode-col:nth-child(n+4), .compare-table td.mode-val:nth-child(n+4) { display: none; }
  }
`;function H(a){const e=parseInt(a.slice(1,3),16),n=parseInt(a.slice(3,5),16),t=parseInt(a.slice(5,7),16);return(e*299+n*587+t*114)/1e3>140}function W(a){return`
    <div class="swatch-strip">
      ${a.map(e=>{const n=H(e.value.slice(0,7));return`
          <div class="strip-segment" style="background:${e.value};">
            <div class="strip-label" style="color:${n?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.8)"}; background:${n?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.2)"};">
              ${e.value.slice(0,9).toUpperCase()}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function j(a){return`
    <table class="token-table">
      <thead>
        <tr>
          <th style="width:36px;"></th>
          <th>Token</th>
          <th>Hex</th>
        </tr>
      </thead>
      <tbody>
        ${a.map(e=>`
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
  `}function u(a,e){return`
    <div class="group-header">
      <span class="group-pip"></span>
      <span class="group-name">${a}</span>
      <span class="group-rule"></span>
    </div>
    ${W(e)}
    ${j(e)}
  `}function c(a,e,n){return`
    <div class="section-header">
      <span class="section-label">${a}</span>
      <span class="section-title">${e}</span>
      <span class="section-count">${n} tokens</span>
    </div>
  `}function h(...a){return`
    <nav class="breadcrumb">
      ${a.map((e,n)=>{const t=n===a.length-1;return`
          <span class="bc-segment${t?" bc-current":""}">${e}</span>
          ${t?"":'<span class="bc-sep">/</span>'}
        `}).join("")}
    </nav>
  `}function g(a,e){const n=[...a.keys()].sort();if(n.length===0)return"";const t=new Set;for(const i of a.values())i.filter(e).forEach(l=>t.add(l.name));const r=[...t].sort();if(r.length===0)return"";const d=n.map(i=>`
    <th class="mode-col"><span class="cmp-mode-badge">${i}</span></th>
  `).join(""),o=r.map(i=>{const l=n.map(p=>{const m=a.get(p)?.find(F=>F.name===i);return m?`
        <td class="mode-val">
          <div class="cmp-chip-wrap">
            <span class="cmp-chip" style="background:${m.value};"></span>
            <span class="cmp-hex">${m.value.slice(0,9).toUpperCase()}</span>
          </div>
        </td>
      `:'<td class="mode-val"><span style="color:var(--ink-faint);font-size:0.5rem;">—</span></td>'}).join("");return`
      <tr>
        <td style="padding:0.5rem 0.75rem 0.5rem 0;border-bottom:1px solid var(--rule);">
          <span style="font-family:var(--font-mono);font-size:0.6875rem;font-weight:500;color:var(--ink);">${i}</span>
        </td>
        ${l}
      </tr>
    `}).join("");return`
    <table class="compare-table">
      <thead>
        <tr>
          <th>Token</th>
          ${d}
        </tr>
      </thead>
      <tbody>${o}</tbody>
    </table>
  `}function $(a,e,n,t){const r=[...n.keys()].sort();if(r.length===0)return"";const d=r.map((l,p)=>`<button class="mode-tab${p===0?" active":""}" data-mode="${l}">${l}</button>`).join(""),o=r.map((l,p)=>{const m=(n.get(l)??[]).filter(t);return`
      <div class="mode-panel${p===0?" active":""}" data-mode="${l}">
        ${u(e,m)}
      </div>
    `}).join(""),i=g(n,t);return`
    <div data-tabs-scope="${a}">
      <div class="mode-tabs">${d}</div>
      ${o}
    </div>
    <div class="group-header" style="margin-top:2rem;">
      <span class="group-pip"></span>
      <span class="group-name">Platform Comparison</span>
      <span class="group-rule"></span>
    </div>
    ${i}
  `}const w={name:"Neutral / Warm Grey",render:f(async()=>{const a=await v(),e=r=>r.name.includes("warm-grey"),t=([...a.values()][0]??[]).filter(e).length;return`
      <style>${b}</style>
      <div class="page">
        ${h("Cedar Tokens","Color","Primitives","Neutral / Warm Grey")}
        ${c("Neutral Colors","Warm Grey",t)}
        ${$("wg-tabs","Warm Grey Scale",a,e)}
      </div>
    `})},k={name:"Neutral / Base Neutrals",render:f(async()=>{const a=await v(),e=r=>r.name.includes("base-neutrals"),t=([...a.values()][0]??[]).filter(e).length;return`
      <style>${b}</style>
      <div class="page">
        ${h("Cedar Tokens","Color","Primitives","Neutral / Base Neutrals")}
        ${c("Neutral Colors","Base Neutrals",t)}
        ${$("bn-tabs","Base Neutrals",a,e)}
      </div>
    `})},x={name:"Brand / Blue",render:f(async()=>{const a=await v(),e=r=>r.name.includes("brand-palette")&&r.name.includes(".blue"),t=([...a.values()][0]??[]).filter(e).length;return`
      <style>${b}</style>
      <div class="page">
        ${h("Cedar Tokens","Color","Primitives","Brand / Blue")}
        ${c("Brand Colors","Blue",t)}
        ${$("blue-tabs","Blue Scale",a,e)}
      </div>
    `})},C={name:"Brand / Red",render:f(async()=>{const a=await v(),e=r=>r.name.includes("brand-palette")&&r.name.includes(".red"),t=([...a.values()][0]??[]).filter(e).length;return`
      <style>${b}</style>
      <div class="page">
        ${h("Cedar Tokens","Color","Primitives","Brand / Red")}
        ${c("Brand Colors","Red",t)}
        ${$("red-tabs","Red Scale",a,e)}
      </div>
    `})},B={name:"Brand / Green",render:f(async()=>{const a=await v(),e=r=>r.name.includes("brand-palette")&&r.name.includes(".green"),t=([...a.values()][0]??[]).filter(e).length;return`
      <style>${b}</style>
      <div class="page">
        ${h("Cedar Tokens","Color","Primitives","Brand / Green")}
        ${c("Brand Colors","Green",t)}
        ${$("green-tabs","Green Scale",a,e)}
      </div>
    `})},M={name:"Brand / Yellow",render:f(async()=>{const a=await v(),e=r=>r.name.includes("brand-palette")&&r.name.includes(".yellow"),t=([...a.values()][0]??[]).filter(e).length;return`
      <style>${b}</style>
      <div class="page">
        ${h("Cedar Tokens","Color","Primitives","Brand / Yellow")}
        ${c("Brand Colors","Yellow",t)}
        ${$("yellow-tabs","Yellow Scale",a,e)}
      </div>
    `})},S={name:"All Primitives",render:f(async()=>{const a=await v(),e=[...a.keys()].sort(),n=[...a.values()][0]??[],t=n.length,r=s=>s.name.includes("warm-grey"),d=s=>s.name.includes("base-neutrals"),o=s=>s.name.includes("brand-palette")&&s.name.includes(".blue"),i=s=>s.name.includes("brand-palette")&&s.name.includes(".red"),l=s=>s.name.includes("brand-palette")&&s.name.includes(".green"),p=s=>s.name.includes("brand-palette")&&s.name.includes(".yellow"),m=n.filter(r).length+n.filter(d).length,F=n.filter(o).length+n.filter(i).length+n.filter(l).length+n.filter(p).length,R=e.map((s,G)=>`<button class="mode-tab${G===0?" active":""}" data-mode="${s}">${s}</button>`).join(""),L=e.map((s,G)=>{const y=a.get(s)??[],N=y.filter(r),P=y.filter(d),T=y.filter(o),E=y.filter(i),z=y.filter(l),Y=y.filter(p);return`
        <div class="mode-panel${G===0?" active":""}" data-mode="${s}">
          <div class="token-section" style="position:relative;">
            <div class="deco-index">01</div>
            ${c("Neutral Colors","Warm Grey + Base Neutrals",N.length+P.length)}
            <div class="primitives-grid" style="margin-top:1.5rem;">
              <div>${u("Warm Grey",N)}</div>
              <div>${u("Base Neutrals",P)}</div>
            </div>
          </div>
          <div class="token-section" style="position:relative;">
            <div class="deco-index">02</div>
            ${c("Brand Colors","Blue · Red · Green · Yellow",T.length+E.length+z.length+Y.length)}
            <div class="primitives-grid" style="margin-top:1.5rem;">
              <div>${u("Blue",T)}</div>
              <div>${u("Red",E)}</div>
              <div>${u("Green",z)}</div>
              <div>${u("Yellow",Y)}</div>
            </div>
          </div>
        </div>
      `}).join("");return`
      <style>${b}</style>
      <div class="page">
        ${h("Cedar Tokens","Color","Primitives")}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Color<br>Primitives</div>
          </div>
          <div class="page-meta">
            <div class="page-meta-count">${t}</div>
            <div class="page-meta-label">${e.length} platform${e.length!==1?"s":""} · ${t} tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        <div data-tabs-scope="all-primitives-tabs">
          <div class="mode-tabs">${R}</div>
          ${L}
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        ${c("Cross-Platform","Neutral Comparison",m)}
        <div class="group-header" style="margin-top:1.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Warm Grey</span>
          <span class="group-rule"></span>
        </div>
        ${g(a,r)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Base Neutrals</span>
          <span class="group-rule"></span>
        </div>
        ${g(a,d)}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        ${c("Cross-Platform","Brand Comparison",F)}
        <div class="group-header" style="margin-top:1.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Blue</span>
          <span class="group-rule"></span>
        </div>
        ${g(a,o)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Red</span>
          <span class="group-rule"></span>
        </div>
        ${g(a,i)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Green</span>
          <span class="group-rule"></span>
        </div>
        ${g(a,l)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Yellow</span>
          <span class="group-rule"></span>
        </div>
        ${g(a,p)}
      </div>
    `})};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "Neutral / Warm Grey",
  render: asyncStory(async () => {
    const modesMap = await loadPrimitiveColors();
    const filterFn = (c: Swatch) => c.name.includes("warm-grey");

    // Count tokens in first available mode
    const firstMode = [...modesMap.values()][0] ?? [];
    const count = firstMode.filter(filterFn).length;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Neutral / Warm Grey")}
        \${sectionHeader("Neutral Colors", "Warm Grey", count)}
        \${tabbedPaletteGroup("wg-tabs", "Warm Grey Scale", modesMap, filterFn)}
      </div>
    \`;
  })
}`,...w.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: "Neutral / Base Neutrals",
  render: asyncStory(async () => {
    const modesMap = await loadPrimitiveColors();
    const filterFn = (c: Swatch) => c.name.includes("base-neutrals");
    const firstMode = [...modesMap.values()][0] ?? [];
    const count = firstMode.filter(filterFn).length;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Neutral / Base Neutrals")}
        \${sectionHeader("Neutral Colors", "Base Neutrals", count)}
        \${tabbedPaletteGroup("bn-tabs", "Base Neutrals", modesMap, filterFn)}
      </div>
    \`;
  })
}`,...k.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Brand / Blue",
  render: asyncStory(async () => {
    const modesMap = await loadPrimitiveColors();
    const filterFn = (c: Swatch) => c.name.includes("brand-palette") && c.name.includes(".blue");
    const firstMode = [...modesMap.values()][0] ?? [];
    const count = firstMode.filter(filterFn).length;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Blue")}
        \${sectionHeader("Brand Colors", "Blue", count)}
        \${tabbedPaletteGroup("blue-tabs", "Blue Scale", modesMap, filterFn)}
      </div>
    \`;
  })
}`,...x.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: "Brand / Red",
  render: asyncStory(async () => {
    const modesMap = await loadPrimitiveColors();
    const filterFn = (c: Swatch) => c.name.includes("brand-palette") && c.name.includes(".red");
    const firstMode = [...modesMap.values()][0] ?? [];
    const count = firstMode.filter(filterFn).length;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Red")}
        \${sectionHeader("Brand Colors", "Red", count)}
        \${tabbedPaletteGroup("red-tabs", "Red Scale", modesMap, filterFn)}
      </div>
    \`;
  })
}`,...C.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: "Brand / Green",
  render: asyncStory(async () => {
    const modesMap = await loadPrimitiveColors();
    const filterFn = (c: Swatch) => c.name.includes("brand-palette") && c.name.includes(".green");
    const firstMode = [...modesMap.values()][0] ?? [];
    const count = firstMode.filter(filterFn).length;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Green")}
        \${sectionHeader("Brand Colors", "Green", count)}
        \${tabbedPaletteGroup("green-tabs", "Green Scale", modesMap, filterFn)}
      </div>
    \`;
  })
}`,...B.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: "Brand / Yellow",
  render: asyncStory(async () => {
    const modesMap = await loadPrimitiveColors();
    const filterFn = (c: Swatch) => c.name.includes("brand-palette") && c.name.includes(".yellow");
    const firstMode = [...modesMap.values()][0] ?? [];
    const count = firstMode.filter(filterFn).length;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives", "Brand / Yellow")}
        \${sectionHeader("Brand Colors", "Yellow", count)}
        \${tabbedPaletteGroup("yellow-tabs", "Yellow Scale", modesMap, filterFn)}
      </div>
    \`;
  })
}`,...M.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "All Primitives",
  render: asyncStory(async () => {
    const modesMap = await loadPrimitiveColors();
    const modes = [...modesMap.keys()].sort();

    // Count total tokens (using first mode as representative)
    const firstMode = [...modesMap.values()][0] ?? [];
    const total = firstMode.length;
    const warmGreyFn = (c: Swatch) => c.name.includes("warm-grey");
    const baseNeutralsFn = (c: Swatch) => c.name.includes("base-neutrals");
    const blueFn = (c: Swatch) => c.name.includes("brand-palette") && c.name.includes(".blue");
    const redFn = (c: Swatch) => c.name.includes("brand-palette") && c.name.includes(".red");
    const greenFn = (c: Swatch) => c.name.includes("brand-palette") && c.name.includes(".green");
    const yellowFn = (c: Swatch) => c.name.includes("brand-palette") && c.name.includes(".yellow");
    const neutralCount = firstMode.filter(warmGreyFn).length + firstMode.filter(baseNeutralsFn).length;
    const brandCount = firstMode.filter(blueFn).length + firstMode.filter(redFn).length + firstMode.filter(greenFn).length + firstMode.filter(yellowFn).length;

    // Tabs for the full all-primitives view: each mode shows a grid of all palettes
    const allTabs = modes.map((m, i) => \`<button class="mode-tab\${i === 0 ? " active" : ""}" data-mode="\${m}">\${m}</button>\`).join("");
    const allPanels = modes.map((m, i) => {
      const swatches = modesMap.get(m) ?? [];
      const warmGrey = swatches.filter(warmGreyFn);
      const baseNeutrals = swatches.filter(baseNeutralsFn);
      const blue = swatches.filter(blueFn);
      const red = swatches.filter(redFn);
      const green = swatches.filter(greenFn);
      const yellow = swatches.filter(yellowFn);
      return \`
        <div class="mode-panel\${i === 0 ? " active" : ""}" data-mode="\${m}">
          <div class="token-section" style="position:relative;">
            <div class="deco-index">01</div>
            \${sectionHeader("Neutral Colors", "Warm Grey + Base Neutrals", warmGrey.length + baseNeutrals.length)}
            <div class="primitives-grid" style="margin-top:1.5rem;">
              <div>\${groupBlock("Warm Grey", warmGrey)}</div>
              <div>\${groupBlock("Base Neutrals", baseNeutrals)}</div>
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
    }).join("");
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Primitives")}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Color<br>Primitives</div>
          </div>
          <div class="page-meta">
            <div class="page-meta-count">\${total}</div>
            <div class="page-meta-label">\${modes.length} platform\${modes.length !== 1 ? "s" : ""} · \${total} tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        <div data-tabs-scope="all-primitives-tabs">
          <div class="mode-tabs">\${allTabs}</div>
          \${allPanels}
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        \${sectionHeader("Cross-Platform", "Neutral Comparison", neutralCount)}
        <div class="group-header" style="margin-top:1.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Warm Grey</span>
          <span class="group-rule"></span>
        </div>
        \${platformCompareTable(modesMap, warmGreyFn)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Base Neutrals</span>
          <span class="group-rule"></span>
        </div>
        \${platformCompareTable(modesMap, baseNeutralsFn)}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        \${sectionHeader("Cross-Platform", "Brand Comparison", brandCount)}
        <div class="group-header" style="margin-top:1.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Blue</span>
          <span class="group-rule"></span>
        </div>
        \${platformCompareTable(modesMap, blueFn)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Red</span>
          <span class="group-rule"></span>
        </div>
        \${platformCompareTable(modesMap, redFn)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Green</span>
          <span class="group-rule"></span>
        </div>
        \${platformCompareTable(modesMap, greenFn)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Yellow</span>
          <span class="group-rule"></span>
        </div>
        \${platformCompareTable(modesMap, yellowFn)}
      </div>
    \`;
  })
}`,...S.parameters?.docs?.source}}};const I=["NeutralWarmGrey","NeutralBaseNeutrals","BrandBlue","BrandRed","BrandGreen","BrandYellow","AllPrimitives"];export{S as AllPrimitives,x as BrandBlue,B as BrandGreen,C as BrandRed,M as BrandYellow,k as NeutralBaseNeutrals,w as NeutralWarmGrey,I as __namedExportsOrder,D as default};
