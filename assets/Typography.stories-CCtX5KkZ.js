import{t as e}from"./chunk-BvrOYcoh.js";import{o as t,t as n}from"./load-tokens-DXw-3Exz.js";function r(e){return()=>{let t=document.createElement(`div`);return t.style.cssText=`min-height:200px;background:#f5f2eb;`,t.innerHTML=`
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:0.85rem;color:#736e65">
        Loading normalized typography elements…
      </div>`,e().then(e=>{typeof e==`string`?t.innerHTML=e:(t.innerHTML=``,t.appendChild(e))}).catch(e=>{t.innerHTML=`
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:0.85rem;color:#be342d">
            Error loading typography tokens: ${e instanceof Error?e.message:String(e)}
          </div>`}),t}}function i(...e){return`
    <nav class="breadcrumb">
      ${e.map((t,n)=>{let r=n===e.length-1;return`<span class="bc-seg${r?` bc-cur`:``}">${t}</span>${r?``:`<span class="bc-sep">/</span>`}`}).join(``)}
    </nav>
  `}function a(e,t,n){return`
    <div class="section-header">
      <span class="section-label">${e}</span>
      <span class="section-title">${t}</span>
      <span class="section-count">${n} token${n===1?``:`s`}</span>
    </div>
  `}function o(e){return`
    <div class="cat-header">
      <span class="cat-pip"></span>
      <span class="cat-name">${e}</span>
      <span class="cat-rule"></span>
    </div>
  `}function s(e){let t=`font-size:16px;line-height:1.5;font-family:system-ui,sans-serif;`;switch(e.category){case`family`:return`${t}font-family:${e.fallback?`'${e.value}',${e.fallback}`:`'${e.value}',sans-serif`};`;case`size`:return`font-family:system-ui,sans-serif;font-size:${e.value}px;line-height:1.3;`;case`weight`:return`${t}font-weight:${e.value};`;case`style`:return`${t}font-style:${e.value};`;case`line-height`:return`font-family:system-ui,sans-serif;font-size:14px;line-height:${e.value}px;`;case`letter-spacing`:return`${t}letter-spacing:${e.value}px;`;default:return t}}function c(e){return`
    <div class="token-grid">
      <div class="token-grid-header">
        <div>Token</div><div>Preview</div><div>Value</div><div style="text-align:right">Type</div>
      </div>
      ${e.map(e=>{let t=String(e.value);e.category===`family`&&e.fallback?t=`'${e.value}',${e.fallback}`:(e.category===`size`||e.category===`line-height`||e.category===`letter-spacing`)&&(t=`${e.value}px`);let n=e.category===`line-height`?p:f;return`
      <div class="trow-cell trow-name">${e.name}</div>
      <div class="trow-cell trow-preview">
        <span style="${s(e)}">${n}</span>
      </div>
      <div class="trow-cell trow-value">${t}</div>
      <div class="trow-cell trow-meta">
        <span class="trow-badge ${e.type}">${e.type}</span>
      </div>
    `}).join(``)}
    </div>
  `}function l(e,n){return{name:n,render:r(async()=>{let r=(await t()).filter(t=>t.category===e);return`
        <style>${d}</style>
        <div class="page">
          ${i(`Cedar Tokens`,`Typography`,`Primitives`,n)}
          <div class="page-title-row">
            <div>
              <div class="page-eyebrow">Option Tokens</div>
              <div class="page-title">${n}</div>
            </div>
            <div>
              <div class="page-meta-count">${r.length}</div>
              <div class="page-meta-label">tokens</div>
            </div>
          </div>
          <div style="margin-top:2rem">
            ${c(r)}
          </div>
        </div>
      `})}}var u,d,f,p,m,h,g,_,v,y,b,x,S;e((()=>{n(),u={title:`Tokens/Typography/Primitives`},d=`
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Syne:wght@400;500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper:       #f5f2eb;
    --ink:         #1a1a18;
    --ink-mid:     #2e2e2b;
    --ink-muted:   #736e65;
    --ink-faint:   #b2ab9f;
    --rule:        rgba(46, 46, 43, 0.12);
    --rule-heavy:  rgba(46, 46, 43, 0.28);
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

  .cat-header { display: flex; align-items: center; gap: 0.625rem; margin: 2.25rem 0 0.875rem; }
  .cat-pip { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); flex-shrink: 0; }
  .cat-name { font-family: var(--font-sans); font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-muted); }
  .cat-rule { flex: 1; height: 1px; background: var(--rule); }

  .token-grid { display: grid; grid-template-columns: minmax(160px, 1fr) 2fr minmax(80px, 1fr) auto; align-items: center; gap: 0 1.5rem; }
  .token-grid-header {
    grid-column: 1 / -1; display: grid; grid-template-columns: minmax(160px, 1fr) 2fr minmax(80px, 1fr) auto; gap: 0 1.5rem;
    font-family: var(--font-sans); font-size: 0.625rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-faint); padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule-heavy);
  }

  .trow-cell { padding: 0.625rem 0; border-bottom: 1px solid var(--rule); font-family: var(--font-mono); font-size: 0.8125rem; color: var(--ink-mid); }
  .trow-name { font-weight: 500; color: var(--ink); font-size: 0.6875rem; }
  .trow-preview { overflow: hidden; color: var(--ink); }
  .trow-value { font-size: 0.75rem; color: var(--ink-muted); word-break: break-all; }
  .trow-meta { text-align: right; }

  .trow-badge {
    display: inline-block; font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid var(--rule-heavy);
    border-radius: 2px; padding: 0.125rem 0.375rem; background: rgba(46,46,43,0.04); color: var(--ink-muted);
  }
  .trow-badge.string { border-color: #406eb5; color: #406eb5; background: rgba(64,110,181,0.05); }
  .trow-badge.number { border-color: #b2ab9f; color: var(--ink-mid); background: rgba(46,46,43,0.04); }

  .demo-note {
    font-family: var(--font-sans); font-size: 0.8125rem; color: var(--ink-muted); line-height: 1.6;
    border-left: 2px solid var(--rule-heavy); padding-left: 1rem; margin: 1.5rem 0 2.5rem;
  }

  .preview-card {
    background: #ffffff; border: 1px solid var(--rule-heavy); border-radius: 6px;
    padding: 2rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;
  }
`,f=`The quick brown fox`,p=`Explore the outdoors in comfort and style.`,m=l(`family`,`Font Family`),h=l(`size`,`Font Size`),g=l(`line-height`,`Line Height`),_=l(`letter-spacing`,`Letter Spacing`),v=l(`style`,`Font Style`),y=l(`weight`,`Font Weight`),b={name:`All Primitives`,render:r(async()=>{let e=await t(),n=[{key:`family`,label:`Font Families`},{key:`size`,label:`Font Sizes`},{key:`line-height`,label:`Line Heights`},{key:`letter-spacing`,label:`Letter Spacing`},{key:`style`,label:`Font Style`},{key:`weight`,label:`Font Weight`}].map(({key:t,label:n})=>{let r=e.filter(e=>e.category===t);return r.length===0?``:`${o(n)}\n${c(r)}`}).join(``);return`
      <style>${d}</style>
      <div class="page">
        ${i(`Cedar Tokens`,`Typography`,`Primitives`,`All`)}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Typography<br>Primitives</div>
          </div>
          <div>
            <div class="page-meta-count">${e.length}</div>
            <div class="page-meta-label">Total Tokens</div>
          </div>
        </div>
        <div class="demo-note">
          All primitive typography option tokens from the Figma normalization layer.
        </div>
        ${n}
      </div>
    `})},x={name:`Live Rendering Preview`,render:r(async()=>{let e=await t(),n=e.find(e=>e.name.includes(`family-graphik`)),r=e.find(e=>e.name.includes(`size-500`))?.value||24,o=e.find(e=>e.name.includes(`line-height-5`))?.value||32,s=e.find(e=>e.name.includes(`size-200`))?.value||16,c=e.find(e=>e.name.includes(`line-height-2`))?.value||24,l=n?`'${n.value}', ${n.fallback||`sans-serif`}`:`system-ui`;return`
      <style>${d}</style>
      <div class="page">
        ${i(`Cedar Tokens`,`Typography`,`Primitives`,`Live Preview`)}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">Visual Diagnostics Contract</div>
            <div class="page-title">Typography Rendering</div>
          </div>
        </div>

        <div class="demo-note">
          Live typographic rendering using actual token values from the pipeline.
        </div>

        ${a(`Rendered Targets`,`Typographic Combination Assertions`,2)}

        <div class="preview-card" style="font-family: ${l};">
          <div>
            <span class="trow-badge number" style="margin-bottom: 0.5rem;">Heading (Size 500 / Line-Height 5)</span>
            <h2 style="font-size: ${r}px; line-height: ${o}px; font-weight: 700; letter-spacing: -0.02em;">
              Explore the great outdoors in comfort.
            </h2>
          </div>
          <div style="margin-top: 1rem;">
            <span class="trow-badge number" style="margin-bottom: 0.5rem;">Body Text (Size 200 / Line-Height 2)</span>
            <p style="font-size: ${s}px; line-height: ${c}px; color: var(--ink-mid);">
              Get expert advice, quality outdoor gear, and clothing for climbing, hiking, cycling, and more at REI. 
              Our normalization layer guarantees that variable spacing balances neatly against cross-platform target line-height specifications.
            </p>
          </div>
        </div>
      </div>
    `})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`categoryStory("family", "Font Family")`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`categoryStory("size", "Font Size")`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`categoryStory("line-height", "Line Height")`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`categoryStory("letter-spacing", "Letter Spacing")`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`categoryStory("style", "Font Style")`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`categoryStory("weight", "Font Weight")`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "All Primitives",
  render: asyncStory(async () => {
    const tokens = await loadTypographyTokens();
    const categories: {
      key: TypographyToken["category"];
      label: string;
    }[] = [{
      key: "family",
      label: "Font Families"
    }, {
      key: "size",
      label: "Font Sizes"
    }, {
      key: "line-height",
      label: "Line Heights"
    }, {
      key: "letter-spacing",
      label: "Letter Spacing"
    }, {
      key: "style",
      label: "Font Style"
    }, {
      key: "weight",
      label: "Font Weight"
    }];
    const sections = categories.map(({
      key,
      label
    }) => {
      const filtered = tokens.filter(t => t.category === key);
      if (filtered.length === 0) return "";
      return \`\${catHeader(label)}\\n\${tokenTable(filtered)}\`;
    }).join("");
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Typography", "Primitives", "All")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">REI Cedar Design System</div>
            <div class="page-title">Typography<br>Primitives</div>
          </div>
          <div>
            <div class="page-meta-count">\${tokens.length}</div>
            <div class="page-meta-label">Total Tokens</div>
          </div>
        </div>
        <div class="demo-note">
          All primitive typography option tokens from the Figma normalization layer.
        </div>
        \${sections}
      </div>
    \`;
  })
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Live Rendering Preview",
  render: asyncStory(async () => {
    const tokens = await loadTypographyTokens();
    const graphik = tokens.find(t => t.name.includes("family-graphik"));
    const sizeHeading = tokens.find(t => t.name.includes("size-500"))?.value || 24;
    const lhHeading = tokens.find(t => t.name.includes("line-height-5"))?.value || 32;
    const sizeBody = tokens.find(t => t.name.includes("size-200"))?.value || 16;
    const lhBody = tokens.find(t => t.name.includes("line-height-2"))?.value || 24;
    const fontFamilyStyle = graphik ? \`'\${graphik.value}', \${graphik.fallback || "sans-serif"}\` : "system-ui";
    return \`
      <style>\${BASE_STYLES}</style>
      <div class="page">
        \${breadcrumb("Cedar Tokens", "Typography", "Primitives", "Live Preview")}
        <div class="page-title-row">
          <div>
            <div class="page-eyebrow">Visual Diagnostics Contract</div>
            <div class="page-title">Typography Rendering</div>
          </div>
        </div>

        <div class="demo-note">
          Live typographic rendering using actual token values from the pipeline.
        </div>

        \${sectionHeader("Rendered Targets", "Typographic Combination Assertions", 2)}

        <div class="preview-card" style="font-family: \${fontFamilyStyle};">
          <div>
            <span class="trow-badge number" style="margin-bottom: 0.5rem;">Heading (Size 500 / Line-Height 5)</span>
            <h2 style="font-size: \${sizeHeading}px; line-height: \${lhHeading}px; font-weight: 700; letter-spacing: -0.02em;">
              Explore the great outdoors in comfort.
            </h2>
          </div>
          <div style="margin-top: 1rem;">
            <span class="trow-badge number" style="margin-bottom: 0.5rem;">Body Text (Size 200 / Line-Height 2)</span>
            <p style="font-size: \${sizeBody}px; line-height: \${lhBody}px; color: var(--ink-mid);">
              Get expert advice, quality outdoor gear, and clothing for climbing, hiking, cycling, and more at REI. 
              Our normalization layer guarantees that variable spacing balances neatly against cross-platform target line-height specifications.
            </p>
          </div>
        </div>
      </div>
    \`;
  })
}`,...x.parameters?.docs?.source}}},S=[`FontFamily`,`FontSize`,`LineHeight`,`LetterSpacing`,`FontStyle`,`FontWeight`,`AllPrimitives`,`LiveRenderingPreview`]}))();export{b as AllPrimitives,m as FontFamily,h as FontSize,v as FontStyle,y as FontWeight,_ as LetterSpacing,g as LineHeight,x as LiveRenderingPreview,S as __namedExportsOrder,u as default};