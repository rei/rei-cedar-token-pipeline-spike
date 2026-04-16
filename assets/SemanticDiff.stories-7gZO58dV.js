import{t as e}from"./chunk-BvrOYcoh.js";function t(e){return typeof e==`object`&&!!e&&`$value`in e&&`$type`in e}function n(e){return e.trimStart().startsWith(`{`)&&e.trimEnd().endsWith(`}`)}function r(e,n,i){for(let[a,o]of Object.entries(e)){let e=n?`${n}.${a}`:a;t(o)?i.set(e,o):typeof o==`object`&&o&&r(o,e,i)}}function i(e,n,r){for(let[a,o]of Object.entries(e)){let e=n?`${n}.${a}`:a;t(o)||typeof o==`object`&&o&&(r.add(e),i(o,e,r))}}function a(e,t){let a=new Map,o=new Map;r(e,``,a),r(t,``,o);let s=new Set,c=new Set;i(e,``,s),i(t,``,c);let l=[],u=new Set([...a.keys(),...o.keys()]);for(let e of u){let t=a.get(e)??null,r=o.get(e)??null;if(t===null&&r!==null)l.push({path:e,kind:`added`,baseline:null,current:r});else if(t!==null&&r===null)l.push({path:e,kind:`removed`,baseline:t,current:null});else if(t!==null&&r!==null){if(t.$value===r.$value)continue;let i=n(t.$value),a=n(r.$value);i&&a?l.push({path:e,kind:`changed-alias`,baseline:t,current:r}):!i&&!a?l.push({path:e,kind:`changed-value`,baseline:t,current:r}):i&&!a?l.push({path:e,kind:`alias-to-value`,baseline:t,current:r}):l.push({path:e,kind:`value-to-alias`,baseline:t,current:r})}}let d=new Set([...c].filter(e=>!s.has(e))),f=new Set([...s].filter(e=>!c.has(e)));function p(e,t){let n=e.split(`.`);for(let e=1;e<n.length;e++){let r=n.slice(0,e).join(`.`);if(t.has(r))return!0}return!1}for(let e of d)p(e,d)||l.push({path:e,kind:`group-added`,baseline:null,current:null});for(let e of f)p(e,f)||l.push({path:e,kind:`group-removed`,baseline:null,current:null});return l.sort((e,t)=>e.path.localeCompare(t.path))}function o(e,t=2){let n=new Map;for(let r of e){let e=r.path.split(`.`),i=e[0]===`color`&&e[1]===`modes`?3:t,a=e.slice(0,i).join(`.`);n.has(a)||n.set(a,[]),n.get(a).push(r)}return n}var s=e((()=>{}));function c(e){return/^#[0-9a-fA-F]{3,8}$/.test(e.trim())}function l(e,t=!1){if(e===null)return`<span style="color:${v.inkFaint}">—</span>`;let n=t?`text-decoration:line-through;opacity:.55;`:``,r=e.trimStart().startsWith(`clamp(`);return`<span style="display:inline-flex;align-items:center;font-family:'DM Mono',monospace;font-size:.8rem;${n}">${c(e)?`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${e};border:1px solid ${v.chip};vertical-align:middle;margin-right:6px;flex-shrink:0"></span>`:r?`<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:linear-gradient(90deg,#b2ab9f 0%,#2e2e2b 100%);border:1px solid ${v.chip};vertical-align:middle;margin-right:6px;flex-shrink:0" title="fluid"></span>`:``}${e}</span>`}function u(e){return`<span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:.68rem;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap;${e.badge}">${e.label}</span>`}function d(e){let t=e.split(`.`),n=t.slice(-2).join(`.`),r=t.slice(0,-2).join(`.`);return r?`<span style="color:${v.inkFaint};font-size:.75rem">${r}.</span><strong>${n}</strong>`:`<strong>${n}</strong>`}function f(e){let t=y[e.kind];if(e.kind===`group-added`||e.kind===`group-removed`)return`
      <tr style="background:${t.rowBg};border-left:3px solid ${t.rowBorder}">
        <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem" colspan="3">
          ${d(e.path)}
        </td>
        <td style="padding:8px 12px">${u(t)}</td>
      </tr>`;let n=e.baseline?.$value??null,r=e.current?.$value??null;return`
    <tr style="background:${t.rowBg};border-left:3px solid ${t.rowBorder}">
      <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem">${d(e.path)}</td>
      <td style="padding:8px 12px">${l(n,e.kind===`removed`)}</td>
      <td style="padding:8px 12px">${l(r,!1)}</td>
      <td style="padding:8px 12px">${u(t)}</td>
    </tr>`}function p(e,t){let n=t.map(f).join(``),r=e.split(`.`),i;i=r[0]===`color`&&r[1]===`modes`&&r[2]?`${r[2]} <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[color mode]</span>`:r[0]===`spacing`&&r[1]===`scale`?`scale <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[fluid]</span>`:r.slice(1).join(` › `)||e;let a=`<span style="margin-left:8px;font-size:.7rem;font-family:'DM Mono',monospace;color:${v.inkFaint}">${t.length} change${t.length===1?``:`s`}</span>`;return`
    <details open style="margin-bottom:1px">
      <summary style="
        list-style:none;
        cursor:pointer;
        padding:9px 16px;
        background:${v.paper};
        border-top:1px solid ${v.rule};
        border-bottom:1px solid ${v.rule};
        font-family:'Syne',sans-serif;
        font-weight:700;
        font-size:.85rem;
        letter-spacing:.06em;
        text-transform:uppercase;
        color:${v.ink};
        display:flex;
        align-items:center;
      ">
        <span style="margin-right:6px;font-size:.7rem;color:${v.inkFaint}">▶</span>
        ${i}${a}
      </summary>
      <table style="width:100%;border-collapse:collapse;font-size:.82rem">
        <thead>
          <tr style="background:${v.paper};border-bottom:1px solid ${v.rule}">
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${v.inkFaint};width:35%">Token path</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${v.inkFaint};width:25%">Baseline</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${v.inkFaint};width:25%">Current</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${v.inkFaint};width:15%">Change</th>
          </tr>
        </thead>
        <tbody>${n}</tbody>
      </table>
    </details>`}function m(e){let t={};for(let n of e)t[n.kind]=(t[n.kind]??0)+1;let n=[];for(let e of[`added`,`removed`,`changed-value`,`changed-alias`,`alias-to-value`,`value-to-alias`,`group-added`,`group-removed`]){let r=t[e];if(!r)continue;let i=y[e];n.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;${i.badge};font-size:.75rem;font-family:'DM Mono',monospace">
        <strong>${r}</strong> ${i.label}
      </span>`)}return n.length===0?`<p style="font-family:'DM Mono',monospace;font-size:.85rem;color:${v.inkFaint};padding:16px 0">No changes detected.</p>`:`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">${n.join(``)}</div>`}function h(e,t={}){let{baselineLabel:n=`baseline`,currentLabel:r=`current`,title:i=`Token Diff`}=t,a=[...o(e).entries()].map(([e,t])=>p(e,t)).join(``),s=e.length===0;return`
  <div style="margin-bottom:32px;border-bottom:2px solid ${v.ink};padding-bottom:16px">
    <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${v.inkFaint};margin-bottom:6px">Cedar Design Tokens</div>
    <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.1">${i}</h1>
    <div style="margin-top:8px;font-size:.78rem;color:${v.inkFaint}">
      Comparing <code style="background:${v.removedBorder}22;padding:1px 5px;border-radius:3px">${n}</code>
      → <code style="background:${v.addedBorder}22;padding:1px 5px;border-radius:3px">${r}</code>
    </div>
  </div>

  ${m(e)}

  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:.72rem;font-family:'Syne',sans-serif;letter-spacing:.04em;color:${v.inkFaint}">
    <span>● Sections are expanded by default — click to collapse</span>
    <span>● Unchanged tokens are not shown</span>
  </div>

  ${s?`<p style="font-size:.9rem;color:${v.inkFaint}">Baseline and current are identical.</p>`:a}`}function g(e,t={}){return`
  <section style="
    background:${v.paper};
    color:${v.ink};
    border:1px solid ${v.rule};
    border-radius:10px;
    padding:28px 24px;
    box-sizing:border-box;
    overflow:hidden;
  ">
    ${h(e,t)}
  </section>`}function _(e,t={}){return`
${b}
<div style="
  background:${v.paper};
  color:${v.ink};
  font-family:'DM Mono',monospace;
  min-height:100vh;
  padding:40px 32px;
  box-sizing:border-box;
">
  ${h(e,t)}
</div>`}var v,y,b,x=e((()=>{s(),v={paper:`#f5f2eb`,ink:`#2e2e2b`,inkFaint:`#736e65`,rule:`#ccc9c1`,added:`#d4edda`,addedBorder:`#3b8349`,removed:`#f8d7da`,removedBorder:`#be342d`,changed:`#fff3cd`,changedBorder:`#c8a020`,structural:`#e8e4f8`,structuralBorder:`#5a4fcf`,chip:`#00000018`},y={added:{label:`Added`,badge:`background:${v.addedBorder};color:#fff`,rowBg:v.added,rowBorder:v.addedBorder},removed:{label:`Removed`,badge:`background:${v.removedBorder};color:#fff`,rowBg:v.removed,rowBorder:v.removedBorder},"changed-value":{label:`Value changed`,badge:`background:${v.changedBorder};color:#fff`,rowBg:v.changed,rowBorder:v.changedBorder},"changed-alias":{label:`Alias retargeted`,badge:`background:${v.changedBorder};color:#fff`,rowBg:v.changed,rowBorder:v.changedBorder},"alias-to-value":{label:`Alias → Value`,badge:`background:${v.structuralBorder};color:#fff`,rowBg:v.structural,rowBorder:v.structuralBorder},"value-to-alias":{label:`Value → Alias`,badge:`background:${v.structuralBorder};color:#fff`,rowBg:v.structural,rowBorder:v.structuralBorder},"group-added":{label:`Group added`,badge:`background:${v.addedBorder};color:#fff`,rowBg:v.added,rowBorder:v.addedBorder},"group-removed":{label:`Group removed`,badge:`background:${v.removedBorder};color:#fff`,rowBg:v.removed,rowBorder:v.removedBorder}},b=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`}));function S(){return window.location.pathname.replace(/\/[^/]*$/,`/`)}function C(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function w(e){if(e.label&&e.slot===`current`){let t=new Date(e.label);if(!Number.isNaN(t.getTime()))return t.toLocaleString(void 0,{year:`numeric`,month:`short`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`,second:`2-digit`})}let t=new Date(e.createdAt),n=Number.isNaN(t.getTime())?e.createdAt:t.toLocaleString(void 0,{year:`numeric`,month:`short`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`,second:`2-digit`});return e.slot===`current`?n:`${n} (${e.slot})`}function T(e,t,n={}){return`${n.allowBlank?`<option value="">No comparison</option>`:``}${e.map(e=>{let n=e.id===t?` selected`:``;return`<option value="${C(e.id)}"${n}>${C(w(e))}</option>`}).join(``)}`}async function E(e){let t=await fetch(`${S()}${e}`);if(!t.ok)throw Error(`${e}: ${t.status} ${t.statusText}`);return await t.json()}function D(e){return()=>{let t=document.createElement(`div`);return t.style.cssText=`min-height:200px`,t.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading token diff…
      </div>`,e().then(e=>{t.innerHTML=e}).catch(e=>{t.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d">
            Error loading diff: ${e instanceof Error?e.message:String(e)}
          </div>`}),t}}function O(e,t,n){let r=e.slice(0,12).map(e=>`
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'DM Mono',monospace;font-size:.8rem">${C(w(e))}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'Syne',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#736e65">${C(e.slot)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'DM Mono',monospace;font-size:.72rem;color:#736e65">${C(e.id)}</td>
        </tr>`).join(``);return`
${A}
<div style="background:#f5f2eb;color:#2e2e2b;font-family:'DM Mono',monospace;min-height:100vh;padding:40px 32px;box-sizing:border-box;">
  <div style="max-width:1320px;margin:0 auto;display:grid;gap:24px;">
    <section style="background:#fbf9f4;border:1px solid #ccc9c1;border-radius:10px;padding:24px;display:grid;gap:18px;">
      <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-end;flex-wrap:wrap;">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;margin-bottom:6px;">Cedar Design Tokens</div>
          <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.05;">Snapshot Compare</h1>
          <p style="margin:10px 0 0;font-size:.92rem;line-height:1.6;color:#736e65;max-width:760px;">Pick one base snapshot and compare it against up to three archived snapshots. Each PR run adds timestamped entries to the snapshot archive.</p>
        </div>
        <div style="font-family:'DM Mono',monospace;font-size:.8rem;color:#736e65;">${e.length} archived snapshot${e.length===1?``:`s`}</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:14px;">
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Base snapshot</span>
          <select data-base-select style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${T(e,t)}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 1</span>
          <select data-compare-select="0" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${T(e,n[0]??``,{allowBlank:!0})}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 2</span>
          <select data-compare-select="1" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${T(e,n[1]??``,{allowBlank:!0})}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 3</span>
          <select data-compare-select="2" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${T(e,n[2]??``,{allowBlank:!0})}
          </select>
        </label>
      </div>

      <div data-compare-status style="font-size:.82rem;color:#736e65;"></div>
    </section>

    <section style="background:#fbf9f4;border:1px solid #ccc9c1;border-radius:10px;padding:20px;overflow:auto;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:10px;">
        <h2 style="margin:0;font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2e2e2b;">Stored snapshots</h2>
        <div style="font-size:.75rem;color:#736e65;">Newest first</div>
      </div>
      <table style="width:100%;border-collapse:collapse;min-width:720px;">
        <thead>
          <tr>
            <th style="padding:0 10px 8px 10px;text-align:left;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;border-bottom:1px solid #b2ab9f;">Timestamp</th>
            <th style="padding:0 10px 8px 10px;text-align:left;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;border-bottom:1px solid #b2ab9f;">Slot</th>
            <th style="padding:0 10px 8px 10px;text-align:left;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;border-bottom:1px solid #b2ab9f;">Id</th>
          </tr>
        </thead>
        <tbody>${r}</tbody>
      </table>
    </section>

    <div data-compare-results style="display:grid;gap:20px;"></div>
  </div>
</div>`}var k,A,j,M,N,P,F,I;e((()=>{s(),x(),k={title:`Cedar Tokens / Semantic Diff`,render:()=>``},A=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`,j=`
<div style="
  background:#f5f2eb;color:#2e2e2b;font-family:'DM Mono',monospace;
  min-height:100vh;padding:40px 32px;box-sizing:border-box
">
  <div style="max-width:560px">
    <div style="font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      color:#736e65;margin-bottom:6px;font-family:'Syne',sans-serif">
      Cedar Design Tokens — Token Diff
    </div>
    <h1 style="margin:0 0 24px;font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;
      letter-spacing:-.02em;border-bottom:2px solid #2e2e2b;padding-bottom:12px">
      Snapshot files not found
    </h1>
    <p style="line-height:1.6;margin:0 0 16px">
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/baseline.json</code>,
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/current.json</code>
      and/or
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">canonical/snapshots/index.json</code>
      could not be fetched. The files must exist before the story can load.
    </p>
    <p style="font-size:.8rem;color:#736e65;margin:0 0 20px;line-height:1.6">
      To generate snapshot files, run the token normalization and snapshot commands:
    </p>
    <div style="background:#2e2e2b;color:#edeae3;border-radius:6px;padding:16px 20px;
      font-size:.82rem;line-height:1.8">
      <div style="color:#736e65;margin-bottom:4px;font-size:.7rem;
        letter-spacing:.08em;text-transform:uppercase">Generate snapshots</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:normalize</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:snapshot baseline</div>
      <div style="color:#736e65;margin:4px 0"># make changes to tokens, then:</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:snapshot current</div>
      <div style="color:#736e65;margin:4px 0"># restart Storybook to pick up the new files:</div>
      <div><span style="color:#3b8349">$</span> pnpm storybook</div>
    </div>
  </div>
</div>`,M={name:`No Changes`,render:D(async()=>{let e=window.location.pathname.replace(/\/[^/]*$/,`/`),t=await fetch(`${e}normalized/baseline.json`);if(t.status===404)return j;if(!t.ok)throw Error(`baseline.json: ${t.status} ${t.statusText}`);let n=await t.json();return _(a(n,n),{baselineLabel:`v1.0.0`,currentLabel:`v1.0.0`})})},N={name:`Live Diff (fetched)`,render:D(async()=>{let e=S(),[t,n]=await Promise.all([fetch(`${e}normalized/baseline.json`),fetch(`${e}normalized/current.json`)]);if(t.status===404||n.status===404)return j;if(!t.ok)throw Error(`baseline.json: ${t.status} ${t.statusText}`);if(!n.ok)throw Error(`current.json: ${n.status} ${n.statusText}`);return _(a(await t.json(),await n.json()),{baselineLabel:`baseline.json`,currentLabel:`current.json`})})},P={name:`Snapshot Compare`,render:()=>{let e=document.createElement(`div`);return e.style.cssText=`min-height:200px;background:#f5f2eb;`,e.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading snapshot archive…
      </div>`,(async()=>{try{let t=await E(`canonical/snapshots/index.json`);if(t.length<2){e.innerHTML=j;return}e.innerHTML=O(t,t[0]?.id??``,t.slice(1,4).map(e=>e.id));let n=e,r=n.querySelector(`[data-base-select]`),i=[...n.querySelectorAll(`[data-compare-select]`)],o=n.querySelector(`[data-compare-status]`),s=n.querySelector(`[data-compare-results]`);if(!r||i.length===0||!o||!s)throw Error(`Snapshot comparison controls failed to render.`);let c=new Map(t.map(e=>[e.id,e])),l=new Map,u=e=>{if(!l.has(e)){let t=c.get(e);if(!t)throw Error(`Unknown snapshot id: ${e}`);l.set(e,E(`canonical/${t.file}`))}return l.get(e)},d=async()=>{let e=r.value,t=[];for(let n of i){let r=n.value;if(!(!r||r===e||t.includes(r))&&(t.push(r),t.length===3))break}if(!e){o.innerHTML=`Choose a base snapshot to start comparing.`,s.innerHTML=``;return}if(t.length===0){o.innerHTML=`Pick at least one comparison snapshot. Duplicate selections and the base snapshot are ignored.`,s.innerHTML=``;return}o.innerHTML=`Comparing <strong>${t.length}</strong> snapshot${t.length===1?``:`s`} against the selected base.`,s.innerHTML=`<div style="padding:20px 0;color:#736e65;font-family:'DM Mono',monospace;">Computing diffs…</div>`;let n=await u(e),l=c.get(e);s.innerHTML=(await Promise.all(t.map(async(e,t)=>{let r=await u(e),i=c.get(e);return g(a(n,r),{title:`Comparison ${t+1}`,baselineLabel:w(l),currentLabel:w(i)})}))).join(``)};r.addEventListener(`change`,()=>{d()}),i.forEach(e=>{e.addEventListener(`change`,()=>{d()})}),await d()}catch(t){e.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d;background:#f5f2eb;">
            Error loading snapshot archive: ${C(t instanceof Error?t.message:String(t))}
          </div>`}})(),e}},F={name:`All Diff Cases`,render:()=>_(a({color:{modes:{default:{text:{link:{$value:`{color.neutral-palette.blue.600}`,$type:`color`},heading:{$value:`{color.neutral-palette.warm-grey.900}`,$type:`color`},inverse:{$value:`{color.neutral-palette.warm-grey.50}`,$type:`color`}},surface:{base:{$value:`#f5f2eb`,$type:`color`},overlay:{$value:`#2e2e2b33`,$type:`color`}}}},"neutral-palette":{"warm-grey":{100:{$value:`#edeae3`,$type:`color`},50:{$value:`#f5f2eb`,$type:`color`}}}},spacing:{scale:{"-50":{$value:`clamp(4px, 0.3571vw + 2.857px, 8px)`,$type:`spacing`},0:{$value:`clamp(8px, 0.7143vw + 5.714px, 16px)`,$type:`spacing`}},component:{"button-padding-x":{$value:`16px`,$type:`spacing`}}},legacy:{"icon-size":{$value:`20px`,$type:`sizing`},"icon-size-lg":{$value:`28px`,$type:`sizing`}}},{color:{modes:{default:{text:{link:{$value:`{color.neutral-palette.blue.700}`,$type:`color`},heading:{$value:`#1a1a18`,$type:`color`},muted:{$value:`{color.neutral-palette.warm-grey.500}`,$type:`color`}},surface:{base:{$value:`#f8f6f0`,$type:`color`},overlay:{$value:`{color.neutral-palette.warm-grey.900}`,$type:`color`}}}},"neutral-palette":{"warm-grey":{100:{$value:`#e8e4dc`,$type:`color`},50:{$value:`#f5f2eb`,$type:`color`}}}},spacing:{scale:{"-50":{$value:`clamp(2px, 0.2232vw + 1.786px, 6px)`,$type:`spacing`},0:{$value:`clamp(8px, 0.7143vw + 5.714px, 16px)`,$type:`spacing`}},component:{},layout:{"content-max-width":{$value:`1280px`,$type:`sizing`},"sidebar-width":{$value:`280px`,$type:`sizing`}}}}),{baselineLabel:`v2.0.0 (synthetic)`,currentLabel:`v2.1.0 (synthetic)`})},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: "No Changes",
  render: asyncStory(async () => {
    const base = window.location.pathname.replace(/\\/[^/]*$/, "/");
    const res = await fetch(\`\${base}normalized/baseline.json\`);
    if (res.status === 404) {
      return NOT_FOUND_HTML;
    }
    if (!res.ok) throw new Error(\`baseline.json: \${res.status} \${res.statusText}\`);
    const baseline = (await res.json()) as Record<string, unknown>;
    // Compare baseline with itself (no changes)
    const entries = computeDiff(baseline, baseline);
    return renderDiffPage(entries, {
      baselineLabel: "v1.0.0",
      currentLabel: "v1.0.0"
    });
  })
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: "Live Diff (fetched)",
  render: asyncStory(async () => {
    const base = storyBase();
    const [baseRes, currRes] = await Promise.all([fetch(\`\${base}normalized/baseline.json\`), fetch(\`\${base}normalized/current.json\`)]);
    if (baseRes.status === 404 || currRes.status === 404) {
      return NOT_FOUND_HTML;
    }
    if (!baseRes.ok) throw new Error(\`baseline.json: \${baseRes.status} \${baseRes.statusText}\`);
    if (!currRes.ok) throw new Error(\`current.json: \${currRes.status} \${currRes.statusText}\`);
    const baseline = (await baseRes.json()) as Record<string, unknown>;
    const current = (await currRes.json()) as Record<string, unknown>;
    const entries = computeDiff(baseline, current);
    return renderDiffPage(entries, {
      baselineLabel: "baseline.json",
      currentLabel: "current.json"
    });
  })
}`,...N.parameters?.docs?.source},description:{story:`Fetches both JSON snapshots from the static server at runtime.
This story displays **all token changes** across all categories:
- Primitive token values (hex colors, sizing, etc.)
- Semantic token aliases (text, surface, border, etc.)
- Spacing and other sections
- Structural changes (added/removed groups)

The diff includes 8 kinds of changes:
- added, removed (token-level)
- changed-value, changed-alias (token modifications)
- alias-to-value, value-to-alias (structural type changes)
- group-added, group-removed (section-level changes)`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: "Snapshot Compare",
  render: () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px;background:#f5f2eb;";
    container.innerHTML = \`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading snapshot archive…
      </div>\`;
    void (async () => {
      try {
        const manifest = await fetchJson<SnapshotManifestEntry[]>("canonical/snapshots/index.json");
        if (manifest.length < 2) {
          container.innerHTML = NOT_FOUND_HTML;
          return;
        }
        const baseId = manifest[0]?.id ?? "";
        const compareIds = manifest.slice(1, 4).map(entry => entry.id);
        container.innerHTML = renderSnapshotCompareShell(manifest, baseId, compareIds);
        const root = container;
        const baseSelect = root.querySelector<HTMLSelectElement>("[data-base-select]");
        const compareSelects = [...root.querySelectorAll<HTMLSelectElement>("[data-compare-select]")];
        const statusEl = root.querySelector<HTMLElement>("[data-compare-status]");
        const resultsEl = root.querySelector<HTMLElement>("[data-compare-results]");
        if (!baseSelect || compareSelects.length === 0 || !statusEl || !resultsEl) {
          throw new Error("Snapshot comparison controls failed to render.");
        }
        const manifestById = new Map(manifest.map(entry => [entry.id, entry]));
        const cache = new Map<string, Promise<Record<string, unknown>>>();
        const loadSnapshot = (id: string): Promise<Record<string, unknown>> => {
          if (!cache.has(id)) {
            const entry = manifestById.get(id);
            if (!entry) throw new Error(\`Unknown snapshot id: \${id}\`);
            cache.set(id, fetchJson<Record<string, unknown>>(\`canonical/\${entry.file}\`));
          }
          return cache.get(id)!;
        };
        const renderComparisons = async (): Promise<void> => {
          const selectedBase = baseSelect.value;
          const selectedTargets: string[] = [];
          for (const select of compareSelects) {
            const id = select.value;
            if (!id || id === selectedBase || selectedTargets.includes(id)) continue;
            selectedTargets.push(id);
            if (selectedTargets.length === 3) break;
          }
          if (!selectedBase) {
            statusEl.innerHTML = "Choose a base snapshot to start comparing.";
            resultsEl.innerHTML = "";
            return;
          }
          if (selectedTargets.length === 0) {
            statusEl.innerHTML = "Pick at least one comparison snapshot. Duplicate selections and the base snapshot are ignored.";
            resultsEl.innerHTML = "";
            return;
          }
          statusEl.innerHTML = \`Comparing <strong>\${selectedTargets.length}</strong> snapshot\${selectedTargets.length === 1 ? "" : "s"} against the selected base.\`;
          resultsEl.innerHTML = \`<div style="padding:20px 0;color:#736e65;font-family:'DM Mono',monospace;">Computing diffs…</div>\`;
          const baseTree = await loadSnapshot(selectedBase);
          const baseEntry = manifestById.get(selectedBase)!;
          const panels = await Promise.all(selectedTargets.map(async (targetId, index) => {
            const targetTree = await loadSnapshot(targetId);
            const targetEntry = manifestById.get(targetId)!;
            const entries = computeDiff(baseTree, targetTree);
            return renderDiffPanel(entries, {
              title: \`Comparison \${index + 1}\`,
              baselineLabel: formatSnapshotLabel(baseEntry),
              currentLabel: formatSnapshotLabel(targetEntry)
            });
          }));
          resultsEl.innerHTML = panels.join("");
        };
        baseSelect.addEventListener("change", () => {
          void renderComparisons();
        });
        compareSelects.forEach(select => {
          select.addEventListener("change", () => {
            void renderComparisons();
          });
        });
        await renderComparisons();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = \`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d;background:#f5f2eb;">
            Error loading snapshot archive: \${escapeHtml(msg)}
          </div>\`;
      }
    })();
    return container;
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: "All Diff Cases",
  render: () => {
    // ── Synthetic baseline token tree ────────────────────────────────────────
    //
    // Organised so that:
    //   • color.modes.default.*  → semantic color aliases (depth-3 section)
    //   • color.neutral-palette.* → primitive hex colors (depth-2 section)
    //   • spacing.scale.*        → fluid clamp() values  (depth-2 section)
    //   • spacing.component.*    → raw px values          (depth-2 section)
    //   • legacy.*               → entire group to be removed
    //
    const baseline: Record<string, unknown> = {
      color: {
        modes: {
          default: {
            text: {
              // changed-alias: alias target will change
              link: {
                $value: "{color.neutral-palette.blue.600}",
                $type: "color"
              },
              // alias-to-value: was alias, becomes raw hex
              heading: {
                $value: "{color.neutral-palette.warm-grey.900}",
                $type: "color"
              },
              // removed: will disappear in current
              inverse: {
                $value: "{color.neutral-palette.warm-grey.50}",
                $type: "color"
              }
            },
            surface: {
              // changed-value: hex will change to a different hex
              base: {
                $value: "#f5f2eb",
                $type: "color"
              },
              // value-to-alias: was raw hex, becomes alias
              overlay: {
                $value: "#2e2e2b33",
                $type: "color"
              }
            }
          }
        },
        "neutral-palette": {
          "warm-grey": {
            // changed-value: hex lightness shift
            "100": {
              $value: "#edeae3",
              $type: "color"
            },
            // unchanged — should not appear in diff
            "50": {
              $value: "#f5f2eb",
              $type: "color"
            }
          }
        }
      },
      spacing: {
        scale: {
          // changed-value: fluid clamp expression will change
          "-50": {
            $value: "clamp(4px, 0.3571vw + 2.857px, 8px)",
            $type: "spacing"
          },
          // unchanged
          "0": {
            $value: "clamp(8px, 0.7143vw + 5.714px, 16px)",
            $type: "spacing"
          }
        },
        component: {
          // removed: will disappear in current
          "button-padding-x": {
            $value: "16px",
            $type: "spacing"
          }
        }
      },
      // group-removed: this entire subtree is absent in current
      legacy: {
        "icon-size": {
          $value: "20px",
          $type: "sizing"
        },
        "icon-size-lg": {
          $value: "28px",
          $type: "sizing"
        }
      }
    };

    // ── Synthetic current token tree ─────────────────────────────────────────
    const current: Record<string, unknown> = {
      color: {
        modes: {
          default: {
            text: {
              // changed-alias: target changed from blue.600 → blue.700
              link: {
                $value: "{color.neutral-palette.blue.700}",
                $type: "color"
              },
              // alias-to-value: now a raw hex instead of alias
              heading: {
                $value: "#1a1a18",
                $type: "color"
              },
              // added: brand-new token in current
              muted: {
                $value: "{color.neutral-palette.warm-grey.500}",
                $type: "color"
              }
              // (inverse is gone → removed)
            },
            surface: {
              // changed-value: hex changed
              base: {
                $value: "#f8f6f0",
                $type: "color"
              },
              // value-to-alias: now an alias
              overlay: {
                $value: "{color.neutral-palette.warm-grey.900}",
                $type: "color"
              }
            }
          }
        },
        "neutral-palette": {
          "warm-grey": {
            // changed-value
            "100": {
              $value: "#e8e4dc",
              $type: "color"
            },
            // unchanged
            "50": {
              $value: "#f5f2eb",
              $type: "color"
            }
          }
        }
      },
      spacing: {
        scale: {
          // changed-value: fluid expression tightened
          "-50": {
            $value: "clamp(2px, 0.2232vw + 1.786px, 6px)",
            $type: "spacing"
          },
          // unchanged
          "0": {
            $value: "clamp(8px, 0.7143vw + 5.714px, 16px)",
            $type: "spacing"
          }
        },
        component: {
          // (button-padding-x removed)
        },
        // group-added: entirely new subtree
        layout: {
          "content-max-width": {
            $value: "1280px",
            $type: "sizing"
          },
          "sidebar-width": {
            $value: "280px",
            $type: "sizing"
          }
        }
      }
      // (legacy group is gone → group-removed)
    };
    const entries = computeDiff(baseline, current);
    return renderDiffPage(entries, {
      baselineLabel: "v2.0.0 (synthetic)",
      currentLabel: "v2.1.0 (synthetic)"
    });
  }
}`,...F.parameters?.docs?.source},description:{story:`Purely static story using hardcoded synthetic token trees.
Demonstrates every possible DiffKind side-by-side so the diff UI can be
reviewed without needing real snapshot files.

Covered kinds (all 8):
  added          — token exists only in current
  removed        — token exists only in baseline
  changed-value  — primitive hex or fluid value changed
  changed-alias  — alias target reference changed
  alias-to-value — was an alias, now a raw value
  value-to-alias — was a raw value, now an alias
  group-added    — entire subtree is new in current
  group-removed  — entire subtree gone from current

Value types covered:
  hex colors (#RRGGBB / #RRGGBBAA)
  fluid spacing clamp() values
  alias references {path.to.token}`,...F.parameters?.docs?.description}}},I=[`NoChanges`,`LiveDiff`,`SnapshotCompare`,`AllDiffCases`]}))();export{F as AllDiffCases,N as LiveDiff,M as NoChanges,P as SnapshotCompare,I as __namedExportsOrder,k as default};