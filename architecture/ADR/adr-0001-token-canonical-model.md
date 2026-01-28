# ADR‑0001: Canonical Token Model

## Status  
Planned

## Context  
Cedar’s design token pipeline requires a stable, governed, platform‑agnostic representation of design intent.  
This representation — the **Canonical Token Model** — is the single source of truth for all downstream transformations (web, iOS, Android, React Native, etc.).

The canonical model is produced by the Normalization Layer (ADR‑0002) from raw Figma inputs (ADR‑0003).  
It must be semantically meaningful, structurally consistent, and free of platform‑specific assumptions.

---

## Purpose  
The Canonical Token Model defines:

- the allowed token types  
- the structure of `$value` for each type  
- how references (aliases) are represented  
- how composite tokens (typography, shadows, etc.) are modeled  
- which metadata is preserved and where  
- which formats are allowed or prohibited  
- how validation is enforced  

This model is the **only** format consumed by Style Dictionary and other platform transformers.

---

## Canonical Token Structure

Every token in the canonical model MUST follow this structure:

```json
{
  "$type": "<canonical-type>",
  "$value": <structured-value>,
  "$extensions": {
    "cedar": {
    // metadata from Figma or normalization
    }
  }
}
```

### Required fields
- `$type` — canonical token type  
- `$value` — structured, platform‑agnostic value  
- `$extensions.cedar` — metadata not defined by DTCG  

### Prohibited
- CSS strings  
- platform‑specific values  
- flattened or stringified composite tokens  
- implicit units  

---

## Supported Canonical Token Types

### 1. Color

**Rules**

- Hex and RGBA objects are implicitly **sRGB**.
- Wide‑gamut colors MUST declare a `space` field.
- Allowed `space` values:
  - `"srgb"` (implicit)
  - `"display-p3"`
- P3 values MUST be normalized floats (`0–1`).
- Platform transforms are responsible for converting P3 to platform‑specific equivalents.

**Allowed formats:**

- `"#RRGGBB"`
- `{ "r": 255, "g": 255, "b": 255, "a": 1 }`
- `{ "space": "display-p3", "r": 1, "g": 1, "b": 1 }`

**Not allowed**
- CSS strings (`rgba(...)`, `hsl(...)`)
- HSL strings
- Platform‑specific formats (UIColor, ARGB hex)

---

### 2. Dimension

All dimensional values MUST be structured:

- `{ "value": 16, "unit": "px" }`

**Allowed units:**

- `px`  
- `unitless`  
- `percent`  
- `em` (discouraged in canonical)  
- `rem` (discouraged in canonical)  

---

### 3. Typography (Composite Token)

Typography tokens MUST be structured objects.  
No CSS strings, no platform font stacks.

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

- `fontFamily` MUST be a **semantic alias**, not a platform stack  
- `fontWeight` MUST be numeric (100–900) or an alias  
- `fontSize`, `lineHeight`, `letterSpacing` MUST be structured `{ value, unit }`  
- `lineHeight` MUST declare its unit (`px`, `unitless`, `percent`)  

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


---

### 5. Other Composite Types

Future composite types (grid, border, motion, etc.) MUST follow the same structured, platform‑agnostic pattern.

---

## Alias Rules

### Aliases MUST remain unresolved in the canonical model.

Canonical tokens may reference other canonical tokens using DTCG syntax:

`"$value": "{color.background.base}"`


### Why
- preserves semantic relationships  
- enables platform‑specific resolution  
- supports diffing and governance  
- avoids premature flattening  

Alias resolution happens **only** in the transformation layer (Style Dictionary or equivalent).

---

## Metadata Rules

All metadata not defined by DTCG MUST be stored under:

`"$extensions.cedar"`


Examples:

- `figmaId`  
- `styleId`  
- `variableCollectionId`  
- documentation metadata  
- raw mode identifiers  

Metadata MUST NOT affect `$value`.

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
