import{t as e}from"./chunk-BvrOYcoh.js";import{n as t,t as n}from"./TokenMeta-CxjT0y43.js";import{n as r,t as i}from"./surface-B4VPJkW8.js";import{n as a,t as o}from"./TokenTable-tShHr32C.js";var s,c,l;e((()=>{a(),t(),i(),s={title:`Tokens/Color/Semantic/Surface API`},c={render:()=>{let e=document.createElement(`div`);return e.style.display=`grid`,e.style.gap=`1rem`,e.appendChild(o({tokens:r,category:`color`,showAlias:!0,showDescription:!0,showUsedBy:!0})),e.appendChild(n({token:r[0]})),e}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const root = document.createElement("div");
    root.style.display = "grid";
    root.style.gap = "1rem";
    root.appendChild(TokenTable({
      tokens: surfaceTokens,
      category: "color",
      showAlias: true,
      showDescription: true,
      showUsedBy: true
    }));
    root.appendChild(TokenMeta({
      token: surfaceTokens[0]
    }));
    return root;
  }
}`,...c.parameters?.docs?.source}}},l=[`Surface`]}))();export{c as Surface,l as __namedExportsOrder,s as default};