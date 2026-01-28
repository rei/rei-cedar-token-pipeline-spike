# V0 Spike Plan — Cedar Token Pipeline

Validate the feasibility of Cedar’s end‑to‑end token pipeline:

`Figma → Normalization → Canonical Model → Transform Layer → Platform Outputs`

The spike is not intended to produce production‑ready assets.  
Its purpose is to **learn**, **de‑risk**, and **prove the architecture**.

---

# V0 Scope

V0 uses **mock data and mock components** to validate the architecture without inheriting legacy Cedar complexity.

### V0 Includes
- A **mock options library** (~10 colors, structured like Cedar options)
- A **mock alias color library** (generated as we build components)
- A **mock component library** (1–2 components using alias tokens)
- A **mock consumer app** (validates dev handoff)
- A **mock Figma file** containing:
  - mock options variables  
  - mock alias variables  
  - mock components using alias tokens  

### V0 Does *Not* Include
- Real Cedar tokens  
- Real Cedar palette  
- Real semantic taxonomy  
- Real component tokens  
- Naming grammar enforcement  
- State metadata  
- Overlay‑based states  
- Multi‑mode support  
- Publishing or versioning  

V0 is **pipeline validation only**.

---

# V0 Figma Input Contract (Spike‑Only)

V0 uses a **minimal, mock Figma input contract** to validate ingestion and normalization without inheriting real Cedar complexity.

### V0 Figma Inputs
The mock Figma file must contain:

- **Mock option variables**
  - ~10 color primitives  
  - structured like Cedar options (`options.color.*`)  
  - single collection  
  - single mode (light/default)

- **Mock alias variables**
  - created as we build mock components  
  - loosely follow the future semantic grammar  
  - map directly to mock options

- **Mock components**
  - 1–2 components using alias tokens only  
  - no primitives exposed  
  - no component tokens exposed  

### V0 Figma Exports
V0 exports only:

- `raw-figma-variables.json`  
  - contains mock options + mock alias tokens  
  - includes variable IDs, names, resolvedType, valuesByMode  
  - includes metadata needed for normalization (`variableCollectionId`, etc.)

V0 **does not export**:

- local styles  
- composite styles  
- multi‑mode values  
- multi‑collection structures  
- component usage metadata  

### V0 Figma Constraints
- Variables API only  
- Single collection  
- Single mode  
- Color variables only  
- No semantic naming enforcement  
- No style ingestion  
- No plugin‑generated metadata  
- No references to real Cedar tokens  

### V0 Example Input Shape
```json
{
  "id": "VariableID:123",
  "name": "warm-grey/600",
  "resolvedType": "COLOR",
  "valuesByMode": {
    "0:0": "#6B6B6B"
  },
  "variableCollectionId": "VC:1"
}
```
## Purpose of the V0 Input Contract

This ensures:

- normalization can parse real Figma JSON
- canonical generation works with real API shapes
- alias resolution works end‑to‑end
- Style Dictionary can consume the canonical output
- dev handoff can be validated in Figma Dev Mode

--- 


# V0 Normalization Contract (Spike‑Only)

V0 normalization validates the transformation from raw Figma variables → canonical tokens using a minimal, mock dataset.

For the V0 spike, normalization will:

- Convert **Figma variable IDs → canonical token paths**
- Apply **DTCG structure** (`$type`, `$value`)
- Preserve Figma metadata in **`$extensions.cedar`**
- Process **only**:
  - mock color primitives (options)
  - mock alias tokens
- Ignore:
  - local styles  
  - composite tokens  
  - multi‑mode values  
  - multi‑collection structures  
- Preserve Figma names **as‑is** (no semantic naming enforcement)
- Skip all governance and naming normalization  
  - These responsibilities begin in **V1**

---

## V0 Transformation Example
Figma Variable: "warm-grey/600" (ID: VariableID:123)
↓
Canonical: options.color.warm.grey.600

## V0 Canonical Output Example
Figma Variable

Figma Variable:
  Name: "warm-grey/600"
  ID: "VariableID:123"
  Value: "#6B6B6B"

```json
{
  "options": {
    "color": {
      "warm": {
        "grey": {
          "600": {
            "$type": "color",
            "$value": "#6B6B6B",
            "$extensions": {
              "cedar": {
                "figmaId": "VariableID:123",
                "figmaName": "warm-grey/600"
              }
            }
          }
        }
      }
    }
  }
}
```
### Purpose of the V0 Input Contract

This ensures:

- Figma variable names can be parsed into canonical paths
- Canonical tokens follow DTCG structure
- Metadata is preserved for future governance
- Alias resolution can be validated in V0
- Style Dictionary can consume the canonical output
- The pipeline supports future semantic enforcement in V1

---

## V0 Canonical Model Contract (Spike‑Only)

The V0 canonical model validates that normalized Figma variables can be transformed into a DTCG‑compliant canonical structure.

### V0 Canonical Model Scope

For the V0 spike, the canonical model will support:

- Color tokens only
- Single mode (light) only
- Structured color values (`"#RRGGBB"` or RGBA objects)
- Alias references using DTCG syntax
- Explicit state tokens allowed (e.g., `color.action.accent.hover`)
- Options tokens included as private primitives

### V0 Canonical Responsibilities

The V0 canonical model must:

- Accept normalized tokens from the V0 Normalization Layer
- Preserve $type, $value, and $extensions.cedar
- Maintain alias references without resolving them
- Produce a valid canonical.json file
- Validate against the V0 canonical schema (color‑only)


### V0 Canonical Limitations

The V0 canonical model does not support:

- multi‑mode tokens
- typography, spacing, radius, shadows, or other composite types
- platform‑specific values
- semantic naming enforcement
- governance rules

These responsibilities begin in V1.

`ock Options (private) ↓ Mock Alias Tokens (public) ↓ Mock Component Library (public) ↓ Mock Consumer App (uses alias + component) ↓ Dev Handoff Validation`
---

# Goals (Organized by ADR)

---

## ADR‑0001 — Validate the Canonical Model  
`../architecture/ADR/adr-0001-token-canonical-model.md`

### Questions
- Can we generate valid canonical JSON from mock Figma variables?
- Does the canonical structure hold up under real‑world complexity?
- Can we enforce schema validation in CI?

### Output
- Define V0 canonical JSON schema (color only)
- Implement canonical validator (Node script)
- Add CI step to validate canonical JSON
- Create canonical example dataset (mock options + mock alias)

---

## ADR‑0002 — Validate Normalization Layer  
`../architecture/ADR/adr-0002-token-normalization-layer.md`

### Questions
- Can we reliably map Figma variable names → alias tokens?
- Can we detect invalid or ambiguous names?
- Can we extract metadata (figmaId, collections)?

### Output
- Parse mock Figma variable export JSON
- Map variable names → mock alias tokens
- Extract metadata into `$extensions.cedar`
- Generate canonical JSON from normalized tokens
- Validate canonical output against schema

---

## ADR‑0003 — Validate Figma Input Contract  
`../architecture/ADR/adr-0003-figma-input-contract.md`

### Output
- Export mock options library JSON
- Export mock alias library JSON
- Validate naming conventions (lightweight)
- Validate mode extraction (single mode)
- Validate semantic mapping (mock)

---

## ADR‑0004 — Validate Options → Alias → Component Flow  
`../architecture/ADR/adr-0004-semantic-token-architecture.md`

### Questions
- Can we alias mock options tokens cleanly?
- Can we detect when designers use primitives instead of alias tokens?
- Can we produce a clean alias library for Figma?
- Can components consume alias tokens correctly?

### Output
- Validate alias token naming grammar (lightweight)
- Validate semantic intent + variant mapping (mock)
- Validate explicit state tokens (hover/pressed)
- Validate alias tokens in mock components

---

## ADR‑0005 — Validate Transform Layer & Platform Outputs  
`../architecture/ADR/adr-0005-transfrom-layer-and-platform-outputs.md`

### Questions
- Can Style Dictionary consume the canonical model?
- Can we generate CSS, iOS, and Android outputs?
- Can we preserve alias relationships until the transform step?
- Can we split output by category (color.css, color.swift, etc.)?

### Output
- Configure Style Dictionary for canonical input
- Implement color transforms (hex, rgba)
- Implement alias resolution
- Generate CSS variables
- Generate JS/TS output
- Generate grouped output files (color.css, color.swift, etc.)

---

# Figma → Dev Handoff Validation  
*(Cross‑ADR: 0001 + 0004 + 0005)*

### Questions
- Can developers inspect a Figma component and find the same alias token in code?
- Can we generate a `@cedar/types` package for type‑safe token usage?
- Can we generate component prop interfaces?
- Can we ensure developers never see primitives or component tokens?

### Output
- Generate configuration map (token → platform outputs)
- Generate `@cedar/types` package
- Generate component prop interfaces
- Validate that Figma Dev Mode shows alias tokens only

---

# Documentation Tasks

- [ ] Update ADR‑0001 with V0 canonical examples  
- [ ] Update ADR‑0002 with V0 normalization rules  
- [ ] Update ADR‑0004 with future semantic grammar  
- [ ] Update ADR‑0005 with transform outputs  
- [ ] Create spike summary document  

---

# Learnings to Capture

### Figma Reality
- How consistent are variable names?
- How many variables violate naming grammar?
- How many variables cannot be mapped to alias tokens?

### Options Coverage
- Are designers using non‑options colors?

### Semantic Layer Stability
- Does the naming grammar hold up?
- Are any intents or variants missing?

### Transform Layer Feasibility
- Do we need custom transforms for P3, typography, shadows?

### Developer Experience
- Does `@cedar/types` provide meaningful autocomplete?
- Do component prop interfaces feel intuitive?
- Does Figma Dev Mode → code mapping feel natural?

---

# Success Criteria

The spike is successful if:

- We can generate valid canonical JSON from mock Figma data  
- We can transform canonical tokens into CSS, iOS, and Android outputs  
- We can generate a `@cedar/types` package  
- We can generate component prop interfaces  
- We can validate alias tokens in Figma Dev Mode  
- We can identify gaps in options, alias tokens, and state tokens  
- We can produce a clear list of V1 requirements  

---

# Deliverables

- `canonical.json` (V0)  
- `schema.json` (canonical schema)  
- `dist/css/color.css`  
- `dist/ios/ColorTokens.swift`  
- `dist/android/colors.xml`  
- `@cedar/types` package  
- Mock component library  
- Mock consumer app  
- Updated ADR‑0001 → ADR‑0005  
- Spike summary document  
