function L(e){return typeof e=="object"&&e!==null&&"$value"in e&&"$type"in e}function S(e){return e.trimStart().startsWith("{")&&e.trimEnd().endsWith("}")}function $(e,t,o){for(const[r,a]of Object.entries(e)){const i=t?`${t}.${r}`:r;L(a)?o.set(i,a):typeof a=="object"&&a!==null&&$(a,i,o)}}function x(e,t,o){for(const[r,a]of Object.entries(e)){const i=t?`${t}.${r}`:r;L(a)||typeof a=="object"&&a!==null&&(o.add(i),x(a,i,o))}}function v(e,t){const o=new Map,r=new Map;$(e,"",o),$(t,"",r);const a=new Set,i=new Set;x(e,"",a),x(t,"",i);const l=[],y=new Set([...o.keys(),...r.keys()]);for(const s of y){const d=o.get(s)??null,c=r.get(s)??null;if(d===null&&c!==null)l.push({path:s,kind:"added",baseline:null,current:c});else if(d!==null&&c===null)l.push({path:s,kind:"removed",baseline:d,current:null});else if(d!==null&&c!==null){if(d.$value===c.$value)continue;const p=S(d.$value),f=S(c.$value);p&&f?l.push({path:s,kind:"changed-alias",baseline:d,current:c}):!p&&!f?l.push({path:s,kind:"changed-value",baseline:d,current:c}):p&&!f?l.push({path:s,kind:"alias-to-value",baseline:d,current:c}):l.push({path:s,kind:"value-to-alias",baseline:d,current:c})}}const g=new Set([...i].filter(s=>!a.has(s))),w=new Set([...a].filter(s=>!i.has(s)));function B(s,d){const c=s.split(".");for(let p=1;p<c.length;p++){const f=c.slice(0,p).join(".");if(d.has(f))return!0}return!1}for(const s of g)B(s,g)||l.push({path:s,kind:"group-added",baseline:null,current:null});for(const s of w)B(s,w)||l.push({path:s,kind:"group-removed",baseline:null,current:null});return l.sort((s,d)=>s.path.localeCompare(d.path))}function R(e,t=2){const o=new Map;for(const r of e){const i=r.path.split(".").slice(0,t).join(".");o.has(i)||o.set(i,[]),o.get(i).push(r)}return o}const n={paper:"#f5f2eb",ink:"#2e2e2b",inkFaint:"#736e65",rule:"#ccc9c1",added:"#d4edda",addedBorder:"#3b8349",removed:"#f8d7da",removedBorder:"#be342d",changed:"#fff3cd",changedBorder:"#c8a020",structural:"#e8e4f8",structuralBorder:"#5a4fcf",chip:"#00000018"},M={added:{label:"Added",badge:`background:${n.addedBorder};color:#fff`,rowBg:n.added,rowBorder:n.addedBorder},removed:{label:"Removed",badge:`background:${n.removedBorder};color:#fff`,rowBg:n.removed,rowBorder:n.removedBorder},"changed-value":{label:"Value changed",badge:`background:${n.changedBorder};color:#fff`,rowBg:n.changed,rowBorder:n.changedBorder},"changed-alias":{label:"Alias retargeted",badge:`background:${n.changedBorder};color:#fff`,rowBg:n.changed,rowBorder:n.changedBorder},"alias-to-value":{label:"Alias → Value",badge:`background:${n.structuralBorder};color:#fff`,rowBg:n.structural,rowBorder:n.structuralBorder},"value-to-alias":{label:"Value → Alias",badge:`background:${n.structuralBorder};color:#fff`,rowBg:n.structural,rowBorder:n.structuralBorder},"group-added":{label:"Group added",badge:`background:${n.addedBorder};color:#fff`,rowBg:n.added,rowBorder:n.addedBorder},"group-removed":{label:"Group removed",badge:`background:${n.removedBorder};color:#fff`,rowBg:n.removed,rowBorder:n.removedBorder}};function F(e){return/^#[0-9a-fA-F]{3,8}$/.test(e.trim())}function z(e,t=!1){if(e===null)return`<span style="color:${n.inkFaint}">—</span>`;const o=t?"text-decoration:line-through;opacity:.55;":"",r=F(e)?`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${e};border:1px solid ${n.chip};vertical-align:middle;margin-right:6px;flex-shrink:0"></span>`:"";return`<span style="display:inline-flex;align-items:center;font-family:'DM Mono',monospace;font-size:.8rem;${o}">${r}${e}</span>`}function D(e){return`<span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:.68rem;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap;${e.badge}">${e.label}</span>`}function j(e){const t=e.split("."),o=t.slice(-2).join("."),r=t.slice(0,-2).join(".");return r?`<span style="color:${n.inkFaint};font-size:.75rem">${r}.</span><strong>${o}</strong>`:`<strong>${o}</strong>`}function T(e){const t=M[e.kind];if(e.kind==="group-added"||e.kind==="group-removed")return`
      <tr style="background:${t.rowBg};border-left:3px solid ${t.rowBorder}">
        <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem" colspan="3">
          ${j(e.path)}
        </td>
        <td style="padding:8px 12px">${D(t)}</td>
      </tr>`;const r=e.baseline?.$value??null,a=e.current?.$value??null;return`
    <tr style="background:${t.rowBg};border-left:3px solid ${t.rowBorder}">
      <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem">${j(e.path)}</td>
      <td style="padding:8px 12px">${z(r,e.kind==="removed")}</td>
      <td style="padding:8px 12px">${z(a,!1)}</td>
      <td style="padding:8px 12px">${D(t)}</td>
    </tr>`}function E(e,t){const o=t.map(T).join(""),r=e.split(".").slice(1).join(" › ")||e,a=`<span style="margin-left:8px;font-size:.7rem;font-family:'DM Mono',monospace;color:${n.inkFaint}">${t.length} change${t.length!==1?"s":""}</span>`;return`
    <details open style="margin-bottom:1px">
      <summary style="
        list-style:none;
        cursor:pointer;
        padding:9px 16px;
        background:${n.paper};
        border-top:1px solid ${n.rule};
        border-bottom:1px solid ${n.rule};
        font-family:'Syne',sans-serif;
        font-weight:700;
        font-size:.85rem;
        letter-spacing:.06em;
        text-transform:uppercase;
        color:${n.ink};
        display:flex;
        align-items:center;
      ">
        <span style="margin-right:6px;font-size:.7rem;color:${n.inkFaint}">▶</span>
        ${r}${a}
      </summary>
      <table style="width:100%;border-collapse:collapse;font-size:.82rem">
        <thead>
          <tr style="background:${n.paper};border-bottom:1px solid ${n.rule}">
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${n.inkFaint};width:35%">Token path</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${n.inkFaint};width:25%">Baseline</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${n.inkFaint};width:25%">Current</th>
            <th style="padding:6px 12px;text-align:left;font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:${n.inkFaint};width:15%">Change</th>
          </tr>
        </thead>
        <tbody>${o}</tbody>
      </table>
    </details>`}function N(e){const t={};for(const a of e)t[a.kind]=(t[a.kind]??0)+1;const o=[],r=["added","removed","changed-value","changed-alias","alias-to-value","value-to-alias","group-added","group-removed"];for(const a of r){const i=t[a];if(!i)continue;const l=M[a];o.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;${l.badge};font-size:.75rem;font-family:'DM Mono',monospace">
        <strong>${i}</strong> ${l.label}
      </span>`)}return o.length===0?`<p style="font-family:'DM Mono',monospace;font-size:.85rem;color:${n.inkFaint};padding:16px 0">No changes detected.</p>`:`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">${o.join("")}</div>`}const C=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`;function k(e,t={}){const{baselineLabel:o="baseline",currentLabel:r="current"}=t,i=[...R(e).entries()].map(([y,g])=>E(y,g)).join(""),l=e.length===0;return`
${C}
<div style="
  background:${n.paper};
  color:${n.ink};
  font-family:'DM Mono',monospace;
  min-height:100vh;
  padding:40px 32px;
  box-sizing:border-box;
">
  <!-- Header -->
  <div style="margin-bottom:32px;border-bottom:2px solid ${n.ink};padding-bottom:16px">
    <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${n.inkFaint};margin-bottom:6px">Cedar Design Tokens</div>
    <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.1">Token Diff</h1>
    <div style="margin-top:8px;font-size:.78rem;color:${n.inkFaint}">
      Comparing <code style="background:${n.removedBorder}22;padding:1px 5px;border-radius:3px">${o}</code>
      → <code style="background:${n.addedBorder}22;padding:1px 5px;border-radius:3px">${r}</code>
    </div>
  </div>

  <!-- Summary pills -->
  ${N(e)}

  <!-- Legend row -->
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:.72rem;font-family:'Syne',sans-serif;letter-spacing:.04em;color:${n.inkFaint}">
    <span>● Sections are expanded by default — click to collapse</span>
    <span>● Unchanged tokens are not shown</span>
  </div>

  ${l?`<p style="font-size:.9rem;color:${n.inkFaint}">Baseline and current are identical.</p>`:i}
</div>`}const A={surface:{base:{$value:"{color.neutral-palette.base-neutrals.black}",$type:"color"},raised:{$value:"{color.neutral-palette.warm-grey.100}",$type:"color"}},text:{base:{$value:"{color.neutral-palette.warm-grey.900}",$type:"color"},subtle:{$value:"{color.neutral-palette.warm-grey.600}",$type:"color"},link:{$value:"{color.brand-palette.blue.600}",$type:"color"},"link-hover":{$value:"{color.brand-palette.blue.400}",$type:"color"}},border:{base:{$value:"{color.neutral-palette.warm-grey.300}",$type:"color"},subtle:{$value:"{color.neutral-palette.warm-grey.100}",$type:"color"}},"neutral-palette":{"warm-grey":{100:{$value:"#edeae3",$type:"color"},300:{$value:"#b2ab9f",$type:"color"},600:{$value:"#736e65",$type:"color"},900:{$value:"#2e2e2b",$type:"color"}},"base-neutrals":{black:{$value:"#000000",$type:"color"},white:{$value:"#ffffff",$type:"color"},"white-85":{$value:"#ffffffd9",$type:"color"},"white-75":{$value:"#ffffffbf",$type:"color"}}},"brand-palette":{blue:{400:{$value:"#406eb5",$type:"color"},600:{$value:"#0b2d60",$type:"color"}},yellow:{400:{$value:"#ffbf59",$type:"color"},600:{$value:"#ffe7b3",$type:"color"}},red:{400:{$value:"#c7370f",$type:"color"},600:{$value:"#610a0a",$type:"color"}},green:{400:{$value:"#3b8349",$type:"color"},600:{$value:"#1f513f",$type:"color"}}}},G={color:A};function O(){return G}const U={title:"Cedar Tokens / Semantic Diff",render:()=>""};function P(e){return()=>{const t=document.createElement("div");return t.style.cssText="min-height:200px",t.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token diff…
      </div>`,e().then(o=>{t.innerHTML=o}).catch(o=>{const r=o instanceof Error?o.message:String(o);t.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading diff: ${r}
          </div>`}),t}}const h=O(),H=h,m={name:"Full Diff (inline fixtures)",render:()=>{const e=v(h,H);return k(e,{baselineLabel:"baseline (inline)",currentLabel:"current (inline)"})}},b={name:"No Changes",render:()=>{const e=v(h,h);return k(e,{baselineLabel:"v1.0.0",currentLabel:"v1.0.0"})}},I=`
<div style="
  background:#f5f2eb;color:#2e2e2b;font-family:'DM Mono',monospace;
  min-height:100vh;padding:40px 32px;box-sizing:border-box
">
  <div style="max-width:560px">
    <div style="font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      color:#736e65;margin-bottom:6px;font-family:'Syne',sans-serif">
      Cedar Design Tokens — Semantic Diff
    </div>
    <h1 style="margin:0 0 24px;font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;
      letter-spacing:-.02em;border-bottom:2px solid #2e2e2b;padding-bottom:12px">
      Snapshot files not found
    </h1>
    <p style="line-height:1.6;margin:0 0 16px">
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/baseline.json</code>
      and/or
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/current.json</code>
      could not be fetched. The files must exist before starting Storybook.
    </p>
    <p style="font-size:.8rem;color:#736e65;margin:0 0 20px;line-height:1.6">
      The <strong>Live Diff</strong> story reads real snapshot files written by the token
      normalization pipeline. Use the <strong>Full Diff (inline fixtures)</strong> story
      to see a working example with hardcoded data.
    </p>
    <div style="background:#2e2e2b;color:#edeae3;border-radius:6px;padding:16px 20px;
      font-size:.82rem;line-height:1.8">
      <div style="color:#736e65;margin-bottom:4px;font-size:.7rem;
        letter-spacing:.08em;text-transform:uppercase">To generate the files</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:snapshot baseline</div>
      <div style="color:#736e65;margin:4px 0"># edit tokens, re-run Figma sync, then:</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:snapshot current</div>
      <div style="color:#736e65;margin:4px 0"># restart Storybook to pick up the new files:</div>
      <div><span style="color:#3b8349">$</span> pnpm storybook</div>
    </div>
  </div>
</div>`,u={name:"Live Diff (fetched)",render:P(async()=>{const e=window.location.pathname.replace(/\/[^/]*$/,"/"),[t,o]=await Promise.all([fetch(`${e}normalized/baseline.json`),fetch(`${e}normalized/current.json`)]);if(t.status===404||o.status===404)return I;if(!t.ok)throw new Error(`baseline.json: ${t.status} ${t.statusText}`);if(!o.ok)throw new Error(`current.json: ${o.status} ${o.statusText}`);const r=await t.json(),a=await o.json(),i=v(r,a);return k(i,{baselineLabel:"baseline.json",currentLabel:"current.json"})})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Full Diff (inline fixtures)",
  render: () => {
    const entries = computeDiff(BASELINE as Record<string, unknown>, CURRENT as Record<string, unknown>);
    return renderDiffPage(entries, {
      baselineLabel: "baseline (inline)",
      currentLabel: "current (inline)"
    });
  }
}`,...m.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "No Changes",
  render: () => {
    const entries = computeDiff(BASELINE as Record<string, unknown>, BASELINE as Record<string, unknown>);
    return renderDiffPage(entries, {
      baselineLabel: "v1.0.0",
      currentLabel: "v1.0.0"
    });
  }
}`,...b.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:`Fetches both JSON fixtures from the static server at runtime.
Requires \`dist/normalized/baseline.json\` and \`dist/normalized/current.json\`
to exist. Generate them with \`pnpm tokens:snapshot baseline\` /
\`pnpm tokens:snapshot current\`, then restart Storybook.

This story displays **all token changes** across all categories:
- Primitive token values (hex colors, sizing, etc.)
- Semantic token aliases (text, surface, border, etc.)
- Spacing and other sections
- Structural changes (added/removed groups)

The diff includes 8 kinds of changes:
- added, removed (token-level)
- changed-value, changed-alias (token modifications)
- alias-to-value, value-to-alias (structural type changes)
- group-added, group-removed (section-level changes)`,...u.parameters?.docs?.description}}};const _=["FullDiff","NoChanges","LiveDiff"];export{m as FullDiff,u as LiveDiff,b as NoChanges,_ as __namedExportsOrder,U as default};
