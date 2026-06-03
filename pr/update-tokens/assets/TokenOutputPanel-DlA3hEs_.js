import{t as e}from"./chunk-BvrOYcoh.js";import{i as t,r as n}from"./platform-mode-context-B5Yqe24o.js";import{i as r,n as i,r as a,t as o}from"./getPlatformSnippet-CldXuH64.js";function s(){if(document.getElementById(l))return;let e=document.createElement(`style`);e.id=l,e.textContent=u,document.head.appendChild(e)}function c({canonicalName:e,outputTokenName:t,resolvedValues:r}){s();let{platform:c,mode:l}=n(),u=r.filter(e=>e.platform===c&&e.mode===l),d=document.createElement(`section`);d.className=`token-output-panel`;let f=document.createElement(`div`);f.className=`token-output-panel__header`;let p=document.createElement(`h2`);p.className=`token-output-panel__title`,p.textContent=t;let m=document.createElement(`p`);m.className=`token-output-panel__subtitle`,m.textContent=e,f.appendChild(p),f.appendChild(m),d.appendChild(f);let h=document.createElement(`div`);h.className=`token-output-panel__meta`,h.textContent=`Platform: ${c} · Mode: ${l}`,d.appendChild(h);let g=document.createElement(`div`);g.className=`token-output-panel__code-wrap`;let _=document.createElement(`div`);_.className=`token-output-panel__code-header`;let v=document.createElement(`span`);v.className=`token-output-panel__language-pill`,v.textContent=o(c);let y=document.createElement(`button`);y.type=`button`,y.className=`token-output-panel__copy`,y.textContent=`⧉`;let b=a({name:t},c);y.setAttribute(`aria-label`,`Copy ${c} code for ${t}`);let x=e=>{y.textContent=e?`✓`:`!`;let t=document.createElement(`span`);t.className=`token-output-panel__copy-tooltip`,t.textContent=e?`Copied!`:`Copy unavailable`,y.appendChild(t),window.setTimeout(()=>{t.remove(),y.textContent=`⧉`},1500)};y.addEventListener(`click`,async()=>{if(window.isSecureContext&&navigator.clipboard){await navigator.clipboard.writeText(b),x(!0);return}let e=document.createElement(`textarea`);e.value=b,e.style.position=`fixed`,e.style.opacity=`0`,document.body.appendChild(e),e.focus(),e.select();let t=document.execCommand(`copy`);document.body.removeChild(e),x(t)}),_.appendChild(v),_.appendChild(y),g.appendChild(_);let S=document.createElement(`pre`);S.className=`token-output-panel__code`;let C=document.createElement(`code`);C.className=`language-${i(c)}`,C.textContent=b,S.appendChild(C),g.appendChild(S),d.appendChild(g);let w=document.createElement(`table`);w.className=`token-output-panel__table`;let T=document.createElement(`thead`),E=document.createElement(`tr`);[`Resolved primitive`,`Palette`,`Hex`].forEach(e=>{let t=document.createElement(`th`);t.textContent=e,E.appendChild(t)}),T.appendChild(E),w.appendChild(T);let D=document.createElement(`tbody`);if(u.length===0){let e=document.createElement(`tr`),t=document.createElement(`td`);t.colSpan=3,t.textContent=`No resolved values found for the active platform and mode.`,e.appendChild(t),D.appendChild(e)}else u.forEach(e=>{let t=document.createElement(`tr`),n=document.createElement(`td`);n.textContent=e.primitive;let r=document.createElement(`td`);r.textContent=e.palette;let i=document.createElement(`td`);i.textContent=e.hex,t.appendChild(n),t.appendChild(r),t.appendChild(i),D.appendChild(t)});return w.appendChild(D),d.appendChild(w),d}var l,u,d=e((()=>{t(),r(),l=`token-output-panel-styles`,u=`
.token-output-panel {
  margin: 1.5rem 0 0;
  padding: var(--cdr-space-panel-padding, 1rem);
  border: 1px solid var(--cdr-border-subtle, rgba(46, 46, 43, 0.12));
  border-radius: var(--cdr-radius-lg, 0.75rem);
  background: var(--cdr-surface-base, #ffffff);
  color: var(--cdr-text-base, #1a1a18);
  font-family: var(--cdr-font-body, system-ui, sans-serif);
}

.token-output-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.token-output-panel__title {
  margin: 0;
  font-size: var(--cdr-font-size-md, 1rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.token-output-panel__subtitle {
  margin: 0.25rem 0 0;
  font-size: var(--cdr-font-size-sm, 0.8125rem);
  color: var(--cdr-text-subtle, #5c5c5d);
}

.token-output-panel__meta {
  font-size: var(--cdr-font-size-xs, 0.75rem);
  color: var(--cdr-text-subtle, #5c5c5d);
  margin-bottom: 0.75rem;
}

.token-output-panel__code-wrap {
  position: relative;
  margin: 0.75rem 0 1rem;
  border-radius: var(--cdr-radius-md, 0.5rem);
  border: 1px solid var(--cdr-code-border, rgba(255, 255, 255, 0.12));
  overflow: hidden;
  background: var(--cdr-code-surface, #1f2428);
}

.token-output-panel__code-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  background: var(--cdr-code-header-surface, #151a1e);
  padding: 0.5rem 0.625rem;
}

.token-output-panel__language-pill {
  font-size: var(--cdr-font-size-xs, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  color: var(--cdr-code-pill-text, #d1d8de);
  background: var(--cdr-code-pill-bg, rgba(255, 255, 255, 0.1));
}

.token-output-panel__copy {
  border: 1px solid var(--cdr-code-copy-border, rgba(255, 255, 255, 0.2));
  color: var(--cdr-code-copy-text, #e6edf3);
  background: transparent;
  border-radius: var(--cdr-radius-sm, 0.375rem);
  min-inline-size: 2rem;
  block-size: 1.75rem;
  cursor: pointer;
  position: relative;
}

.token-output-panel__copy-tooltip {
  position: absolute;
  right: 0;
  top: -1.75rem;
  font-size: var(--cdr-font-size-xs, 0.75rem);
  color: var(--cdr-code-tooltip-text, #d1d8de);
  background: var(--cdr-code-tooltip-bg, #0f1317);
  border-radius: var(--cdr-radius-sm, 0.375rem);
  padding: 0.125rem 0.375rem;
  white-space: nowrap;
}

.token-output-panel__code {
  margin: 0;
  padding: 0.875rem;
  color: var(--cdr-code-text, #e6edf3);
  font-family: var(--cdr-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: var(--cdr-font-size-sm, 0.8125rem);
  line-height: 1.4;
}

.token-output-panel__table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.25rem;
}

.token-output-panel__table th,
.token-output-panel__table td {
  padding: 0.75rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--cdr-rule-subtle, rgba(46, 46, 43, 0.08));
  font-size: var(--cdr-font-size-sm, 0.8125rem);
}

.token-output-panel__table th {
  font-weight: 700;
  color: var(--cdr-text-subtle, #5c5c5d);
}

.token-output-panel__table td {
  color: var(--cdr-text-base, #1a1a18);
}

.token-output-panel__table td:first-child {
  width: 35%;
}

.token-output-panel__table td:nth-child(2) {
  width: 35%;
}

.token-output-panel__table td:last-child {
  text-align: right;
}
`}));export{d as n,c as t};