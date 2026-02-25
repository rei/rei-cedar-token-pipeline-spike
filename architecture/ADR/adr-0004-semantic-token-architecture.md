# ADR‑0004: Semantic Token Architecture

## Status  
Planned

> **Note**  
> V0 implements only a minimal subset of this ADR for pipeline validation.  
> Full multi‑category semantic implementation begins in V1.

## Context  
Cedar’s current token set is heavily component‑specific and lacks a unified semantic abstraction layer. As a result:

- design intent is not consistently represented across platforms  
- components duplicate logic that should be centralized  
- tokens cannot be governed or validated at scale  
- platform outputs (Web, iOS, Android, etc.) cannot be generated reliably  
- naming conventions drift between teams and libraries  

To modernize Cedar’s design token architecture, this ADR defines a **three‑tier semantic model** that applies to *all* token categories:

**Foundations (Options) → Alias (Semantic Ancestors) → Component**

This model establishes:

- a stable, governed semantic vocabulary  
- a consistent mapping from Figma → Semantic → Canonical → Platform  
- a naming grammar that applies across all token categories  
- a separation between palette values, semantic roles, and component usage  
- a future‑proof structure that supports theming, modes, and platform overrides  

While earlier ADRs focused on the canonical model (ADR‑0001), normalization (ADR‑0002), and Figma ingestion (ADR‑0003), this ADR defines the **semantic layer** that sits between raw design intent and platform‑specific output.

This semantic layer is the foundation for:

- cross‑platform consistency  
- design/dev visibility  
- alias token governance  
- component token stability  
- future theming and platform overrides  
- automated validation and linting  

### Platform Considerations 
Cedar’s semantic architecture must support **multiple platform outputs**, 
beginning with: - 
- **Web** 
- **iOS**
- **Android**

These are the platforms that ultimately consume Cedar’s platform‑specific token outputs. This ADR does not define output formats (e.g., CSS, SCSS, JS, TS, Swift). Those are handled by the canonical model and platform‑specific transforms defined in ADR‑0001–0003. Figma remains the **design input source**, not a runtime platform. Designers work with semantic alias tokens in Figma, which are then normalized and transformed into platform‑specific outputs for Web, iOS, and Android.

---

## Purpose

This ADR defines Cedar’s long‑term semantic token architecture across **all token categories**, not just color. It establishes the rules, naming grammar, and transformation flow that govern how design intent becomes stable, platform‑agnostic, and consumable by engineering.

Specifically, this ADR establishes:

- the three‑tier token architecture  
  **Foundations (Options) → Alias (Semantic Ancestors) → Component**
- the definition and responsibilities of each tier  
- how Figma variables map into the semantic alias layer  
- how the Normalization Layer (ADR‑0002) converts semantic tokens into canonical tokens  
- how Style Dictionary transforms canonical tokens into platform‑specific outputs  
- a governed naming grammar that applies to all token categories  
- semantic building blocks for color, typography, spacing, radius, border, shadow, opacity, motion, and grid  
- a minimal, stable approach to component tokens  
- the V0/V1 design workflow and Figma library structure that supports this architecture  

This semantic layer is the connective tissue between:

- **ADR‑0001** (Canonical Token Model)  
- **ADR‑0002** (Normalization Layer)  
- **ADR‑0003** (Figma Input Contract)  

and the platform‑specific outputs consumed by Web, iOS, Android, and future platforms.

The goals of this architecture are to:

- provide a stable, governed semantic vocabulary  
- ensure design intent is expressed consistently across platforms  
- eliminate component‑specific duplication and drift  
- enable automated validation, linting, and contrast checks  
- support theming, modes, and platform overrides  
- create a predictable, inspectable design‑to‑code pipeline  

This ADR defines the **semantic system Cedar will use for all token categories**, ensuring long‑term scalability, governance, and cross‑platform consistency.

---

## Token Architecture Overview

Cedar’s semantic token system is structured as a three‑tier architecture that applies consistently across **all token categories**:

**Foundations (Options) → Alias (Semantic Ancestors) → Component**

Each tier has a distinct purpose, governance model, and set of constraints.  
Together, they form a stable, scalable, cross‑platform design token system.

### Tier Responsibilities

| Tier | Purpose | Who Uses It | Allowed Values | Stability |
|------|----------|--------------|----------------|-----------|
| **Foundations (Options)** | Raw palette and primitive values | Cedar Design only | Literal values | Low (brand‑driven) |
| **Alias (Semantic Ancestors)** | Semantic roles expressing design intent | Designers + Developers | References to Foundations | High (governed) |
| **Component Tokens** | Component‑specific usage of semantic tokens | Developers + Component Library | References to Alias tokens | Medium (component‑driven) |

### Why This Architecture

This three‑tier model ensures:

- **Design intent is stable** even when palette values change  
- **Components remain consistent** across platforms  
- **Developers consume a predictable API**  
- **Designers work with meaningful semantics**, not raw values  
- **Platform outputs (Web, iOS, Android)** can diverge safely  
- **Theming and modes** can be layered on without breaking semantics  
- **Governance and validation** can be applied at the semantic layer  

### Categories Covered by This Architecture

This ADR applies the three‑tier model to **all token categories**, including:

- **Color**  
- **Typography** (font families, sizes, weights, line heights, letter spacing)  
- **Spacing** (scale, layout spacing, component spacing)  
- **Radius** (corner radii, shape tokens)  
- **Border** (widths, styles)  
- **Shadow** (elevation, depth)  
- **Opacity**  
- **Motion** (durations, easings)  
- **Grid & Layout** (columns, gutters, breakpoints)  

Each category defines:

- its own semantic intents  
- its own naming grammar  
- its own mapping rules  
- its own invariants and validation requirements  

### Flow of Design Intent

The semantic architecture governs the transformation pipeline:

**Figma → Semantic Alias Tokens → Canonical Tokens → Platform Tokens**

- **Figma** expresses designer intent through variables and styles  
- **Semantic Alias Tokens** express meaning (e.g., `color.text.primary`)  
- **Canonical Tokens** store normalized, governed, platform‑agnostic data  
- **Platform Tokens** (CSS, Swift, XML, etc.) express final implementation  

This ADR defines the **semantic layer**, which is the backbone of the entire pipeline.

---

## Tier 1 — Foundations (Options)

Foundations (also called **Options**) are Cedar’s raw design primitives.  
They represent the **literal, brand‑authored values** that form the base of all design expression.  
Foundations contain **no semantic meaning** and are **never consumed directly** by product teams.

Foundations are private to Cedar Design and Brand.

### Purpose of Foundations

Foundations serve three primary purposes:

1. **Brand Source of Truth**  
   They store the literal palette, typography primitives, spacing scales, radii, shadows, and motion curves defined by Cedar Design and Brand.

2. **Stable Inputs for Semantic Mapping**  
   Alias tokens reference Foundations, ensuring that semantic tokens remain stable even when brand values evolve.

3. **Governed, Private Layer**  
   Foundations are not exposed to product teams, preventing accidental coupling to raw palette values.

### Characteristics

Foundations are:

- literal values (colors, numbers, strings, booleans)  
- brand‑authored and brand‑governed  
- private and unpublished  
- not platform‑agnostic (they are raw values)  
- not consumed directly by components  
- not visible to non‑Cedar designers  

Foundations **must never** appear in:

- component libraries  
- product team Figma files  
- Style Dictionary outputs  
- platform SDKs  

Only Alias tokens may reference Foundations.

### Categories of Foundations

Foundations exist for all token categories:

- **Color Foundations**  
  Raw palette values (e.g., brand blues, neutrals, accent palettes)

- **Typography Foundations**  
  Font families, weights, base sizes, line‑height primitives

- **Spacing Foundations**  
  Base spacing scale (e.g., 2, 4, 8, 12, 16…)

- **Radius Foundations**  
  Corner radius primitives (e.g., 2, 4, 8, 16)

- **Border Foundations**  
  Border widths and styles

- **Shadow Foundations**  
  Raw shadow definitions (offsets, blur, spread, color)

- **Opacity Foundations**  
  Raw opacity values

- **Motion Foundations**  
  Durations, easings, curves

- **Grid & Layout Foundations**  
  Columns, gutters, breakpoints

Each category defines its own primitive vocabulary.

### Naming

Foundations use a **brand‑driven naming convention**, not a semantic one.  
Names reflect palette or primitive structure, not UX intent.

Examples:

**Color Foundations**
- `blue.spruce.1000`
- `warm.grey.600`
- `white.75`

**Typography Foundations**
- `font.family.sans`
- `font.weight.semibold`
- `font.size.300`

**Spacing Foundations**
- `space.025`
- `space.050`
- `space.100`

**Radius Foundations**
- `radius.025`
- `radius.050`
- `radius.100`

These names are **not semantic** and must never appear in component usage.

### Invariants (V1)

Foundations must follow these rules:

- Foundations may contain **only literal values**  
- Foundations must not reference other tokens  
- Foundations must not encode semantic meaning  
- Foundations must not include component names  
- Foundations must not include platform‑specific values  
- Foundations must not be exposed outside Cedar Design  

### Example (Color Foundations)

```json
{
  "options": {
    "color": {
      "blue": {
        "spruce": {
          "900": "#004488",
          "1000": "#003366"
        }
      },
      "warm": {
        "grey": {
          "600": "#6B6B6B"
        }
      },
      "white": {
        "75": "rgba(255,255,255,0.75)"
      }
    }
  }
}
```

Foundations are the root layer of Cedar’s token architecture.
All semantic meaning is introduced in Tier 2 — Alias Tokens.

## Tier 2 — Alias Tokens (Semantic Ancestors)

Alias tokens represent **semantic design intent**.  
They are the stable, platform‑agnostic vocabulary that designers and developers use to describe how UI elements should look and behave.

Alias tokens **never contain literal values**.  
They always reference Foundations (Options).

Alias tokens are the **API** of the design system.

> **Note on Tier Evolution (V0 → V1)**  
> In V0/V1, the Alias tier intentionally combines two conceptual responsibilities:  
> 1. **Palette indirection** (mapping primitives to palette roles)  
> 2. **Semantic intent** (mapping palette roles to UX meaning)  
>  
> A future ADR will formalize these as distinct tiers within a four‑tier model:  
>  
> **Foundations → Alias (Palette Roles) → Semantic (Design Intent) → Component**  
>  
> For now, this ADR defines the combined tier as **Alias Tokens**.

### Purpose of Alias Tokens

Alias tokens provide:

- a **stable semantic vocabulary** for all token categories  
- a **platform‑agnostic layer** that survives palette changes  
- a **governed naming grammar**  
- a **consistent mapping** from Figma → Canonical → Platform  
- a **single source of truth** for component styling  
- a **lintable, inspectable, enforceable** semantic layer  

Alias tokens are the layer that:

- designers use in Figma  
- developers see in Dev Mode  
- the normalization layer produces  
- Style Dictionary consumes  
- components depend on  

### Characteristics

Alias tokens are:

- semantic (express meaning, not values)  
- stable across platforms  
- governed by naming grammar  
- validated during normalization  
- the only tokens exposed to product teams  
- the only tokens components may reference  

Alias tokens **must never**:

- contain literal values  
- reference other alias tokens (except for state variants)  
- encode component names  
- encode platform names  
- encode raw Figma names  
- encode brand palette names  

### Categories of Alias Tokens

Alias tokens exist for **all token categories**, each with its own semantic vocabulary:

- **Color**  
  `color.text.primary`, `color.surface.base`, `color.action.accent`

- **Typography**  
  `type.body.md`, `type.heading.lg`, `type.label.sm`

- **Spacing**  
  `space.component.sm`, `space.layout.md`, `space.inline.lg`

- **Radius**  
  `radius.container.md`, `radius.interactive.sm`

- **Border**  
  `border.width.default`, `border.color.subtle`

- **Shadow**  
  `shadow.card.default`, `shadow.overlay.lg`

- **Opacity**  
  `opacity.disabled`, `opacity.overlay`

- **Motion**  
  `motion.duration.fast`, `motion.easing.standard`

- **Grid & Layout**  
  `grid.columns.default`, `grid.gutter.md`

Each category defines:

- semantic intents  
- variants  
- optional families  
- optional modifiers  
- naming grammar  
- invariants  

### Alias Token Naming Grammar (High‑Level)

Alias tokens follow a consistent grammar across categories:

```
<category>.<intent>[.<family>][.<variant>]
```
Optional modifiers:

```
<category>.<intent>.on.<intent>
<category>.<intent>.inverse.<variant>
<category>.<intent>.over.<variant>
```

Examples:

- `color.text.primary`  
- `color.text.on.surface`  
- `type.heading.lg`  
- `space.component.sm`  
- `radius.interactive.md`  
- `shadow.card.default`  

### Invariants (V1)

Alias tokens must follow these rules:

- Alias tokens must reference Foundations  
- Alias tokens must not contain literal values  
- Alias tokens must not include component names  
- Alias tokens must not include platform names  
- Alias tokens must follow the naming grammar  
- Alias tokens must use lowercase and dot‑delimited segments  
- Alias tokens must not include hyphens, slashes, or underscores  
- Alias tokens must not encode raw Figma names  

Violations MUST fail normalization.

### Example (Color Alias Token)

```json
{
  "color": {
    "action": {
      "accent": {
        "$value": "{options.color.blue.spruce.1000}"
      }
    }
  }
}
```

### Example (Typography Alias Token)

```json
{
  "type": {
    "body": {
      "md": {
        "$value": {
          "fontFamily": "{options.type.family.sans}",
          "fontSize": "{options.type.size.300}",
          "lineHeight": "{options.type.lineHeight.400}",
          "fontWeight": "{options.type.weight.regular}"
        }
      }
    }
  }
}
```

Alias tokens are the semantic backbone of Cedar’s design system.
Component tokens (Tier 3) may reference only this tier.

--- 

## Semantic Naming Grammar (All Categories)

Semantic alias tokens follow a unified naming grammar across all token categories.  
This grammar ensures that semantic tokens are:

- stable  
- predictable  
- platform‑agnostic  
- enforceable by normalization  
- readable by designers and developers  
- compatible with Style Dictionary  

The grammar applies to **all token categories**, with category‑specific extensions.

--- 

## 6.1 Unified Naming Grammar All semantic alias tokens follow the general structure:

```
<category>.<intent>[.<family>][.<variant>]
```
Optional modifiers:

```
<category>.<intent>.on.<intent>
<category>.<intent>.inverse.<variant>
<category>.<intent>.over.<variant>
```


### Required Rules

- **Lowercase only**  
- **Dot-delimited segments**  
- **No hyphens, underscores, or slashes**  
- **No component names**  
- **No platform names**  
- **No raw Figma names**  
- **No brand palette names**  
- **No literal values**  

Normalization MUST reject tokens that violate these rules.

---

## 6.2 Categories and Their Semantic Grammars

Each token category defines its own semantic vocabulary.  
The unified grammar applies, but each category has its own:

- intents  
- families  
- variants  
- modifiers  
- invariants  

Below are the category‑specific grammars.

---

## 6.2.1 Color Tokens

**Grammar**

```
color.<intent>[.<family>][.<variant>]
color.<intent>.on.<intent>
color.<intent>.inverse.<variant>
color.<intent>.over.<variant>
```


**Intents (UX Roles)**  
- `surface`  
- `action`  
- `navigation`  
- `page`  
- `text`  
- `error`, `success`, `warning`, `info`  
- `outline`  

**Families (Palette Roles)**  
- `brand`  
- `primary`, `secondary`, `tertiary`  
- `neutral`  

**Variants (Tonal / Emphasis)**  
- `base`, `subtle`, `muted`, `highlight`  
- `accent`, `strong`, `vibrant`  
- `shade`  

**Examples**

- `color.text.primary`  
- `color.surface.base`  
- `color.action.accent.hover`  
- `color.text.on.surface`  

---

## 6.2.2 Typography Tokens

**Grammar**

```
color.<intent>[.<family>][.<variant>]
color.<intent>.on.<intent>
color.<intent>.inverse.<variant>
color.<intent>.over.<variant>
```


**Intents (UX Roles)**  
- `surface`  
- `action`  
- `navigation`  
- `page`  
- `text`  
- `error`, `success`, `warning`, `info`  
- `outline`  

**Families (Palette Roles)**  
- `brand`  
- `primary`, `secondary`, `tertiary`  
- `neutral`  

**Variants (Tonal / Emphasis)**  
- `base`, `subtle`, `muted`, `highlight`  
- `accent`, `strong`, `vibrant`  
- `shade`  

**Examples**

- `color.text.primary`  
- `color.surface.base`  
- `color.action.accent.hover`  
- `color.text.on.surface`  

---

## 6.2.2 Typography Tokens

**Grammar**

```
type.<intent>.<size>
type.<intent>.<size>.<emphasis>
```


**Intents**  
- `body`  
- `heading`  
- `label`  
- `code`  

**Sizes**  
- `xs`, `sm`, `md`, `lg`, `xl`, `xxl`  

**Emphasis**  
- `regular`, `medium`, `semibold`, `bold`  

**Examples**

- `type.body.md`  
- `type.heading.lg.semibold`  
- `type.label.sm.medium`  

---

## 6.2.3 Spacing Tokens

**Grammar**

```
space.<intent>.<scale>
```


**Intents**  
- `component`  
- `layout`  
- `inline`  
- `stack`  

**Scale**  
- `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`  

**Examples**

- `space.component.sm`  
- `space.layout.lg`  
- `space.inline.md`  

---

## 6.2.4 Radius Tokens

**Grammar**

```
radius.<intent>.<size>
```


**Intents**  
- `interactive`  
- `container`  
- `surface`  

**Sizes**  
- `none`, `sm`, `md`, `lg`, `full`  

**Examples**

- `radius.interactive.sm`  
- `radius.container.md`  
- `radius.surface.lg`  

---

## 6.2.5 Border Tokens

**Grammar**



