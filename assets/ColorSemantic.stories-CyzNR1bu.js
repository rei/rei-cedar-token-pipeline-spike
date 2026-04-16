import{t as e}from"./chunk-BvrOYcoh.js";import{i as t,r as n}from"./platform-mode-context-B5Yqe24o.js";import{n as r,t as i}from"./load-tokens-CbjuqQrc.js";import{n as a,t as o}from"./TokenOutputPanel-DlA3hEs_.js";function s(e){e.querySelectorAll(`[data-tabs-scope]`).forEach(e=>{let t=e.querySelectorAll(`.mode-tab`),n=e.querySelectorAll(`.mode-panel`);t.forEach(e=>{e.addEventListener(`click`,()=>{let r=e.dataset.mode;t.forEach(e=>e.classList.toggle(`active`,e.dataset.mode===r)),n.forEach(e=>e.classList.toggle(`active`,e.dataset.mode===r))})})})}function c(e){return()=>{let t=document.createElement(`div`);return t.style.cssText=`min-height:200px;background:#f5f2eb;`,t.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token data…
      </div>`,e().then(e=>{typeof e==`string`?t.innerHTML=e:(t.innerHTML=``,t.appendChild(e)),s(t)}).catch(e=>{t.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading tokens: ${e instanceof Error?e.message:String(e)}
          </div>`}),t}}function l(e,t){let n=document.createElement(`div`);return n.innerHTML=e,t&&n.appendChild(t),n}function u(e,t,n){let r=[];for(let i of n){let n=i===`default`?`color.${e}`:`color.modes.${i}.${e}`,a=t.get(n);if(!a)continue;let o=a.ref.split(` → `)[0]??a.ref,s=i===`default`?[`light`,`dark`]:[i];for(let e of s)for(let t of[`web`,`ios`,`android`])r.push({platform:t,mode:e,hex:a.hex,primitive:a.ref,palette:o})}return r}function d(e){let[t,n]=e.split(`.`);return!t||!n?e:`cdr-${{surface:`surface`,text:`text`,border:`border`}[t]??t}-${n}`}function f(e,t,n){let r=u(e,t,n);return r.length===0?null:o({canonicalName:`color.${e}`,outputTokenName:d(e),resolvedValues:r})}function p(...e){return`
    <nav class="breadcrumb">
      ${e.map((t,n)=>{let r=n===e.length-1;return`<span class="bc-segment${r?` bc-current`:``}">${t}</span>${r?``:`<span class="bc-sep">/</span>`}`}).join(``)}
    </nav>
  `}function m(e,t,n){return`
    <div class="section-header">
      <span class="section-label">${e}</span>
      <span class="section-title">${t}</span>
      <span class="section-count">${n} tokens</span>
    </div>
  `}function h(e){return`<div class="cat-header"><span class="cat-pip"></span><span class="cat-name">${e}</span><span class="cat-rule"></span></div>`}function g(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function _(e){if(!e)return``;let t=[];return e.summary&&t.push(`<div class="trow-doc-summary">${g(e.summary)}</div>`),e.usage&&t.push(`<div class="trow-doc-meta"><span class="trow-doc-label">Usage</span>${g(e.usage)}</div>`),e.design&&t.push(`<div class="trow-doc-meta"><span class="trow-doc-label">Design</span>${g(e.design)}</div>`),e.aliases&&e.aliases.length>0&&t.push(`<div class="trow-doc-meta"><span class="trow-doc-label">Aliases</span>${e.aliases.map(g).join(`, `)}</div>`),t.length>0?`<div class="trow-token-docs">${t.join(``)}</div>`:``}function v(e){return e.startsWith(`color.modes.`)?e.replace(/^color\.modes\.[^.]+\./,``):e.startsWith(`color.`)?e.slice(6):e}function y(e,t){return`
    <div class="token-grid">
      <div class="token-grid-header">
        <div></div><div>Token</div><div>Resolves to</div><div style="text-align:right">Hex</div>
      </div>
      ${t.map(t=>{let n=e.get(t);if(!n)return``;let{hex:r,ref:i,docs:a}=n,o=_(a),s=o?` has-docs`:``;return`
          <div class="trow-chip-wrap${s}"><span class="trow-chip" style="background:${r};"></span></div>
          <div class="trow-token${s}"><div class="trow-token-name">${v(t)}</div></div>
          <div class="trow-ref${s}">${i}</div>
          <div class="trow-hex${s}">${r.slice(0,9).toUpperCase()}</div>
          ${o?`<div class="trow-doc-full"><div></div><div class="trow-doc-body">${o}</div></div>`:``}
        `}).join(``)}
    </div>
  `}function b(e,t,n,r){return`
    <table class="compare-table">
      <thead>
        <tr>
          <th>Token</th>
          ${t.map(e=>`
    <th class="mode-col">
      <div class="cmp-mode-header">
        <span class="cmp-mode-badge">${e}</span>
      </div>
    </th>
  `).join(``)}
        </tr>
      </thead>
      <tbody>${r.map(r=>`
      <tr>
        <td style="padding:0.5rem 0.875rem 0.5rem 0;border-bottom:1px solid var(--rule);">
          <span class="cmp-token-name">${r}</span>
        </td>
        ${t.map(t=>{let i=`color.modes.${t}.${n}.${r}`,a=`color.${n}.${r}`,o=e.get(i)??e.get(a);return o?`
        <td class="mode-val">
          <div class="cmp-chip-wrap">
            <span class="cmp-chip" style="background:${o.hex};"></span>
            <span class="cmp-hex">${o.hex.slice(0,9).toUpperCase()}</span>
          </div>
        </td>
      `:`<td class="mode-val"><span style="color:var(--ink-faint);font-size:0.625rem;">—</span></td>`}).join(``)}
      </tr>
    `).join(``)}</tbody>
    </table>
  `}function x(e,t,n,r){return e.get(`color.modes.${t}.${n}.${r}`)??e.get(`color.${n}.${r}`)}function S(e){let t=new Set;for(let n of e.keys()){let e=n.match(/^color\.modes\.([^.]+)\./);e&&t.add(e[1])}return t.size>0?[...t].sort():[`default`]}var C,w,T,E,D,O,k;e((()=>{t(),i(),a(),C={title:`Tokens/Color/Semantic`},w=`
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper:        #f5f2eb;
    --ink:          #1a1a18;
    --ink-mid:      #2e2e2b;
    --ink-muted:    #736e65;
    --ink-faint:    #b2ab9f;
    --rule:         rgba(46, 46, 43, 0.12);
    --rule-heavy:   rgba(46, 46, 43, 0.28);
    --accent:       #0b2d60;
    --accent-mid:   #406eb5;
    --font-mono:    'DM Mono', 'Courier New', monospace;
    --font-sans:    'Syne', system-ui, sans-serif;
  }

  body { background: var(--paper); color: var(--ink); font-family: var(--font-mono); -webkit-font-smoothing: antialiased; }

  .page { padding: 3rem 3.5rem 5rem; max-width: 1100px; }

  /* ── Breadcrumb ── */
  .breadcrumb { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 2.5rem; }
  .bc-segment { font-family: var(--font-sans); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.75rem; }
  .bc-current { color: var(--ink-muted); }

  /* ── Page title ── */
  .page-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 0; }
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
  .section-header { display: flex; align-items: baseline; gap: 1.5rem; margin-bottom: 0.625rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid var(--rule-heavy); }
  .section-label  { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title  { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count  { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-faint); margin-left: auto; }

  /* ── Category header ── */
  .cat-header { display: flex; align-items: center; gap: 0.625rem; margin: 2.25rem 0 0.875rem; }
  .cat-pip { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); flex-shrink: 0; }
  .cat-name { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-muted); }
  .cat-rule { flex: 1; height: 1px; background: var(--rule); }

  /* ── Token grid (single-mode) ── */
  .token-grid { display: grid; grid-template-columns: 44px 1fr 1fr auto; align-items: center; gap: 0 1.25rem; }
  .token-grid-header {
    grid-column: 1 / -1; display: grid; grid-template-columns: 44px 1fr 1fr auto; gap: 0 1.25rem;
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-faint); padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule-heavy);
  }
  .trow-chip-wrap { padding: 0.5rem 0; border-bottom: 1px solid var(--rule); }
  .trow-chip-wrap.has-docs { border-bottom: none; }
  .trow-chip { width: 32px; height: 32px; border-radius: 3px; border: 1px solid var(--rule-heavy); display: block; }
  .trow-token { padding: 0.6rem 0; border-bottom: 1px solid var(--rule); }
  .trow-token.has-docs { border-bottom: none; }
  .trow-token-name { font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
  .trow-doc-full { grid-column: 1 / -1; display: grid; grid-template-columns: 44px 1fr 1fr auto; gap: 0 1.25rem; border-bottom: 1px solid var(--rule); }
  .trow-token-docs { display: grid; gap: 0.28rem; padding: 0.05rem 0 0.8rem; }
  .trow-doc-summary { font-family: var(--font-sans); font-size: 0.75rem; line-height: 1.4; color: var(--ink-mid); }
  .trow-doc-meta { font-family: var(--font-sans); font-size: 0.6875rem; line-height: 1.45; color: var(--ink-muted); }
  .trow-doc-label { font-family: var(--font-sans); font-size: 0.56rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-faint); margin-right: 0.35rem; }
  .trow-ref { padding: 0.5rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.6875rem; font-style: italic; color: var(--ink-muted); display: flex; align-items: center; gap: 0.25rem; }
  .trow-ref.has-docs { border-bottom: none; }
  .trow-ref::before { content: '→'; font-style: normal; color: var(--ink-faint); font-size: 0.625rem; }
  .trow-hex { padding: 0.5rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.75rem; color: var(--ink-muted); letter-spacing: 0.04em; text-align: right; }
  .trow-hex.has-docs { border-bottom: none; }
  .trow-doc-body { grid-column: 2 / -1; }

  /* ── Multi-mode comparison table ── */
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
  .cmp-token-name { font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 500; color: var(--ink); }
  .cmp-chip-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
  .cmp-chip { width: 30px; height: 30px; border-radius: 3px; border: 1px solid var(--rule-heavy); display: block; flex-shrink: 0; }
  .cmp-hex { font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-faint); letter-spacing: 0.03em; }
  .cmp-mode-header { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; }
  .cmp-mode-badge {
    display: inline-block; font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-muted);
    border: 1px solid var(--rule-heavy); border-radius: 2px; padding: 0.125rem 0.375rem;
    background: rgba(46,46,43,0.04);
  }

  /* ── Demo surfaces ── */
  .demo-card { border-radius: 4px; overflow: hidden; border: 1px solid var(--rule); margin-top: 0.5rem; }
  .demo-layer { padding: 1.125rem 1.375rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .demo-layer-label { font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.06em; opacity: 0.55; }
  .demo-layer-desc { font-family: var(--font-sans); font-size: 0.75rem; opacity: 0.45; letter-spacing: 0.04em; }
  .demo-divider { height: 1px; }

  /* ── Text demo ── */
  .text-demo { background: #ffffff; border: 1px solid #b2ab9f; border-radius: 4px; padding: 1.75rem 2rem 1.5rem; margin-top: 0.5rem; }
  .text-demo-headline { font-family: var(--font-sans); font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem; line-height: 1.2; }
  .text-demo-body { font-family: var(--font-sans); font-size: 1rem; line-height: 1.6; margin-bottom: 0.875rem; }
  .text-demo-link { font-family: var(--font-mono); font-size: 0.875rem; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
  .text-demo-divider { height: 1px; margin: 1rem 0; }

  /* ── Border demo ── */
  .border-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem; }
  .border-demo-cell { background: var(--paper); border-radius: 4px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .border-demo-label { font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-faint); letter-spacing: 0.06em; }
  .border-demo-desc { font-family: var(--font-sans); font-size: 0.875rem; color: var(--ink-muted); font-weight: 500; }

  /* ── AllSemantic mode section ── */
  .mode-section { margin-bottom: 0; }
  .mode-section + .mode-section { margin-top: 3.5rem; padding-top: 2.5rem; border-top: 2px solid var(--rule-heavy); }
  .mode-section-title-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
  .mode-section-badge {
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: white; background: var(--ink-mid);
    border-radius: 2px; padding: 0.2rem 0.5rem;
  }
  .mode-section-name { font-family: var(--font-sans); font-size: 1.75rem; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; }
  .mode-section-rule { flex: 1; height: 1px; background: var(--rule); }
  .mode-section-index { font-family: var(--font-sans); font-size: 5rem; font-weight: 800; color: rgba(46,46,43,0.04); line-height: 1; letter-spacing: -0.05em; }

  /* ── Overview compare table ── */
  .overview-compare { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .overview-compare th { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-faint); padding: 0.5rem 0.875rem 0.5rem 0; border-bottom: 1.5px solid var(--rule-heavy); text-align: left; white-space: nowrap; }
  .overview-compare th.mode-th { text-align: center; padding: 0.5rem 0.75rem; }
  .overview-compare td { padding: 0.5rem 0.875rem 0.5rem 0; border-bottom: 1px solid var(--rule); vertical-align: middle; }
  .overview-compare td.mode-td { text-align: center; padding: 0.5rem 0.75rem; }

  @media (max-width: 700px) {
    .page { padding: 2rem 1.25rem 3rem; }
    .token-grid, .token-grid-header { grid-template-columns: 40px 1fr auto; }
    .trow-doc-full { grid-template-columns: 40px 1fr auto; }
    .trow-ref { display: none; }
    .border-demo-grid { grid-template-columns: 1fr; }
    .compare-table th.mode-col:nth-child(n+4), .compare-table td.mode-val:nth-child(n+4) { display: none; }
  }
`,T={name:`Surface`,render:c(async()=>{let{platform:e,mode:t}=n(),i=await r(e,t),a=S(i),o=a.length>1,s=``;if(o)s=`
        <div data-tabs-scope="surface-tabs">
          <div class="mode-tabs">${a.map((e,t)=>`<button class="mode-tab${t===0?` active`:``}" data-mode="${e}">${e}</button>`).join(``)}</div>
          ${a.map((e,t)=>{let n=`color.modes.${e}.`,r=[`${n}surface.base`,`${n}surface.raised`],a=x(i,e,`surface`,`base`),o=x(i,e,`surface`,`raised`),s=x(i,e,`text`,`base`),c=x(i,e,`text`,`subtle`),l=x(i,e,`border`,`subtle`);return`
          <div class="mode-panel${t===0?` active`:``}" data-mode="${e}">
            ${y(i,r)}
            <div class="demo-card" style="margin-top:1rem;">
              <div class="demo-layer" style="background:${a?.hex??`transparent`};">
                <span class="demo-layer-label" style="color:${s?.hex};">${n}surface.base</span>
                <span class="demo-layer-desc" style="color:${c?.hex};">Base — page background, modal backdrop</span>
              </div>
              <div class="demo-divider" style="background:${l?.hex};"></div>
              <div class="demo-layer" style="background:${o?.hex??`transparent`};">
                <span class="demo-layer-label" style="color:${s?.hex};">${n}surface.raised</span>
                <span class="demo-layer-desc" style="color:${c?.hex};">Raised — cards, sidebars, dropdowns</span>
              </div>
            </div>
          </div>
        `}).join(``)}
        </div>
        ${h(`Mode Comparison`)}
        ${b(i,a,`surface`,[`base`,`raised`])}
      `;else{let[e]=a,t=`color.${e===`default`?``:`modes.${e}.`}`,n=[`${t}surface.base`,`${t}surface.raised`],r=x(i,e,`surface`,`base`),o=x(i,e,`surface`,`raised`),c=x(i,e,`text`,`base`),l=x(i,e,`text`,`subtle`),u=x(i,e,`border`,`subtle`);s=`
        ${y(i,n)}
        <div class="demo-card" style="margin-top:1rem;">
          <div class="demo-layer" style="background:${r?.hex??`transparent`};">
            <span class="demo-layer-label" style="color:${c?.hex};">surface.base</span>
            <span class="demo-layer-desc" style="color:${l?.hex};">Base — page background, modal backdrop</span>
          </div>
          <div class="demo-divider" style="background:${u?.hex};"></div>
          <div class="demo-layer" style="background:${o?.hex??`transparent`};">
            <span class="demo-layer-label" style="color:${c?.hex};">surface.raised</span>
            <span class="demo-layer-desc" style="color:${l?.hex};">Raised — cards, sidebars, dropdowns</span>
          </div>
        </div>
      `}return l(`
      <style>${w}</style>
      <div class="page">
        ${p(`Cedar Tokens`,`Color`,`Semantic`,`Surface`)}
        ${m(`Semantic Colors`,`Surface`,a.length*2)}
        ${s}
      </div>
    `,f(`surface.base`,i,a))})},E={name:`Text`,render:c(async()=>{let{platform:e,mode:t}=n(),i=await r(e,t),a=S(i),o=a.length>1,s=[`base`,`subtle`,`link`,`link-hover`],c=``;if(o)c=`
        <div data-tabs-scope="text-tabs">
          <div class="mode-tabs">${a.map((e,t)=>`<button class="mode-tab${t===0?` active`:``}" data-mode="${e}">${e}</button>`).join(``)}</div>
          ${a.map((e,t)=>{let n=`color.modes.${e}.`,r=s.map(e=>`${n}text.${e}`),a=x(i,e,`text`,`base`),o=x(i,e,`text`,`subtle`),c=x(i,e,`text`,`link`),l=x(i,e,`text`,`link-hover`),u=x(i,e,`border`,`base`);return`
          <div class="mode-panel${t===0?` active`:``}" data-mode="${e}">
            ${y(i,r)}
            ${h(`Live Preview`)}
            <div class="text-demo">
              <div class="text-demo-headline" style="color:${a?.hex};">Gear up for your next adventure.</div>
              <div class="text-demo-body" style="color:${o?.hex};">From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside.</div>
              <div>
                <a class="text-demo-link" href="#" style="color:${c?.hex};">View all collections</a>
                <span style="margin-left:0.5rem;font-family:var(--font-mono);font-size:0.625rem;color:${l?.hex};letter-spacing:0.04em;">hover → ${l?.hex?.slice(0,9).toUpperCase()??``}</span>
              </div>
              <div class="text-demo-divider" style="background:${u?.hex};"></div>
              <div style="display:flex;gap:1.25rem;flex-wrap:wrap;">
                ${r.map(e=>`<div style="display:flex;align-items:center;gap:0.35rem;"><span style="width:7px;height:7px;border-radius:50%;border:1px solid var(--rule-heavy);flex-shrink:0;background:${i.get(e)?.hex};"></span><span style="font-family:var(--font-mono);font-size:0.625rem;color:var(--ink-faint);">${e}</span></div>`).join(``)}
              </div>
            </div>
          </div>
        `}).join(``)}
        </div>
        ${h(`Mode Comparison`)}
        ${b(i,a,`text`,s)}
      `;else{let[e]=a,t=`color.modes.${e}.`,n=s.map(e=>`${t}text.${e}`),r=x(i,e,`text`,`base`),o=x(i,e,`text`,`subtle`),l=x(i,e,`text`,`link`),u=x(i,e,`text`,`link-hover`),d=x(i,e,`border`,`base`);c=`
        ${y(i,n)}
        ${h(`Live Preview`)}
        <div class="text-demo">
          <div class="text-demo-headline" style="color:${r?.hex};">Gear up for your next adventure.</div>
          <div class="text-demo-body" style="color:${o?.hex};">From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside.</div>
          <div>
            <a class="text-demo-link" href="#" style="color:${l?.hex};">View all collections</a>
            <span style="margin-left:0.5rem;font-family:var(--font-mono);font-size:0.625rem;color:${u?.hex};letter-spacing:0.04em;">hover → ${u?.hex?.slice(0,9).toUpperCase()??``}</span>
          </div>
          <div class="text-demo-divider" style="background:${d?.hex};"></div>
        </div>
      `}return l(`
      <style>${w}</style>
      <div class="page">
        ${p(`Cedar Tokens`,`Color`,`Semantic`,`Text`)}
        ${m(`Semantic Colors`,`Text`,a.length*4)}
        ${c}
      </div>
    `,f(`text.base`,i,a))})},D={name:`Border`,render:c(async()=>{let{platform:e,mode:t}=n(),i=await r(e,t),a=S(i),o=a.length>1,s=[`base`,`subtle`],c=``;if(o)c=`
        <div data-tabs-scope="border-tabs">
          <div class="mode-tabs">${a.map((e,t)=>`<button class="mode-tab${t===0?` active`:``}" data-mode="${e}">${e}</button>`).join(``)}</div>
          ${a.map((e,t)=>{let n=`color.modes.${e}.`,r=s.map(e=>`${n}border.${e}`),a=x(i,e,`border`,`base`),o=x(i,e,`border`,`subtle`),c=x(i,e,`text`,`subtle`),l=x(i,e,`text`,`base`),u=x(i,e,`surface`,`raised`);return`
          <div class="mode-panel${t===0?` active`:``}" data-mode="${e}">
            ${y(i,r)}
            <div class="border-demo-grid">
              <div class="border-demo-cell" style="border:1.5px solid ${a?.hex};">
                <div class="border-demo-label">${n}border.base</div>
                <div class="border-demo-desc" style="color:${c?.hex};">Default — cards, inputs, containers</div>
                <div style="margin-top:0.75rem;height:1px;background:${a?.hex};"></div>
                <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--ink-faint);letter-spacing:0.06em;margin-top:0.25rem;">${a?.hex?.slice(0,9).toUpperCase()}</div>
              </div>
              <div class="border-demo-cell" style="border:1.5px solid ${o?.hex};">
                <div class="border-demo-label">${n}border.subtle</div>
                <div class="border-demo-desc" style="color:${c?.hex};">Subtle — dividers, section separators</div>
                <div style="margin-top:0.75rem;height:1px;background:${o?.hex};"></div>
                <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--ink-faint);letter-spacing:0.06em;margin-top:0.25rem;">${o?.hex?.slice(0,9).toUpperCase()}</div>
              </div>
            </div>
            <div style="margin-top:1rem;padding:1.25rem;background:${u?.hex};border-radius:4px;border-top:3px solid ${a?.hex};">
              <div style="font-family:var(--font-sans);font-size:0.625rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:0.375rem;">Usage note</div>
              <div style="font-family:var(--font-sans);font-size:0.75rem;color:${c?.hex};line-height:1.6;">
                Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:${l?.hex};">border.base</code> for interactive and structural boundaries.
                Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:${l?.hex};">border.subtle</code> for low-emphasis visual separators.
              </div>
            </div>
          </div>
        `}).join(``)}
        </div>
        ${h(`Mode Comparison`)}
        ${b(i,a,`border`,s)}
      `;else{let[e]=a,t=`color.modes.${e}.`,n=s.map(e=>`${t}border.${e}`),r=x(i,e,`border`,`base`),o=x(i,e,`border`,`subtle`),l=x(i,e,`text`,`subtle`),u=x(i,e,`text`,`base`),d=x(i,e,`surface`,`raised`);c=`
        ${y(i,n)}
        <div class="border-demo-grid">
          <div class="border-demo-cell" style="border:1.5px solid ${r?.hex};">
            <div class="border-demo-label">${t}border.base</div>
            <div class="border-demo-desc" style="color:${l?.hex};">Default — cards, inputs, containers</div>
          </div>
          <div class="border-demo-cell" style="border:1.5px solid ${o?.hex};">
            <div class="border-demo-label">${t}border.subtle</div>
            <div class="border-demo-desc" style="color:${l?.hex};">Subtle — dividers, section separators</div>
          </div>
        </div>
        <div style="margin-top:1rem;padding:1.25rem;background:${d?.hex};border-radius:4px;border-top:3px solid ${r?.hex};">
          <div style="font-family:var(--font-sans);font-size:0.625rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:0.375rem;">Usage note</div>
          <div style="font-family:var(--font-sans);font-size:0.75rem;color:${l?.hex};line-height:1.6;">
            Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:${u?.hex};">border.base</code> for interactive and structural boundaries.
            Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:${u?.hex};">border.subtle</code> for low-emphasis visual separators.
          </div>
        </div>
      `}return l(`
      <style>${w}</style>
      <div class="page">
        ${p(`Cedar Tokens`,`Color`,`Semantic`,`Border`)}
        ${m(`Semantic Colors`,`Border`,a.length*2)}
        ${c}
      </div>
    `,f(`border.base`,i,a))})},O={name:`All Semantic Tokens`,render:c(async()=>{let{platform:e,mode:t}=n(),i=await r(e,t),a=S(i),o=i.size,s=[{cat:`surface`,toks:[`base`,`raised`]},{cat:`text`,toks:[`base`,`subtle`,`link`,`link-hover`]},{cat:`border`,toks:[`base`,`subtle`]}].map(({cat:e,toks:t})=>{let n=a.map(e=>`<th class="mode-th" style="min-width:90px;"><span class="cmp-mode-badge">${e}</span></th>`).join(``),r=t.map(t=>`
          <tr>
            <td style="padding:0.5rem 0.875rem 0.5rem 0;border-bottom:1px solid var(--rule);white-space:nowrap;">
              <span style="font-family:var(--font-mono);font-size:0.5625rem;color:var(--ink-faint);margin-right:0.25rem;">${e} ·</span>
              <span class="cmp-token-name">${t}</span>
            </td>
            ${a.map(n=>{let r=`color.modes.${n}.${e}.${t}`,a=`color.${e}.${t}`,o=i.get(r)??i.get(a);return o?`
            <td class="mode-td">
              <div class="cmp-chip-wrap">
                <span class="cmp-chip" style="background:${o.hex};"></span>
                <span class="cmp-hex">${o.hex.slice(0,9).toUpperCase()}</span>
              </div>
            </td>
          `:`<td class="mode-td"><span style="color:var(--ink-faint);font-size:0.625rem">—</span></td>`}).join(``)}
          </tr>
        `).join(``);return`
        ${h(e)}
        <table class="overview-compare">
          <thead>
            <tr>
              <th>Token</th>
              ${n}
            </tr>
          </thead>
          <tbody>${r}</tbody>
        </table>
      `}).join(``),c=a.map((e,t)=>{let n=`color.modes.${e}.`,r=x(i,e,`surface`,`base`),a=x(i,e,`surface`,`raised`),o=x(i,e,`text`,`base`),s=x(i,e,`text`,`subtle`),c=x(i,e,`border`,`subtle`),l=[`base`,`raised`].map(e=>`${n}surface.${e}`),u=[`base`,`subtle`,`link`,`link-hover`].map(e=>`${n}text.${e}`),d=[`base`,`subtle`].map(e=>`${n}border.${e}`);return`
        <div class="mode-section">
          <div class="mode-section-title-row">
            <span class="mode-section-badge">mode</span>
            <span class="mode-section-name">${e}</span>
            <span class="mode-section-rule"></span>
            <span class="mode-section-index">${String(t+1).padStart(2,`0`)}</span>
          </div>

          ${h(`Surface`)}
          <div style="margin-top:0.5rem">${y(i,l)}</div>
          <div class="demo-card" style="margin-top:0.75rem">
            <div class="demo-layer" style="background:${r?.hex??`transparent`}">
              <span class="demo-layer-label" style="color:${o?.hex}">surface.base</span>
              <span class="demo-layer-desc" style="color:${s?.hex}">Page background</span>
            </div>
            <div class="demo-divider" style="background:${c?.hex}"></div>
            <div class="demo-layer" style="background:${a?.hex??`transparent`}">
              <span class="demo-layer-label" style="color:${o?.hex}">surface.raised</span>
              <span class="demo-layer-desc" style="color:${s?.hex}">Cards &amp; panels</span>
            </div>
          </div>

          ${h(`Text`)}
          <div style="margin-top:0.5rem">${y(i,u)}</div>

          ${h(`Border`)}
          <div style="margin-top:0.5rem">${y(i,d)}</div>
        </div>
      `}).join(``);return l(`
      <style>${w}</style>
      <div class="page">
        ${p(`Cedar Tokens`,`Color`,`Semantic`)}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Color<br>Semantic</div>
          </div>
          <div class="page-meta">
            <div class="page-meta-count">${o}</div>
            <div class="page-meta-label">${a.length} mode${a.length===1?``:`s`} · ${o} alias tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        ${m(`Cross-Mode`,`Comparison`,o)}
        ${s}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        ${m(`Per-Mode`,`Detail`,o)}
        ${c}
      </div>
    `,f(`surface.base`,i,a))})},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "Surface",
  render: asyncStory(async () => {
    const {
      platform,
      mode
    } = getPlatformModeContext();
    const tokens = await loadColorTokens(platform, mode);
    const modes = collectModes(tokens);
    const hasMultipleModes = modes.length > 1;

    // Single mode: standard list view. Multiple modes: tabbed panels + comparison table.
    let body = "";
    if (hasMultipleModes) {
      const scopeId = "surface-tabs";
      const tabs = modes.map((m, i) => \`<button class="mode-tab\${i === 0 ? " active" : ""}" data-mode="\${m}">\${m}</button>\`).join("");
      const panels = modes.map((m, i) => {
        const surfacePrefix = \`color.modes.\${m}.\`;
        const keys = [\`\${surfacePrefix}surface.base\`, \`\${surfacePrefix}surface.raised\`];
        const base = resolveToken(tokens, m, "surface", "base");
        const raised = resolveToken(tokens, m, "surface", "raised");
        const textBase = resolveToken(tokens, m, "text", "base");
        const textSubtle = resolveToken(tokens, m, "text", "subtle");
        const borderSubtle = resolveToken(tokens, m, "border", "subtle");
        return \`
          <div class="mode-panel\${i === 0 ? " active" : ""}" data-mode="\${m}">
            \${tokenGrid(tokens, keys)}
            <div class="demo-card" style="margin-top:1rem;">
              <div class="demo-layer" style="background:\${base?.hex ?? "transparent"};">
                <span class="demo-layer-label" style="color:\${textBase?.hex};">\${surfacePrefix}surface.base</span>
                <span class="demo-layer-desc" style="color:\${textSubtle?.hex};">Base — page background, modal backdrop</span>
              </div>
              <div class="demo-divider" style="background:\${borderSubtle?.hex};"></div>
              <div class="demo-layer" style="background:\${raised?.hex ?? "transparent"};">
                <span class="demo-layer-label" style="color:\${textBase?.hex};">\${surfacePrefix}surface.raised</span>
                <span class="demo-layer-desc" style="color:\${textSubtle?.hex};">Raised — cards, sidebars, dropdowns</span>
              </div>
            </div>
          </div>
        \`;
      }).join("");
      body = \`
        <div data-tabs-scope="\${scopeId}">
          <div class="mode-tabs">\${tabs}</div>
          \${panels}
        </div>
        \${catHeader("Mode Comparison")}
        \${modeCompareTable(tokens, modes, "surface", ["base", "raised"])}
      \`;
    } else {
      const [mode] = modes;
      const prefix = \`color.\${mode === "default" ? "" : \`modes.\${mode}.\`}\`;
      const keys = [\`\${prefix}surface.base\`, \`\${prefix}surface.raised\`];
      const base = resolveToken(tokens, mode, "surface", "base");
      const raised = resolveToken(tokens, mode, "surface", "raised");
      const textBase = resolveToken(tokens, mode, "text", "base");
      const textSubtle = resolveToken(tokens, mode, "text", "subtle");
      const borderSubtle = resolveToken(tokens, mode, "border", "subtle");
      body = \`
        \${tokenGrid(tokens, keys)}
        <div class="demo-card" style="margin-top:1rem;">
          <div class="demo-layer" style="background:\${base?.hex ?? "transparent"};">
            <span class="demo-layer-label" style="color:\${textBase?.hex};">surface.base</span>
            <span class="demo-layer-desc" style="color:\${textSubtle?.hex};">Base — page background, modal backdrop</span>
          </div>
          <div class="demo-divider" style="background:\${borderSubtle?.hex};"></div>
          <div class="demo-layer" style="background:\${raised?.hex ?? "transparent"};">
            <span class="demo-layer-label" style="color:\${textBase?.hex};">surface.raised</span>
            <span class="demo-layer-desc" style="color:\${textSubtle?.hex};">Raised — cards, sidebars, dropdowns</span>
          </div>
        </div>
      \`;
    }
    const page = \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Surface")}
        \${sectionHeader("Semantic Colors", "Surface", modes.length * 2)}
        \${body}
      </div>
    \`;
    return renderStoryWithPanel(page, buildSemanticPanel("surface.base", tokens, modes));
  })
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: "Text",
  render: asyncStory(async () => {
    const {
      platform,
      mode
    } = getPlatformModeContext();
    const tokens = await loadColorTokens(platform, mode);
    const modes = collectModes(tokens);
    const hasMultipleModes = modes.length > 1;
    const tokenNames = ["base", "subtle", "link", "link-hover"];
    let body = "";
    if (hasMultipleModes) {
      const scopeId = "text-tabs";
      const tabs = modes.map((m, i) => \`<button class="mode-tab\${i === 0 ? " active" : ""}" data-mode="\${m}">\${m}</button>\`).join("");
      const panels = modes.map((m, i) => {
        const p = \`color.modes.\${m}.\`;
        const keys = tokenNames.map(t => \`\${p}text.\${t}\`);
        const textBase = resolveToken(tokens, m, "text", "base");
        const textSubtle = resolveToken(tokens, m, "text", "subtle");
        const textLink = resolveToken(tokens, m, "text", "link");
        const textLinkHover = resolveToken(tokens, m, "text", "link-hover");
        const borderBase = resolveToken(tokens, m, "border", "base");
        return \`
          <div class="mode-panel\${i === 0 ? " active" : ""}" data-mode="\${m}">
            \${tokenGrid(tokens, keys)}
            \${catHeader("Live Preview")}
            <div class="text-demo">
              <div class="text-demo-headline" style="color:\${textBase?.hex};">Gear up for your next adventure.</div>
              <div class="text-demo-body" style="color:\${textSubtle?.hex};">From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside.</div>
              <div>
                <a class="text-demo-link" href="#" style="color:\${textLink?.hex};">View all collections</a>
                <span style="margin-left:0.5rem;font-family:var(--font-mono);font-size:0.625rem;color:\${textLinkHover?.hex};letter-spacing:0.04em;">hover → \${textLinkHover?.hex?.slice(0, 9).toUpperCase() ?? ""}</span>
              </div>
              <div class="text-demo-divider" style="background:\${borderBase?.hex};"></div>
              <div style="display:flex;gap:1.25rem;flex-wrap:wrap;">
                \${keys.map(key => {
          const d = tokens.get(key);
          return \`<div style="display:flex;align-items:center;gap:0.35rem;"><span style="width:7px;height:7px;border-radius:50%;border:1px solid var(--rule-heavy);flex-shrink:0;background:\${d?.hex};"></span><span style="font-family:var(--font-mono);font-size:0.625rem;color:var(--ink-faint);">\${key}</span></div>\`;
        }).join("")}
              </div>
            </div>
          </div>
        \`;
      }).join("");
      body = \`
        <div data-tabs-scope="\${scopeId}">
          <div class="mode-tabs">\${tabs}</div>
          \${panels}
        </div>
        \${catHeader("Mode Comparison")}
        \${modeCompareTable(tokens, modes, "text", tokenNames)}
      \`;
    } else {
      const [mode] = modes;
      const p = \`color.modes.\${mode}.\`;
      const keys = tokenNames.map(t => \`\${p}text.\${t}\`);
      const textBase = resolveToken(tokens, mode, "text", "base");
      const textSubtle = resolveToken(tokens, mode, "text", "subtle");
      const textLink = resolveToken(tokens, mode, "text", "link");
      const textLinkHover = resolveToken(tokens, mode, "text", "link-hover");
      const borderBase = resolveToken(tokens, mode, "border", "base");
      body = \`
        \${tokenGrid(tokens, keys)}
        \${catHeader("Live Preview")}
        <div class="text-demo">
          <div class="text-demo-headline" style="color:\${textBase?.hex};">Gear up for your next adventure.</div>
          <div class="text-demo-body" style="color:\${textSubtle?.hex};">From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside.</div>
          <div>
            <a class="text-demo-link" href="#" style="color:\${textLink?.hex};">View all collections</a>
            <span style="margin-left:0.5rem;font-family:var(--font-mono);font-size:0.625rem;color:\${textLinkHover?.hex};letter-spacing:0.04em;">hover → \${textLinkHover?.hex?.slice(0, 9).toUpperCase() ?? ""}</span>
          </div>
          <div class="text-demo-divider" style="background:\${borderBase?.hex};"></div>
        </div>
      \`;
    }
    const page = \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Text")}
        \${sectionHeader("Semantic Colors", "Text", modes.length * 4)}
        \${body}
      </div>
    \`;
    return renderStoryWithPanel(page, buildSemanticPanel("text.base", tokens, modes));
  })
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "Border",
  render: asyncStory(async () => {
    const {
      platform,
      mode
    } = getPlatformModeContext();
    const tokens = await loadColorTokens(platform, mode);
    const modes = collectModes(tokens);
    const hasMultipleModes = modes.length > 1;
    const tokenNames = ["base", "subtle"];
    let body = "";
    if (hasMultipleModes) {
      const scopeId = "border-tabs";
      const tabs = modes.map((m, i) => \`<button class="mode-tab\${i === 0 ? " active" : ""}" data-mode="\${m}">\${m}</button>\`).join("");
      const panels = modes.map((m, i) => {
        const p = \`color.modes.\${m}.\`;
        const keys = tokenNames.map(t => \`\${p}border.\${t}\`);
        const borderBase = resolveToken(tokens, m, "border", "base");
        const borderSubtle = resolveToken(tokens, m, "border", "subtle");
        const textSubtle = resolveToken(tokens, m, "text", "subtle");
        const textBase = resolveToken(tokens, m, "text", "base");
        const surfaceRaised = resolveToken(tokens, m, "surface", "raised");
        return \`
          <div class="mode-panel\${i === 0 ? " active" : ""}" data-mode="\${m}">
            \${tokenGrid(tokens, keys)}
            <div class="border-demo-grid">
              <div class="border-demo-cell" style="border:1.5px solid \${borderBase?.hex};">
                <div class="border-demo-label">\${p}border.base</div>
                <div class="border-demo-desc" style="color:\${textSubtle?.hex};">Default — cards, inputs, containers</div>
                <div style="margin-top:0.75rem;height:1px;background:\${borderBase?.hex};"></div>
                <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--ink-faint);letter-spacing:0.06em;margin-top:0.25rem;">\${borderBase?.hex?.slice(0, 9).toUpperCase()}</div>
              </div>
              <div class="border-demo-cell" style="border:1.5px solid \${borderSubtle?.hex};">
                <div class="border-demo-label">\${p}border.subtle</div>
                <div class="border-demo-desc" style="color:\${textSubtle?.hex};">Subtle — dividers, section separators</div>
                <div style="margin-top:0.75rem;height:1px;background:\${borderSubtle?.hex};"></div>
                <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--ink-faint);letter-spacing:0.06em;margin-top:0.25rem;">\${borderSubtle?.hex?.slice(0, 9).toUpperCase()}</div>
              </div>
            </div>
            <div style="margin-top:1rem;padding:1.25rem;background:\${surfaceRaised?.hex};border-radius:4px;border-top:3px solid \${borderBase?.hex};">
              <div style="font-family:var(--font-sans);font-size:0.625rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:0.375rem;">Usage note</div>
              <div style="font-family:var(--font-sans);font-size:0.75rem;color:\${textSubtle?.hex};line-height:1.6;">
                Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:\${textBase?.hex};">border.base</code> for interactive and structural boundaries.
                Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:\${textBase?.hex};">border.subtle</code> for low-emphasis visual separators.
              </div>
            </div>
          </div>
        \`;
      }).join("");
      body = \`
        <div data-tabs-scope="\${scopeId}">
          <div class="mode-tabs">\${tabs}</div>
          \${panels}
        </div>
        \${catHeader("Mode Comparison")}
        \${modeCompareTable(tokens, modes, "border", tokenNames)}
      \`;
    } else {
      const [mode] = modes;
      const p = \`color.modes.\${mode}.\`;
      const keys = tokenNames.map(t => \`\${p}border.\${t}\`);
      const borderBase = resolveToken(tokens, mode, "border", "base");
      const borderSubtle = resolveToken(tokens, mode, "border", "subtle");
      const textSubtle = resolveToken(tokens, mode, "text", "subtle");
      const textBase = resolveToken(tokens, mode, "text", "base");
      const surfaceRaised = resolveToken(tokens, mode, "surface", "raised");
      body = \`
        \${tokenGrid(tokens, keys)}
        <div class="border-demo-grid">
          <div class="border-demo-cell" style="border:1.5px solid \${borderBase?.hex};">
            <div class="border-demo-label">\${p}border.base</div>
            <div class="border-demo-desc" style="color:\${textSubtle?.hex};">Default — cards, inputs, containers</div>
          </div>
          <div class="border-demo-cell" style="border:1.5px solid \${borderSubtle?.hex};">
            <div class="border-demo-label">\${p}border.subtle</div>
            <div class="border-demo-desc" style="color:\${textSubtle?.hex};">Subtle — dividers, section separators</div>
          </div>
        </div>
        <div style="margin-top:1rem;padding:1.25rem;background:\${surfaceRaised?.hex};border-radius:4px;border-top:3px solid \${borderBase?.hex};">
          <div style="font-family:var(--font-sans);font-size:0.625rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:0.375rem;">Usage note</div>
          <div style="font-family:var(--font-sans);font-size:0.75rem;color:\${textSubtle?.hex};line-height:1.6;">
            Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:\${textBase?.hex};">border.base</code> for interactive and structural boundaries.
            Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:\${textBase?.hex};">border.subtle</code> for low-emphasis visual separators.
          </div>
        </div>
      \`;
    }
    const page = \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Border")}
        \${sectionHeader("Semantic Colors", "Border", modes.length * 2)}
        \${body}
      </div>
    \`;
    return renderStoryWithPanel(page, buildSemanticPanel("border.base", tokens, modes));
  })
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: "All Semantic Tokens",
  render: asyncStory(async () => {
    const {
      platform,
      mode
    } = getPlatformModeContext();
    const tokens = await loadColorTokens(platform, mode);
    const modes = collectModes(tokens);
    const semanticTokenCount = tokens.size;

    // ── Big comparison header table (all modes × all categories) ──────────────
    const allCategories: Array<{
      cat: string;
      toks: string[];
    }> = [{
      cat: "surface",
      toks: ["base", "raised"]
    }, {
      cat: "text",
      toks: ["base", "subtle", "link", "link-hover"]
    }, {
      cat: "border",
      toks: ["base", "subtle"]
    }];

    // Full cross-mode comparison at the top
    const fullCompareRows = allCategories.map(({
      cat,
      toks
    }) => {
      const modeHeaders = modes.map(m => \`<th class="mode-th" style="min-width:90px;"><span class="cmp-mode-badge">\${m}</span></th>\`).join("");
      const rows = toks.map(tok => {
        const modeCells = modes.map(mode => {
          const key = \`color.modes.\${mode}.\${cat}.\${tok}\`;
          const legacyKey = \`color.\${cat}.\${tok}\`;
          const data = tokens.get(key) ?? tokens.get(legacyKey);
          if (!data) return \`<td class="mode-td"><span style="color:var(--ink-faint);font-size:0.625rem">—</span></td>\`;
          return \`
            <td class="mode-td">
              <div class="cmp-chip-wrap">
                <span class="cmp-chip" style="background:\${data.hex};"></span>
                <span class="cmp-hex">\${data.hex.slice(0, 9).toUpperCase()}</span>
              </div>
            </td>
          \`;
        }).join("");
        return \`
          <tr>
            <td style="padding:0.5rem 0.875rem 0.5rem 0;border-bottom:1px solid var(--rule);white-space:nowrap;">
              <span style="font-family:var(--font-mono);font-size:0.5625rem;color:var(--ink-faint);margin-right:0.25rem;">\${cat} ·</span>
              <span class="cmp-token-name">\${tok}</span>
            </td>
            \${modeCells}
          </tr>
        \`;
      }).join("");
      return \`
        \${catHeader(cat)}
        <table class="overview-compare">
          <thead>
            <tr>
              <th>Token</th>
              \${modeHeaders}
            </tr>
          </thead>
          <tbody>\${rows}</tbody>
        </table>
      \`;
    }).join("");

    // ── Per-mode detail sections ───────────────────────────────────────────────
    const modeSections = modes.map((mode, idx) => {
      const p = \`color.modes.\${mode}.\`;
      const surfaceBase = resolveToken(tokens, mode, "surface", "base");
      const surfaceRaised = resolveToken(tokens, mode, "surface", "raised");
      const textBase = resolveToken(tokens, mode, "text", "base");
      const textSubtle = resolveToken(tokens, mode, "text", "subtle");
      const borderSubtle = resolveToken(tokens, mode, "border", "subtle");
      const surfaceKeys = ["base", "raised"].map(t => \`\${p}surface.\${t}\`);
      const textKeys = ["base", "subtle", "link", "link-hover"].map(t => \`\${p}text.\${t}\`);
      const borderKeys = ["base", "subtle"].map(t => \`\${p}border.\${t}\`);
      return \`
        <div class="mode-section">
          <div class="mode-section-title-row">
            <span class="mode-section-badge">mode</span>
            <span class="mode-section-name">\${mode}</span>
            <span class="mode-section-rule"></span>
            <span class="mode-section-index">\${String(idx + 1).padStart(2, "0")}</span>
          </div>

          \${catHeader("Surface")}
          <div style="margin-top:0.5rem">\${tokenGrid(tokens, surfaceKeys)}</div>
          <div class="demo-card" style="margin-top:0.75rem">
            <div class="demo-layer" style="background:\${surfaceBase?.hex ?? "transparent"}">
              <span class="demo-layer-label" style="color:\${textBase?.hex}">surface.base</span>
              <span class="demo-layer-desc" style="color:\${textSubtle?.hex}">Page background</span>
            </div>
            <div class="demo-divider" style="background:\${borderSubtle?.hex}"></div>
            <div class="demo-layer" style="background:\${surfaceRaised?.hex ?? "transparent"}">
              <span class="demo-layer-label" style="color:\${textBase?.hex}">surface.raised</span>
              <span class="demo-layer-desc" style="color:\${textSubtle?.hex}">Cards &amp; panels</span>
            </div>
          </div>

          \${catHeader("Text")}
          <div style="margin-top:0.5rem">\${tokenGrid(tokens, textKeys)}</div>

          \${catHeader("Border")}
          <div style="margin-top:0.5rem">\${tokenGrid(tokens, borderKeys)}</div>
        </div>
      \`;
    }).join("");
    const page = \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Semantic")}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Color<br>Semantic</div>
          </div>
          <div class="page-meta">
            <div class="page-meta-count">\${semanticTokenCount}</div>
            <div class="page-meta-label">\${modes.length} mode\${modes.length !== 1 ? "s" : ""} · \${semanticTokenCount} alias tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        \${sectionHeader("Cross-Mode", "Comparison", semanticTokenCount)}
        \${fullCompareRows}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        \${sectionHeader("Per-Mode", "Detail", semanticTokenCount)}
        \${modeSections}
      </div>
    \`;
    return renderStoryWithPanel(page, buildSemanticPanel("surface.base", tokens, modes));
  })
}`,...O.parameters?.docs?.source}}},k=[`Surface`,`Text`,`Border`,`AllSemantic`]}))();export{O as AllSemantic,D as Border,T as Surface,E as Text,k as __namedExportsOrder,C as default};