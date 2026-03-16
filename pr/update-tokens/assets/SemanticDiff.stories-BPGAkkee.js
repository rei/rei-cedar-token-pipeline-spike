function F(e){return typeof e=="object"&&e!==null&&"$value"in e&&"$type"in e}function E(e){return e.trimStart().startsWith("{")&&e.trimEnd().endsWith("}")}function T(e,n,t){for(const[s,a]of Object.entries(e)){const i=n?`${n}.${s}`:s;F(a)?t.set(i,a):typeof a=="object"&&a!==null&&T(a,i,t)}}function B(e,n,t){for(const[s,a]of Object.entries(e)){const i=n?`${n}.${s}`:s;F(a)||typeof a=="object"&&a!==null&&(t.add(i),B(a,i,t))}}function z(e,n){const t=new Map,s=new Map;T(e,"",t),T(n,"",s);const a=new Set,i=new Set;B(e,"",a),B(n,"",i);const c=[],u=new Set([...t.keys(),...s.keys()]);for(const l of u){const d=t.get(l)??null,r=s.get(l)??null;if(d===null&&r!==null)c.push({path:l,kind:"added",baseline:null,current:r});else if(d!==null&&r===null)c.push({path:l,kind:"removed",baseline:d,current:null});else if(d!==null&&r!==null){if(d.$value===r.$value)continue;const p=E(d.$value),m=E(r.$value);p&&m?c.push({path:l,kind:"changed-alias",baseline:d,current:r}):!p&&!m?c.push({path:l,kind:"changed-value",baseline:d,current:r}):p&&!m?c.push({path:l,kind:"alias-to-value",baseline:d,current:r}):c.push({path:l,kind:"value-to-alias",baseline:d,current:r})}}const f=new Set([...i].filter(l=>!a.has(l))),g=new Set([...a].filter(l=>!i.has(l)));function h(l,d){const r=l.split(".");for(let p=1;p<r.length;p++){const m=r.slice(0,p).join(".");if(d.has(m))return!0}return!1}for(const l of f)h(l,f)||c.push({path:l,kind:"group-added",baseline:null,current:null});for(const l of g)h(l,g)||c.push({path:l,kind:"group-removed",baseline:null,current:null});return c.sort((l,d)=>l.path.localeCompare(d.path))}function V(e,n=2){const t=new Map;for(const s of e){const a=s.path.split("."),i=a[0]==="color"&&a[1]==="modes"?3:n,c=a.slice(0,i).join(".");t.has(c)||t.set(c,[]),t.get(c).push(s)}return t}const o={paper:"#f5f2eb",ink:"#2e2e2b",inkFaint:"#736e65",rule:"#ccc9c1",added:"#d4edda",addedBorder:"#3b8349",removed:"#f8d7da",removedBorder:"#be342d",changed:"#fff3cd",changedBorder:"#c8a020",structural:"#e8e4f8",structuralBorder:"#5a4fcf",chip:"#00000018"},N={added:{label:"Added",badge:`background:${o.addedBorder};color:#fff`,rowBg:o.added,rowBorder:o.addedBorder},removed:{label:"Removed",badge:`background:${o.removedBorder};color:#fff`,rowBg:o.removed,rowBorder:o.removedBorder},"changed-value":{label:"Value changed",badge:`background:${o.changedBorder};color:#fff`,rowBg:o.changed,rowBorder:o.changedBorder},"changed-alias":{label:"Alias retargeted",badge:`background:${o.changedBorder};color:#fff`,rowBg:o.changed,rowBorder:o.changedBorder},"alias-to-value":{label:"Alias → Value",badge:`background:${o.structuralBorder};color:#fff`,rowBg:o.structural,rowBorder:o.structuralBorder},"value-to-alias":{label:"Value → Alias",badge:`background:${o.structuralBorder};color:#fff`,rowBg:o.structural,rowBorder:o.structuralBorder},"group-added":{label:"Group added",badge:`background:${o.addedBorder};color:#fff`,rowBg:o.added,rowBorder:o.addedBorder},"group-removed":{label:"Group removed",badge:`background:${o.removedBorder};color:#fff`,rowBg:o.removed,rowBorder:o.removedBorder}};function J(e){return/^#[0-9a-fA-F]{3,8}$/.test(e.trim())}function j(e,n=!1){if(e===null)return`<span style="color:${o.inkFaint}">—</span>`;const t=n?"text-decoration:line-through;opacity:.55;":"",s=e.trimStart().startsWith("clamp("),a=J(e)?`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${e};border:1px solid ${o.chip};vertical-align:middle;margin-right:6px;flex-shrink:0"></span>`:s?`<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:linear-gradient(90deg,#b2ab9f 0%,#2e2e2b 100%);border:1px solid ${o.chip};vertical-align:middle;margin-right:6px;flex-shrink:0" title="fluid"></span>`:"";return`<span style="display:inline-flex;align-items:center;font-family:'DM Mono',monospace;font-size:.8rem;${t}">${a}${e}</span>`}function C(e){return`<span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:.68rem;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap;${e.badge}">${e.label}</span>`}function H(e){const n=e.split("."),t=n.slice(-2).join("."),s=n.slice(0,-2).join(".");return s?`<span style="color:${o.inkFaint};font-size:.75rem">${s}.</span><strong>${t}</strong>`:`<strong>${t}</strong>`}function K(e){const n=N[e.kind];if(e.kind==="group-added"||e.kind==="group-removed")return`
      <tr style="background:${n.rowBg};border-left:3px solid ${n.rowBorder}">
        <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem" colspan="3">
          ${H(e.path)}
        </td>
        <td style="padding:8px 12px">${C(n)}</td>
      </tr>`;const s=e.baseline?.$value??null,a=e.current?.$value??null;return`
    <tr style="background:${n.rowBg};border-left:3px solid ${n.rowBorder}">
      <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem">${H(e.path)}</td>
      <td style="padding:8px 12px">${j(s,e.kind==="removed")}</td>
      <td style="padding:8px 12px">${j(a,!1)}</td>
      <td style="padding:8px 12px">${C(n)}</td>
    </tr>`}function W(e,n){const t=n.map(K).join(""),s=e.split(".");let a;s[0]==="color"&&s[1]==="modes"&&s[2]?a=`${s[2]} <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[color mode]</span>`:s[0]==="spacing"&&s[1]==="scale"?a='scale <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[fluid]</span>':a=s.slice(1).join(" › ")||e;const i=`<span style="margin-left:8px;font-size:.7rem;font-family:'DM Mono',monospace;color:${o.inkFaint}">${n.length} change${n.length!==1?"s":""}</span>`;return`
    <details open style="margin-bottom:1px">
      <summary style="
        list-style:none;
        cursor:pointer;
        padding:9px 16px;
        background:${o.paper};
        border-top:1px solid ${o.rule};
        border-bottom:1px solid ${o.rule};
        font-family:'Syne',sans-serif;
        font-weight:700;
        font-size:.85rem;
        letter-spacing:.06em;
        text-transform:uppercase;
        color:${o.ink};
        display:flex;
        align-items:center;
      ">
        <span style="margin-right:6px;font-size:.7rem;color:${o.inkFaint}">▶</span>
        ${a}${i}
      </summary>
      <table style="width:100%;border-collapse:collapse;font-size:.82rem">
        <thead>
          <tr style="background:${o.paper};border-bottom:1px solid ${o.rule}">
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${o.inkFaint};width:35%">Token path</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${o.inkFaint};width:25%">Baseline</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${o.inkFaint};width:25%">Current</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${o.inkFaint};width:15%">Change</th>
          </tr>
        </thead>
        <tbody>${t}</tbody>
      </table>
    </details>`}function Q(e){const n={};for(const a of e)n[a.kind]=(n[a.kind]??0)+1;const t=[],s=["added","removed","changed-value","changed-alias","alias-to-value","value-to-alias","group-added","group-removed"];for(const a of s){const i=n[a];if(!i)continue;const c=N[a];t.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;${c.badge};font-size:.75rem;font-family:'DM Mono',monospace">
        <strong>${i}</strong> ${c.label}
      </span>`)}return t.length===0?`<p style="font-family:'DM Mono',monospace;font-size:.85rem;color:${o.inkFaint};padding:16px 0">No changes detected.</p>`:`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">${t.join("")}</div>`}const X=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`;function A(e,n={}){const{baselineLabel:t="baseline",currentLabel:s="current",title:a="Token Diff"}=n,c=[...V(e).entries()].map(([f,g])=>W(f,g)).join(""),u=e.length===0;return`
  <div style="margin-bottom:32px;border-bottom:2px solid ${o.ink};padding-bottom:16px">
    <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${o.inkFaint};margin-bottom:6px">Cedar Design Tokens</div>
    <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.1">${a}</h1>
    <div style="margin-top:8px;font-size:.78rem;color:${o.inkFaint}">
      Comparing <code style="background:${o.removedBorder}22;padding:1px 5px;border-radius:3px">${t}</code>
      → <code style="background:${o.addedBorder}22;padding:1px 5px;border-radius:3px">${s}</code>
    </div>
  </div>

  ${Q(e)}

  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:.72rem;font-family:'Syne',sans-serif;letter-spacing:.04em;color:${o.inkFaint}">
    <span>● Sections are expanded by default — click to collapse</span>
    <span>● Unchanged tokens are not shown</span>
  </div>

  ${u?`<p style="font-size:.9rem;color:${o.inkFaint}">Baseline and current are identical.</p>`:c}`}function Y(e,n={}){return`
  <section style="
    background:${o.paper};
    color:${o.ink};
    border:1px solid ${o.rule};
    border-radius:10px;
    padding:28px 24px;
    box-sizing:border-box;
    overflow:hidden;
  ">
    ${A(e,n)}
  </section>`}function L(e,n={}){return`
${X}
<div style="
  background:${o.paper};
  color:${o.ink};
  font-family:'DM Mono',monospace;
  min-height:100vh;
  padding:40px 32px;
  box-sizing:border-box;
">
  ${A(e,n)}
</div>`}const ne={title:"Cedar Tokens / Semantic Diff",render:()=>""},Z=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`;function P(){return window.location.pathname.replace(/\/[^/]*$/,"/")}function y(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function M(e){if(e.label&&e.slot==="current"){const s=new Date(e.label);if(!Number.isNaN(s.getTime()))return s.toLocaleString(void 0,{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"})}const n=new Date(e.createdAt),t=Number.isNaN(n.getTime())?e.createdAt:n.toLocaleString(void 0,{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});return e.slot==="current"?t:`${t} (${e.slot})`}function w(e,n,t={}){return`${t.allowBlank?'<option value="">No comparison</option>':""}${e.map(a=>{const i=a.id===n?" selected":"";return`<option value="${y(a.id)}"${i}>${y(M(a))}</option>`}).join("")}`}async function R(e){const n=await fetch(`${P()}${e}`);if(!n.ok)throw new Error(`${e}: ${n.status} ${n.statusText}`);return await n.json()}function O(e){return()=>{const n=document.createElement("div");return n.style.cssText="min-height:200px",n.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading token diff…
      </div>`,e().then(t=>{n.innerHTML=t}).catch(t=>{const s=t instanceof Error?t.message:String(t);n.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d">
            Error loading diff: ${s}
          </div>`}),n}}const D=`
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
</div>`,k={name:"No Changes",render:O(async()=>{const e=window.location.pathname.replace(/\/[^/]*$/,"/"),n=await fetch(`${e}normalized/baseline.json`);if(n.status===404)return D;if(!n.ok)throw new Error(`baseline.json: ${n.status} ${n.statusText}`);const t=await n.json(),s=z(t,t);return L(s,{baselineLabel:"v1.0.0",currentLabel:"v1.0.0"})})},x={name:"Live Diff (fetched)",render:O(async()=>{const e=P(),[n,t]=await Promise.all([fetch(`${e}normalized/baseline.json`),fetch(`${e}normalized/current.json`)]);if(n.status===404||t.status===404)return D;if(!n.ok)throw new Error(`baseline.json: ${n.status} ${n.statusText}`);if(!t.ok)throw new Error(`current.json: ${t.status} ${t.statusText}`);const s=await n.json(),a=await t.json(),i=z(s,a);return L(i,{baselineLabel:"baseline.json",currentLabel:"current.json"})})};function ee(e,n,t){const s=e.slice(0,12).map(a=>`
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'DM Mono',monospace;font-size:.8rem">${y(M(a))}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'Syne',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#736e65">${y(a.slot)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ccc9c1;font-family:'DM Mono',monospace;font-size:.72rem;color:#736e65">${y(a.id)}</td>
        </tr>`).join("");return`
${Z}
<div style="background:#f5f2eb;color:#2e2e2b;font-family:'DM Mono',monospace;min-height:100vh;padding:40px 32px;box-sizing:border-box;">
  <div style="max-width:1320px;margin:0 auto;display:grid;gap:24px;">
    <section style="background:#fbf9f4;border:1px solid #ccc9c1;border-radius:10px;padding:24px;display:grid;gap:18px;">
      <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-end;flex-wrap:wrap;">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;margin-bottom:6px;">Cedar Design Tokens</div>
          <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.05;">Snapshot Compare</h1>
          <p style="margin:10px 0 0;font-size:.92rem;line-height:1.6;color:#736e65;max-width:760px;">Pick one base snapshot and compare it against up to three archived snapshots. Each PR run adds timestamped entries to the snapshot archive.</p>
        </div>
        <div style="font-family:'DM Mono',monospace;font-size:.8rem;color:#736e65;">${e.length} archived snapshot${e.length===1?"":"s"}</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:14px;">
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Base snapshot</span>
          <select data-base-select style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${w(e,n)}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 1</span>
          <select data-compare-select="0" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${w(e,t[0]??"",{allowBlank:!0})}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 2</span>
          <select data-compare-select="1" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${w(e,t[1]??"",{allowBlank:!0})}
          </select>
        </label>
        <label style="display:grid;gap:6px;">
          <span style="font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#736e65;">Compare 3</span>
          <select data-compare-select="2" style="width:100%;padding:10px 12px;border:1px solid #b2ab9f;border-radius:6px;background:#fffdf8;color:#2e2e2b;font-family:'DM Mono',monospace;font-size:.78rem;">
            ${w(e,t[2]??"",{allowBlank:!0})}
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
        <tbody>${s}</tbody>
      </table>
    </section>

    <div data-compare-results style="display:grid;gap:20px;"></div>
  </div>
</div>`}const S={name:"Snapshot Compare",render:()=>{const e=document.createElement("div");return e.style.cssText="min-height:200px;background:#f5f2eb;",e.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#736e65">
        Loading snapshot archive…
      </div>`,(async()=>{try{const n=await R("canonical/snapshots/index.json");if(n.length<2){e.innerHTML=D;return}const t=n[0]?.id??"",s=n.slice(1,4).map(r=>r.id);e.innerHTML=ee(n,t,s);const a=e,i=a.querySelector("[data-base-select]"),c=[...a.querySelectorAll("[data-compare-select]")],u=a.querySelector("[data-compare-status]"),f=a.querySelector("[data-compare-results]");if(!i||c.length===0||!u||!f)throw new Error("Snapshot comparison controls failed to render.");const g=new Map(n.map(r=>[r.id,r])),h=new Map,l=r=>{if(!h.has(r)){const p=g.get(r);if(!p)throw new Error(`Unknown snapshot id: ${r}`);h.set(r,R(`canonical/${p.file}`))}return h.get(r)},d=async()=>{const r=i.value,p=[];for(const $ of c){const b=$.value;if(!(!b||b===r||p.includes(b))&&(p.push(b),p.length===3))break}if(!r){u.innerHTML="Choose a base snapshot to start comparing.",f.innerHTML="";return}if(p.length===0){u.innerHTML="Pick at least one comparison snapshot. Duplicate selections and the base snapshot are ignored.",f.innerHTML="";return}u.innerHTML=`Comparing <strong>${p.length}</strong> snapshot${p.length===1?"":"s"} against the selected base.`,f.innerHTML=`<div style="padding:20px 0;color:#736e65;font-family:'DM Mono',monospace;">Computing diffs…</div>`;const m=await l(r),I=g.get(r),G=await Promise.all(p.map(async($,b)=>{const _=await l($),q=g.get($),U=z(m,_);return Y(U,{title:`Comparison ${b+1}`,baselineLabel:M(I),currentLabel:M(q)})}));f.innerHTML=G.join("")};i.addEventListener("change",()=>{d()}),c.forEach(r=>{r.addEventListener("change",()=>{d()})}),await d()}catch(n){const t=n instanceof Error?n.message:String(n);e.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:1rem;color:#be342d;background:#f5f2eb;">
            Error loading snapshot archive: ${y(t)}
          </div>`}})(),e}},v={name:"All Diff Cases",render:()=>{const t=z({color:{modes:{default:{text:{link:{$value:"{color.neutral-palette.blue.600}",$type:"color"},heading:{$value:"{color.neutral-palette.warm-grey.900}",$type:"color"},inverse:{$value:"{color.neutral-palette.warm-grey.50}",$type:"color"}},surface:{base:{$value:"#f5f2eb",$type:"color"},overlay:{$value:"#2e2e2b33",$type:"color"}}}},"neutral-palette":{"warm-grey":{100:{$value:"#edeae3",$type:"color"},50:{$value:"#f5f2eb",$type:"color"}}}},spacing:{scale:{"-50":{$value:"clamp(4px, 0.3571vw + 2.857px, 8px)",$type:"spacing"},0:{$value:"clamp(8px, 0.7143vw + 5.714px, 16px)",$type:"spacing"}},component:{"button-padding-x":{$value:"16px",$type:"spacing"}}},legacy:{"icon-size":{$value:"20px",$type:"sizing"},"icon-size-lg":{$value:"28px",$type:"sizing"}}},{color:{modes:{default:{text:{link:{$value:"{color.neutral-palette.blue.700}",$type:"color"},heading:{$value:"#1a1a18",$type:"color"},muted:{$value:"{color.neutral-palette.warm-grey.500}",$type:"color"}},surface:{base:{$value:"#f8f6f0",$type:"color"},overlay:{$value:"{color.neutral-palette.warm-grey.900}",$type:"color"}}}},"neutral-palette":{"warm-grey":{100:{$value:"#e8e4dc",$type:"color"},50:{$value:"#f5f2eb",$type:"color"}}}},spacing:{scale:{"-50":{$value:"clamp(2px, 0.2232vw + 1.786px, 6px)",$type:"spacing"},0:{$value:"clamp(8px, 0.7143vw + 5.714px, 16px)",$type:"spacing"}},component:{},layout:{"content-max-width":{$value:"1280px",$type:"sizing"},"sidebar-width":{$value:"280px",$type:"sizing"}}}});return L(t,{baselineLabel:"v2.0.0 (synthetic)",currentLabel:"v2.1.0 (synthetic)"})}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`Fetches both JSON snapshots from the static server at runtime.
This story displays **all token changes** across all categories:
- Primitive token values (hex colors, sizing, etc.)
- Semantic token aliases (text, surface, border, etc.)
- Spacing and other sections
- Structural changes (added/removed groups)

The diff includes 8 kinds of changes:
- added, removed (token-level)
- changed-value, changed-alias (token modifications)
- alias-to-value, value-to-alias (structural type changes)
- group-added, group-removed (section-level changes)`,...x.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Purely static story using hardcoded synthetic token trees.
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
  alias references {path.to.token}`,...v.parameters?.docs?.description}}};const te=["NoChanges","LiveDiff","SnapshotCompare","AllDiffCases"];export{v as AllDiffCases,x as LiveDiff,k as NoChanges,S as SnapshotCompare,te as __namedExportsOrder,ne as default};
