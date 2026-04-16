import{t as e}from"./chunk-BvrOYcoh.js";import{r as t,t as n}from"./load-tokens-CT6AMABu.js";import{n as r,t as i}from"./TokenOutputPanel-DLuXUcyH.js";function a(e){e.querySelectorAll(`[data-tabs-scope]`).forEach(e=>{let t=e.querySelectorAll(`.mode-tab`),n=e.querySelectorAll(`.mode-panel`);t.forEach(e=>{e.addEventListener(`click`,()=>{let r=e.dataset.mode;t.forEach(e=>e.classList.toggle(`active`,e.dataset.mode===r)),n.forEach(e=>e.classList.toggle(`active`,e.dataset.mode===r))})})})}function o(e){return()=>{let t=document.createElement(`div`);return t.style.cssText=`min-height:200px;background:#f5f2eb;`,t.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading token data…
      </div>`,e().then(e=>{typeof e==`string`?t.innerHTML=e:(t.innerHTML=``,t.appendChild(e)),a(t)}).catch(e=>{t.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d">
            Error loading tokens: ${e instanceof Error?e.message:String(e)}
          </div>`}),t}}function s(e,t){let n=document.createElement(`div`);return n.innerHTML=e,t&&n.appendChild(t),n}function c(e){return e.startsWith(`ios-`)?{platform:`ios`,mode:e.slice(4)}:e.startsWith(`web-`)?{platform:`web`,mode:e.slice(4)}:e===`light`||e===`dark`?{platform:`web`,mode:e}:{platform:`web`,mode:`light`}}function l(e,t){return[...t.entries()].flatMap(([t,n])=>{let r=n.find(t=>t.name===e);if(!r)return[];let{platform:i,mode:a}=c(t);return[{platform:i,mode:a,hex:r.value,primitive:r.name,palette:r.name.split(`.`)[0]??r.name}]})}function u(e){let t=([...e.values()][0]??[])[0];if(!t)return null;let n=l(t.name,e);return i({canonicalName:`color.${t.name}`,outputTokenName:t.name,resolvedValues:n})}function d(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function f(e){if(!e)return``;let t=[];return e.summary&&t.push(`<div class="td-doc-summary">${d(e.summary)}</div>`),e.usage&&t.push(`<div class="td-doc-meta"><span class="td-doc-label">Usage</span>${d(e.usage)}</div>`),e.design&&t.push(`<div class="td-doc-meta"><span class="td-doc-label">Design</span>${d(e.design)}</div>`),t.length>0?`<div class="td-token-docs">${t.join(``)}</div>`:``}function p(e){let t=parseInt(e.slice(1,3),16),n=parseInt(e.slice(3,5),16),r=parseInt(e.slice(5,7),16);return(t*299+n*587+r*114)/1e3>140}function m(e){return`
    <div class="swatch-strip">
      ${e.map(e=>{let t=p(e.value.slice(0,7));return`
          <div class="strip-segment" style="background:${e.value};">
            <div class="strip-label" style="color:${t?`rgba(0,0,0,0.6)`:`rgba(255,255,255,0.8)`}; background:${t?`rgba(255,255,255,0.12)`:`rgba(0,0,0,0.2)`};">
              ${e.value.slice(0,9).toUpperCase()}
            </div>
          </div>
        `}).join(``)}
    </div>
  `}function h(e){return`
    <table class="token-table">
      <thead>
        <tr>
          <th style="width:36px;"></th>
          <th>Token</th>
          <th>Hex</th>
        </tr>
      </thead>
      <tbody>
        ${e.map(e=>{let t=f(e.docs);return`
          <tr class="token-row${t?` has-docs`:``}">
            <td class="td-swatch">
              <span class="swatch-chip" style="background:${e.value};"></span>
            </td>
            <td class="td-token"><div class="td-token-wrap"><span class="td-token-name">${e.name}</span></div></td>
            <td class="td-hex">${e.value.slice(0,9).toUpperCase()}</td>
          </tr>
          ${t?`
          <tr class="token-doc-row">
            <td></td>
            <td colspan="2" class="td-doc-cell">${t}</td>
          </tr>`:``}
        `}).join(``)}
      </tbody>
    </table>
  `}function g(e,t){return`
    <div class="group-header">
      <span class="group-pip"></span>
      <span class="group-name">${e}</span>
      <span class="group-rule"></span>
    </div>
    ${m(t)}
    ${h(t)}
  `}function _(e,t,n){return`
    <div class="section-header">
      <span class="section-label">${e}</span>
      <span class="section-title">${t}</span>
      <span class="section-count">${n} tokens</span>
    </div>
  `}function v(...e){return`
    <nav class="breadcrumb">
      ${e.map((t,n)=>{let r=n===e.length-1;return`
          <span class="bc-segment${r?` bc-current`:``}">${t}</span>
          ${r?``:`<span class="bc-sep">/</span>`}
        `}).join(``)}
    </nav>
  `}function y(e,t){let n=[...e.keys()].sort();if(n.length===0)return``;let r=new Set;for(let n of e.values())n.filter(t).forEach(e=>r.add(e.name));let i=[...r].sort();return i.length===0?``:`
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
            <span class="cmp-hex">${r.value.slice(0,9).toUpperCase()}</span>
          </div>
        </td>
      `:`<td class="mode-val"><span style="color:var(--ink-faint);font-size:0.5rem;">—</span></td>`}).join(``)}
      </tr>
    `).join(``)}</tbody>
    </table>
  `}function b(e,t,n,r){let i=[...n.keys()].sort();return i.length===0?``:`
    <div data-tabs-scope="${e}">
      <div class="mode-tabs">${i.map((e,t)=>`<button class="mode-tab${t===0?` active`:``}" data-mode="${e}">${e}</button>`).join(``)}</div>
      ${i.map((e,i)=>{let a=(n.get(e)??[]).filter(r);return`
      <div class="mode-panel${i===0?` active`:``}" data-mode="${e}">
        ${g(t,a)}
      </div>
    `}).join(``)}
    </div>
    <div class="group-header" style="margin-top:2rem;">
      <span class="group-pip"></span>
      <span class="group-name">Platform Comparison</span>
      <span class="group-rule"></span>
    </div>
    ${y(n,r)}
  `}var x,S,C,w,T,E,D,O,k,A;e((()=>{n(),r(),x={title:`Tokens/Color/Primitives`},S=`
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
  .td-hex { font-family: var(--font-mono); font-size: 0.8125rem; color: var(--ink-muted); text-align: right; letter-spacing: 0.04em; }

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
  .cmp-hex { font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-faint); letter-spacing: 0.03em; }
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
`,C={name:`Neutral / Warm Grey`,render:o(async()=>{let e=await t(),n=e=>e.name.includes(`warm-grey`),r=([...e.values()][0]??[]).filter(n).length;return`
      <style>${S}</style>
      <div class="page">
        ${v(`Cedar Tokens`,`Color`,`Primitives`,`Neutral / Warm Grey`)}
        ${_(`Neutral Colors`,`Warm Grey`,r)}
        ${b(`wg-tabs`,`Warm Grey Scale`,e,n)}
      </div>
    `})},w={name:`Neutral / Base Neutrals`,render:o(async()=>{let e=await t(),n=e=>e.name.includes(`base-neutrals`),r=([...e.values()][0]??[]).filter(n).length;return`
      <style>${S}</style>
      <div class="page">
        ${v(`Cedar Tokens`,`Color`,`Primitives`,`Neutral / Base Neutrals`)}
        ${_(`Neutral Colors`,`Base Neutrals`,r)}
        ${b(`bn-tabs`,`Base Neutrals`,e,n)}
      </div>
    `})},T={name:`Brand / Blue`,render:o(async()=>{let e=await t(),n=e=>e.name.includes(`brand-palette`)&&e.name.includes(`.blue`),r=([...e.values()][0]??[]).filter(n).length;return`
      <style>${S}</style>
      <div class="page">
        ${v(`Cedar Tokens`,`Color`,`Primitives`,`Brand / Blue`)}
        ${_(`Brand Colors`,`Blue`,r)}
        ${b(`blue-tabs`,`Blue Scale`,e,n)}
      </div>
    `})},E={name:`Brand / Red`,render:o(async()=>{let e=await t(),n=e=>e.name.includes(`brand-palette`)&&e.name.includes(`.red`),r=([...e.values()][0]??[]).filter(n).length;return`
      <style>${S}</style>
      <div class="page">
        ${v(`Cedar Tokens`,`Color`,`Primitives`,`Brand / Red`)}
        ${_(`Brand Colors`,`Red`,r)}
        ${b(`red-tabs`,`Red Scale`,e,n)}
      </div>
    `})},D={name:`Brand / Green`,render:o(async()=>{let e=await t(),n=e=>e.name.includes(`brand-palette`)&&e.name.includes(`.green`),r=([...e.values()][0]??[]).filter(n).length;return`
      <style>${S}</style>
      <div class="page">
        ${v(`Cedar Tokens`,`Color`,`Primitives`,`Brand / Green`)}
        ${_(`Brand Colors`,`Green`,r)}
        ${b(`green-tabs`,`Green Scale`,e,n)}
      </div>
    `})},O={name:`Brand / Yellow`,render:o(async()=>{let e=await t(),n=e=>e.name.includes(`brand-palette`)&&e.name.includes(`.yellow`),r=([...e.values()][0]??[]).filter(n).length;return`
      <style>${S}</style>
      <div class="page">
        ${v(`Cedar Tokens`,`Color`,`Primitives`,`Brand / Yellow`)}
        ${_(`Brand Colors`,`Yellow`,r)}
        ${b(`yellow-tabs`,`Yellow Scale`,e,n)}
      </div>
    `})},k={name:`All Primitives`,render:o(async()=>{let e=await t(),n=[...e.keys()].sort(),r=[...e.values()][0]??[],i=r.length,a=e=>e.name.includes(`warm-grey`),o=e=>e.name.includes(`base-neutrals`),c=e=>e.name.includes(`brand-palette`)&&e.name.includes(`.blue`),l=e=>e.name.includes(`brand-palette`)&&e.name.includes(`.red`),d=e=>e.name.includes(`brand-palette`)&&e.name.includes(`.green`),f=e=>e.name.includes(`brand-palette`)&&e.name.includes(`.yellow`),p=r.filter(a).length+r.filter(o).length,m=r.filter(c).length+r.filter(l).length+r.filter(d).length+r.filter(f).length,h=n.map((e,t)=>`<button class="mode-tab${t===0?` active`:``}" data-mode="${e}">${e}</button>`).join(``),b=n.map((t,n)=>{let r=e.get(t)??[],i=r.filter(a),s=r.filter(o),u=r.filter(c),p=r.filter(l),m=r.filter(d),h=r.filter(f);return`
        <div class="mode-panel${n===0?` active`:``}" data-mode="${t}">
          <div class="token-section" style="position:relative;">
            <div class="deco-index">01</div>
            ${_(`Neutral Colors`,`Warm Grey + Base Neutrals`,i.length+s.length)}
            <div class="primitives-grid" style="margin-top:1.5rem;">
              <div>${g(`Warm Grey`,i)}</div>
              <div>${g(`Base Neutrals`,s)}</div>
            </div>
          </div>
          <div class="token-section" style="position:relative;">
            <div class="deco-index">02</div>
            ${_(`Brand Colors`,`Blue · Red · Green · Yellow`,u.length+p.length+m.length+h.length)}
            <div class="primitives-grid" style="margin-top:1.5rem;">
              <div>${g(`Blue`,u)}</div>
              <div>${g(`Red`,p)}</div>
              <div>${g(`Green`,m)}</div>
              <div>${g(`Yellow`,h)}</div>
            </div>
          </div>
        </div>
      `}).join(``);return s(`
      <style>${S}</style>
      <div class="page">
        ${v(`Cedar Tokens`,`Color`,`Primitives`)}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Color<br>Primitives</div>
          </div>
          <div class="page-meta">
            <div class="page-meta-count">${i}</div>
            <div class="page-meta-label">${n.length} platform${n.length===1?``:`s`} · ${i} tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        <div data-tabs-scope="all-primitives-tabs">
          <div class="mode-tabs">${h}</div>
          ${b}
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        ${_(`Cross-Platform`,`Neutral Comparison`,p)}
        <div class="group-header" style="margin-top:1.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Warm Grey</span>
          <span class="group-rule"></span>
        </div>
        ${y(e,a)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Base Neutrals</span>
          <span class="group-rule"></span>
        </div>
        ${y(e,o)}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        ${_(`Cross-Platform`,`Brand Comparison`,m)}
        <div class="group-header" style="margin-top:1.5rem;">
          <span class="group-pip"></span>
          <span class="group-name">Blue</span>
          <span class="group-rule"></span>
        </div>
        ${y(e,c)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Red</span>
          <span class="group-rule"></span>
        </div>
        ${y(e,l)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Green</span>
          <span class="group-rule"></span>
        </div>
        ${y(e,d)}
        <div class="group-header" style="margin-top:2rem;">
          <span class="group-pip"></span>
          <span class="group-name">Yellow</span>
          <span class="group-rule"></span>
        </div>
        ${y(e,f)}
      </div>
    `,u(e))})},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
    return renderStoryWithPanel(page, buildStoryPanel(modesMap, filterFn));
  })
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
    return renderStoryWithPanel(page, buildStoryPanel(modesMap, filterFn));
  })
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
    return renderStoryWithPanel(page, buildStoryPanel(modesMap, filterFn));
  })
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
    return renderStoryWithPanel(page, buildStoryPanel(modesMap, filterFn));
  })
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
    return renderStoryWithPanel(page, buildStoryPanel(modesMap, filterFn));
  })
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
    return renderStoryWithPanel(page, buildStoryPanel(modesMap, filterFn));
  })
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
    return renderStoryWithPanel(page, buildPanelForFirstToken(modesMap));
  })
}`,...k.parameters?.docs?.source}}},A=[`NeutralWarmGrey`,`NeutralBaseNeutrals`,`BrandBlue`,`BrandRed`,`BrandGreen`,`BrandYellow`,`AllPrimitives`]}))();export{k as AllPrimitives,T as BrandBlue,D as BrandGreen,E as BrandRed,O as BrandYellow,w as NeutralBaseNeutrals,C as NeutralWarmGrey,A as __namedExportsOrder,x as default};