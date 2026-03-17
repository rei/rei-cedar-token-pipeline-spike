# ADR‑0003: Figma Input Contract

## Status
Draft

> [!NOTE]
> The mapping contract section reflects the V1 implementation. The Export Method section describes the V0 automated GitHub Actions export.


## Context  
Cedar’s design token pipeline begins with design proposals authored in Figma. These proposals are exported via the Figma REST API as two complementary raw inputs, each representing a different dimension of design intent:

- **Raw Figma Variables** — atomic values representing colors, numbers, strings, booleans, and references  
- **Variables API:**  
  https://developers.figma.com/docs/rest-api/variables/
- **Local Styles** — composite design styles (typography, effects, grids, paint styles) that may reference variables

Together, these two inputs form the unprocessed design‑time source material for Cedar’s Normalization Layer (ADR‑0002). They reflect designer intent but lack:

- semantic typing
- naming conventions
- governance
- platform abstraction
- validation guarantees

This ADR defines the contract for these raw inputs:

- what Cedar expects
- what Figma must provide
- what invariants must hold
- what failure modes the pipeline must detect
- how these inputs map into the Canonical Token Model (ADR‑0001)

This contract ensures that the Normalization Layer can operate deterministically and that downstream systems (Style Dictionary, platform SDKs, and runtime theming) receive stable, governed, semantically typed tokens.

---

## Raw Figma Variables

Raw Figma Variables are retrieved via the Figma Variables REST API:

- Variables API:  
  https://developers.figma.com/docs/rest-api/variables/

Raw Variables include:

- variable collections  
- modes  
- per‑mode values  
- references (as variable IDs)  
- resolved types  
- metadata (e.g., `variableCollectionId`, `modeId`)  

In V1, Cedar treats Raw Figma Variables as the authoritative source of all **atomic, design‑time values**. They represent designer intent but do not yet meet the requirements of the Canonical Token Model.

### Characteristics

Raw Variables are:

- not semantically typed  
- not governed  
- not platform‑agnostic  
- not validated against naming conventions  
- not suitable for direct consumption by Style Dictionary  

### Required Fields (V1 Contract)

Every variable must include:

- `id` — globally unique Figma variable ID  
- `name` — raw designer‑authored name  
- `resolvedType` — Figma’s inferred type (`color`, `number`, `string`, `boolean`)  
- `variableCollectionId` — parent collection  
- `valuesByMode` — map of mode ID → value or reference  
- `scopes` — Figma‑defined usage scopes (may be empty)  

### Allowed Value Types

Per‑mode values may be:

- literal values (color, number, string, boolean)  
- references to other variables (via variable ID)  
- `null` (unsupported or unassigned)  

### Invariants (V1)

The following must always be true for the pipeline to accept the file:

- Every variable must declare a `resolvedType`.  
- Every mode must provide either a literal value or a reference.  
- No variable may mix incompatible types across modes.  
- All references must resolve to variables within the same export.  
- No circular references are allowed.  

### Failure Modes

The pipeline will reject Raw Variables if:

- a reference cannot be resolved  
- a variable has inconsistent types across modes  
- a variable is missing required fields  
- a variable name violates the canonical naming contract (ADR‑0001)  
- a variable participates in a circular reference chain  

### Artifact

`raw-figma-variables.json`


---

## Figma-to-Canonical Path Mapping Contract

### Purpose

Raw Figma variable names, collection names, and group names are designer-authored and subject to change without notice. The Normalization Layer MUST NOT infer canonical paths by string manipulation of Figma names — doing so couples the pipeline to Figma's current naming and causes silent breakage when designers rename things.

Instead, the mapping between Figma collection paths and canonical `color.option.*` paths is declared explicitly in `token-mapping.json`. This file is the formal, version-controlled boundary between design and engineering.

### token-mapping.json

`token-mapping.json` lives alongside `canonical.json` in the `tokens/` directory and is committed to the repository. It maps every Figma collection to:

- `canonicalPrefix` — the `color.option.*` prefix for all tokens in this collection
- `tokens` — an explicit map of every Figma token path to its canonical sub-path

```json
{
  "collections": {
    "neutral-palette": {
      "canonicalPrefix": "color.option.neutral",
      "tokens": {
        "warm-grey.100":          "warm.grey.100",
        "warm-grey.900":          "warm.grey.900",
        "base-neutrals.white":    "white",
        "base-neutrals.white-85": "overlay.light",
        "base-neutrals.white-75": "overlay.subtle"
      }
    },
    "brand-palette": {
      "canonicalPrefix": "color.option.brand",
      "tokens": {
        "blue.400": "blue.400",
        "red.600":  "red.600"
      }
    }
  }
}
```

### Invariants

- `token-mapping.json` MUST be present. Missing file fails the build.
- Every Figma collection in `options.color.*.json` MUST have a `collections` entry. Unknown collections fail the build.
- Every Figma token path within a collection MUST have a `tokens` entry. Unknown paths fail the build.
- Canonical sub-paths MUST follow ADR-0001 path rules: lowercase, dot-delimited, no hyphens.
- Semantic renames (e.g. `white-85` → `overlay.light`) are expressed here, not in code.

### Governing Changes

When a designer renames or restructures Figma variables:

1. The build fails with a specific error naming the unmapped path
2. Engineering and design agree on the canonical name
3. A PR updates `token-mapping.json` — reviewable, diffable, governable
4. The build passes again

This makes designer renames visible at the PR level rather than silently corrupting canonical paths.

---

## Four-File Platform Input Contract

### Why Four Files

The Figma Variables API exports one file per platform-appearance combination because Figma's mode system is one-dimensional — it cannot represent `platform × appearance` in a single export. Cedar's pipeline reconstructs this matrix from four separate files.

This is an architectural constraint of the Figma REST API, not a choice. It means the appearance dimension (light/dark) is encoded in the **filename convention**, not in the file contents.

### Governed File Set

The following four files are the required, governed inputs for color option processing:

| File | Platform | Appearance | Role |
|---|---|---|---|
| `options.color.web-light.json` | web | light | Canonical `$value` source for `color.option.*` |
| `options.color.web-dark.json` | web | dark | Provides `appearances.dark` values |
| `options.color.ios-light.json` | ios | light | Provides `platformOverrides.ios.light` where different from web |
| `options.color.ios-dark.json` | ios | dark | Provides `platformOverrides.ios.dark` where different from web-dark |

All four files MUST be present. The build MUST fail if any are missing.

### Adding a New Platform or Appearance

Adding a new platform (e.g. `android`) or a new appearance (e.g. `high-contrast`) requires:

1. An ADR amendment documenting the new platform/appearance and its governance rules
2. New Figma files exported under the naming convention (`options.color.android-light.json`, etc.)
3. Updates to `token-mapping.json` if the new platform uses different collection names
4. Updates to `mergeColorVariants` in `normalize.ts` to include the new platform in `platformOverrides`
5. A new platform config and action in the Style Dictionary pipeline

This is intentionally not self-service — adding a platform is a significant governance decision.

### Figma API vs Pre-Exported Files

The spike implementation uses **pre-exported JSON files** placed in the `tokens/` directory, not live Figma REST API calls during normalization. The normalization script reads from the filesystem. The GitHub Action handles the Figma API calls as a separate upstream step that populates the `tokens/` directory before normalization runs.

This separation is intentional:
- Normalization is deterministic and testable without Figma API access
- The Figma API step can be re-run independently when designs change
- CI can validate canonical.json without network access

---

## Local Styles

## Local Styles

Local Styles are retrieved via the Figma File Nodes API:

- File Nodes API:  
  https://developers.figma.com/docs/rest-api/files/

Local Styles represent composite design constructs that cannot be expressed through variables alone. They capture higher‑order design intent and often reference Raw Figma Variables. In V1, Local Styles are treated as first‑class raw inputs and are required to reconstruct full design semantics.

Local Styles include:

- Text styles (font family, size, weight, line height, letter spacing)  
- Effect styles (shadows, blurs)  
- Grid styles  
- Paint styles  
- Variable bindings used within styles (e.g., typography styles referencing color variables)

### Characteristics

Local Styles provide structure and relationships that Raw Figma Variables do not capture. They are essential for reconstructing:

- composite tokens (typography, shadows, grids)  
- variable usage within styles  
- cross‑variable relationships  
- design intent that spans multiple atomic values  

Local Styles are not governed, validated, or normalized. They may contain:

- inconsistent naming  
- incomplete variable bindings  
- mixed literal values and variable references  
- platform‑specific assumptions  

### Required Fields (V1 Contract)

Every Local Style must include:

- `id` — globally unique Figma style ID  
- `name` — raw designer‑authored name  
- `styleType` — one of: `TEXT`, `EFFECT`, `GRID`, `PAINT`  
- `description` — optional designer notes  
- `remote` — whether the style originates from a library  
- `key` — Figma style key (used for cross‑file references)  
- `documentNode` — full node payload containing style properties and variable bindings  

### Variable Binding Requirements

If a Local Style references variables:

- all variable IDs must resolve to variables in the same export  
- bindings must be explicit in the node payload  
- styles may not mix literal values and variable references for the same property in the same mode  

### Invariants (V1)

The following must always be true for the pipeline to accept Local Styles:

- Every style must declare a valid `styleType`.  
- Every style must include a `documentNode` with the expected property set for its type.  
- All variable references must resolve to Raw Figma Variables.  
- No style may contain unresolved or malformed variable bindings.  
- No style may reference a variable of an incompatible type (e.g., text style referencing a boolean).  

### Failure Modes

The pipeline will reject Local Styles if:

- a variable reference cannot be resolved  
- a style is missing required fields  
- a style contains unsupported or unknown properties  
- a style mixes incompatible value types  
- a style name violates the canonical naming contract (ADR‑0001)  
- a style references variables from an unexported file or library  

### Artifact

`raw-figma-styles.json`

---

## Known Limitations

The raw Figma inputs (Variables and Local Styles) reflect design intent but lack the structure, guarantees, and governance required by the Canonical Token Model. The following limitations apply in V1:

### Structural Limitations

- No enforced naming conventions  
- No semantic typing (e.g., color vs spacing vs typography)  
- No versioning, change history, or diffability  
- No guarantees about completeness or usage coverage  
- No validation of variable references or style bindings  

### Data Quality Limitations

- Variables may be unused, orphaned, or duplicated  
- Styles may be partially defined or reference missing variables  
- Literal values may be mixed with variable references  
- Collections and modes may be inconsistently structured  
- Component usage tracking may be incomplete or unavailable  

### API and Export Limitations

- Figma API payload shapes may change without notice  
- Plugin exports may differ from REST API exports  
- Multi‑file or multi‑team variable usage may require additional ingestion logic  
- Remote styles may not include full node details depending on library permissions  

### Governance Limitations

- Designers may rename or restructure variables or styles without warning  
- No enforcement of canonical naming rules at design time  
- No enforcement of semantic categories or token types  
- No enforcement of cross‑mode consistency  

These limitations are addressed by the Normalization Layer (ADR‑0002), which applies validation, governance, semantic typing, and canonicalization to produce stable, platform‑agnostic tokens.

---

## Export Method (V0)

In V0, raw Figma inputs are exported automatically using a GitHub Actions workflow. This replaces the earlier manual export process and provides a stable, repeatable mechanism for retrieving design‑time data from Figma.

### GitHub Workflow

A dedicated GitHub Action retrieves raw Figma Variables and Local Styles from one or more Figma libraries. The workflow:

- runs on demand or on a schedule  
- authenticates using a GitHub secret (`FIGMA_ACCESS_TOKEN`)  
- iterates over an array of Figma file keys  
- fetches variables and styles for each file  
- writes the results into the repository for downstream processing  

This automation ensures that the pipeline always ingests the latest design state.

### Endpoints Used

- Variables:  
  `/v1/files/:file_key/variables`

- Styles and node tree:  
  `/v1/files/:file_key`

### Authentication

- GitHub Actions uses a **team access token** stored as a GitHub secret.  
- The workflow supports **multiple file keys**, enabling ingestion from multiple libraries.

### Output Artifacts

For each Figma file key, the workflow produces:

- `raw-figma-variables.json`  
- `raw-figma-styles.json`

These artifacts are committed or made available to the Style Dictionary pipeline as unprocessed inputs to the Normalization Layer.

### Characteristics of the V0 Export

- Automated GitHub‑based export  
- Deterministic and repeatable  
- Supports multiple Figma libraries  
- No schema validation  
- No diffing or change detection  
- No enforcement of naming or semantic rules  
- Stable enough to support normalization and early governance

### Limitations of V0 Export

- Workflow must be manually triggered or scheduled; not event‑driven from Figma  
- No automated verification that the export matches the latest design state  
- Remote styles may not include full node details depending on library permissions  
- Multi‑collection or multi‑mode structures may require manual inspection  
- No cross‑file reference resolution (handled in V1)

V1 introduces schema validation, diff‑based governance, and cross‑file reference resolution, but V0 provides the minimal viable automated ingestion required to bootstrap the pipeline.

---

## Relationship to Canonical Model

Raw Figma Variables and Local Styles are transformed into the Canonical Token Model through the Normalization Layer (ADR‑0002). This transformation is required because raw Figma inputs do not provide the semantic structure, governance, or platform abstraction needed for downstream consumption.

### Purpose of the Transformation

The Canonical Token Model (ADR‑0001) defines:

- semantic token types  
- naming conventions  
- platform‑agnostic structure  
- reference rules  
- composite token definitions  
- governance and validation requirements  

Raw Figma inputs do not satisfy these requirements. The Normalization Layer bridges this gap by converting unstructured design intent into governed, deterministic, platform‑ready tokens.

### What the Normalization Layer Enforces

During transformation, the Normalization Layer applies:

- semantic typing (color, spacing, typography, shadow, etc.)  
- canonical naming conventions  
- platform‑agnostic token structure  
- reference resolution and validation  
- cross‑mode consistency rules  
- composite token construction (typography, shadows, grids)  
- removal of unused or orphaned variables  
- enforcement of invariants defined in ADR‑0003  

### What the Normalization Layer Does Not Do

The Normalization Layer does **not**:

- infer missing design intent  
- correct ambiguous or conflicting variable definitions  
- automatically rename variables or styles without explicit rules  
- generate platform‑specific tokens (handled by Style Dictionary)  
- modify the raw Figma export  

It strictly transforms raw inputs into canonical form based on explicit rules.

### Output of the Transformation

The result of this process is a governed, validated, semantically typed set of tokens that:

- conform to the Canonical Token Model  
- are stable across platforms  
- are suitable for Style Dictionary and SDK generation  
- can be diffed, versioned, and governed  
- support multi‑mode and multi‑theme design systems  

### Raw Inputs Are Never Published

Raw Figma Variables and Local Styles:

- are never consumed directly by Style Dictionary  
- are never published to NPM  
- are never exposed to downstream platforms  

Only the canonical, normalized output is considered authoritative.

---

## Risks and Assumptions

The Figma input layer introduces several risks that must be accounted for by the Normalization Layer and future automation. These risks stem from the flexibility of Figma’s design environment, the variability of API exports, and the absence of governance at design time.

### Designer Workflow Risks

- Designers may rename or restructure variables or styles without warning.  
- Variables or styles may be deleted, duplicated, or moved across collections.  
- Literal values may be introduced where variable references are expected.  
- Styles may be partially defined or inconsistently applied across the file.  
- Multi‑mode or multi‑collection structures may be created without coordination.

### API and Data Shape Risks

- Figma API payload shapes may change without notice.  
- Fields may be added, removed, or renamed across API versions.  
- Plugin exports may differ from REST API exports.  
- Remote styles may not include full node details depending on permissions.  
- Component usage tracking may be incomplete or unavailable.

### Pipeline Integration Risks

- Raw inputs may contain unresolved or circular references.  
- Variables may have inconsistent types across modes.  
- Styles may reference variables that are missing from the export.  
- Multi‑file or multi‑team variable usage may require additional ingestion logic.  
- Raw inputs may not match the expected schema for normalization.

### Governance and Stability Risks

- No enforcement of naming conventions at design time.  
- No enforcement of semantic categories or token types.  
- No validation of cross‑mode consistency.  
- No guarantee that raw inputs reflect the latest design state.  
- No built‑in versioning or diffability for design artifacts.

### Assumptions (V1)

The pipeline assumes:

- Raw Figma exports are complete and reflect the intended design state.  
- All variable references resolve within the exported file.  
- Designers follow high‑level naming patterns, even if not enforced.  
- Collections and modes are used consistently within a file.  
- Local Styles include sufficient node detail to reconstruct composite tokens.  
- The export process is run whenever design changes occur.

These assumptions will be progressively replaced by automated validation, schema enforcement, and diff‑based governance in future versions.

---

## Future Considerations

The Figma input contract defined in this ADR establishes the foundation for Cedar’s design‑to‑code pipeline, but several enhancements are planned for future versions. These improvements focus on automation, governance, validation, and multi‑source design ingestion.

### Automation and Tooling

- Automate Figma export via GitHub Actions or scheduled CI workflows.  
- Introduce schema validation for raw inputs prior to normalization.  
- Add automated diffing to detect design changes and trigger pipeline runs.  
- Provide developer tooling for local export, validation, and debugging.  
- Support incremental ingestion to avoid full‑file reprocessing.

### Governance and Validation

- Enforce naming conventions at design time through plugins or linters.  
- Validate semantic categories and token types before normalization.  
- Detect unused, orphaned, or duplicated variables and styles.  
- Enforce cross‑mode consistency and reference integrity.  
- Provide warnings or errors for ambiguous or conflicting design intent.

### Multi‑Source and Multi‑Team Support

- Ingest proposals from multiple Figma files or teams.  
- Resolve cross‑file variable references and remote style dependencies.  
- Support shared libraries and multi‑collection governance.  
- Introduce a unified ingestion layer for distributed design systems.

### Reverse Sync and Round‑Trip Workflows

- Support reverse sync from Canonical Tokens back into Figma.  
- Provide tooling to update Figma variables and styles based on governed tokens.  
- Enable round‑trip workflows where design and code remain in sync.

### Advanced Design Intent Reconstruction

- Improve detection of composite token patterns (typography, shadows, grids).  
- Infer missing relationships when safe and unambiguous.  
- Provide richer metadata for platform‑specific or theme‑specific tokens.  
- Support multi‑theme and multi‑brand design systems.

These future enhancements will strengthen the contract between design and engineering, improve governance, and ensure that Cedar’s token pipeline remains robust, scalable, and aligned with evolving design system needs.

