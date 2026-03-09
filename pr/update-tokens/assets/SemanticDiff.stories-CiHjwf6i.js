function j(e){return typeof e=="object"&&e!==null&&"$value"in e&&"$type"in e}function z(e){return e.trimStart().startsWith("{")&&e.trimEnd().endsWith("}")}function y(e,n,a){for(const[o,r]of Object.entries(e)){const i=n?`${n}.${o}`:o;j(r)?a.set(i,r):typeof r=="object"&&r!==null&&y(r,i,a)}}function v(e,n,a){for(const[o,r]of Object.entries(e)){const i=n?`${n}.${o}`:o;j(r)||typeof r=="object"&&r!==null&&(a.add(i),v(r,i,a))}}function $(e,n){const a=new Map,o=new Map;y(e,"",a),y(n,"",o);const r=new Set,i=new Set;v(e,"",r),v(n,"",i);const l=[],b=new Set([...a.keys(),...o.keys()]);for(const s of b){const c=a.get(s)??null,d=o.get(s)??null;if(c===null&&d!==null)l.push({path:s,kind:"added",baseline:null,current:d});else if(c!==null&&d===null)l.push({path:s,kind:"removed",baseline:c,current:null});else if(c!==null&&d!==null){if(c.$value===d.$value)continue;const p=z(c.$value),u=z(d.$value);p&&u?l.push({path:s,kind:"changed-alias",baseline:c,current:d}):!p&&!u?l.push({path:s,kind:"changed-value",baseline:c,current:d}):p&&!u?l.push({path:s,kind:"alias-to-value",baseline:c,current:d}):l.push({path:s,kind:"value-to-alias",baseline:c,current:d})}}const m=new Set([...i].filter(s=>!r.has(s))),w=new Set([...r].filter(s=>!i.has(s)));function k(s,c){const d=s.split(".");for(let p=1;p<d.length;p++){const u=d.slice(0,p).join(".");if(c.has(u))return!0}return!1}for(const s of m)k(s,m)||l.push({path:s,kind:"group-added",baseline:null,current:null});for(const s of w)k(s,w)||l.push({path:s,kind:"group-removed",baseline:null,current:null});return l.sort((s,c)=>s.path.localeCompare(c.path))}function T(e,n=2){const a=new Map;for(const o of e){const r=o.path.split("."),i=r[0]==="color"&&r[1]==="modes"?3:n,l=r.slice(0,i).join(".");a.has(l)||a.set(l,[]),a.get(l).push(o)}return a}const t={paper:"#f5f2eb",ink:"#2e2e2b",inkFaint:"#736e65",rule:"#ccc9c1",added:"#d4edda",addedBorder:"#3b8349",removed:"#f8d7da",removedBorder:"#be342d",changed:"#fff3cd",changedBorder:"#c8a020",structural:"#e8e4f8",structuralBorder:"#5a4fcf",chip:"#00000018"},M={added:{label:"Added",badge:`background:${t.addedBorder};color:#fff`,rowBg:t.added,rowBorder:t.addedBorder},removed:{label:"Removed",badge:`background:${t.removedBorder};color:#fff`,rowBg:t.removed,rowBorder:t.removedBorder},"changed-value":{label:"Value changed",badge:`background:${t.changedBorder};color:#fff`,rowBg:t.changed,rowBorder:t.changedBorder},"changed-alias":{label:"Alias retargeted",badge:`background:${t.changedBorder};color:#fff`,rowBg:t.changed,rowBorder:t.changedBorder},"alias-to-value":{label:"Alias → Value",badge:`background:${t.structuralBorder};color:#fff`,rowBg:t.structural,rowBorder:t.structuralBorder},"value-to-alias":{label:"Value → Alias",badge:`background:${t.structuralBorder};color:#fff`,rowBg:t.structural,rowBorder:t.structuralBorder},"group-added":{label:"Group added",badge:`background:${t.addedBorder};color:#fff`,rowBg:t.added,rowBorder:t.addedBorder},"group-removed":{label:"Group removed",badge:`background:${t.removedBorder};color:#fff`,rowBg:t.removed,rowBorder:t.removedBorder}};function F(e){return/^#[0-9a-fA-F]{3,8}$/.test(e.trim())}function B(e,n=!1){if(e===null)return`<span style="color:${t.inkFaint}">—</span>`;const a=n?"text-decoration:line-through;opacity:.55;":"",o=e.trimStart().startsWith("clamp("),r=F(e)?`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${e};border:1px solid ${t.chip};vertical-align:middle;margin-right:6px;flex-shrink:0"></span>`:o?`<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:linear-gradient(90deg,#b2ab9f 0%,#2e2e2b 100%);border:1px solid ${t.chip};vertical-align:middle;margin-right:6px;flex-shrink:0" title="fluid"></span>`:"";return`<span style="display:inline-flex;align-items:center;font-family:'DM Mono',monospace;font-size:.8rem;${a}">${r}${e}</span>`}function D(e){return`<span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:.68rem;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap;${e.badge}">${e.label}</span>`}function S(e){const n=e.split("."),a=n.slice(-2).join("."),o=n.slice(0,-2).join(".");return o?`<span style="color:${t.inkFaint};font-size:.75rem">${o}.</span><strong>${a}</strong>`:`<strong>${a}</strong>`}function C(e){const n=M[e.kind];if(e.kind==="group-added"||e.kind==="group-removed")return`
      <tr style="background:${n.rowBg};border-left:3px solid ${n.rowBorder}">
        <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem" colspan="3">
          ${S(e.path)}
        </td>
        <td style="padding:8px 12px">${D(n)}</td>
      </tr>`;const o=e.baseline?.$value??null,r=e.current?.$value??null;return`
    <tr style="background:${n.rowBg};border-left:3px solid ${n.rowBorder}">
      <td style="padding:8px 12px;font-family:'DM Mono',monospace;font-size:.8rem">${S(e.path)}</td>
      <td style="padding:8px 12px">${B(o,e.kind==="removed")}</td>
      <td style="padding:8px 12px">${B(r,!1)}</td>
      <td style="padding:8px 12px">${D(n)}</td>
    </tr>`}function A(e,n){const a=n.map(C).join(""),o=e.split(".");let r;o[0]==="color"&&o[1]==="modes"&&o[2]?r=`${o[2]} <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[color mode]</span>`:o[0]==="spacing"&&o[1]==="scale"?r='scale <span style="font-weight:400;font-size:.7rem;opacity:.6;text-transform:none;letter-spacing:0">[fluid]</span>':r=o.slice(1).join(" › ")||e;const i=`<span style="margin-left:8px;font-size:.7rem;font-family:'DM Mono',monospace;color:${t.inkFaint}">${n.length} change${n.length!==1?"s":""}</span>`;return`
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
        ${r}${i}
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
        <tbody>${a}</tbody>
      </table>
    </details>`}function G(e){const n={};for(const r of e)n[r.kind]=(n[r.kind]??0)+1;const a=[],o=["added","removed","changed-value","changed-alias","alias-to-value","value-to-alias","group-added","group-removed"];for(const r of o){const i=n[r];if(!i)continue;const l=M[r];a.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:4px;${l.badge};font-size:.75rem;font-family:'DM Mono',monospace">
        <strong>${i}</strong> ${l.label}
      </span>`)}return a.length===0?`<p style="font-family:'DM Mono',monospace;font-size:.85rem;color:${t.inkFaint};padding:16px 0">No changes detected.</p>`:`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">${a.join("")}</div>`}const N=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">`;function x(e,n={}){const{baselineLabel:a="baseline",currentLabel:o="current"}=n,i=[...T(e).entries()].map(([b,m])=>A(b,m)).join(""),l=e.length===0;return`
${N}
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
      Comparing <code style="background:${t.removedBorder}22;padding:1px 5px;border-radius:3px">${a}</code>
      → <code style="background:${t.addedBorder}22;padding:1px 5px;border-radius:3px">${o}</code>
    </div>
  </div>

  <!-- Summary pills -->
  ${G(e)}

  <!-- Legend row -->
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:.72rem;font-family:'Syne',sans-serif;letter-spacing:.04em;color:${t.inkFaint}">
    <span>● Sections are expanded by default — click to collapse</span>
    <span>● Unchanged tokens are not shown</span>
  </div>

  ${l?`<p style="font-size:.9rem;color:${t.inkFaint}">Baseline and current are identical.</p>`:i}
</div>`}const O={title:"Cedar Tokens / Semantic Diff",render:()=>""};function L(e){return()=>{const n=document.createElement("div");return n.style.cssText="min-height:200px",n.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token diff…
      </div>`,e().then(a=>{n.innerHTML=a}).catch(a=>{const o=a instanceof Error?a.message:String(a);n.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading diff: ${o}
          </div>`}),n}}const R=`
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
</div>`,h={name:"No Changes",render:L(async()=>{const e=window.location.pathname.replace(/\/[^/]*$/,"/"),n=await fetch(`${e}normalized/baseline.json`);if(n.status===404)return R;if(!n.ok)throw new Error(`baseline.json: ${n.status} ${n.statusText}`);const a=await n.json(),o=$(a,a);return x(o,{baselineLabel:"v1.0.0",currentLabel:"v1.0.0"})})},f={name:"Live Diff (fetched)",render:L(async()=>{const e=window.location.pathname.replace(/\/[^/]*$/,"/"),[n,a]=await Promise.all([fetch(`${e}normalized/baseline.json`),fetch(`${e}normalized/current.json`)]);if(n.status===404||a.status===404)return R;if(!n.ok)throw new Error(`baseline.json: ${n.status} ${n.statusText}`);if(!a.ok)throw new Error(`current.json: ${a.status} ${a.statusText}`);const o=await n.json(),r=await a.json(),i=$(o,r);return x(i,{baselineLabel:"baseline.json",currentLabel:"current.json"})})},g={name:"All Diff Cases",render:()=>{const a=$({color:{modes:{default:{text:{link:{$value:"{color.neutral-palette.blue.600}",$type:"color"},heading:{$value:"{color.neutral-palette.warm-grey.900}",$type:"color"},inverse:{$value:"{color.neutral-palette.warm-grey.50}",$type:"color"}},surface:{base:{$value:"#f5f2eb",$type:"color"},overlay:{$value:"#2e2e2b33",$type:"color"}}}},"neutral-palette":{"warm-grey":{100:{$value:"#edeae3",$type:"color"},50:{$value:"#f5f2eb",$type:"color"}}}},spacing:{scale:{"-50":{$value:"clamp(4px, 0.3571vw + 2.857px, 8px)",$type:"spacing"},0:{$value:"clamp(8px, 0.7143vw + 5.714px, 16px)",$type:"spacing"}},component:{"button-padding-x":{$value:"16px",$type:"spacing"}}},legacy:{"icon-size":{$value:"20px",$type:"sizing"},"icon-size-lg":{$value:"28px",$type:"sizing"}}},{color:{modes:{default:{text:{link:{$value:"{color.neutral-palette.blue.700}",$type:"color"},heading:{$value:"#1a1a18",$type:"color"},muted:{$value:"{color.neutral-palette.warm-grey.500}",$type:"color"}},surface:{base:{$value:"#f8f6f0",$type:"color"},overlay:{$value:"{color.neutral-palette.warm-grey.900}",$type:"color"}}}},"neutral-palette":{"warm-grey":{100:{$value:"#e8e4dc",$type:"color"},50:{$value:"#f5f2eb",$type:"color"}}}},spacing:{scale:{"-50":{$value:"clamp(2px, 0.2232vw + 1.786px, 6px)",$type:"spacing"},0:{$value:"clamp(8px, 0.7143vw + 5.714px, 16px)",$type:"spacing"}},component:{},layout:{"content-max-width":{$value:"1280px",$type:"sizing"},"sidebar-width":{$value:"280px",$type:"sizing"}}}});return x(a,{baselineLabel:"v2.0.0 (synthetic)",currentLabel:"v2.1.0 (synthetic)"})}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:`Fetches both JSON snapshots from the static server at runtime.
This story displays **all token changes** across all categories:
- Primitive token values (hex colors, sizing, etc.)
- Semantic token aliases (text, surface, border, etc.)
- Spacing and other sections
- Structural changes (added/removed groups)

The diff includes 8 kinds of changes:
- added, removed (token-level)
- changed-value, changed-alias (token modifications)
- alias-to-value, value-to-alias (structural type changes)
- group-added, group-removed (section-level changes)`,...f.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Purely static story using hardcoded synthetic token trees.
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
  alias references {path.to.token}`,...g.parameters?.docs?.description}}};const E=["NoChanges","LiveDiff","AllDiffCases"];export{g as AllDiffCases,f as LiveDiff,h as NoChanges,E as __namedExportsOrder,O as default};
