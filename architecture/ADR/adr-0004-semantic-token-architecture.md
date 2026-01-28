# ADR‑0004: Semantic Token Architecture

## Status  
Planned

> [!NOTE]
> V0 implements only a minimal subset of this ADR for pipeline validation. > Full implementation begins in V1.


## Context  
Cedar’s current token set is heavily component‑specific and lacks a semantic abstraction layer. To modernize Cedar’s token architecture, we adopt a three‑tier

`Primitives → Alias → Component`

This ADR defines the long‑term semantic architecture, naming grammar, token flow, and the integration between Figma, the canonical model, and Style Dictionary. It focuses on color first; other foundations (spacing, typography, radius, prominence, motion) will be added incrementally.
---

## Purpose  
This ADR establishes:

- the three‑tier token architecture
- tier defenition and usage
- how Figma maps into the semantic alias layer
- how Style Dictionary consumes the canonical model
- a governed naming grammar
- a semantic lookup table for color
- a minimal approach to component tokens
- the V0 design workflow and Figma library structure

This semantic layer is the foundation for:

- ADR‑0001 (Canonical Token Model)  
- ADR‑0002 (Normalization Layer)  
- ADR‑0003 (Figma Input Contract)  

---

## Token Architecture Overview

Cedar’s token system is structured as:

**Foundations (options) → Alias (semantic ancestors) → Component**


---

## Tier 1 — Foundations

Options are raw design primitives. these tokens are private, and unpublished palettes and neutrals. These are literal values with no semantic meaning.

### Characteristics

- Represent the actual palette (e.g., brand colors, neutrals). 
- Named by Foundation role rather than implentation intent.
- Not consumed directly by components.
- Not available to members outside of Cedar Design. 
- Represent the Brand source of truth.


### Nameing 

Options use the following naming convention:

| Palette | range |

#### Examples: 

- white.75
- warm.grey.600
- blue.spruce.green.1000

---

## Tier 2 — Alias Tokens (Semantic Ancestor Tokens)

Alias tokens are semantic roles that map design intent to primitives.

They are:

- platform‑agnostic 
- stable
- governed
- the “API” that components consume
- the layer that Figma normalization produces
- the layer that Style Dictionary transforms into platform outputs

Alias tokens **alias primitives**, never raw values.

`color.action.accent → {options.color.blue.spruce.green.1000}`

### Semantic Color Naming Reference 

Alias tokens conform the the following naming convention

`color.<intent>.<family>.<variant>` 

addtionally alias tokens employ the useage of pre and post modifiers to the variant space

#### rules: 

- dot is the only delimiter - style dictionary will transform into dash 
- lowercase only 
- no hyphens, underscores, of slashes 
- no component names 
- no raw figma names 
- family, prefix, and variant are optional 

## Semantic Color Naming Reference (Intents, Families, Prefixes, Variants)

This table defines the semantic building blocks used to construct alias token names.  
Alias tokens follow the general grammar:

`color.<intent>[.<family>].<variant>`

Optional modifiers:

- `color.<intent>[.<family>].on.<variant>`
- `color.<intent>[.<family>].inverse.<variant>`
- `color.<intent>[.<family>].over.<variant>`

All segments are optional except `<intent>`.

| Category | Token Segment | Meaning / Usage |
|---------|----------------|------------------|
| **Intents (UX Roles)** | `surface` | Background layers (surface, surface‑variant) |
| | `action` | Interactive elements (buttons, controls, links) |
| | `navigation` | Navigation surfaces and items |
| | `page` | Page‑level backgrounds |
| | `text` | Foreground text/icon roles |
| | `error` | Error state colors |
| | `success` | Success state colors |
| | `warning` | Warning state colors |
| | `info` | Informational state colors |
| | `outline` | Strokes and borders |
| | `on.<intent>` | Foreground elements that sit on another intent (e.g., `on.surface`, `on.action`) |
|  |  |  |
| **Color Families (Palette Roles)** | `brand` | Brand color family (primary brand palette) |
| | `primary` | Primary palette family for the intent |
| | `secondary` | Secondary palette family for the intent |
| | `tertiary` | Tertiary or complementary palette family |
| | `neutral` | Neutral/gray palette family |
|  |  |  |
| **Prefixes (Relationships)** | `color.` | Base namespace for fills and foregrounds |
| | `on` | Foreground content that sits *on top of* another color intent |
| | `inverse` | Flipped foreground/background relationship (e.g., light‑on‑dark) |
| | `over` | Semi‑transparent scrims or overlays |
|  |  |  |
| **Variants (Tonal / Emphasis)** | `highlight` | Very light, subtle fills |
| | `subtle` | Low‑emphasis surfaces |
| | `muted` | Disabled or subdued |
| | `base` | Default surface/text value |
| | `accent` | Interactive emphasis (variant, not family) |
| | `shade` | Darker fills/borders |
| | `strong` | Primary fills, critical states |
| | `vibrant` | Elevated, saturated emphasis |


## State Tokens & State Metadata

Cedar supports a staged approach to state handling that aligns with current design workflows (explicit state colors) while preparing for a future overlay‑based system.

### Explicit State Tokens (Current Behavior)

Designers define state colors by selecting new palette values (e.g., blue.1000 → blue.900).  
These appear in the semantic layer as explicit tokens:

- color.action.accent
- color.action.accent.hover
- color.action.accent.pressed


These tokens are treated as independent values.

### Metadata: Preparing for Overlay-Based States

To support future computed states, canonical tokens may include metadata describing:

- the luminance of the base color  
- the recommended overlay color (white or black)  
- the opacity that would produce an equivalent tonal shift  
- the base token the state was derived from  

Example:

```json
{
  "color": {
    "action": {
      "accent": {
        "$value": "{options.color.blue.1000}",
        "$extensions": {
          "cedar": {
            "luminance": 0.30,
            "stateLayer": "white"
          }
        }
      },
      "accent": {
        "hover": {
          "$value": "{options.color.blue.900}",
          "$extensions": {
            "cedar": {
              "derivedFrom": "{color.action.accent}",
              "overlayEquivalent": {
                "base": "{color.action.accent}",
                "layer": "white",
                "opacity": 0.08
              }
            }
          }
        }
      }
    }
  }
}
```

This metadata enables:

- future overlay computation
- contrast validation
- automated state generation
- palette‑wide consistency checks


### V1: Hybrid State System (Explicit + Computed)

- computed overlays for hover/pressed
- fallback explicit tokens for legacy components
- a rule‑based system for selecting overlay color
- automated generation of state tokens during build
- no explicit hover/pressed tokens
- state layers computed from base color
- luminance‑aware overlay selection
- consistent tonal shifts across all components

However we should note that this system requires design to adopt overlay‑based state creation, which is out of scope for this doc.


---

## Tier 3 — Component Tokens

Component tokens define how a component uses semantic alias tokens.

### Key principles

- Component tokens never reference primitives
- Component tokens never define raw values
- Component tokens should be minimal
- Component tokens should not proliferate
- Component tokens should not encode semantics
- Component tokens should only express usage


Examples: 

- button.background → `{color.action.accent}`
- button.text → `{color.action.on.accent}`
---

## Mapping Figma → Semantic → Canonical

The Cedar token pipeline transforms design intent into platform‑specific output through four stages:

`Figma → Semantic Alias Tokens → Canonical Tokens → Platform Tokens` 

Each stage is governed and explicit.

---

## Design Workflow and Figma Library Architecture

Designers use:

- variables
- modes
- collections
- naming conventions

### Design deliverables 

#### Options Library (Private)

Owned by Cedar Design + Brand.

- contains raw palette values
- not exposed to product teams
- not used directly in component design
- provides the root values to the Alias library

#### Alias Color Library (Public)

Published by Cedar Design.

- contains all semantic alias tokens
- is the **only** color library non Cedar designers use
- maps primitives → alias tokens
- provides a stable semantic vocabulary
- provided as figma variables

Designers use:

- color.surface.base
- color.surface.accent
- color.surface.on.accent
- color.brand.primary

#### Cedar Component Library (Public)

Published by Cedar Design.

Components:

- use alias tokens internally
- expose alias tokens in their properties
- never expose primitives
- never expose component tokens 

Example (Button):

- background → `color.action.accent`
- button.text → {color.action.on.accent}


#### Non‑Cedar Teams

##### A. Using Cedar components

They drag components from the Cedar library.
They inherit alias tokens automatically.

##### B. Building their own components

They use the alias library to style them.
They never touch primitives.


##### Developer Workflow

Developers have access to:
- alias tokens (via Style Dictionary output)
- component tokens (via Cedar Vue library)
- Cedar components

Design to Dev handoff:

- using figma dev mode inspect Figma
- see alias tokens
- use the Cedar Vue component directly
- or find the alias tokens in code

### Figma variable names → Semantic Paths

Normalization (ADR‑0002) converts Figma variable names into semantic alias tokens.

| Figma variable | Semantic alias token |
|`"Primary/Button/Background/Hover"`| color.action.accent.hover |

Normalization performs:

- Parse Figma hierarchy
- Map to semantic intent (e.g., “Button” → action)
- Map to variant (e.g., “Primary” → accent)
- Map to state (e.g., “Hover” → .hover)
- Construct semantic alias token

#### Figma → Semantic Modes

Figma modes (e.g., Light, Dark, High Contrast) are preserved and stored in the canonical model under:

`$extensions.cedar.modes` 

This ensures:

- mode information is not lost
- semantic tokens can vary by mode
- Style Dictionary can generate multi‑mode outputs

Modes are not part of the semantic token name; they are metadata.


### 2. Normalization (ADR‑0002)

Semantic alias tokens become canonical tokens with:

- `$type`
- `$value`
- `$extensions.cedar` metadata

### 3. Canonical Model (ADR‑0001)
```json
{
  "$type": "color",
  "$value": "{options.color.blue.spruce.green.900}",
  "$extensions": {
    "cedar": {
      "source": "figma",
      "figmaName": "Primary/Button/Background/Hover",
      "modes": ["light", "dark"]
    }
  }
}
```
The canonical model is the single source of truth for all platforms.

### 4. Style Dictionary

Style Dictionary transforms canonical tokens into platform‑specific outputs.

It resolves:
- alias references
- units
- platform color formats
- platform naming conventions (dash)


Example: 

css
`--cdr-color-action-accent: #0055cc;`

ios
`Color.actionAccent`

---

## Governance Rules

Normalization MUST enforce:

- naming grammar  
- allowed intents  
- allowed variants  
- allowed states  
- allowed tiers  
- no component‑specific tokens  
- no raw Figma names  
- no hyphens or slashes  
- no platform‑specific values  

Violations MUST fail normalization.

---

## Future Considerations

- Multi‑mode canonical tokens  
- Theming support  
- Motion semantic roles  
- Layout density tokens  
- Cross‑platform typography roles  
- Color contrast automation  

---

## Related Documents

- ADR‑0001: Canonical Token Model  
- ADR‑0002: Normalization Layer  
- ADR‑0003: Figma Input Contract  
