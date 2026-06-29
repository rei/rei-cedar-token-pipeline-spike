import{t as e}from"./chunk-BvrOYcoh.js";import{r as t,t as n}from"./load-tokens-AVaqj0hW.js";import{n as r,t as i}from"./TokenOutputPanel-D5SNPfrP.js";function a(e){e.querySelectorAll(`[data-tabs-scope]`).forEach(e=>{let t=e.querySelectorAll(`.mode-tab`),n=e.querySelectorAll(`.mode-panel`);t.forEach(e=>{e.addEventListener(`click`,()=>{let r=e.dataset.mode;t.forEach(e=>e.classList.toggle(`active`,e.dataset.mode===r)),n.forEach(e=>e.classList.toggle(`active`,e.dataset.mode===r))})})})}function o(e){return()=>{let t=document.createElement(`div`);return t.style.cssText=`min-height:200px;background:#f5f2eb;`,t.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading token data…
      </div>`,e().then(e=>{typeof e==`string`?t.innerHTML=e:(t.innerHTML=``,t.appendChild(e)),a(t)}).catch(e=>{t.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d">
            Error loading tokens: ${e instanceof Error?e.message:String(e)}
          </div>`}),t}}function s(e,t){let n=document.createElement(`div`);return n.innerHTML=e,t&&n.appendChild(t),n}function c(e){return e.startsWith(`ios-`)?{platform:`ios`,mode:e.slice(4)}:e.startsWith(`web-`)?{platform:`web`,mode:e.slice(4)}:e===`light`||e===`dark`?{platform:`web`,mode:e}:{platform:`web`,mode:`light`}}function l(e,t){return[...t.entries()].flatMap(([t,n])=>{let r=n.find(t=>t.name===e);if(!r)return[];let{platform:i,mode:a}=c(t);return[{platform:i,mode:a,hex:r.value,primitive:r.name,palette:r.name.split(`.`)[0]??r.name}]})}function u(e,t){let n=([...e.values()][0]??[]).find(t);if(!n)return null;let r=l(n.name,e);return i({canonicalName:`color.${n.name}`,outputTokenName:n.name,resolvedValues:r})}function d(e){let t=([...e.values()][0]??[])[0];if(!t)return null;let n=l(t.name,e);return i({canonicalName:`color.${t.name}`,outputTokenName:t.name,resolvedValues:n})}function f(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function p(e){if(!e)return``;let t=[];return e.summary&&t.push(`<div class="td-doc-summary">${f(e.summary)}</div>`),e.usage&&t.push(`<div class="td-doc-meta"><span class="td-doc-label">Usage</span>${f(e.usage)}</div>`),e.design&&t.push(`<div class="td-doc-meta"><span class="td-doc-label">Design</span>${f(e.design)}</div>`),t.length>0?`<div class="td-token-docs">${t.join(``)}</div>`:``}function m(e){let t=parseInt(e.slice(1,3),16),n=parseInt(e.slice(3,5),16),r=parseInt(e.slice(5,7),16);return(t*299+n*587+r*114)/1e3>140}function h(e){return`
    <div class="swatch-strip">
      ${e.map(e=>{let t=m(e.sourceHex.slice(0,7));return`
          <div class="strip-segment" style="background:${e.value};">
            <div class="strip-label" style="color:${t?`rgba(0,0,0,0.6)`:`rgba(255,255,255,0.8)`}; background:${t?`rgba(255,255,255,0.12)`:`rgba(0,0,0,0.2)`};">
              ${e.value}
            </div>
          </div>
        `}).join(``)}
    </div>
  `}function g(e){return`
    <table class="token-table">
      <thead>
        <tr>
          <th style="width:36px;"></th>
          <th>Token</th>
          <th>oklch</th>
        </tr>
      </thead>
      <tbody>
        ${e.map(e=>{let t=p(e.docs);return`
          <tr class="token-row${t?` has-docs`:``}">
            <td class="td-swatch">
              <span class="swatch-chip" style="background:${e.value};"></span>
            </td>
            <td class="td-token"><div class="td-token-wrap"><span class="td-token-name">${e.name}</span></div></td>
            <td class="td-value">${e.value}</td>
          </tr>
          ${t?`
          <tr class="token-doc-row">
            <td></td>
            <td colspan="2" class="td-doc-cell">${t}</td>
          </tr>`:``}
        `}).join(``)}
      </tbody>
    </table>
  `}function _(e,t){return`
    <div class="group-header">
      <span class="group-pip"></span>
      <span class="group-name">${e}</span>
      <span class="group-rule"></span>
    </div>
    ${h(t)}
    ${g(t)}
  `}function v(e,t,n){return`
    <div class="section-header">
      <span class="section-label">${e}</span>
      <span class="section-title">${t}</span>
      <span class="section-count">${n} tokens</span>
    </div>
  `}function y(...e){return`
    <nav class="breadcrumb">
      ${e.map((t,n)=>{let r=n===e.length-1;return`
          <span class="bc-segment${r?` bc-current`:``}">${t}</span>
          ${r?``:`<span class="bc-sep">/</span>`}
        `}).join(``)}
    </nav>
  `}function b(e,t){let n=[...e.keys()].sort();if(n.length===0)return``;let r=new Set;for(let n of e.values())n.filter(t).forEach(e=>r.add(e.name));let i=[...r].sort();return i.length===0?``:`
    <table class="compare-table">
      <thead>
        <tr>
          <th>Token</th>
          ${n.map(e=>`
    <th class="mode-col"><span class="cmp-mode-badge">${e}</span></th>
  `).join(``)}
        </tr>
      </thead>
      <tbody>${i.map(t=>`
      <tr>
        <td style="padding:0.5rem 0.75rem 0.5rem 0;border-bottom:1px solid var(--rule);">
          <span style="font-family:var(--font-mono);font-size:0.6875rem;font-weight:500;color:var(--ink);">${t}</span>
        </td>
        ${n.map(n=>{let r=e.get(n)?.find(e=>e.name===t);return r?`
        <td class="mode-val">
          <div class="cmp-chip-wrap">
            <span class="cmp-chip" style="background:${r.value};"></span>
            <span class="cmp-value">${r.value}</span>
          </div>
        </td>
      `:`<td class="mode-val"><span style="color:var(--ink-faint);font-size:0.5rem;">—</span></td>`}).join(``)}
      </tr>
    `).join(``)}</tbody>
    </table>
  `}function x(e,t,n,r){let i=[...n.keys()].sort();return i.length===0?``:`
    <div data-tabs-scope="${e}">
      <div class="mode-tabs">${i.map((e,t)=>`<button class="mode-tab${t===0?` active`:``}" data-mode="${e}">${e}</button>`).join(``)}</div>
      ${i.map((e,i)=>{let a=(n.get(e)??[]).filter(r);return`
      <div class="mode-panel${i===0?` active`:``}" data-mode="${e}">
        ${_(t,a)}
      </div>
    `}).join(``)}
    </div>
    <div class="group-header" style="margin-top:2rem;">
      <span class="group-pip"></span>
      <span class="group-name">Web Appearance Comparison</span>
      <span class="group-rule"></span>
    </div>
    ${b(n,r)}
  `}function S(e){return t=>t.name.startsWith(`${e}.`)}function C(e){return{name:e.label,render:o(async()=>{let n=await t(),r=S(e.key),i=([...n.values()][0]??[]).filter(r).length;return s(`
        <style>${E}</style>
        <div class="page">
          ${y(`Cedar Tokens`,`Color`,`Primitives`,e.label)}
          ${v(`Option Colors`,e.label,i)}
          ${x(`${e.tabId}-tabs`,`${e.label} Scale`,n,r)}
        </div>
      `,u(n,r))})}}function w(e){let t=new Map;for(let n of e){let e=n.name.lastIndexOf(`.`);if(e<0)continue;let r=n.name.slice(0,e);if(!t.has(r)){let e=r.replace(/-/g,` `).replace(/\b\w/g,e=>e.toUpperCase());t.set(r,e)}}return[...t.entries()].map(([e,t])=>({key:e,label:t}))}var T,E,D,O,k,A,j,M,N,P,F,I,L;e((()=>{n(),r(),T={title:`Tokens/Color/Primitives`},E=`
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
  .bc-segment { font-family: var(--font-sans); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.75rem; }
  .bc-current { color: var(--ink-muted); }

  /* ── Page title ── */
  .page-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; }
  .page-eyebrow { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 0.25rem; }
  .page-title { font-family: var(--font-sans); font-size: 2.25rem; font-weight: 800; color: var(--ink); letter-spacing: -0.04em; line-height: 1; }
  .page-meta { text-align: right; }
  .page-meta-count { font-family: var(--font-mono); font-size: 3.5rem; font-weight: 800; color: rgba(46,46,43,0.06); line-height: 1; letter-spacing: -0.06em; }
  .page-meta-label { font-family: var(--font-sans); font-size: 0.625rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); margin-top: 0.15rem; }

  /* ── Mode tabs ── */
  .mode-tabs { display: flex; gap: 0; border-bottom: 1.5px solid var(--rule-heavy); margin: 2.5rem 0 2rem; }
  .mode-tab {
    font-family: var(--font-sans); font-size: 0.6875rem; font-weight: 700;
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
  .section-label { font-family: var(--font-sans); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title { font-family: var(--font-sans); font-size: 1.25rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count { font-family: var(--font-mono); font-size: 0.75rem; color: var(--ink-faint); margin-left: auto; }

  /* ── Group header ── */
  .group-header { display: flex; align-items: center; gap: 0.625rem; margin: 2rem 0 1rem; }
  .group-pip { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); }
  .group-name { font-family: var(--font-sans); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-muted); }
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
    padding: 0.3rem 0.5rem; font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500;
    white-space: nowrap; overflow: hidden; opacity: 0;
    transition: opacity 0.2s ease; pointer-events: none;
  }
  .strip-segment:hover .strip-label { opacity: 1; }

  /* ── Token table ── */
  .token-table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; }
  .token-table thead tr { border-bottom: 1px solid var(--rule-heavy); }
  .token-table th {
    font-family: var(--font-sans); font-size: 0.6875rem; font-weight: 600;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-faint);
    text-align: left; padding: 0 0 0.5rem;
  }
  .token-table th:last-child { text-align: right; }
  .token-table tbody tr { border-bottom: 1px solid var(--rule); }
  .token-table tbody tr.token-row { transition: background 0.15s ease; }
  .token-table tbody tr.token-row:hover { background: rgba(46,46,43,0.03); }
  .token-table tbody tr.token-row.has-docs { border-bottom: none; }
  .token-table tbody tr.token-doc-row:hover { background: transparent; }
  .token-table td { padding: 0.625rem 0; vertical-align: middle; }
  .td-swatch { width: 36px; padding-right: 0.75rem !important; }
  .swatch-chip { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--rule-heavy); display: inline-block; }
  .td-token { font-family: var(--font-mono); font-size: 0.875rem; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
  .td-doc-cell { padding: 0 0 0.85rem; }
  .td-token-wrap { display: grid; gap: 0.3rem; }
  .td-token-name { display: block; }
  .td-token-docs { display: grid; gap: 0.28rem; }
  .td-doc-summary { font-family: var(--font-sans); font-size: 0.75rem; line-height: 1.4; color: var(--ink-mid); }
  .td-doc-meta { font-family: var(--font-sans); font-size: 0.6875rem; line-height: 1.45; color: var(--ink-muted); }
  .td-doc-label { font-family: var(--font-sans); font-size: 0.56rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-faint); margin-right: 0.35rem; }
  .td-value { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-muted); text-align: right; letter-spacing: 0.01em; }

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
  .compare-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.8125rem; }
  .compare-table th {
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--ink-faint); text-align: left; padding: 0.5rem 0.75rem 0.5rem 0;
    border-bottom: 1.5px solid var(--rule-heavy); white-space: nowrap;
  }
  .compare-table th.mode-col { text-align: center; padding: 0.5rem 0.875rem; }
  .compare-table td { padding: 0.5rem 0.75rem 0.5rem 0; border-bottom: 1px solid var(--rule); vertical-align: middle; }
  .compare-table td.mode-val { text-align: center; padding: 0.5rem 0.875rem; }
  .compare-table tr:hover td { background: rgba(46,46,43,0.025); }
  .cmp-chip-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
  .cmp-chip { width: 30px; height: 30px; border-radius: 3px; border: 1px solid var(--rule-heavy); display: block; flex-shrink: 0; }
  .cmp-value { font-family: var(--font-mono); font-size: 0.5625rem; color: var(--ink-faint); letter-spacing: 0.01em; }
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
`,D=[{key:`warm-grey`,label:`Warm Grey`,tabId:`wg`},{key:`alpine-lake-blue`,label:`Alpine Lake Blue`,tabId:`alb`},{key:`info-blue`,label:`Info Blue`,tabId:`ib`},{key:`blue-spruce-green`,label:`Blue Spruce Green`,tabId:`bsg`},{key:`success-green`,label:`Success Green`,tabId:`sg`},{key:`warning-yellow`,label:`Warning Yellow`,tabId:`wy`},{key:`error-red`,label:`Error Red`,tabId:`er`},{key:`sale-red`,label:`Sale Red`,tabId:`sr`}],O=C(D[0]),k=C(D[1]),A=C(D[2]),j=C(D[3]),M=C(D[4]),N=C(D[5]),P=C(D[6]),F=C(D[7]),I={name:`All Primitives`,render:o(async()=>{let e=await t(),n=[...e.keys()].sort(),r=[...e.values()][0]??[],i=r.length,a=w(r).map(e=>({...e,filter:S(e.key)})),o=n.map((e,t)=>`<button class="mode-tab${t===0?` active`:``}" data-mode="${e}">${e}</button>`).join(``),c=n.map((t,n)=>{let r=e.get(t)??[],o=a.map(e=>{let t=r.filter(e.filter);return t.length>0?`<div>${_(e.label,t)}</div>`:``}).join(``);return`
        <div class="mode-panel${n===0?` active`:``}" data-mode="${t}">
          <div class="token-section" style="position:relative;">
            <div class="deco-index">01</div>
            ${v(`Option Colors`,`All Families`,i)}
            <div class="primitives-grid" style="margin-top:1.5rem;">
              ${o}
            </div>
          </div>
        </div>
      `}).join(``),l=a.map(t=>`
      <div class="group-header" style="margin-top:2rem;">
        <span class="group-pip"></span>
        <span class="group-name">${t.label}</span>
        <span class="group-rule"></span>
      </div>
      ${b(e,t.filter)}
    `).join(``);return s(`
      <style>${E}</style>
      <div class="page">
        ${y(`Cedar Tokens`,`Color`,`Primitives`)}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Color<br>Primitives</div>
          </div>
          <div class="page-meta">
            <div class="page-meta-count">${i}</div>
            <div class="page-meta-label">${n.length} web appearance${n.length===1?``:`s`} · ${i} tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        <div data-tabs-scope="all-primitives-tabs">
          <div class="mode-tabs">${o}</div>
          ${c}
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        ${v(`Web Appearances`,`Cross-Mode Comparison`,i)}
        ${l}
      </div>
    `,d(e))})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`familyStory(COLOR_FAMILIES[0])`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`familyStory(COLOR_FAMILIES[1])`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`familyStory(COLOR_FAMILIES[2])`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`familyStory(COLOR_FAMILIES[3])`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`familyStory(COLOR_FAMILIES[4])`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`familyStory(COLOR_FAMILIES[5])`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`familyStory(COLOR_FAMILIES[6])`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`familyStory(COLOR_FAMILIES[7])`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: "All Primitives",
  render: asyncStory(async () => {
    const modesMap = await loadPrimitiveColors();
    const modes = [...modesMap.keys()].sort();
    const firstMode = [...modesMap.values()][0] ?? [];
    const total = firstMode.length;

    // Discover families from loaded data — no hardcoded list needed
    const families = discoverFamilies(firstMode);
    const familyFilters = families.map(f => ({
      ...f,
      filter: familyFilter(f.key)
    }));
    const allTabs = modes.map((m, i) => \`<button class="mode-tab\${i === 0 ? " active" : ""}" data-mode="\${m}">\${m}</button>\`).join("");
    const allPanels = modes.map((m, i) => {
      const swatches = modesMap.get(m) ?? [];
      const familyBlocks = familyFilters.map(f => {
        const filtered = swatches.filter(f.filter);
        return filtered.length > 0 ? \`<div>\${groupBlock(f.label, filtered)}</div>\` : "";
      }).join("");
      return \`
        <div class="mode-panel\${i === 0 ? " active" : ""}" data-mode="\${m}">
          <div class="token-section" style="position:relative;">
            <div class="deco-index">01</div>
            \${sectionHeader("Option Colors", "All Families", total)}
            <div class="primitives-grid" style="margin-top:1.5rem;">
              \${familyBlocks}
            </div>
          </div>
        </div>
      \`;
    }).join("");
    const comparisonSections = familyFilters.map(f => \`
      <div class="group-header" style="margin-top:2rem;">
        <span class="group-pip"></span>
        <span class="group-name">\${f.label}</span>
        <span class="group-rule"></span>
      </div>
      \${platformCompareTable(modesMap, f.filter)}
    \`).join("");
    const page = \`
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
            <div class="page-meta-label">\${modes.length} web appearance\${modes.length !== 1 ? "s" : ""} · \${total} tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        <div data-tabs-scope="all-primitives-tabs">
          <div class="mode-tabs">\${allTabs}</div>
          \${allPanels}
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        \${sectionHeader("Web Appearances", "Cross-Mode Comparison", total)}
        \${comparisonSections}
      </div>
    \`;
    return renderStoryWithPanel(page, buildPanelForFirstToken(modesMap));
  })
}`,...I.parameters?.docs?.source}}},L=[`WarmGrey`,`AlpineLakeBlue`,`InfoBlue`,`BlueSpruceGreen`,`SuccessGreen`,`WarningYellow`,`ErrorRed`,`SaleRed`,`AllPrimitives`]}))();export{I as AllPrimitives,k as AlpineLakeBlue,j as BlueSpruceGreen,P as ErrorRed,A as InfoBlue,F as SaleRed,M as SuccessGreen,O as WarmGrey,N as WarningYellow,L as __namedExportsOrder,T as default};