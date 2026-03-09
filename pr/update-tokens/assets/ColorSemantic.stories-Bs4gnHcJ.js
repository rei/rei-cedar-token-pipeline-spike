import{a as C}from"./load-tokens--fInEjBR.js";const R={title:"Tokens/Color/Semantic"};function L(e){e.querySelectorAll("[data-tabs-scope]").forEach(o=>{const n=o.querySelectorAll(".mode-tab"),d=o.querySelectorAll(".mode-panel");n.forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.mode;n.forEach(s=>s.classList.toggle("active",s.dataset.mode===r)),d.forEach(s=>s.classList.toggle("active",s.dataset.mode===r))})})})}function z(e){return()=>{const o=document.createElement("div");return o.style.cssText="min-height:200px;background:#f5f2eb;",o.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token data…
      </div>`,e().then(n=>{o.innerHTML=n,L(o)}).catch(n=>{const d=n instanceof Error?n.message:String(n);o.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading tokens: ${d}
          </div>`}),o}}const B=`
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
  .bc-segment { font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.625rem; }
  .bc-current { color: var(--ink-muted); }

  /* ── Page title ── */
  .page-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 0; }
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
  .section-header { display: flex; align-items: baseline; gap: 1.5rem; margin-bottom: 0.625rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid var(--rule-heavy); }
  .section-label  { font-family: var(--font-sans); font-size: 0.5rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title  { font-family: var(--font-sans); font-size: 1rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count  { font-family: var(--font-mono); font-size: 0.5625rem; color: var(--ink-faint); margin-left: auto; }

  /* ── Category header ── */
  .cat-header { display: flex; align-items: center; gap: 0.625rem; margin: 2.25rem 0 0.875rem; }
  .cat-pip { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); flex-shrink: 0; }
  .cat-name { font-family: var(--font-sans); font-size: 0.5rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-muted); }
  .cat-rule { flex: 1; height: 1px; background: var(--rule); }

  /* ── Token grid (single-mode) ── */
  .token-grid { display: grid; grid-template-columns: 44px 1fr 1fr auto; align-items: center; gap: 0 1.25rem; }
  .token-grid-header {
    grid-column: 1 / -1; display: grid; grid-template-columns: 44px 1fr 1fr auto; gap: 0 1.25rem;
    font-family: var(--font-sans); font-size: 0.5rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-faint); padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule-heavy);
  }
  .trow-chip-wrap { padding: 0.5rem 0; border-bottom: 1px solid var(--rule); }
  .trow-chip { width: 32px; height: 32px; border-radius: 3px; border: 1px solid var(--rule-heavy); display: block; }
  .trow-token { padding: 0.5rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
  .trow-ref { padding: 0.5rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.5625rem; font-style: italic; color: var(--ink-muted); display: flex; align-items: center; gap: 0.25rem; }
  .trow-ref::before { content: '→'; font-style: normal; color: var(--ink-faint); font-size: 0.5rem; }
  .trow-hex { padding: 0.5rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-muted); letter-spacing: 0.04em; text-align: right; }

  /* ── Multi-mode comparison table ── */
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
  .cmp-token-name { font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500; color: var(--ink); }
  .cmp-chip-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
  .cmp-chip { width: 30px; height: 30px; border-radius: 3px; border: 1px solid var(--rule-heavy); display: block; flex-shrink: 0; }
  .cmp-hex { font-family: var(--font-mono); font-size: 0.5rem; color: var(--ink-faint); letter-spacing: 0.03em; }
  .cmp-mode-header { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; }
  .cmp-mode-badge {
    display: inline-block; font-family: var(--font-sans); font-size: 0.4375rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-muted);
    border: 1px solid var(--rule-heavy); border-radius: 2px; padding: 0.125rem 0.375rem;
    background: rgba(46,46,43,0.04);
  }

  /* ── Demo surfaces ── */
  .demo-card { border-radius: 4px; overflow: hidden; border: 1px solid var(--rule); margin-top: 0.5rem; }
  .demo-layer { padding: 1.125rem 1.375rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .demo-layer-label { font-family: var(--font-mono); font-size: 0.5625rem; font-weight: 500; letter-spacing: 0.06em; opacity: 0.55; }
  .demo-layer-desc { font-family: var(--font-sans); font-size: 0.625rem; opacity: 0.45; letter-spacing: 0.04em; }
  .demo-divider { height: 1px; }

  /* ── Text demo ── */
  .text-demo { background: #ffffff; border: 1px solid #b2ab9f; border-radius: 4px; padding: 1.75rem 2rem 1.5rem; margin-top: 0.5rem; }
  .text-demo-headline { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem; line-height: 1.2; }
  .text-demo-body { font-family: var(--font-sans); font-size: 0.8125rem; line-height: 1.6; margin-bottom: 0.875rem; }
  .text-demo-link { font-family: var(--font-mono); font-size: 0.75rem; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
  .text-demo-divider { height: 1px; margin: 1rem 0; }

  /* ── Border demo ── */
  .border-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem; }
  .border-demo-cell { background: var(--paper); border-radius: 4px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .border-demo-label { font-family: var(--font-mono); font-size: 0.5rem; color: var(--ink-faint); letter-spacing: 0.06em; }
  .border-demo-desc { font-family: var(--font-sans); font-size: 0.75rem; color: var(--ink-muted); font-weight: 500; }

  /* ── AllSemantic mode section ── */
  .mode-section { margin-bottom: 0; }
  .mode-section + .mode-section { margin-top: 3.5rem; padding-top: 2.5rem; border-top: 2px solid var(--rule-heavy); }
  .mode-section-title-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
  .mode-section-badge {
    font-family: var(--font-sans); font-size: 0.5rem; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: white; background: var(--ink-mid);
    border-radius: 2px; padding: 0.2rem 0.5rem;
  }
  .mode-section-name { font-family: var(--font-sans); font-size: 1.5rem; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; }
  .mode-section-rule { flex: 1; height: 1px; background: var(--rule); }
  .mode-section-index { font-family: var(--font-sans); font-size: 4.5rem; font-weight: 800; color: rgba(46,46,43,0.04); line-height: 1; letter-spacing: -0.05em; }

  /* ── Overview compare table ── */
  .overview-compare { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .overview-compare th { font-family: var(--font-sans); font-size: 0.5rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-faint); padding: 0.5rem 0.875rem 0.5rem 0; border-bottom: 1.5px solid var(--rule-heavy); text-align: left; white-space: nowrap; }
  .overview-compare th.mode-th { text-align: center; padding: 0.5rem 0.75rem; }
  .overview-compare td { padding: 0.5rem 0.875rem 0.5rem 0; border-bottom: 1px solid var(--rule); vertical-align: middle; }
  .overview-compare td.mode-td { text-align: center; padding: 0.5rem 0.75rem; }

  @media (max-width: 700px) {
    .page { padding: 2rem 1.25rem 3rem; }
    .token-grid, .token-grid-header { grid-template-columns: 40px 1fr auto; }
    .trow-ref { display: none; }
    .border-demo-grid { grid-template-columns: 1fr; }
    .compare-table th.mode-col:nth-child(n+4), .compare-table td.mode-val:nth-child(n+4) { display: none; }
  }
`;function M(...e){return`
    <nav class="breadcrumb">
      ${e.map((o,n)=>{const d=n===e.length-1;return`<span class="bc-segment${d?" bc-current":""}">${o}</span>${d?"":'<span class="bc-sep">/</span>'}`}).join("")}
    </nav>
  `}function $(e,o,n){return`
    <div class="section-header">
      <span class="section-label">${e}</span>
      <span class="section-title">${o}</span>
      <span class="section-count">${n} tokens</span>
    </div>
  `}function g(e){return`<div class="cat-header"><span class="cat-pip"></span><span class="cat-name">${e}</span><span class="cat-rule"></span></div>`}function y(e,o){return`
    <div class="token-grid">
      <div class="token-grid-header">
        <div></div><div>Token</div><div>Resolves to</div><div style="text-align:right">Hex</div>
      </div>
      ${o.map(n=>{const d=e.get(n);if(!d)return"";const{hex:i,ref:r}=d;return`
          <div class="trow-chip-wrap"><span class="trow-chip" style="background:${i};"></span></div>
          <div class="trow-token">${n}</div>
          <div class="trow-ref">${r}</div>
          <div class="trow-hex">${i.slice(0,9).toUpperCase()}</div>
        `}).join("")}
    </div>
  `}function j(e,o,n,d){const i=o.map(s=>`
    <th class="mode-col">
      <div class="cmp-mode-header">
        <span class="cmp-mode-badge">${s}</span>
      </div>
    </th>
  `).join(""),r=d.map(s=>{const l=o.map(t=>{const m=`color.modes.${t}.${n}.${s}`,c=`color.${n}.${s}`,p=e.get(m)??e.get(c);return p?`
        <td class="mode-val">
          <div class="cmp-chip-wrap">
            <span class="cmp-chip" style="background:${p.hex};"></span>
            <span class="cmp-hex">${p.hex.slice(0,9).toUpperCase()}</span>
          </div>
        </td>
      `:'<td class="mode-val"><span style="color:var(--ink-faint);font-size:0.5rem;">—</span></td>'}).join("");return`
      <tr>
        <td style="padding:0.5rem 0.875rem 0.5rem 0;border-bottom:1px solid var(--rule);">
          <span class="cmp-token-name">${s}</span>
        </td>
        ${l}
      </tr>
    `}).join("");return`
    <table class="compare-table">
      <thead>
        <tr>
          <th>Token</th>
          ${i}
        </tr>
      </thead>
      <tbody>${r}</tbody>
    </table>
  `}function a(e,o,n,d){return e.get(`color.modes.${o}.${n}.${d}`)??e.get(`color.${n}.${d}`)}function H(e){const o=new Set;for(const n of e.keys()){const d=n.match(/^color\.modes\.([^.]+)\./);d&&o.add(d[1])}return o.size>0?[...o].sort():["default"]}const k={name:"Surface",render:z(async()=>{const e=await C(),o=H(e),n=o.length>1;let d="";if(n){const i="surface-tabs",r=o.map((l,t)=>`<button class="mode-tab${t===0?" active":""}" data-mode="${l}">${l}</button>`).join(""),s=o.map((l,t)=>{const m=`color.modes.${l}.`,c=[`${m}surface.base`,`${m}surface.raised`],p=a(e,l,"surface","base"),b=a(e,l,"surface","raised"),v=a(e,l,"text","base"),u=a(e,l,"text","subtle"),f=a(e,l,"border","subtle");return`
          <div class="mode-panel${t===0?" active":""}" data-mode="${l}">
            ${y(e,c)}
            <div class="demo-card" style="margin-top:1rem;">
              <div class="demo-layer" style="background:${p?.hex??"transparent"};">
                <span class="demo-layer-label" style="color:${v?.hex};">${m}surface.base</span>
                <span class="demo-layer-desc" style="color:${u?.hex};">Base — page background, modal backdrop</span>
              </div>
              <div class="demo-divider" style="background:${f?.hex};"></div>
              <div class="demo-layer" style="background:${b?.hex??"transparent"};">
                <span class="demo-layer-label" style="color:${v?.hex};">${m}surface.raised</span>
                <span class="demo-layer-desc" style="color:${u?.hex};">Raised — cards, sidebars, dropdowns</span>
              </div>
            </div>
          </div>
        `}).join("");d=`
        <div data-tabs-scope="${i}">
          <div class="mode-tabs">${r}</div>
          ${s}
        </div>
        ${g("Mode Comparison")}
        ${j(e,o,"surface",["base","raised"])}
      `}else{const[i]=o,r=`color.${i==="default"?"":`modes.${i}.`}`,s=[`${r}surface.base`,`${r}surface.raised`],l=a(e,i,"surface","base"),t=a(e,i,"surface","raised"),m=a(e,i,"text","base"),c=a(e,i,"text","subtle"),p=a(e,i,"border","subtle");d=`
        ${y(e,s)}
        <div class="demo-card" style="margin-top:1rem;">
          <div class="demo-layer" style="background:${l?.hex??"transparent"};">
            <span class="demo-layer-label" style="color:${m?.hex};">surface.base</span>
            <span class="demo-layer-desc" style="color:${c?.hex};">Base — page background, modal backdrop</span>
          </div>
          <div class="demo-divider" style="background:${p?.hex};"></div>
          <div class="demo-layer" style="background:${t?.hex??"transparent"};">
            <span class="demo-layer-label" style="color:${m?.hex};">surface.raised</span>
            <span class="demo-layer-desc" style="color:${c?.hex};">Raised — cards, sidebars, dropdowns</span>
          </div>
        </div>
      `}return`
      <style>${B}</style>
      <div class="page">
        ${M("Cedar Tokens","Color","Semantic","Surface")}
        ${$("Semantic Colors","Surface",o.length*2)}
        ${d}
      </div>
    `})},w={name:"Text",render:z(async()=>{const e=await C(),o=H(e),n=o.length>1,d=["base","subtle","link","link-hover"];let i="";if(n){const r="text-tabs",s=o.map((t,m)=>`<button class="mode-tab${m===0?" active":""}" data-mode="${t}">${t}</button>`).join(""),l=o.map((t,m)=>{const c=`color.modes.${t}.`,p=d.map(x=>`${c}text.${x}`),b=a(e,t,"text","base"),v=a(e,t,"text","subtle"),u=a(e,t,"text","link"),f=a(e,t,"text","link-hover"),h=a(e,t,"border","base");return`
          <div class="mode-panel${m===0?" active":""}" data-mode="${t}">
            ${y(e,p)}
            ${g("Live Preview")}
            <div class="text-demo">
              <div class="text-demo-headline" style="color:${b?.hex};">Gear up for your next adventure.</div>
              <div class="text-demo-body" style="color:${v?.hex};">From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside.</div>
              <div>
                <a class="text-demo-link" href="#" style="color:${u?.hex};">View all collections</a>
                <span style="margin-left:0.5rem;font-family:var(--font-mono);font-size:0.5rem;color:${f?.hex};letter-spacing:0.04em;">hover → ${f?.hex?.slice(0,9).toUpperCase()??""}</span>
              </div>
              <div class="text-demo-divider" style="background:${h?.hex};"></div>
              <div style="display:flex;gap:1.25rem;flex-wrap:wrap;">
                ${p.map(x=>`<div style="display:flex;align-items:center;gap:0.35rem;"><span style="width:7px;height:7px;border-radius:50%;border:1px solid var(--rule-heavy);flex-shrink:0;background:${e.get(x)?.hex};"></span><span style="font-family:var(--font-mono);font-size:0.5rem;color:var(--ink-faint);">${x}</span></div>`).join("")}
              </div>
            </div>
          </div>
        `}).join("");i=`
        <div data-tabs-scope="${r}">
          <div class="mode-tabs">${s}</div>
          ${l}
        </div>
        ${g("Mode Comparison")}
        ${j(e,o,"text",d)}
      `}else{const[r]=o,s=`color.modes.${r}.`,l=d.map(v=>`${s}text.${v}`),t=a(e,r,"text","base"),m=a(e,r,"text","subtle"),c=a(e,r,"text","link"),p=a(e,r,"text","link-hover"),b=a(e,r,"border","base");i=`
        ${y(e,l)}
        ${g("Live Preview")}
        <div class="text-demo">
          <div class="text-demo-headline" style="color:${t?.hex};">Gear up for your next adventure.</div>
          <div class="text-demo-body" style="color:${m?.hex};">From technical alpine climbing to casual day hikes, REI has the gear, expertise, and community to get you outside.</div>
          <div>
            <a class="text-demo-link" href="#" style="color:${c?.hex};">View all collections</a>
            <span style="margin-left:0.5rem;font-family:var(--font-mono);font-size:0.5rem;color:${p?.hex};letter-spacing:0.04em;">hover → ${p?.hex?.slice(0,9).toUpperCase()??""}</span>
          </div>
          <div class="text-demo-divider" style="background:${b?.hex};"></div>
        </div>
      `}return`
      <style>${B}</style>
      <div class="page">
        ${M("Cedar Tokens","Color","Semantic","Text")}
        ${$("Semantic Colors","Text",o.length*4)}
        ${i}
      </div>
    `})},S={name:"Border",render:z(async()=>{const e=await C(),o=H(e),n=o.length>1,d=["base","subtle"];let i="";if(n){const r="border-tabs",s=o.map((t,m)=>`<button class="mode-tab${m===0?" active":""}" data-mode="${t}">${t}</button>`).join(""),l=o.map((t,m)=>{const c=`color.modes.${t}.`,p=d.map(x=>`${c}border.${x}`),b=a(e,t,"border","base"),v=a(e,t,"border","subtle"),u=a(e,t,"text","subtle"),f=a(e,t,"text","base"),h=a(e,t,"surface","raised");return`
          <div class="mode-panel${m===0?" active":""}" data-mode="${t}">
            ${y(e,p)}
            <div class="border-demo-grid">
              <div class="border-demo-cell" style="border:1.5px solid ${b?.hex};">
                <div class="border-demo-label">${c}border.base</div>
                <div class="border-demo-desc" style="color:${u?.hex};">Default — cards, inputs, containers</div>
                <div style="margin-top:0.75rem;height:1px;background:${b?.hex};"></div>
                <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--ink-faint);letter-spacing:0.06em;margin-top:0.25rem;">${b?.hex?.slice(0,9).toUpperCase()}</div>
              </div>
              <div class="border-demo-cell" style="border:1.5px solid ${v?.hex};">
                <div class="border-demo-label">${c}border.subtle</div>
                <div class="border-demo-desc" style="color:${u?.hex};">Subtle — dividers, section separators</div>
                <div style="margin-top:0.75rem;height:1px;background:${v?.hex};"></div>
                <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--ink-faint);letter-spacing:0.06em;margin-top:0.25rem;">${v?.hex?.slice(0,9).toUpperCase()}</div>
              </div>
            </div>
            <div style="margin-top:1rem;padding:1.25rem;background:${h?.hex};border-radius:4px;border-top:3px solid ${b?.hex};">
              <div style="font-family:var(--font-sans);font-size:0.5rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:0.375rem;">Usage note</div>
              <div style="font-family:var(--font-sans);font-size:0.75rem;color:${u?.hex};line-height:1.6;">
                Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:${f?.hex};">border.base</code> for interactive and structural boundaries.
                Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:${f?.hex};">border.subtle</code> for low-emphasis visual separators.
              </div>
            </div>
          </div>
        `}).join("");i=`
        <div data-tabs-scope="${r}">
          <div class="mode-tabs">${s}</div>
          ${l}
        </div>
        ${g("Mode Comparison")}
        ${j(e,o,"border",d)}
      `}else{const[r]=o,s=`color.modes.${r}.`,l=d.map(v=>`${s}border.${v}`),t=a(e,r,"border","base"),m=a(e,r,"border","subtle"),c=a(e,r,"text","subtle"),p=a(e,r,"text","base"),b=a(e,r,"surface","raised");i=`
        ${y(e,l)}
        <div class="border-demo-grid">
          <div class="border-demo-cell" style="border:1.5px solid ${t?.hex};">
            <div class="border-demo-label">${s}border.base</div>
            <div class="border-demo-desc" style="color:${c?.hex};">Default — cards, inputs, containers</div>
          </div>
          <div class="border-demo-cell" style="border:1.5px solid ${m?.hex};">
            <div class="border-demo-label">${s}border.subtle</div>
            <div class="border-demo-desc" style="color:${c?.hex};">Subtle — dividers, section separators</div>
          </div>
        </div>
        <div style="margin-top:1rem;padding:1.25rem;background:${b?.hex};border-radius:4px;border-top:3px solid ${t?.hex};">
          <div style="font-family:var(--font-sans);font-size:0.5rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:0.375rem;">Usage note</div>
          <div style="font-family:var(--font-sans);font-size:0.75rem;color:${c?.hex};line-height:1.6;">
            Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:${p?.hex};">border.base</code> for interactive and structural boundaries.
            Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:${p?.hex};">border.subtle</code> for low-emphasis visual separators.
          </div>
        </div>
      `}return`
      <style>${B}</style>
      <div class="page">
        ${M("Cedar Tokens","Color","Semantic","Border")}
        ${$("Semantic Colors","Border",o.length*2)}
        ${i}
      </div>
    `})},T={name:"All Semantic Tokens",render:z(async()=>{const e=await C(),o=H(e),n=e.size,i=[{cat:"surface",toks:["base","raised"]},{cat:"text",toks:["base","subtle","link","link-hover"]},{cat:"border",toks:["base","subtle"]}].map(({cat:s,toks:l})=>{const t=o.map(c=>`<th class="mode-th" style="min-width:90px;"><span class="cmp-mode-badge">${c}</span></th>`).join(""),m=l.map(c=>{const p=o.map(b=>{const v=`color.modes.${b}.${s}.${c}`,u=`color.${s}.${c}`,f=e.get(v)??e.get(u);return f?`
            <td class="mode-td">
              <div class="cmp-chip-wrap">
                <span class="cmp-chip" style="background:${f.hex};"></span>
                <span class="cmp-hex">${f.hex.slice(0,9).toUpperCase()}</span>
              </div>
            </td>
          `:'<td class="mode-td"><span style="color:var(--ink-faint);font-size:0.5rem">—</span></td>'}).join("");return`
          <tr>
            <td style="padding:0.5rem 0.875rem 0.5rem 0;border-bottom:1px solid var(--rule);white-space:nowrap;">
              <span style="font-family:var(--font-mono);font-size:0.5625rem;color:var(--ink-faint);margin-right:0.25rem;">${s} ·</span>
              <span class="cmp-token-name">${c}</span>
            </td>
            ${p}
          </tr>
        `}).join("");return`
        ${g(s)}
        <table class="overview-compare">
          <thead>
            <tr>
              <th>Token</th>
              ${t}
            </tr>
          </thead>
          <tbody>${m}</tbody>
        </table>
      `}).join(""),r=o.map((s,l)=>{const t=`color.modes.${s}.`,m=a(e,s,"surface","base"),c=a(e,s,"surface","raised"),p=a(e,s,"text","base"),b=a(e,s,"text","subtle"),v=a(e,s,"border","subtle"),u=["base","raised"].map(x=>`${t}surface.${x}`),f=["base","subtle","link","link-hover"].map(x=>`${t}text.${x}`),h=["base","subtle"].map(x=>`${t}border.${x}`);return`
        <div class="mode-section">
          <div class="mode-section-title-row">
            <span class="mode-section-badge">mode</span>
            <span class="mode-section-name">${s}</span>
            <span class="mode-section-rule"></span>
            <span class="mode-section-index">${String(l+1).padStart(2,"0")}</span>
          </div>

          ${g("Surface")}
          <div style="margin-top:0.5rem">${y(e,u)}</div>
          <div class="demo-card" style="margin-top:0.75rem">
            <div class="demo-layer" style="background:${m?.hex??"transparent"}">
              <span class="demo-layer-label" style="color:${p?.hex}">surface.base</span>
              <span class="demo-layer-desc" style="color:${b?.hex}">Page background</span>
            </div>
            <div class="demo-divider" style="background:${v?.hex}"></div>
            <div class="demo-layer" style="background:${c?.hex??"transparent"}">
              <span class="demo-layer-label" style="color:${p?.hex}">surface.raised</span>
              <span class="demo-layer-desc" style="color:${b?.hex}">Cards &amp; panels</span>
            </div>
          </div>

          ${g("Text")}
          <div style="margin-top:0.5rem">${y(e,f)}</div>

          ${g("Border")}
          <div style="margin-top:0.5rem">${y(e,h)}</div>
        </div>
      `}).join("");return`
      <style>${B}</style>
      <div class="page">
        ${M("Cedar Tokens","Color","Semantic")}

        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Color<br>Semantic</div>
          </div>
          <div class="page-meta">
            <div class="page-meta-count">${n}</div>
            <div class="page-meta-label">${o.length} mode${o.length!==1?"s":""} · ${n} alias tokens</div>
          </div>
        </div>

        <div style="height:1.5px;background:var(--rule-heavy);margin:2rem 0;"></div>

        ${$("Cross-Mode","Comparison",n)}
        ${i}

        <div style="height:1.5px;background:var(--rule-heavy);margin:3.5rem 0 2.5rem;"></div>

        ${$("Per-Mode","Detail",n)}
        ${r}
      </div>
    `})};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: "Surface",
  render: asyncStory(async () => {
    const tokens = await loadColorTokens();
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
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Surface")}
        \${sectionHeader("Semantic Colors", "Surface", modes.length * 2)}
        \${body}
      </div>
    \`;
  })
}`,...k.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "Text",
  render: asyncStory(async () => {
    const tokens = await loadColorTokens();
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
                <span style="margin-left:0.5rem;font-family:var(--font-mono);font-size:0.5rem;color:\${textLinkHover?.hex};letter-spacing:0.04em;">hover → \${textLinkHover?.hex?.slice(0, 9).toUpperCase() ?? ""}</span>
              </div>
              <div class="text-demo-divider" style="background:\${borderBase?.hex};"></div>
              <div style="display:flex;gap:1.25rem;flex-wrap:wrap;">
                \${keys.map(key => {
          const d = tokens.get(key);
          return \`<div style="display:flex;align-items:center;gap:0.35rem;"><span style="width:7px;height:7px;border-radius:50%;border:1px solid var(--rule-heavy);flex-shrink:0;background:\${d?.hex};"></span><span style="font-family:var(--font-mono);font-size:0.5rem;color:var(--ink-faint);">\${key}</span></div>\`;
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
            <span style="margin-left:0.5rem;font-family:var(--font-mono);font-size:0.5rem;color:\${textLinkHover?.hex};letter-spacing:0.04em;">hover → \${textLinkHover?.hex?.slice(0, 9).toUpperCase() ?? ""}</span>
          </div>
          <div class="text-demo-divider" style="background:\${borderBase?.hex};"></div>
        </div>
      \`;
    }
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Text")}
        \${sectionHeader("Semantic Colors", "Text", modes.length * 4)}
        \${body}
      </div>
    \`;
  })
}`,...w.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "Border",
  render: asyncStory(async () => {
    const tokens = await loadColorTokens();
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
                <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--ink-faint);letter-spacing:0.06em;margin-top:0.25rem;">\${borderBase?.hex?.slice(0, 9).toUpperCase()}</div>
              </div>
              <div class="border-demo-cell" style="border:1.5px solid \${borderSubtle?.hex};">
                <div class="border-demo-label">\${p}border.subtle</div>
                <div class="border-demo-desc" style="color:\${textSubtle?.hex};">Subtle — dividers, section separators</div>
                <div style="margin-top:0.75rem;height:1px;background:\${borderSubtle?.hex};"></div>
                <div style="font-family:var(--font-mono);font-size:0.5rem;color:var(--ink-faint);letter-spacing:0.06em;margin-top:0.25rem;">\${borderSubtle?.hex?.slice(0, 9).toUpperCase()}</div>
              </div>
            </div>
            <div style="margin-top:1rem;padding:1.25rem;background:\${surfaceRaised?.hex};border-radius:4px;border-top:3px solid \${borderBase?.hex};">
              <div style="font-family:var(--font-sans);font-size:0.5rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:0.375rem;">Usage note</div>
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
          <div style="font-family:var(--font-sans);font-size:0.5rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:0.375rem;">Usage note</div>
          <div style="font-family:var(--font-sans);font-size:0.75rem;color:\${textSubtle?.hex};line-height:1.6;">
            Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:\${textBase?.hex};">border.base</code> for interactive and structural boundaries.
            Use <code style="font-family:var(--font-mono);font-size:0.6875rem;color:\${textBase?.hex};">border.subtle</code> for low-emphasis visual separators.
          </div>
        </div>
      \`;
    }
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Color", "Semantic", "Border")}
        \${sectionHeader("Semantic Colors", "Border", modes.length * 2)}
        \${body}
      </div>
    \`;
  })
}`,...S.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "All Semantic Tokens",
  render: asyncStory(async () => {
    const tokens = await loadColorTokens();
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
          if (!data) return \`<td class="mode-td"><span style="color:var(--ink-faint);font-size:0.5rem">—</span></td>\`;
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
    return \`
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
  })
}`,...T.parameters?.docs?.source}}};const P=["Surface","Text","Border","AllSemantic"];export{T as AllSemantic,S as Border,k as Surface,w as Text,P as __namedExportsOrder,R as default};
