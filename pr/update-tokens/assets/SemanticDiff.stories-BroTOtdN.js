function j(e){return typeof e=="object"&&e!==null&&"$value"in e&&"$type"in e}function S(e){return e.trimStart().startsWith("{")&&e.trimEnd().endsWith("}")}function y(e,r,n){for(const[t,a]of Object.entries(e)){const l=r?`${r}.${t}`:t;j(a)?n.set(l,a):typeof a=="object"&&a!==null&&y(a,l,n)}}function h(e,r,n){for(const[t,a]of Object.entries(e)){const l=r?`${r}.${t}`:t;j(a)||typeof a=="object"&&a!==null&&(n.add(l),h(a,l,n))}}function x(e,r){const n=new Map,t=new Map;y(e,"",n),y(r,"",t);const a=new Set,l=new Set;h(e,"",a),h(r,"",l);const i=[],$=new Set([...n.keys(),...t.keys()]);for(const s of $){const c=n.get(s)??null,d=t.get(s)??null;if(c===null&&d!==null)i.push({path:s,kind:"added",baseline:null,current:d});else if(c!==null&&d===null)i.push({path:s,kind:"removed",baseline:c,current:null});else if(c!==null&&d!==null){if(c.$value===d.$value)continue;const p=S(c.$value),u=S(d.$value);p&&u?i.push({path:s,kind:"changed-alias",baseline:c,current:d}):!p&&!u?i.push({path:s,kind:"changed-value",baseline:c,current:d}):p&&!u?i.push({path:s,kind:"alias-to-value",baseline:c,current:d}):i.push({path:s,kind:"value-to-alias",baseline:c,current:d})}}const g=new Set([...l].filter(s=>!a.has(s))),w=new Set([...a].filter(s=>!l.has(s)));function B(s,c){const d=s.split(".");for(let p=1;p<d.length;p++){const u=d.slice(0,p).join(".");if(c.has(u))return!0}return!1}for(const s of g)B(s,g)||i.push({path:s,kind:"group-added",baseline:null,current:null});for(const s of w)B(s,w)||i.push({path:s,kind:"group-removed",baseline:null,current:null});return i.sort((s,c)=>s.path.localeCompare(c.path))}function N(e,r=2){const n=new Map;for(const t of e){const l=t.path.split(".").slice(0,r).join(".");n.has(l)||n.set(l,[]),n.get(l).push(t)}return n}const o={paper:"#f5f2eb",ink:"#2e2e2b",inkFaint:"#736e65",rule:"#ccc9c1",added:"#d4edda",addedBorder:"#3b8349",removed:"#f8d7da",removedBorder:"#be342d",changed:"#fff3cd",changedBorder:"#c8a020",structural:"#e8e4f8",structuralBorder:"#5a4fcf",chip:"#00000018"},L={added:{label:"Added",badge:`background:${o.addedBorder};color:#fff`,rowBg:o.added,rowBorder:o.addedBorder},removed:{label:"Removed",badge:`background:${o.removedBorder};color:#fff`,rowBg:o.removed,rowBorder:o.removedBorder},"changed-value":{label:"Value changed",badge:`background:${o.changedBorder};color:#fff`,rowBg:o.changed,rowBorder:o.changedBorder},"changed-alias":{label:"Alias retargeted",badge:`background:${o.changedBorder};color:#fff`,rowBg:o.changed,rowBorder:o.changedBorder},"alias-to-value":{label:"Alias → Value",badge:`background:${o.structuralBorder};color:#fff`,rowBg:o.structural,rowBorder:o.structuralBorder},"value-to-alias":{label:"Value → Alias",badge:`background:${o.structuralBorder};color:#fff`,rowBg:o.structural,rowBorder:o.structuralBorder},"group-added":{label:"Group added",badge:`background:${o.addedBorder};color:#fff`,rowBg:o.added,rowBorder:o.addedBorder},"group-removed":{label:"Group removed",badge:`background:${o.removedBorder};color:#fff`,rowBg:o.removed,rowBorder:o.removedBorder}};function M(e){return/^#[0-9a-fA-F]{3,8}$/.test(e.trim())}function C(e,r=!1){if(e===null)return`<span style="color:${o.inkFaint}">—</span>`;const n=r?"text-decoration:line-through;opacity:.55;":"",t=M(e)?`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${e};border:1px solid ${o.chip};vertical-align:middle;margin-right:6px;flex-shrink:0"></span>`:"";return`<span style="display:inline-flex;align-items:center;font-family:'DM Mono',monospace;font-size:.8rem;${n}">${t}${e}</span>`}function z(e){return`<span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:.68rem;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap;${e.badge}">${e.label}</span>`}function D(e){const r=e.split("."),n=r.slice(-2).join("."),t=r.slice(0,-2).join(".");return t?`<span style="color:${o.inkFaint};font-size:.75rem">${t}.</span><strong>${n}</strong>`:`<strong>${n}</strong>`}function R(e){const r=L[e.kind];if(e.kind==="group-added"||e.kind==="group-removed")return`
      <tr style="background:${r.rowBg};border-left:3px solid ${r.rowBorder}">
        <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem" colspan="3">
          ${D(e.path)}
        </td>
        <td style="padding:8px 12px">${z(r)}</td>
      </tr>`;const t=e.baseline?.$value??null,a=e.current?.$value??null;return`
    <tr style="background:${r.rowBg};border-left:3px solid ${r.rowBorder}">
      <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem">${D(e.path)}</td>
      <td style="padding:8px 12px">${C(t,e.kind==="removed")}</td>
      <td style="padding:8px 12px">${C(a,!1)}</td>
      <td style="padding:8px 12px">${z(r)}</td>
    </tr>`}function F(e,r){const n=r.map(R).join(""),t=e.split(".").slice(1).join(" › ")||e,a=`<span style="margin-left:8px;font-size:.7rem;font-family:'DM Mono',monospace;color:${o.inkFaint}">${r.length} change${r.length!==1?"s":""}</span>`;return`
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
        ${t}${a}
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
        <tbody>${n}</tbody>
      </table>
    </details>`}function T(e){const r={};for(const a of e)r[a.kind]=(r[a.kind]??0)+1;const n=[],t=["added","removed","changed-value","changed-alias","alias-to-value","value-to-alias","group-added","group-removed"];for(const a of t){const l=r[a];if(!l)continue;const i=L[a];n.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;${i.badge};font-size:.75rem;font-family:'DM Mono',monospace">
        <strong>${l}</strong> ${i.label}
      </span>`)}return n.length===0?`<p style="font-family:'DM Mono',monospace;font-size:.85rem;color:${o.inkFaint};padding:16px 0">No semantic changes detected.</p>`:`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">${n.join("")}</div>`}const E=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`;function k(e,r={}){const{baselineLabel:n="baseline",currentLabel:t="current"}=r,l=[...N(e).entries()].map(([$,g])=>F($,g)).join(""),i=e.length===0;return`
${E}
<div style="
  background:${o.paper};
  color:${o.ink};
  font-family:'DM Mono',monospace;
  min-height:100vh;
  padding:40px 32px;
  box-sizing:border-box;
">
  <!-- Header -->
  <div style="margin-bottom:32px;border-bottom:2px solid ${o.ink};padding-bottom:16px">
    <div style="font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${o.inkFaint};margin-bottom:6px">Cedar Design Tokens</div>
    <h1 style="margin:0;font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.1">Semantic Diff</h1>
    <div style="margin-top:8px;font-size:.78rem;color:${o.inkFaint}">
      Comparing <code style="background:${o.removedBorder}22;padding:1px 5px;border-radius:3px">${n}</code>
      → <code style="background:${o.addedBorder}22;padding:1px 5px;border-radius:3px">${t}</code>
    </div>
  </div>

  <!-- Summary pills -->
  ${T(e)}

  <!-- Legend row -->
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:.72rem;font-family:'Syne',sans-serif;letter-spacing:.04em;color:${o.inkFaint}">
    <span>● Sections are expanded by default — click to collapse</span>
    <span>● Unchanged tokens are not shown</span>
  </div>

  ${i?`<p style="font-size:.9rem;color:${o.inkFaint}">Baseline and current are identical.</p>`:l}
</div>`}const P={title:"Cedar Tokens / Semantic Diff",render:()=>""};function A(e){return()=>{const r=document.createElement("div");return r.style.cssText="min-height:200px",r.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token diff…
      </div>`,e().then(n=>{r.innerHTML=n}).catch(n=>{const t=n instanceof Error?n.message:String(n);r.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading diff: ${t}
          </div>`}),r}}const v={color:{"Neutral Colors":{"warm-grey":{100:{$value:"#edeae3",$type:"color"},300:{$value:"#b2ab9f",$type:"color"},600:{$value:"#736e65",$type:"color"},900:{$value:"#2e2e2b",$type:"color"}},"base-neutrals":{black:{$value:"#000000",$type:"color"},white:{$value:"#ffffff",$type:"color"},"white-85":{$value:"#ffffffd9",$type:"color"},"white-75":{$value:"#ffffffbf",$type:"color"}}},"Brand Colors":{blue:{400:{$value:"#406eb5",$type:"color"},600:{$value:"#0b2d60",$type:"color"}},red:{400:{$value:"#be342d",$type:"color"},600:{$value:"#610a0a",$type:"color"}},green:{400:{$value:"#3b8349",$type:"color"},600:{$value:"#1f513f",$type:"color"}},yellow:{400:{$value:"#ffbf59",$type:"color"},600:{$value:"#ffe7b3",$type:"color"},800:{$value:"#ede285",$type:"color"}}},surface:{base:{$value:"{color.Neutral Colors.base-neutrals.white}",$type:"color"},raised:{$value:"{color.Neutral Colors.warm-grey.100}",$type:"color"}},text:{base:{$value:"{color.Neutral Colors.warm-grey.900}",$type:"color"},subtle:{$value:"{color.Neutral Colors.warm-grey.600}",$type:"color"},link:{$value:"{color.Brand Colors.blue.600}",$type:"color"},"link-hover":{$value:"{color.Brand Colors.blue.400}",$type:"color"}},border:{base:{$value:"{color.Neutral Colors.warm-grey.300}",$type:"color"},subtle:{$value:"{color.Neutral Colors.warm-grey.100}",$type:"color"}}}},G={color:{"Neutral Colors":{"warm-grey":{100:{$value:"#edeae3",$type:"color"},300:{$value:"#b2ab9f",$type:"color"},600:{$value:"#736e65",$type:"color"},900:{$value:"#1a1a18",$type:"color"}},"base-neutrals":{black:{$value:"#000000",$type:"color"},white:{$value:"#ffffff",$type:"color"},"white-85":{$value:"#ffffffd9",$type:"color"}}},"Brand Colors":{blue:{400:{$value:"#4a7ec8",$type:"color"},600:{$value:"#0b2d60",$type:"color"}},red:{400:{$value:"#be342d",$type:"color"},600:{$value:"#610a0a",$type:"color"}},green:{400:{$value:"#3b8349",$type:"color"},600:{$value:"#1f513f",$type:"color"}},yellow:{400:{$value:"#ffbf59",$type:"color"},600:{$value:"#ffe7b3",$type:"color"},800:{$value:"#ede285",$type:"color"}},teal:{400:{$value:"#2a8a8a",$type:"color"},600:{$value:"#1a5555",$type:"color"}}},surface:{base:{$value:"{color.Neutral Colors.base-neutrals.white}",$type:"color"},raised:{$value:"{color.Neutral Colors.warm-grey.100}",$type:"color"},overlay:{$value:"{color.Neutral Colors.base-neutrals.black}",$type:"color"}},text:{base:{$value:"{color.Neutral Colors.warm-grey.900}",$type:"color"},subtle:{$value:"{color.Neutral Colors.warm-grey.600}",$type:"color"},link:{$value:"{color.Brand Colors.blue.400}",$type:"color"},"link-hover":{$value:"{color.Brand Colors.blue.400}",$type:"color"}},border:{base:{$value:"{color.Neutral Colors.warm-grey.300}",$type:"color"},subtle:{$value:"{color.Neutral Colors.warm-grey.100}",$type:"color"}},feedback:{success:{$value:"{color.Brand Colors.green.400}",$type:"color"},warning:{$value:"{color.Brand Colors.yellow.400}",$type:"color"},error:{$value:"{color.Brand Colors.red.400}",$type:"color"}}}},m={name:"Full Diff (inline fixtures)",render:()=>{const e=x(v,G);return k(e,{baselineLabel:"baseline (inline)",currentLabel:"current (inline)"})}},b={name:"No Changes",render:()=>{const e=x(v,v);return k(e,{baselineLabel:"v1.0.0",currentLabel:"v1.0.0"})}},O=`
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
</div>`,f={name:"Live Diff (fetched)",render:A(async()=>{const e=window.location.pathname.replace(/\/[^/]*$/,"/"),[r,n]=await Promise.all([fetch(`${e}normalized/baseline.json`),fetch(`${e}normalized/current.json`)]);if(r.status===404||n.status===404)return O;if(!r.ok)throw new Error(`baseline.json: ${r.status} ${r.statusText}`);if(!n.ok)throw new Error(`current.json: ${n.status} ${n.statusText}`);const t=await r.json(),a=await n.json(),l=x(t,a);return k(l,{baselineLabel:"baseline.json",currentLabel:"current.json"})})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:"Fetches both JSON fixtures from the static server at runtime.\nRequires `dist/normalized/baseline.json` and `dist/normalized/current.json`\nto exist. Generate them with `pnpm tokens:snapshot baseline` /\n`pnpm tokens:snapshot current`, then restart Storybook.",...f.parameters?.docs?.description}}};const H=["FullDiff","NoChanges","LiveDiff"];export{m as FullDiff,f as LiveDiff,b as NoChanges,H as __namedExportsOrder,P as default};
