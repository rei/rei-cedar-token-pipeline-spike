# ADR‑0002: Normalization Layer

## Status  
Planned

## Context  
Cedar receives two ungoverned design‑time inputs from Figma:

- **Raw Figma Variables** — atomic values representing colors, numbers, strings, booleans, and references  
- **Local Styles** — composite design styles (typography, effects, grids, paint styles) that may reference variables

These inputs reflect design intent but lack:

- semantic typing  
- consistent naming conventions  
- platform‑agnostic structure  
- governance and validation  
- stable hierarchical organization  
- guaranteed reference integrity  

Because of these limitations, raw Figma data **cannot** be consumed directly by Style Dictionary or downstream platforms.

The Normalization Layer is the deterministic, governed transformation step that converts raw Figma inputs (ADR‑0003) into the canonical token model defined in ADR‑0001.  
It is the **only** layer permitted to interpret, restructure, or validate raw design input before it becomes canonical.

---

## Purpose of the Normalization Layer

The Normalization Layer is the authoritative transformation step between raw Figma inputs and the canonical token model defined in ADR‑0001.  
It interprets, restructures, and validates ungoverned design‑time data to produce a stable, platform‑agnostic representation of design intent.

Normalization is responsible for:

- interpreting raw Figma variables and styles  
- enforcing Cedar’s naming and governance rules  
- inferring canonical `$type` values  
- resolving references and ensuring referential integrity  
- constructing structured composite tokens  
- isolating metadata into `$extensions.cedar`  
- validating types, values, and structure  
- producing canonical dot‑notation paths  
- emitting a fully governed canonical token artifact  

Normalization is the **only** layer permitted to transform raw design input into canonical tokens.  
All downstream layers (semantic resolution, platform transforms, publishing) MUST consume the canonical model produced here.

> [!NOTE]  
> In V0, only a minimal subset of normalization responsibilities is implemented.

---

# Full Normalization Responsibilities

Normalization is a deterministic, multi‑stage pipeline that transforms raw Figma inputs into the canonical token model defined in ADR‑0001.  
Each stage has strict responsibilities and MUST NOT perform work belonging to other layers.

---

## 1. Ingestion

Normalization MUST ingest the two raw Figma inputs:

- `raw-figma-variables.json`  
- `raw-figma-styles.json`  

Ingestion MUST:

- preserve all raw metadata  
- preserve all mode information  
- preserve all variable → variable references  
- preserve all style → variable bindings  

Ingestion MUST NOT:

- infer types  
- modify names  
- resolve references  
- drop metadata  

---

## 2. Intermediate Representation (IR)

Normalization MUST merge raw inputs into a unified **Intermediate Representation (IR)**.  
The IR is a lossless, structured view of all Figma variables, styles, references, and metadata.

The IR MUST:

- preserve all raw values  
- preserve all raw references  
- preserve all raw metadata  
- unify variables and styles into a single graph  

The IR MUST NOT:

- apply canonical naming  
- apply semantic grouping  
- coerce values  
- construct composite tokens  

---

## 3. Semantic Typing

Normalization MUST infer canonical `$type` values using:

- Figma variable `resolvedType`  
- style metadata  
- naming conventions  
- Cedar governance rules  

Examples:

- `COLOR` → `color`  
- `FLOAT` → `dimension`  
- text style → `typography`  
- effect style → `shadow`  

Semantic typing MUST NOT:

- infer platform types  
- infer CSS types  
- infer component semantics  

---

## 4. Naming Normalization

Normalization MUST apply Cedar’s naming conventions to produce:

- hierarchical, semantic paths  
- platform‑agnostic grouping  
- stable, governed token names  

Naming normalization MUST:

- remove plugin‑generated names  
- remove file‑system‑shaped paths  
- remove platform‑specific naming artifacts  
- enforce ADR‑0001 path grammar  

Naming normalization MUST NOT:

- emit platform naming (kebab, camelCase, snake_case)  
- infer component names  
- infer platform semantics  

---

## 5. Slash → Dot Path Conversion

Figma variable names use slash‑delimited paths (e.g., `warm-grey/600`).  
The canonical model uses dot‑notation paths (e.g., `color.warm-grey.600`).

Normalization is the **only** layer responsible for converting slash‑notation into canonical dot‑notation.

This conversion MUST:

- preserve hierarchical meaning  
- apply Cedar’s semantic naming conventions  
- remove platform‑specific or plugin artifacts  
- ensure compliance with ADR‑0001 path rules  

Normalization MUST NOT:

- emit slash‑notation  
- emit platform naming  
- infer platform transforms  

---

## 6. Reference Resolution

Normalization MUST resolve:

- variable → variable references  
- style → variable bindings  
- composite → atomic references  

Normalization MUST ensure:

- no broken references  
- no circular references  
- all references use DTCG alias syntax in the canonical model  

Normalization MUST NOT:

- resolve alias chains into raw values  
- flatten references  
- introduce platform‑specific reference formats  

---

## 7. Composite Token Construction

Normalization MUST convert Local Styles into canonical composite tokens:

- typography  
- shadows  
- grids  
- paint styles  

Composite tokens MUST:

- use structured objects  
- use structured dimensions  
- preserve alias references  
- follow canonical shapes defined in ADR‑0001  

Composite tokens MUST NOT:

- use CSS strings  
- use platform‑specific formats  
- flatten composite structures  

---

## 8. Metadata Isolation

Normalization MUST move all non‑DTCG metadata into:

```
$extensions.cedar
```

Metadata MAY include:

- `figmaId`  
- `styleId`  
- `variableCollectionId`  
- documentation metadata  
- raw mode identifiers  

Normalization MUST NOT:

- store metadata outside `$extensions.cedar`  
- allow metadata to affect `$value`  
- encode platform behavior in metadata  

---

## 9. Validation

Normalization MUST validate:

- canonical schema compliance  
- type correctness  
- structured value correctness  
- reference integrity  
- duplicate path prevention  
- mode completeness (if applicable)  

Invalid tokens MUST fail CI.

---

## 10. Canonical Output

Normalization MUST produce a single governed, platform‑agnostic JSON artifact:

```
canonical-tokens.json
```

This file is the **only** input to Style Dictionary and all downstream platforms.

---

## Normalization Invariants (MUST / MUST NOT)

The Normalization Layer operates under strict invariants that ensure deterministic, governed, and platform‑agnostic output.  
These invariants apply to all stages of normalization and MUST be enforced by CI.

### 1. Canonical Structure Invariants

Normalization MUST:

- produce tokens that conform to the canonical structure defined in ADR‑0001  
- emit `$type`, `$value`, and `$extensions.cedar` for every token  
- use structured values for all composite and dimensional types  
- preserve alias references using DTCG syntax  

Normalization MUST NOT:

- invent new canonical fields  
- emit platform‑specific fields  
- flatten composite tokens  
- emit CSS strings or platform formats  
- resolve aliases into raw values  

---

### 2. Naming Invariants

Normalization MUST:

- emit dot‑notation canonical paths  
- enforce lowercase, dot‑delimited naming  
- remove plugin‑generated or platform‑specific naming artifacts  
- ensure all paths comply with ADR‑0001 grammar  

Normalization MUST NOT:

- emit slash‑notation  
- emit kebab‑case, camelCase, snake_case, or PascalCase  
- infer component names  
- infer platform naming conventions  
- introduce hyphens, underscores, or slashes  

---

### 3. Reference Invariants

Normalization MUST:

- preserve all variable → variable references  
- preserve style → variable bindings  
- validate reference integrity  
- detect and reject circular references  
- convert all references to DTCG alias syntax  

Normalization MUST NOT:

- resolve alias chains  
- replace references with raw values  
- introduce platform‑specific reference formats  
- allow broken references to pass validation  

---

### 4. Typing Invariants

Normalization MUST:

- infer canonical `$type` based on Figma metadata and governance rules  
- validate that `$value` matches the inferred `$type`  
- validate composite token structure  

Normalization MUST NOT:

- infer platform types (CSS, UIKit, Android)  
- infer component semantics  
- coerce values into platform formats  

---

### 5. Metadata Invariants

Normalization MUST:

- isolate all non‑DTCG metadata under `$extensions.cedar`  
- preserve all raw Figma metadata  
- preserve mode identifiers  

Normalization MUST NOT:

- store metadata outside `$extensions.cedar`  
- allow metadata to affect `$value`  
- encode platform behavior in metadata  

---

### 6. Output Invariants

Normalization MUST:

- produce a single governed artifact: `canonical-tokens.json`  
- ensure the output is stable, diff‑friendly, and deterministic  
- ensure the output is valid according to the canonical JSON Schema  

Normalization MUST NOT:

- emit multiple canonical files  
- emit platform‑specific outputs  
- modify canonical output based on platform concerns  

---

### 7. Boundary Invariants

Normalization MUST NOT:

- define canonical token types (ADR‑0001 responsibility)  
- define Figma authoring rules (ADR‑0003 responsibility)  
- perform semantic token resolution (future ADR)  
- perform platform transforms (ADR‑0005 responsibility)  
- sync tokens back to Figma  

Normalization MUST:

- operate strictly between raw Figma input and canonical output  
- respect the boundaries defined by ADR‑0001 and ADR‑0003  

---

## Non‑Responsibilities

The Normalization Layer has strict boundaries.  
It MUST NOT perform work belonging to other layers in the Cedar architecture.

Normalization does **not**:

- generate platform outputs (CSS, iOS, Android)  
- apply platform‑specific transforms  
- infer platform naming conventions  
- resolve semantic meaning beyond what is required for canonical `$type` inference  
- perform semantic token resolution or mode expansion  
- sync tokens back to Figma  
- enforce design‑time constraints inside Figma  
- manage versioning, publishing, or release workflows  
- perform diffing, impact detection, or change analysis  
- define canonical token types or structures (ADR‑0001 responsibility)  
- define Figma authoring rules or naming contracts (ADR‑0003 responsibility)  
- store platform‑specific metadata or behavior  

Normalization MUST operate strictly between:

**raw Figma input → canonical token output**

and MUST NOT extend beyond this boundary.

--- 

## Risks & Assumptions

Normalization depends on external systems (Figma, plugins, designer workflows) that Cedar does not control.  
These risks and assumptions define the boundaries of what normalization can guarantee.

---

## Risks

### 1. Raw Figma Data Instability
Figma may change the structure, naming, or metadata of variables and styles without warning.  
Such changes may break ingestion or typing logic.

### 2. Designer‑Driven Renaming
Designers may rename variables or styles unpredictably, causing:

- broken references  
- unexpected path changes  
- loss of semantic meaning  

Normalization must detect and reject invalid or ambiguous names.

### 3. Broken or Incomplete References
Raw Figma data may contain:

- missing references  
- circular references  
- references to deleted variables  
- references across incompatible types  

Normalization must validate and fail fast.

### 4. Composite Style Ambiguity
Local Styles may not map cleanly to canonical composite structures, especially for:

- typography  
- shadows  
- grids  
- paint styles  

Normalization must enforce canonical shapes and reject invalid composites.

### 5. Multi‑Mode Complexity
Figma modes may be:

- incomplete  
- inconsistent  
- misaligned across variables  
- missing required states  

Normalization must validate mode completeness when applicable.

### 6. Plugin‑Generated Artifacts
Plugins may introduce:

- non‑semantic names  
- platform‑specific naming  
- file‑system‑shaped paths  
- metadata that conflicts with canonical rules  

Normalization must sanitize these artifacts.

### 7. Future Figma API Changes
Changes to:

- variable schema  
- style schema  
- reference representation  
- mode structures  

may require updates to the normalization pipeline and schema.

---

## Assumptions

Normalization assumes:

- Figma provides complete and accurate raw variable and style data  
- variable `resolvedType` is reliable for canonical `$type` inference  
- style metadata is sufficient to construct composite tokens  
- designers follow the Figma Input Contract (ADR‑0003)  
- raw references are structurally valid even if semantically incorrect  
- mode identifiers are stable across Figma exports  
- the canonical JSON Schema remains the source of truth for validation  

If any assumption is violated, normalization MUST fail validation rather than produce incorrect canonical output.

---

## Future Considerations

Normalization will evolve as Cedar’s design system, Figma capabilities, and platform requirements mature.  
The following areas represent planned or potential future enhancements.

---

### 1. Multi‑Mode Canonical Tokens

Support for multi‑mode canonical tokens will require:

- mode completeness validation  
- mode inheritance rules  
- mode fallback behavior  
- mode‑aware composite construction  
- mode‑aware alias resolution (future ADR)  

Normalization will need to enforce consistent mode structures across variables and styles.

---

### 2. Advanced Diffing & Impact Detection

Future versions may include:

- automated diffing of raw Figma input  
- detection of breaking changes  
- semantic impact analysis  
- designer‑facing warnings for risky changes  

These capabilities will support governance and release workflows.

---

### 3. Multi‑File Normalization

Large design systems may require:

- splitting normalization across multiple files  
- merging partial canonical outputs  
- validating cross‑file references  
- ensuring global path uniqueness  

This will require enhancements to ingestion and IR merging.

---

### 4. Reverse Sync (Canonical → Figma)

Future bi‑directional sync may allow:

- pushing canonical tokens back into Figma  
- updating variable names and values  
- enforcing naming conventions inside Figma  
- validating designer proposals before merge  

Normalization will need to expose structured metadata to support this.

---

### 5. Schema Evolution

As new token types emerge (motion, grid, accessibility), normalization will need to:

- support new canonical shapes  
- validate new composite structures  
- enforce new typing rules  
- maintain backward compatibility  

Schema evolution will be governed by future ADRs.

---

### 6. Performance & Scalability

As token counts grow, normalization may require:

- incremental normalization  
- caching of IR and resolved references  
- parallel processing of variable graphs  
- streaming canonical output generation  

These improvements will ensure normalization remains fast and reliable.

---

### 7. Plugin & API Resilience

Normalization may need to adapt to:

- changes in Figma’s variable or style schema  
- new reference types  
- new mode structures  
- plugin‑generated metadata  

Future ADRs will define how normalization responds to upstream changes.

---

Normalization will continue to evolve, but its core contract remains stable:

**raw Figma input → governed canonical output**
