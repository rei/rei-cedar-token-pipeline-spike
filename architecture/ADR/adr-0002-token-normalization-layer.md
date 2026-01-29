# ADR‑0002: Normalization Layer

## Status  
Planned

## Context  
Cedar receives two ungoverned design‑time inputs from Figma:

- **Raw Figma Variables** — atomic values representing colors, numbers, strings, booleans, and references  
- **Local Styles** — composite design styles (typography, effects, grids, paint styles) that may reference variables

These inputs reflect design intent but lack semantic typing, naming conventions, platform‑agnostic structure, and governance. They cannot be consumed directly by Style Dictionary or downstream platforms.

---

## Purpose of the Normalization Layer

The Normalization Layer is the authoritative transformation step between raw design input and the canonical token model. It is responsible for:

- interpreting raw Figma data  
- enforcing governance rules  
- resolving references  
- constructing composite tokens  
- applying naming conventions  
- validating types and values  
- producing a stable, platform‑agnostic canonical structure  

It is the **only** layer allowed to transform raw design input into canonical tokens.

> [!NOTE]
> In V0, only a minimal subset of these responsibilities is implemented. Full normalization begins in V1.

---

# Future: Full Normalization

## Responsibilities

### Merge Raw Inputs

**Combine:**

- `raw-figma-variables.json`  
- `raw-figma-styles.json`  

into a unified intermediate representation that preserves all raw metadata.

### Semantic Typing

**Infer canonical `$type` based on:**

- Figma variable `resolvedType`  
- style metadata  
- naming conventions  
- Cedar governance rules  

**Examples:**

- `COLOR` → `color`  
- `FLOAT` → `dimension`  
- text style → `typography`  
- effect style → `shadow`  

### Naming Normalization

Apply Cedar’s naming conventions to produce:

- hierarchical, semantic paths  
- platform‑agnostic grouping  
- stable, governed token names  

The Normalization Layer must remove:

- plugin‑generated names  
- file‑system‑shaped paths  
- platform‑specific naming artifacts  

## Slash → Dot Path Conversion

Figma variable names use **slash‑delimited paths** (e.g., `warm-grey/600`, `surface/default`).  
The canonical token model defined in ADR‑0001 uses **dot‑notation paths** (e.g., `color.warm-grey.600`, `color.surface.default`).

The Normalization Layer is the **only** layer responsible for converting Figma’s slash‑notation into canonical dot‑notation.

This conversion MUST:

- preserve the hierarchical meaning of the original Figma name  
- apply Cedar’s semantic naming conventions  
- remove platform‑specific or plugin‑generated artifacts  
- ensure all canonical paths follow ADR‑0001 rules (lowercase, dot‑delimited, semantic)

Normalization MUST NOT:

- emit slash‑notation names  
- emit platform‑specific naming (dash, camelCase, snake_case)  
- infer platform naming conventions  

All downstream transforms (ADR‑0005) derive their naming from the canonical dot‑notation paths produced here.


### Reference Resolution

**Resolve:**

- variable → variable references  
- style → variable bindings  
- composite → atomic references  

**Ensure:**

- no broken references  
- no circular references  
- all references use DTCG alias syntax in the canonical model  

### Composite Token Construction

Convert Local Styles into canonical composite tokens:

- typography  
- shadows  
- grids  
- paint styles  

Each composite token must be represented as a structured object in the canonical model, not flattened or platform‑specific.

### Metadata Isolation

Move all non‑DTCG metadata into:

`$extensions.cedar`

**Examples:**

- `figmaId`  
- `styleId`  
- `variableCollectionId`  
- documentation metadata  
- raw Figma mode identifiers  

### Validation

Validate:

- schema compliance  
- type correctness  
- semantic value validity  
- reference resolution  
- duplicate path prevention  
- mode completeness (if applicable)  

Invalid tokens must fail CI.

### Canonical Output

Produce a single governed, platform‑agnostic JSON artifact:

**Artifact:** `canonical-tokens.json`

This file is the input to Style Dictionary and all downstream platforms.

---

## Non‑Responsibilities

The Normalization Layer does **not**:

- generate platform outputs (CSS, iOS, Android)  
- apply platform‑specific transforms  
- sync tokens back to Figma  
- enforce design‑time constraints inside Figma  
- manage versioning or publishing  
- perform diffing or impact detection (future work)  

Those responsibilities belong to other layers.

---

## Risks and Assumptions

- Raw Figma data may change shape without warning  
- Designers may rename variables or styles unpredictably  
- References may be broken or incomplete  
- Composite styles may not map cleanly to canonical structures  
- Multi‑mode support may require additional governance  
- Future Figma API changes may require schema updates  

---

## Future Considerations

- Automated diffing of raw input  
- Impact detection for variable and style changes  
- Multi‑file normalization  
- Reverse sync from Canonical → Figma  
- Validation of designer proposals before merge  
- Support for multi‑mode canonical tokens  

