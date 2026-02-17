# ADR‑0001: Canonical Token Model

## Status  
Draft 

> [!NOTE] > implements only a minimal subset of this ADR for pipeline validation.

## Context  
Cedar’s design token pipeline requires a stable, governed, platform‑agnostic representation of design intent.  
This representation — the **Canonical Token Model** — is the single source of truth for all downstream transformations.

- normalization output
- Style Dictionary input
- Semantic token resolution
- lifecycle validation
- governance and breaking‑change rules
- future bi‑directional sync with Figma

The canonical model is produced by the Normalization Layer (ADR‑0002) from raw Figma inputs (ADR‑0003).  
It must be:

- semantically meaningful
- structurally consistent
- free of platform assumptions
- stable across versions
- diff‑friendly
- machine‑validatable


---

## Purpose  
The Canonical Token Model defines:

- the allowed token types  
- the structure of `$value` for each type
- how primitive, alias, and semantic tiers relate 
- how references (aliases) are represented  
- how composite tokens (typography, shadows, etc.) are modeled  
- how platform overrides are expressed (future‑facing)  
- how metadata is preserved
- how validation is enforced  

This model is the **only** format consumed by Style Dictionary and other platform transformers.

---

## Canonical Token Structure

Every token in the canonical model MUST follow this structure:

```json
{
  "$type": "<canonical-type>",
  "$value": <structured-value-or-alias>,
  "$extensions": {
    "cedar": {
      // metadata from Figma or normalization
    }
  }
}
```

### Required fields

- `$type` — canonical token type  
- `$value` — structured, platform‑agnostic value or alias  
- `$extensions.cedar` — metadata not defined by DTCG  

### Prohibited

Canonical tokens MUST NOT contain:

- CSS strings  
- platform‑specific values  
- flattened or stringified composite tokens  
- implicit units  
- platform naming conventions  
- Figma slash notation  
- tool‑specific metadata outside `$extensions.cedar`  

### Notes

- `$value` MUST be either a structured value (for option tokens) or a DTCG‑style alias reference.  
- `$extensions.cedar` MUST NOT affect `$value` or token resolution.  
- Composite tokens MUST use structured objects, never strings.  
- All canonical tokens MUST be valid according to the canonical JSON Schema.


---

## Canonical Token Path Rules

Canonical token paths MUST follow a strict, deterministic grammar.  
These paths define the semantic hierarchy of the canonical model and MUST NOT reflect platform or tool‑specific structures.

### Path Grammar

Canonical token paths MUST:

- use dot‑delimited segments  
- use lowercase only  
- contain no hyphens, underscores, or slashes  
- contain no platform names (`css`, `ios`, `android`, etc.)  
- contain no component names or implementation details  
- contain no Figma naming constructs (slash notation, groups, collections)  
- reflect semantic structure only  

### Notes

- Path segments MUST be meaningful semantic categories (e.g., `color.action.accent`).  
- Normalization (ADR‑0002) is responsible for converting Figma variable names into canonical paths according to ADR‑0003.  
- Canonical paths MUST remain stable across versions unless a breaking change is explicitly governed.  

---

## Canonical Naming Grammar & Transform Relationship

The canonical model defines the authoritative naming grammar for all Cedar design tokens.  
Canonical token paths MUST use dot‑delimited notation, and this structure is the only naming format consumed by downstream transformation layers.

### Canonical Naming Rules

Canonical token paths MUST:

- use dot‑delimited segments  
- use lowercase only  
- contain no hyphens, underscores, or slashes  
- contain no platform names (`css`, `ios`, `android`, etc.)  
- contain no component names or implementation details  
- reflect semantic structure only  

### Relationship to Figma Naming

Normalization (ADR‑0002) is responsible for converting Figma’s slash‑notation variable names into canonical dot‑notation paths according to the Figma Input Contract (ADR‑0003).  
The canonical model MUST NOT contain Figma naming constructs.

### Relationship to Platform Transforms

All platform transformers — including Style Dictionary — MUST consume the canonical model and MUST NOT read raw Figma data directly.

Transform layers MAY convert canonical paths into platform‑specific naming conventions:

- CSS: kebab‑case  
- iOS: camelCase  
- Android: snake_case  

The canonical dot‑notation path remains the single source of truth and MUST NOT be altered by platform transforms.

---

## Supported Canonical Token Types

The canonical model defines a set of token types that MUST be represented using structured, platform‑agnostic values.  
All token types MUST conform to the canonical JSON Schema and MUST NOT use platform‑specific formats.

---

### 1. Color

#### Rules

- Hex and RGBA objects are implicitly **sRGB**.  
- Wide‑gamut colors MUST declare a `space` field.  
- Allowed `space` values:  
  - `"srgb"` (implicit)  
  - `"display-p3"`  
- P3 values MUST be normalized floats (`0–1`).  
- Platform transforms are responsible for converting P3 to platform‑specific equivalents.

#### Allowed formats

- `"#RRGGBB"`  
- `{ "r": 255, "g": 255, "b": 255, "a": 1 }`  
- `{ "space": "display-p3", "r": 1, "g": 1, "b": 1 }`  

#### Not allowed

- CSS strings (`rgba(...)`, `hsl(...)`)  
- HSL strings  
- platform‑specific formats (UIColor, ARGB hex)  

---

### 2. Dimension

All dimensional values MUST be structured:

```json
{ "value": 16, "unit": "px" }
```

#### Allowed units

- `px`  
- `unitless`  
- `percent`  
- `em` (discouraged in canonical)  
- `rem` (discouraged in canonical)  

---

### 3. Typography (Composite Token)

Typography tokens MUST be structured objects.  
No CSS strings or platform font stacks.

```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "{brand.primary}",
    "fontWeight": 500,
    "fontSize": { "value": 16, "unit": "px" },
    "lineHeight": { "value": 24, "unit": "px" },
    "letterSpacing": { "value": -0.2, "unit": "px" }
  }
}
```

#### Rules

- `fontFamily` MUST be a semantic alias  
- `fontWeight` MUST be numeric (100–900) or an alias  
- `fontSize`, `lineHeight`, `letterSpacing` MUST be structured `{ value, unit }`  
- `lineHeight` MUST declare its unit  

---

### 4. Shadow (Composite Token)

```json
{
  "$type": "shadow",
  "$value": [
    {
      "color": "{color.shadow.ambient}",
      "offsetX": { "value": 0, "unit": "px" },
      "offsetY": { "value": 2, "unit": "px" },
      "blur": { "value": 4, "unit": "px" },
      "spread": { "value": 0, "unit": "px" }
    }
  ]
}
```

#### Rules

- MUST be an array of shadow layers  
- each layer MUST use structured dimension objects  
- `color` MUST be a canonical color or alias  

---

### 5. Other Composite Types

Future composite types (e.g., grid, border, motion, transitions, layout primitives) MUST follow the same structured, platform‑agnostic pattern:

- no CSS strings  
- no platform‑specific values  
- no flattened or stringified structures  
- MUST use structured objects for all numeric or dimensional values  

---

### Notes

- All token types MUST be validated by the canonical JSON Schema.  
- New token types MUST define a canonical shape, validation rules, and normalization rules before being added to the system.  


---

## Alias Rules

### Aliases MUST remain unresolved in the canonical model.

Canonical tokens may reference other canonical tokens using DTCG alias syntax:

```json
"$value": "{color.background.base}"
```

Aliases MUST NOT be resolved, flattened, or replaced during normalization or canonicalization.

### Requirements

Alias tokens MUST:

- reference a valid canonical token path  
- use DTCG alias syntax (`{path.to.token}`)  
- preserve semantic relationships  
- be validated for cycles  
- be validated for type compatibility  

Alias tokens MUST NOT:

- contain raw values  
- resolve other aliases  
- reference platform‑specific tokens  
- reference Figma variable names or slash notation  

### Rationale

Leaving aliases unresolved in the canonical model:

- preserves semantic intent  
- enables platform‑specific resolution strategies  
- supports diff‑friendly governance  
- avoids premature flattening  
- ensures consistent behavior across all platforms  

### Example

```json
{
  "color": {
    "action": {
      "accent": {
        "$type": "color",
        "$value": "{options.color.warm.grey.600}",
        "$extensions": {
          "cedar": {
            "source": "figma",
            "figmaName": "Primary/Button/Background"
          }
        }
      }
    }
  }
}
```
---

## Metadata Rules

All metadata not defined by DTCG MUST be stored under:

```
$extensions.cedar
```

Metadata MAY include:

- `figmaId`  
- `styleId`  
- `variableCollectionId`  
- documentation metadata  
- raw mode identifiers  
- provenance information from normalization  

### Requirements

Metadata MUST:

- be stored only under `$extensions.cedar`  
- be preserved during normalization and canonicalization  
- be ignored by token resolution and platform transforms  
- not affect `$value` or token semantics  

Metadata MUST NOT:

- appear outside `$extensions.cedar`  
- change the meaning of a token  
- override canonical values  
- encode platform‑specific behavior  
- encode Figma naming structures  

### Notes

- Metadata is optional but strongly recommended for governance and traceability.  
- Metadata MUST NOT be used as a substitute for semantic structure or canonical fields.  
- Future metadata fields MUST be added under `$extensions.cedar` to maintain schema stability.

---

## Canonical Token Tiers

The canonical model defines three tiers of tokens.  
These tiers are essential for semantic token implementation, lifecycle validation, and governance.

### 1. Option Tokens

Option tokens are the lowest‑level, non‑alias, non‑semantic values.  
They represent raw, concrete design values.

Examples include:

- raw colors  
- raw spacing values  
- raw typography metrics  
- raw radii  

#### Requirements

Option tokens MUST:

- define a concrete `$value`  
- be stable and versioned  
- use structured values appropriate to their type  

Option tokens MUST NOT:

- reference other tokens  
- contain aliases  
- contain platform‑specific values  

### Relationship to Normalization

Normalization (ADR‑0002) typically produces **alias** and **semantic** tokens derived from Figma variables.  
Option tokens are generally authored manually as part of the design system’s foundational palette and are not expected to be generated from Figma inputs.

As a result, normalized output will usually contain:

- `$extensions.com.figma` metadata  
- alias references  
- semantic paths  

This is expected and does not conflict with the canonical tier model.


#### Example

```json
{
  "options": {
    "color": {
      "warm": {
        "grey": {
          "600": {
            "$type": "color",
            "$value": "#6B6B6B"
          }
        }
      }
    }
  }
}
```

---

### 2. Alias Tokens

Alias tokens reference other canonical tokens using DTCG alias syntax.

Alias tokens MUST:

- reference a valid canonical token path  
- preserve semantic relationships  
- be validated for cycles  
- be validated for type compatibility  

Alias tokens MUST NOT:

- contain raw values  
- resolve other aliases  
- reference platform‑specific tokens  
- reference Figma variable names or slash notation  

#### Example

```json
{
  "color": {
    "action": {
      "accent": {
        "$type": "color",
        "$value": "{options.color.warm.grey.600}",
        "$extensions": {
          "cedar": {
            "source": "figma",
            "figmaName": "Primary/Button/Background"
          }
        }
      }
    }
  }
}
```

---

### 3. Semantic Tokens

Semantic tokens represent design intent, not implementation details.  
They define the meaning of a token within the design system.

Examples:

- `color.action.accent`  
- `color.text.primary`  
- `size.button.padding`  

#### Requirements

Semantic tokens MUST:

- reference option or alias tokens  
- remain stable across themes, modes, and versions  
- support future multi‑mode structures  

Semantic tokens MUST NOT:

- contain raw values  
- encode platform‑specific behavior  
- reference Figma naming constructs  

---

### Notes

- The tier hierarchy (Option → Alias → Semantic) MUST be preserved across all token categories

--- 

## Platforms

Platform overrides allow a semantic token to define platform‑specific values without polluting the canonical model.

Overrides are stored under `$extensions.cedar.platformOverrides`.

Example: 

```json
{
  "$type": "color",
  "$value": "{color.action.accent.base}",
  "$extensions": {
    "cedar": {
      "platformOverrides": {
        "ios": { "$value": "#123456" },
        "android": { "$value": "#654321" }
      }
    }
  }
}
```

Must
- Be optional
- Be validated for type correctness

May
- choose to consume overrides

Must Not
- change the canonical $value

---

## Canonical JSON Structure

The canonical model MUST be a deeply nested JSON object representing semantic hierarchy.

Example:

```json
{
  "color": {
    "options": {
      "warm": {
        "grey": {
          "600": {
            "$type": "color",
            "$value": "#6B6B6B"
          }
        }
      }
    },
    "action": {
      "accent": {
        "$type": "color",
        "$value": "{color.options.warm.grey.600}",
        "$extensions": {
          "cedar": {
            "source": "figma",
            "figmaName": "Primary/Button/Background"
          }
        }
      }
    }
  }
}

```
---
## Validation Requirements

The canonical model MUST be validated using:

### 1. JSON Schema (source of truth)
Validates:

- token structure  
- allowed `$type` values  
- `$value` shape per type  
- color format correctness  
- dimensional units  
- composite token structure  
- alias syntax  

### 2. TypeScript types (generated from schema)
Validates:

- developer usage  
- transform logic  
- helper utilities  

### 3. CI Enforcement
Invalid canonical tokens MUST fail the build.

---

## Non‑Responsibilities

The canonical model does **not**:

- define platform‑specific values  
- resolve aliases  
- generate CSS, iOS, or Android output  
- enforce design‑time constraints in Figma  
- store platform transforms  

Those responsibilities belong to other layers.

---

## Future Considerations

- Multi‑mode canonical tokens  
- Platform‑specific alias resolution strategies  
- Canonical motion tokens  
- Canonical grid and layout tokens  
- Canonical accessibility tokens  

---

## Related Documents

- ADR‑0002: Normalization Layer  
- ADR‑0003: Figma Input Contract  
- Data Architecture Diagram (`../diagrams/v0-data-architecture.md`)
