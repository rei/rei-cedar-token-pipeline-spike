import{t as e}from"./chunk-BvrOYcoh.js";import{n as t,t as n}from"./iframe-CxDvXmCO.js";function r(){if(document.getElementById(a))return;let e=document.createElement(`style`);e.id=a,e.textContent=o,document.head.appendChild(e)}function i({canonicalName:e,outputTokenName:t,resolvedValues:i}){r();let{platform:a,mode:o}=n(),s=i.filter(e=>e.platform===a&&e.mode===o),c=document.createElement(`section`);c.className=`token-output-panel`;let l=document.createElement(`div`);l.className=`token-output-panel__header`;let u=document.createElement(`h2`);u.className=`token-output-panel__title`,u.textContent=t;let d=document.createElement(`p`);d.className=`token-output-panel__subtitle`,d.textContent=e,l.appendChild(u),l.appendChild(d),c.appendChild(l);let f=document.createElement(`div`);f.className=`token-output-panel__meta`,f.textContent=`Platform: ${a} · Mode: ${o}`,c.appendChild(f);let p=document.createElement(`table`);p.className=`token-output-panel__table`;let m=document.createElement(`thead`),h=document.createElement(`tr`);[`Resolved primitive`,`Palette`,`Hex`].forEach(e=>{let t=document.createElement(`th`);t.textContent=e,h.appendChild(t)}),m.appendChild(h),p.appendChild(m);let g=document.createElement(`tbody`);if(s.length===0){let e=document.createElement(`tr`),t=document.createElement(`td`);t.colSpan=3,t.textContent=`No resolved values found for the active platform and mode.`,e.appendChild(t),g.appendChild(e)}else s.forEach(e=>{let t=document.createElement(`tr`),n=document.createElement(`td`);n.textContent=e.primitive;let r=document.createElement(`td`);r.textContent=e.palette;let i=document.createElement(`td`);i.textContent=e.hex,t.appendChild(n),t.appendChild(r),t.appendChild(i),g.appendChild(t)});return p.appendChild(g),c.appendChild(p),c}var a,o,s=e((()=>{t(),a=`token-output-panel-styles`,o=`
.token-output-panel {
  margin: 1.5rem 0 0;
  padding: 1rem 1rem 0.75rem;
  border: 1px solid rgba(46, 46, 43, 0.12);
  border-radius: 0.75rem;
  background: #ffffff;
  color: #1a1a18;
  font-family: Inter, system-ui, sans-serif;
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
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.token-output-panel__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: #5c5c5d;
}

.token-output-panel__meta {
  font-size: 0.75rem;
  color: #5c5c5d;
  margin-bottom: 0.75rem;
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
  border-bottom: 1px solid rgba(46, 46, 43, 0.08);
  font-size: 0.8125rem;
}

.token-output-panel__table th {
  font-weight: 700;
  color: #5c5c5d;
}

.token-output-panel__table td {
  color: #1a1a18;
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
`}));export{s as n,i as t};