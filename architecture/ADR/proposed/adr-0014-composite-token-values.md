# ADR: Composite Style Values — What Belongs in the Token Repository

**Status:** Proposed  
**Date:** 2026-06-09  
**Context:** Cedar token spike — Figma-pulled token pipeline, multi-platform delivery  
**Stakeholders:** Design system team, token spike team, DXP platform engineering, design  
**Related:** ADR: Cedar Tailwind Preset — Multi-Platform Token Alignment Strategy

---

## Background

Cedar has historically shipped composite typography values as Sass mixins from the token repository. A mixin like `@mixin cdr-text-heading-sans-900` bundles font-size, line-height, font-weight, font-family, and letter-spacing into a single authored unit — mirroring how a designer thinks about a named text style in Figma.

This was a pragmatic decision. It gave web consumers a single point of application for a complete typographic style. But it encoded a platform assumption (Sass, web) directly into what should be a platform-agnostic token contract. As Cedar now supports web, iOS, Android, and Tailwind-based consumers, and as we move to a Figma-pulled pipeline, this approach cannot scale.

This ADR defines what is allowed in the token repository going forward, what is not, and where composite values should live instead. It is written to give the token spike team a clear contract to build against.

---

## The Core Distinction: Tokens vs Styles

A **token** is a single design decision expressed as a named value.

A **style** is a combination of tokens applied together to express a design pattern.

| | Token | Style |
|---|---|---|
| Example | `--cdr-font-size-heading-900: 2.5rem` | `heading-sans-900 { font-size, line-height, font-weight, font-family }` |
| Nature | Atomic, single value | Composite, multiple values |
| Platform | Platform-agnostic | Platform-specific expression |
| Lives in | Token repository | Component library or style package |
| Changes when | Design decisions change | Usage patterns change |

Figma text styles are **styles** in this model. They are the designer's way of grouping tokens into named patterns. The Figma-pulled pipeline should decompose them into atomic tokens on export — not carry them as composites into the token repository.

---

## What Is Allowed in the Token Repository

The token repository is the platform-agnostic source of truth. Every value it ships must be expressible on every platform Cedar supports: web CSS, TypeScript, iOS Swift, Android Kotlin/XML.

### Allowed: Atomic single-value tokens

```
cdr-font-size-heading-900: 2.5rem
cdr-line-height-heading-900: 1.2
cdr-font-weight-heading-900: 700
cdr-font-family-sans: "REI Stuart App", sans-serif
cdr-letter-spacing-heading: -0.01em
```

These are the correct output of the Figma-pulled pipeline. A Figma text style named "Heading / Sans / 900" decomposes into this set of atomic tokens. The grouping is preserved in naming convention and token category — not in a composite value.

### Allowed: Fluid/computed single values

```
cdr-space-scale-5: clamp(1.6rem, 1.5rem + 0.44cqi, 2rem)
```

A clamp value is still a single design decision — the fluid range for a spacing step. It resolves to one CSS property value. It is atomic even if it is computed. This is allowed.

### Allowed: Alias/semantic tokens that reference primitives

```
cdr-color-text-primary → cdr-color-primitive-green-900
cdr-space-inset-component-default → cdr-space-scale-3
```

Semantic aliases are single values that point to primitives. They represent a design decision about usage context. They are allowed and encouraged — they are how Cedar expresses intent without hardcoding values.

---

## What Is Not Allowed in the Token Repository

### Not allowed: Composite multi-property values

Sass mixins, CSS shorthand bundles, or any construct that expresses multiple CSS properties under a single token name. This includes:

```scss
// ❌ Not allowed in token repository
@mixin cdr-text-heading-sans-900 {
  font-size: var(--cdr-font-size-heading-900);
  line-height: var(--cdr-line-height-heading-900);
  font-weight: var(--cdr-font-weight-heading-900);
  font-family: var(--cdr-font-family-sans);
  letter-spacing: var(--cdr-letter-spacing-heading);
}
```

These cannot be expressed in iOS Swift, Android XML, or as TypeScript constants. Publishing them from the token repository implies they are part of the platform-agnostic contract — they are not.

### Not allowed: Platform-specific syntax

Sass variables, Swift structs, Kotlin objects, or Android resource files are outputs of the token pipeline — they are not inputs or artifacts that should live in the repository itself. The token repository holds the source values. Platform-specific output is generated.

### Not allowed: Usage-encoded token names

Token names should describe what a value **is**, not where it is **used**. A token named `cdr-font-size-button-label` encodes a component-level usage decision into the token layer. A token named `cdr-font-size-body-sm` describes a scale position. The former belongs in a component, the latter belongs in the token repository.

---

## Where Composite Styles Live Instead

The removal of Sass mixins from the token repository does not remove the need for composite styles. It moves that responsibility to the correct layer.

### Web: Component library (primary path)

Cedar components are the canonical implementation of composite styles. A `<cdr-text variant="heading-sans-900">` component applies the correct combination of atomic tokens internally. This is how ~90% of Cedar consumers should access typographic styles — through components, not mixins.

```scss
// Inside Cedar component — correct, not in token repo
.cdr-text--heading-sans-900 {
  font-size: var(--cdr-font-size-heading-900);
  line-height: var(--cdr-line-height-heading-900);
  font-weight: var(--cdr-font-weight-heading-900);
  font-family: var(--cdr-font-family-sans);
  letter-spacing: var(--cdr-letter-spacing-heading);
}
```

The component references tokens directly — not a mixin layer in between. The component is the authoritative composite expression.

### Web: Cedar style utilities (escape hatch)

For cases where a developer needs to apply a typographic style outside a Cedar component — custom templates, third-party component overrides, marketing surfaces — Cedar ships a style utilities package as a sibling to the component library:

```scss
// @rei/cedar-styles — escape hatch, not the primary path
@use '@rei/cedar-styles/typography' as cdr-type;

.custom-hero-headline {
  @include cdr-type.heading-sans-900;
}
```

```css
/* Also available as CSS utility classes */
.cdr-text--heading-sans-900 { ... }
```

This package is web-only, versioned alongside Cedar, and explicitly documented as a web-specific escape hatch — not a platform-agnostic contract.

### Web: Cedar Tailwind Preset (Tailwind consumer path)

For teams using Tailwind (DXP and others), the Cedar Tailwind preset surfaces atomic typography tokens as utility classes. Composite typographic styles are accessed through Cedar components or the style utilities package — the preset does not attempt to express composite typography as Tailwind utilities.

See ADR: Cedar Tailwind Preset for the full strategy.

### iOS

A Swift helper that accepts a Cedar text style name and returns a configured `UIFont` or `AttributedString` using the atomic token values from the iOS token package. The composite lives in a Cedar iOS utilities library, not in the token package.

### Android

`TextAppearance` styles in Cedar's Android resource library, referencing `@dimen` and `@font` values from the token package. Same separation: atomic values in tokens, composite expressions in the platform library.

---

## How the Figma Pipeline Should Handle Text Styles

The Figma-pulled token spike should treat Figma text styles as a **decomposition source**, not an export target.

When the pipeline encounters a Figma text style:

1. **Decompose** the style into its constituent properties (font-size, line-height, font-weight, font-family, letter-spacing)
2. **Map** each property to an existing Cedar atomic token, or flag it as a new token candidate
3. **Export** only the atomic token values to the token repository
4. **Preserve** the Figma style name as a category/group in the token naming convention — so `Heading / Sans / 900` becomes the `heading-900` namespace across the family of atomic tokens

What the pipeline should not do: export the text style as a composite object, a JSON bundle of multiple properties, or any construct that implies a single token represents multiple CSS properties.

### Gap handling

If a Figma text style uses a value that has no existing Cedar atomic token, the pipeline should:
- Flag it as a token gap in the pipeline output
- Block it from being silently added as a one-off value
- Route it to the design system team for evaluation as a new atomic token

This is the same gap-reporting model as the Cedar Tailwind preset. The pipeline surfaces design drift; the design system team resolves it.

---

## Impact on the Token Spike

The token spike team should build against the following constraints:

**Pipeline output (what the spike produces):**
- Atomic single-value tokens only
- Fluid/clamp values are acceptable (still atomic)
- Semantic alias tokens are acceptable
- No composite multi-property outputs
- No Sass mixins, no shorthand bundles

**Repository structure:**
- Token categories reflect Figma groupings (typography, spacing, color, radius)
- Naming convention preserves the Figma style hierarchy (e.g. `cdr-font-size-heading-900`) without encoding composites
- Gap reporting is a first-class pipeline output, not an afterthought

**Platform outputs the pipeline must support:**
- CSS custom properties (web)
- TypeScript constants (web, tooling)
- iOS Swift values
- Android Kotlin/XML resources

**Platform outputs that are explicitly out of scope for the token repository:**
- Sass mixins
- CSS utility classes
- Component styles
- iOS `TextStyle` or `AttributedString` helpers
- Android `TextAppearance` definitions

These are the responsibility of the platform-specific Cedar libraries and are generated from the atomic token values — not authored in the token repository.

---

## Summary

| Artifact | Lives in token repo? | Lives where instead |
|---|---|---|
| Atomic font-size token | ✅ Yes | — |
| Atomic line-height token | ✅ Yes | — |
| Fluid spacing clamp token | ✅ Yes | — |
| Semantic color alias token | ✅ Yes | — |
| Sass mixin (composite typography) | ❌ No | Cedar component / cedar-styles package |
| CSS utility class (composite typography) | ❌ No | Cedar component / cedar-styles package |
| iOS TextStyle helper | ❌ No | Cedar iOS library |
| Android TextAppearance | ❌ No | Cedar Android resource library |
| Tailwind utility class | ❌ No | Cedar Tailwind preset |

The token repository is the platform-agnostic source of truth for design decisions. Everything else is a platform-specific expression of those decisions, owned by the platform libraries.
