import{t as e}from"./chunk-BvrOYcoh.js";import{a as t,t as n}from"./load-tokens-DXw-3Exz.js";function r(e){return()=>{let t=document.createElement(`div`);return t.style.cssText=`min-height:200px;background:#f5f2eb;`,t.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token compilation snapshots…
      </div>`,e().then(e=>{t.innerHTML=e}).catch(e=>{t.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading compilation reference: ${e instanceof Error?e.message:String(e)}
          </div>`}),t}}function i(...e){return`
    <nav class="breadcrumb">
      ${e.map((t,n)=>{let r=n===e.length-1;return`<span class="bc-seg${r?` bc-cur`:``}">${t}</span>${r?``:`<span class="bc-sep">/</span>`}`}).join(``)}
    </nav>
  `}function a(e,t,n){return`
    <div class="section-header">
      <span class="section-label">${e}</span>
      <span class="section-title">${t}</span>
      <span class="section-count">${n} active tokens</span>
    </div>
  `}function o(e){let t=Math.max(...e.map(e=>e.value),1);return`
    <div class="static-grid">
      <div class="static-grid-header">
        <div>Proportion</div><div>Name</div><div>Token Path</div><div style="text-align:right">Value</div>
      </div>
      ${e.map(e=>`
      <div class="srow-bar-wrap">
        <div class="srow-bar-track">
          <div class="srow-bar-fill" style="width: ${e.value/t*100}%"></div>
        </div>
      </div>
      <div class="srow-name">${e.name}</div>
      <div class="srow-decl" title="${e.path}">${e.path}</div>
      <div class="srow-kind"><span class="srow-badge swift">${e.value}${e.unit}</span></div>
    `).join(``)}
    </div>
  `}var s,c,l,u,d;e((()=>{n(),s={title:`Tokens/Spacing/Native (iOS)`},c=`
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper:       #f5f2eb;
    --ink:         #1a1a18;
    --ink-mid:     #2e2e2b;
    --ink-muted:   #736e65;
    --ink-faint:   #b2ab9f;
    --rule:        rgba(46, 46, 43, 0.12);
    --rule-heavy:  rgba(46, 46, 43, 0.28);
    --ios-blue:    #007aff;
    --font-mono:   'DM Mono', 'Courier New', monospace;
    --font-sans:   'Syne', system-ui, sans-serif;
  }

  body { background: var(--paper); color: var(--ink); font-family: var(--font-mono); -webkit-font-smoothing: antialiased; }
  .page { padding: 3rem 3.5rem 5rem; max-width: 1100px; }

  .breadcrumb { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 2.5rem; }
  .bc-seg { font-family: var(--font-sans); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.75rem; }
  .bc-cur { color: var(--ink-muted); }

  .page-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 0; }
  .page-eyebrow { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 0.25rem; }
  .page-title { font-family: var(--font-sans); font-size: 2.25rem; font-weight: 800; color: var(--ink); letter-spacing: -0.04em; line-height: 1; }
  .page-meta-count { font-family: var(--font-mono); font-size: 3.5rem; font-weight: 800; color: rgba(46,46,43,0.06); line-height: 1; letter-spacing: -0.06em; }
  .page-meta-label { font-family: var(--font-sans); font-size: 0.625rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); margin-top: 0.15rem; text-align: right; }

  .section-header { display: flex; align-items: baseline; gap: 1.5rem; margin-bottom: 0.625rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid var(--rule-heavy); }
  .section-label  { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title  { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count  { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-faint); margin-left: auto; }

  /* Proportional Metrics Grids */
  .static-grid { display: grid; grid-template-columns: auto 1fr 1fr auto; align-items: center; gap: 0 1.5rem; }
  .static-grid-header {
    grid-column: 1 / -1; display: grid; grid-template-columns: auto 1fr 1fr auto; gap: 0 1.5rem;
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-faint); padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule-heavy);
  }
  
  .srow-bar-wrap { padding: 0.75rem 0 0.625rem; border-bottom: 1px solid var(--rule); min-width: 140px; }
  .srow-bar-track { position: relative; height: 6px; border-radius: 3px; background: var(--rule); width: 100%; max-width: 200px; }
  .srow-bar-fill { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 3px; background: var(--ink-mid); }
  
  .srow-name { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 500; color: var(--ink); }
  .srow-decl { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .srow-kind { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); text-align: right; }
  
  .srow-badge {
    display: inline-block; font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid var(--rule-heavy);
    border-radius: 2px; padding: 0.125rem 0.375rem; background: rgba(46,46,43,0.04); color: var(--ink-muted);
  }
  .srow-badge.swift { border-color: var(--ios-blue); color: var(--ios-blue); background: rgba(0,122,255,0.05); }

  .demo-note {
    font-family: var(--font-sans); font-size: 0.8125rem; color: var(--ink-muted); line-height: 1.6;
    border-left: 2px solid var(--rule-heavy); padding-left: 1rem; margin: 1.5rem 0 2.5rem;
  }
  
  .swift-code-block {
    background: #1e1e24; color: #f8f8f2; padding: 1.25rem; border-radius: 6px;
    font-family: var(--font-mono); font-size: 0.75rem; line-height: 1.5; overflow-x: auto; margin: 1rem 0;
  }
`,l={name:`Space Group Static`,render:r(async()=>{let e=await t();return`
      <style>${c}</style>
      <div class="page">
        ${i(`Cedar Native`,`Spacing`,`Space`,`Static`)}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Native Application Layer</div>
            <div class="page-title">Spacing "Space" Group</div>
          </div>
          <div>
            <div class="page-meta-count">${e.length}</div>
            <div class="page-meta-label">iOS Constants</div>
          </div>
        </div>

        <div class="demo-note">
          This catalog maps out your normalized <code>space</code> group elements resolved strictly 
          against layout configurations. These point allocations allow native layouts to scale 
          without viewport interpolation overhead.
        </div>

        ${a(`Static Core Dimensions`,`CdrSpacing Properties`,e.length)}
        ${o(e)}
      </div>
    `})},u={name:`CdrSpacing.swift File Preview`,render:r(async()=>{let e=await t(),n=e=>e.replace(/-([a-z])/g,(e,t)=>t.toUpperCase()),r=`// Automatically generated by Cedar Token Pipeline
import UIKit
import Foundation

public struct CdrSpacing {
${e.map(e=>`    public static let ${n(e.name)} = CGFloat(${e.value})`).join(`
`)}
}`;return`
      <style>${c}</style>
      <div class="page">
        ${i(`Cedar Native`,`Spacing`,`File Definition`)}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">Compilation Output Snapshot</div>
            <div class="page-title">CdrSpacing.swift Source</div>
          </div>
        </div>

        <div class="demo-note">
          This preview represents the exact compiled source code generated inside 
          <code>dist/themes/rei-dot-com/ios/</code> distribution directory.
        </div>

        ${a(`Swift Output Structures`,`Compiled Output Definitions`,e.length)}
        <pre class="swift-code-block"><code>${r.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</code></pre>
      </div>
    `})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Space Group Static",
  render: asyncStory(async () => {
    const tokens = await loadStaticSpacingTokens();
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Native", "Spacing", "Space", "Static")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Native Application Layer</div>
            <div class="page-title">Spacing "Space" Group</div>
          </div>
          <div>
            <div class="page-meta-count">\${tokens.length}</div>
            <div class="page-meta-label">iOS Constants</div>
          </div>
        </div>

        <div class="demo-note">
          This catalog maps out your normalized <code>space</code> group elements resolved strictly 
          against layout configurations. These point allocations allow native layouts to scale 
          without viewport interpolation overhead.
        </div>

        \${sectionHeader("Static Core Dimensions", "CdrSpacing Properties", tokens.length)}
        \${staticTokenTable(tokens)}
      </div>
    \`;
  })
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "CdrSpacing.swift File Preview",
  render: asyncStory(async () => {
    const tokens = await loadStaticSpacingTokens();
    const toCamelCase = (name: string) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const swiftLines = tokens.map(t => \`    public static let \${toCamelCase(t.name)} = CGFloat(\${t.value})\`).join("\\n");
    const fullSwiftFileContent = \`// Automatically generated by Cedar Token Pipeline
import UIKit
import Foundation

public struct CdrSpacing {
\${swiftLines}
}\`;
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Native", "Spacing", "File Definition")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">Compilation Output Snapshot</div>
            <div class="page-title">CdrSpacing.swift Source</div>
          </div>
        </div>

        <div class="demo-note">
          This preview represents the exact compiled source code generated inside 
          <code>dist/themes/rei-dot-com/ios/</code> distribution directory.
        </div>

        \${sectionHeader("Swift Output Structures", "Compiled Output Definitions", tokens.length)}
        <pre class="swift-code-block"><code>\${fullSwiftFileContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
      </div>
    \`;
  })
}`,...u.parameters?.docs?.source}}},d=[`SpacingSpaceGroup`,`SwiftFileCompilation`]}))();export{l as SpacingSpaceGroup,u as SwiftFileCompilation,d as __namedExportsOrder,s as default};