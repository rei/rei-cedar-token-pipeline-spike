function T(e){return typeof e=="object"&&e!==null&&"$value"in e&&"$type"in e}function B(e){return e.trimStart().startsWith("{")&&e.trimEnd().endsWith("}")}function y(e,n,s){for(const[o,r]of Object.entries(e)){const a=n?`${n}.${o}`:o;T(r)?s.set(a,r):typeof r=="object"&&r!==null&&y(r,a,s)}}function x(e,n,s){for(const[o,r]of Object.entries(e)){const a=n?`${n}.${o}`:o;T(r)||typeof r=="object"&&r!==null&&(s.add(a),x(r,a,s))}}function k(e,n){const s=new Map,o=new Map;y(e,"",s),y(n,"",o);const r=new Set,a=new Set;x(e,"",r),x(n,"",a);const l=[],b=new Set([...s.keys(),...o.keys()]);for(const i of b){const d=s.get(i)??null,c=o.get(i)??null;if(d===null&&c!==null)l.push({path:i,kind:"added",baseline:null,current:c});else if(d!==null&&c===null)l.push({path:i,kind:"removed",baseline:d,current:null});else if(d!==null&&c!==null){if(d.$value===c.$value)continue;const p=B(d.$value),f=B(c.$value);p&&f?l.push({path:i,kind:"changed-alias",baseline:d,current:c}):!p&&!f?l.push({path:i,kind:"changed-value",baseline:d,current:c}):p&&!f?l.push({path:i,kind:"alias-to-value",baseline:d,current:c}):l.push({path:i,kind:"value-to-alias",baseline:d,current:c})}}const g=new Set([...a].filter(i=>!r.has(i))),j=new Set([...r].filter(i=>!a.has(i)));function z(i,d){const c=i.split(".");for(let p=1;p<c.length;p++){const f=c.slice(0,p).join(".");if(d.has(f))return!0}return!1}for(const i of g)z(i,g)||l.push({path:i,kind:"group-added",baseline:null,current:null});for(const i of j)z(i,j)||l.push({path:i,kind:"group-removed",baseline:null,current:null});return l.sort((i,d)=>i.path.localeCompare(d.path))}function L(e,n=2){const s=new Map;for(const o of e){const r=o.path.split("."),a=r[0]==="color"&&r[1]==="modes"?3:n,l=r.slice(0,a).join(".");s.has(l)||s.set(l,[]),s.get(l).push(o)}return s}const t={paper:"#f5f2eb",ink:"#2e2e2b",inkFaint:"#736e65",rule:"#ccc9c1",added:"#d4edda",addedBorder:"#3b8349",removed:"#f8d7da",removedBorder:"#be342d",changed:"#fff3cd",changedBorder:"#c8a020",structural:"#e8e4f8",structuralBorder:"#5a4fcf",chip:"#00000018"},M={added:{label:"Added",badge:`background:${t.addedBorder};color:#fff`,rowBg:t.added,rowBorder:t.addedBorder},removed:{label:"Removed",badge:`background:${t.removedBorder};color:#fff`,rowBg:t.removed,rowBorder:t.removedBorder},"changed-value":{label:"Value changed",badge:`background:${t.changedBorder};color:#fff`,rowBg:t.changed,rowBorder:t.changedBorder},"changed-alias":{label:"Alias retargeted",badge:`background:${t.changedBorder};color:#fff`,rowBg:t.changed,rowBorder:t.changedBorder},"alias-to-value":{label:"Alias → Value",badge:`background:${t.structuralBorder};color:#fff`,rowBg:t.structural,rowBorder:t.structuralBorder},"value-to-alias":{label:"Value → Alias",badge:`background:${t.structuralBorder};color:#fff`,rowBg:t.structural,rowBorder:t.structuralBorder},"group-added":{label:"Group added",badge:`background:${t.addedBorder};color:#fff`,rowBg:t.added,rowBorder:t.addedBorder},"group-removed":{label:"Group removed",badge:`background:${t.removedBorder};color:#fff`,rowBg:t.removed,rowBorder:t.removedBorder}};function F(e){return/^#[0-9a-fA-F]{3,8}$/.test(e.trim())}function S(e,n=!1){if(e===null)return`<span style="color:${t.inkFaint}">—</span>`;const s=n?"text-decoration:line-through;opacity:.55;":"",o=e.trimStart().startsWith("clamp("),r=F(e)?`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${e};border:1px solid ${t.chip};vertical-align:middle;margin-right:6px;flex-shrink:0"></span>`:o?`<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:linear-gradient(90deg,#b2ab9f 0%,#2e2e2b 100%);border:1px solid ${t.chip};vertical-align:middle;margin-right:6px;flex-shrink:0" title="fluid"></span>`:"";return`<span style="display:inline-flex;align-items:center;font-family:'DM Mono',monospace;font-size:.8rem;${s}">${r}${e}</span>`}function D(e){return`<span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:.68rem;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap;${e.badge}">${e.label}</span>`}function R(e){const n=e.split("."),s=n.slice(-2).join("."),o=n.slice(0,-2).join(".");return o?`<span style="color:${t.inkFaint};font-size:.75rem">${o}.</span><strong>${s}</strong>`:`<strong>${s}</strong>`}function N(e){const n=M[e.kind];if(e.kind==="group-added"||e.kind==="group-removed")return`
      <tr style="background:${n.rowBg};border-left:3px solid ${n.rowBorder}">
        <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem" colspan="3">
          ${R(e.path)}
        </td>
        <td style="padding:8px 12px">${D(n)}</td>
      </tr>`;const o=e.baseline?.$value??null,r=e.current?.$value??null;return`
    <tr style="background:${n.rowBg};border-left:3px solid ${n.rowBorder}">
      <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem">${R(e.path)}</td>
      <td style="padding:8px 12px">${S(o,e.kind==="removed")}</td>
      <td style="padding:8px 12px">${S(r,!1)}</td>
      <td style="padding:8px 12px">${D(n)}</td>
    </tr>`}function E(e,n){const s=n.map(N).join(""),o=e.split(".");let r;o[0]==="color"&&o[1]==="modes"&&o[2]?r=`${o[2]} <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[color mode]</span>`:o[0]==="spacing"&&o[1]==="scale"?r='scale <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[fluid]</span>':r=o.slice(1).join(" › ")||e;const a=`<span style="margin-left:8px;font-size:.7rem;font-family:'DM Mono',monospace;color:${t.inkFaint}">${n.length} change${n.length!==1?"s":""}</span>`;return`
    <details open style="margin-bottom:1px">
      <summary style="
        list-style:none;
        cursor:pointer;
        padding:9px 16px;
        background:${t.paper};
        border-top:1px solid ${t.rule};
        border-bottom:1px solid ${t.rule};
        font-family:'Syne',sans-serif;
        font-weight:700;
        font-size:.85rem;
        letter-spacing:.06em;
        text-transform:uppercase;
        color:${t.ink};
        display:flex;
        align-items:center;
      ">
        <span style="margin-right:6px;font-size:.7rem;color:${t.inkFaint}">▶</span>
        ${r}${a}
      </summary>
      <table style="width:100%;border-collapse:collapse;font-size:.82rem">
        <thead>
          <tr style="background:${t.paper};border-bottom:1px solid ${t.rule}">
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${t.inkFaint};width:35%">Token path</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${t.inkFaint};width:25%">Baseline</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${t.inkFaint};width:25%">Current</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${t.inkFaint};width:15%">Change</th>
          </tr>
        </thead>
        <tbody>${s}</tbody>
      </table>
    </details>`}function O(e){const n={};for(const r of e)n[r.kind]=(n[r.kind]??0)+1;const s=[],o=["added","removed","changed-value","changed-alias","alias-to-value","value-to-alias","group-added","group-removed"];for(const r of o){const a=n[r];if(!a)continue;const l=M[r];s.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;${l.badge};font-size:.75rem;font-family:'DM Mono',monospace">
        <strong>${a}</strong> ${l.label}
      </span>`)}return s.length===0?`<p style="font-family:'DM Mono',monospace;font-size:.85rem;color:${t.inkFaint};padding:16px 0">No changes detected.</p>`:`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">${s.join("")}</div>`}const C=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`;function w(e,n={}){const{baselineLabel:s="baseline",currentLabel:o="current"}=n,a=[...L(e).entries()].map(([b,g])=>E(b,g)).join(""),l=e.length===0;return`
${C}
<div style="
  background:${t.paper};
  color:${t.ink};
  font-family:'DM Mono',monospace;
  min-height:100vh;
  padding:40px 32px;
  box-sizing:border-box;
">
  <!-- Header -->
  <div style="margin-bottom:32px;border-bottom:2px solid ${t.ink};padding-bottom:16px">
    <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${t.inkFaint};margin-bottom:6px">Cedar Design Tokens</div>
    <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.1">Token Diff</h1>
    <div style="margin-top:8px;font-size:.78rem;color:${t.inkFaint}">
      Comparing <code style="background:${t.removedBorder}22;padding:1px 5px;border-radius:3px">${s}</code>
      → <code style="background:${t.addedBorder}22;padding:1px 5px;border-radius:3px">${o}</code>
    </div>
  </div>

  <!-- Summary pills -->
  ${O(e)}

  <!-- Legend row -->
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:.72rem;font-family:'Syne',sans-serif;letter-spacing:.04em;color:${t.inkFaint}">
    <span>● Sections are expanded by default — click to collapse</span>
    <span>● Unchanged tokens are not shown</span>
  </div>

  ${l?`<p style="font-size:.9rem;color:${t.inkFaint}">Baseline and current are identical.</p>`:a}
</div>`}const P={title:"Cedar Tokens / Semantic Diff",render:()=>""};function $(e){return()=>{const n=document.createElement("div");return n.style.cssText="min-height:200px",n.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token diff…
      </div>`,e().then(s=>{n.innerHTML=s}).catch(s=>{const o=s instanceof Error?s.message:String(s);n.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading diff: ${o}
          </div>`}),n}}const v=`
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
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/baseline.json</code>
      and/or
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/current.json</code>
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
</div>`,u={name:"Full Diff",render:$(async()=>{const e=window.location.pathname.replace(/\/[^/]*$/,"/"),[n,s]=await Promise.all([fetch(`${e}normalized/baseline.json`),fetch(`${e}normalized/current.json`)]);if(n.status===404||s.status===404)return v;if(!n.ok)throw new Error(`baseline.json: ${n.status} ${n.statusText}`);if(!s.ok)throw new Error(`current.json: ${s.status} ${s.statusText}`);const o=await n.json(),r=await s.json(),a=k(o,r);return w(a,{baselineLabel:"baseline.json",currentLabel:"current.json"})})},h={name:"No Changes",render:$(async()=>{const e=window.location.pathname.replace(/\/[^/]*$/,"/"),n=await fetch(`${e}normalized/baseline.json`);if(n.status===404)return v;if(!n.ok)throw new Error(`baseline.json: ${n.status} ${n.statusText}`);const s=await n.json(),o=k(s,s);return w(o,{baselineLabel:"v1.0.0",currentLabel:"v1.0.0"})})},m={name:"Live Diff (fetched)",render:$(async()=>{const e=window.location.pathname.replace(/\/[^/]*$/,"/"),[n,s]=await Promise.all([fetch(`${e}normalized/baseline.json`),fetch(`${e}normalized/current.json`)]);if(n.status===404||s.status===404)return v;if(!n.ok)throw new Error(`baseline.json: ${n.status} ${n.statusText}`);if(!s.ok)throw new Error(`current.json: ${s.status} ${s.statusText}`);const o=await n.json(),r=await s.json(),a=k(o,r);return w(a,{baselineLabel:"baseline.json",currentLabel:"current.json"})})};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Full Diff",
  render: asyncStory(async () => {
    // Derive the base URL from the current page so this works both locally
    // (served from /) and on GH Pages (served from a sub-path like
    // /rei-cedar-token-pipeline-spike/pr/update-tokens/).
    // window.location.pathname inside the Storybook iframe is something like
    // /rei-cedar-token-pipeline-spike/pr/update-tokens/iframe.html so stripping
    // the filename gives us the correct base to resolve normalized/ against.
    const base = window.location.pathname.replace(/\\/[^/]*$/, "/");
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
}`,...u.parameters?.docs?.source},description:{story:"Fetches both JSON snapshots from the static server at runtime.\nRequires `dist/normalized/baseline.json` and `dist/normalized/current.json`\nto exist. Always shows the latest token changes (dynamic/live data).",...u.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Live Diff (fetched)",
  render: asyncStory(async () => {
    // Derive the base URL from the current page so this works both locally
    // (served from /) and on GH Pages (served from a sub-path like
    // /rei-cedar-token-pipeline-spike/pr/update-tokens/).
    // window.location.pathname inside the Storybook iframe is something like
    // /rei-cedar-token-pipeline-spike/pr/update-tokens/iframe.html so stripping
    // the filename gives us the correct base to resolve normalized/ against.
    const base = window.location.pathname.replace(/\\/[^/]*$/, "/");
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
}`,...m.parameters?.docs?.source},description:{story:`Fetches both JSON snapshots from the static server at runtime.
This story displays **all token changes** across all categories:
- Primitive token values (hex colors, sizing, etc.)
- Semantic token aliases (text, surface, border, etc.)
- Spacing and other sections
- Structural changes (added/removed groups)

The diff includes 8 kinds of changes:
- added, removed (token-level)
- changed-value, changed-alias (token modifications)
- alias-to-value, value-to-alias (structural type changes)
- group-added, group-removed (section-level changes)`,...m.parameters?.docs?.description}}};const G=["FullDiff","NoChanges","LiveDiff"];export{u as FullDiff,m as LiveDiff,h as NoChanges,G as __namedExportsOrder,P as default};
