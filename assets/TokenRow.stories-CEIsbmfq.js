import{t as e}from"./chunk-BvrOYcoh.js";import{n as t,t as n}from"./surface-B4VPJkW8.js";import{n as r,t as i}from"./TokenRow-DyB6w62W.js";var a,o,s,c,l,u,d;e((()=>{r(),n(),a={title:`Components/TokenRow`,argTypes:{category:{control:{type:`inline-radio`},options:[`color`,`space`,`typography`,`elevation`,`motion`]},showAlias:{control:`boolean`},showDescription:{control:`boolean`},showUsedBy:{control:`boolean`},compact:{control:`boolean`}}},o=t[0],s={args:{token:o,category:`color`,showAlias:!0,showDescription:!0,showUsedBy:!0,compact:!1},render:e=>i(e)},c={args:{token:t[1],category:`color`,showAlias:!0,showDescription:!0,showUsedBy:!0,compact:!1},render:e=>i(e)},l={args:{token:t[2],category:`color`,showAlias:!0,showDescription:!0,showUsedBy:!0,compact:!1},render:e=>i(e)},u={args:{token:o,category:`color`,showAlias:!1,showDescription:!1,showUsedBy:!1,compact:!0},render:e=>i(e)},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    token: baseToken,
    category: "color",
    showAlias: true,
    showDescription: true,
    showUsedBy: true,
    compact: false
  },
  render: args => TokenRow(args)
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    token: surfaceTokens[1],
    category: "color",
    showAlias: true,
    showDescription: true,
    showUsedBy: true,
    compact: false
  },
  render: args => TokenRow(args)
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    token: surfaceTokens[2],
    category: "color",
    showAlias: true,
    showDescription: true,
    showUsedBy: true,
    compact: false
  },
  render: args => TokenRow(args)
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    token: baseToken,
    category: "color",
    showAlias: false,
    showDescription: false,
    showUsedBy: false,
    compact: true
  },
  render: args => TokenRow(args)
}`,...u.parameters?.docs?.source}}},d=[`Stable`,`Experimental`,`Deprecated`,`Compact`]}))();export{u as Compact,l as Deprecated,c as Experimental,s as Stable,d as __namedExportsOrder,a as default};