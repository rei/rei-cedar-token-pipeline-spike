# Token Output Contracts

> **Status:** Working reference — reflects spike decisions and resolves ambiguity across parallel PRs.

## 1. Purpose

This document exists to:

- Define the complete set of token domains (foundations + components + palettes).
- Clarify which domains produce TypeScript types and which do not.
- Establish whether modular output is required for each consumer type.
- Ensure the build pipeline produces consistent, predictable, schema‑aligned output.
- Provide a shared reference for developers working across parallel PRs.

This document reflects the decisions made during the spike and resolves the current ambiguity.

---

## 2. Foundations

Foundations are the only domains that produce typed surfaces. They represent the stable, cross‑component contract of the design system.

### 2.1 Canonical Foundation Domains

These domains are schema-backed and must emit SCSS, JSON, TS, and CSS:

- `color-background`
- `color-text`
- `color-border`
- `color-icon`
- `motion-duration`
- `motion-timing`
- `prominence`
- `radius`
- `space`

### 2.2 Additional Foundations (previously missing)

These domains exist in the schema but look to be missing in the modularized TS/CSS:

**Typography**
- `font-family`
- `line-height` (heading, subheading, body, utility)
- `text-size-root`
- `type-scale`
- `text` variants

**Layout**
- `breakpoints`

**Space (extended)**
- `spacing`
- `spacing-inset`

These must be added to the modular output so that all foundation domains are consistently represented.

---

## 3. Components

Components consume foundations but do not define stable token contracts. Teams should not iterate over component tokens, and we should not imply a public API surface.

### 3.1 Component List

`accordion` · `button` · `chip` · `form` · `icon` · `input` · `link` · `message` · `modal` · `pagination` · `rating` · `slide` · `surface` · `surface-selection` · `switch` · `tab` · `table` · `toggle-button` · `tooltip`

### 3.2 Component Output Rules

Components do **not** emit:
- TypeScript token types
- Token enums
- Component‑specific TS interfaces

Components **do** emit:
- JSON token bundles (modularized by component)
- SCSS
- CSS
- A simple `Tokens` type (generic map) for JS/TS consumers
- Barrel exports for modular imports

This keeps components lightweight and avoids creating false stability guarantees.

---

## 4. Palettes

Palettes are independent token sets used for membership and brand contexts.

### 4.1 Palette List

- `membership-vibrant`
- `membership-subtle`

### 4.2 Palette Output

- JSON
- CSS
- SCSS

Palettes do **not** emit TypeScript types.

---

## 5. Modularization Strategy

### 5.1 Foundations

Foundations must be modularized. Consumers benefit from:
- Tree‑shaking
- Domain‑specific iteration
- Smaller bundles
- Clearer mental model

### 5.2 Components

Components should be modularized only at the JSON/SCSS/CSS level. No TS types.

### 5.3 JSON/JS Consumers

Modularization is beneficial but optional. They can import:
- The full flat root
- Individual domains
- Individual components

This flexibility supports Story 1 without forcing migration.

---

## 6. Entry Points and Consumer Contracts

This section maps every entry point the pipeline produces to the consumer type it serves, the import path, and the stability guarantee attached to it.

### 6.1 NPM Package Entry Points

The package exposes three explicit `exports` conditions in `package.json`:

| Entry | Import path | What you get |
|-------|-------------|-------------|
| Root types | `import type { ... } from '@rei/cedar-tokens'` | All foundation TS types, name unions, docs types, system enums — the full stable surface |
| Types sub-path | `import type { ... } from '@rei/cedar-tokens/types'` | Identical to root — explicit alias used when the consumer only wants types, not runtime |
| Meta files | `import url from '@rei/cedar-tokens/meta/foundations/cdr-color-border.docs.json'` | Raw documentation JSON for each foundation domain — used by tooling, Storybook, and doc sites |

The root `index.js` intentionally exports nothing at runtime. All value delivery is through CSS/SCSS files loaded independently — the NPM package is a **type contract + metadata package, not a runtime value package**.

### 6.2 TypeScript Contract — Three Files Per Foundation Domain

Every foundation domain emits exactly three TypeScript files. Using `cdr-color-border` as the example:

**`cdr-color-border.d.ts` — the value interface**

```ts
// What the tokens object looks like at runtime (CSS-var map, JSON object, etc.)
export interface CdrColorBorderTokens {
  "color-border-base": string;
  "color-border-subtle": string;
}
```

Consumers use this to type-check a token map, enforce keys on CSS-var lookups, or validate token objects at build time.

**`cdr-color-border.names.d.ts` — the name union**

```ts
// All valid token names for this domain as a discriminated union
export type CdrColorBorderTokenName =
  | "color-border-base"
  | "color-border-subtle";
```

Consumers use this to iterate over token names safely, build look-up functions, or guard against invalid token references. This is the type to use in `Object.entries()` loops — not the interface.

**`cdr-color-border.docs.d.ts` — the documentation map**

```ts
// A partial map of token name → { summary, usage, design, aliases }
export type CdrColorBorderTokenDocs = TokenDocsMap<CdrColorBorderTokenName>;
```

Consumers use this in documentation tools and Storybook stories to retrieve structured descriptions for each token. The `TokenDocsMap` generic is defined in `@rei/cedar-tokens` core and maps each token name to the `TokenDocumentation` interface.

All three files are re-exported by the domain's barrel (`foundations/index.d.ts`) and by the package root (`dist/types/index.d.ts`), so consumers can import at whatever level of specificity they need:

```ts
// Modular — preferred for tree-shaking
import type { CdrColorBorderTokens, CdrColorBorderTokenName } from '@rei/cedar-tokens/types';

// Or directly by domain file (future sub-path exports)
import type { CdrColorBorderTokens } from '@rei/cedar-tokens/types/foundations/cdr-color-border';
```

### 6.3 Core Shared Types

The package exports a set of primitive types used by all consumers regardless of domain. These live under `dist/types/core/` and are part of the root entry point:

| Type | Description |
|------|-------------|
| `TokenMap` | `Record<string, string>` — the runtime shape of any resolved token set |
| `TokenDocumentation` | `{ summary?, usage?, design?, aliases? }` — per-token doc fields |
| `TokenDocsMap<TName>` | `Partial<Record<TName, TokenDocumentation>>` — domain doc map generic |
| `TokenDictionary<…>` | Full discriminated type combining theme, platform, responsibility, module, tokens, and docs — used to type complete token bundles |
| `Theme` | `"rei-dot-com"` — current theme discriminant |
| `Platform` | `"web" \| "ios" \| "android"` |
| `Responsibility` | `"foundations"` — will expand as components and palettes grow |
| `FoundationModule` | Union of all current foundation domain names (e.g. `"cdr-color-border"`) |

`TokenDictionary` is the canonical shape for any code that passes a full domain bundle around:

```ts
import type { TokenDictionary } from '@rei/cedar-tokens';

function renderTokenTable(
  dict: TokenDictionary<'rei-dot-com', 'web', 'foundations', 'cdr-color-border', CdrColorBorderTokens>
) {
  // dict.tokens is fully typed — dict.docs is available for descriptions
}
```

### 6.4 CSS / SCSS Entry Points

CSS files are **not** delivered via the `exports` map. They are file paths within the published `dist/` directory, consumed directly as stylesheet imports:

```
dist/themes/rei-dot-com/css/cdr-light.css          ← full light mode (all foundations)
dist/themes/rei-dot-com/css/cdr-dark.css           ← full dark mode

dist/themes/rei-dot-com/css/light/cdr-color-border.css   ← modular light
dist/themes/rei-dot-com/css/light/cdr-color-text.css
dist/themes/rei-dot-com/css/dark/cdr-color-border.css    ← modular dark
...
```

**Recommended import pattern for web consumers:**

```css
/* Option A — full bundle, single import */
@import '@rei/cedar-tokens/dist/themes/rei-dot-com/css/cdr-light.css';

/* Option B — modular, domain-by-domain */
@import '@rei/cedar-tokens/dist/themes/rei-dot-com/css/light/cdr-color-border.css';
@import '@rei/cedar-tokens/dist/themes/rei-dot-com/css/light/cdr-spacing-scale.css';
```

Modular CSS is the preferred pattern for new consumers — it minimises cascade, allows per-domain dark-mode toggling, and maps 1:1 to the TS domain names.

### 6.5 iOS Entry Point (xcassets)

iOS consumers receive a `CdrColors.xcassets` color asset catalog rather than CSS or TS files:

```
dist/themes/rei-dot-com/ios/CdrColors.xcassets/
  cdr-textBase.colorset/
  cdr-textSubtle.colorset/
  cdr-textLink.colorset/
  cdr-textLinkHover.colorset/
  cdr-textSale.colorset/
  cdr-surfaceBase.colorset/
  cdr-surfaceRaised.colorset/
  cdr-borderBase.colorset/
  cdr-borderSubtle.colorset/
```

Each `.colorset` contains a `Contents.json` with both a universal (light) and a `luminosity: dark` appearance entry. Dark mode adaptation is handled entirely by the asset catalog — no code switch is needed.

The `rei-cedar-ios` Swift package copies this xcassets into `Sources/CedarTokens/Resources/` and wraps each colorset in a typed `Color` extension:

```swift
// Consumers import CedarTokens and reference tokens by name
import CedarTokens

Text("Hello").foregroundStyle(Color.cdrTextBase)
view.backgroundColor = UIColor.cdrSurfaceBase
```

The iOS token surface is intentionally narrower than the web surface. It currently covers the color foundation domains only. Spacing, radius, and typography are delivered as `CGFloat` / `Font` constants in the same `CedarTokens` module.

### 6.6 Stability Guarantees by Domain Type

| Domain type | TS types | CSS | iOS xcassets | Stable public API |
|-------------|----------|-----|-------------|-------------------|
| Foundations | ✅ Three-file pattern | ✅ Modular + full bundle | ✅ Named colorsets | **Yes — breaking changes require a major version** |
| Components | ❌ Generic `Tokens` map only | ✅ | ❌ | **No — internal use only; subject to change** |
| Palettes | ❌ | ✅ | ❌ | **Provisional — stabilises in V1** |

### 6.7 What Consumers Must Not Depend On

The following are internal to the pipeline and are **not** part of the consumer contract:

- `dist/normalized/` — intermediate normalization snapshots, not shipped to consumers
- `canonical/tokens.json` — the canonical source; consumers use platform outputs only
- Any file not listed in the `files` array in `package.json`
- Token names that include `option.*` path segments — these are foundation primitives and are not exposed in platform outputs
