# ADR‑0003: Figma Input Contract

## Status  
Planned

> [!NOTE]
> V0 implements only a minimal subset of this ADR for pipeline validation. > Full implementation begins in V1.


## Context  
Cedar’s token pipeline begins with design proposals authored in Figma. These proposals are exported via the Figma REST API as two complementary raw inputs:

- **Raw Figma Variables** — atomic values representing colors, numbers, strings, booleans, and references  
- **Variables API:**  
  https://developers.figma.com/docs/rest-api/variables/
- **Local Styles** — composite design styles (typography, effects, grids, paint styles) that may reference variables

Both inputs reflect design intent but lack governance, semantic structure, or platform readiness. Together, they form the unprocessed design‑time source material for Cedar’s normalization layer.

This document defines the structure, limitations, and assumptions of the raw Figma input layer. It serves as the foundation for the Normalization Layer (ADR‑0002) and informs the shape of the Canonical Token Model (ADR‑0001).

---

# Future: Full Input Contract

The following sections describe the complete Figma input contract Cedar will support in V1 and beyond.

## Raw Figma Variables

Raw Figma Variables are retrieved via the **Figma Variables REST API**:

- **Variables API:**  
  https://developers.figma.com/docs/rest-api/variables/

Raw Variables include:

- variable collections  
- modes  
- per‑mode values  
- references (as variable IDs)  
- resolved types  
- metadata (e.g., `variableCollectionId`, `modeId`)  

Raw Variables are:

- not semantically typed  
- not governed  
- not platform‑agnostic  
- not suitable for direct consumption by Style Dictionary  

**Artifact:** `raw-figma-variables.json`

---

## Local Styles

Local Styles are retrieved via the **Figma File Nodes API**:

- **File Nodes API:**  
  https://developers.figma.com/docs/rest-api/files/

Local Styles represent composite design constructs that cannot be expressed through variables alone. These styles are considered part of the raw input and are required to reconstruct full design intent.

Local Styles include:

- **Text styles** (font family, size, weight, line height, letter spacing)  
- **Effect styles** (shadows, blurs)  
- **Grid styles**  
- **Paint styles**  
- **Variable bindings** used within styles (e.g., typography styles referencing color variables)

Local Styles provide structure and relationships that Raw Figma Variables do not capture. The Normalization Layer merges both inputs to produce governed, semantically typed canonical tokens.

**Artifact:** `raw-figma-styles.json`

---

## Known Limitations

- No enforced naming conventions  
- No semantic typing (e.g., color vs spacing vs typography)  
- No platform targeting  
- No versioning or change history  
- No validation or governance rules  
- May include unused or orphaned variables or styles  
- May vary by plugin or export method  
- Variable usage within components may be incomplete or unavailable  

---

## Export Method (V0)

In V0, raw Figma inputs are exported manually using:

- **Variables:** `/v1/files/:file_key/variables`  
- **Styles & node tree:** `/v1/files/:file_key`  
- **Authentication:** team token (not user key)  
- **Output:**  
  - `raw-figma-variables.json`  
  - `raw-figma-styles.json`  

This export is not automated in V0, but the structure is stable enough to support normalization.

---

## Relationship to Canonical Model

Raw Figma Variables and Local Styles are transformed into the **Canonical Token Model** via the Normalization Layer.  
This transformation enforces:

- semantic typing  
- naming conventions  
- platform‑agnostic structure  
- governance rules  
- reference resolution  
- composite token construction (e.g., typography, shadows)

Raw inputs are never consumed directly by Style Dictionary or published to NPM.

---

## Risks and Assumptions

- Designers may rename or restructure variables or styles without warning  
- Figma API may change payload shape or field names  
- Plugin exports may differ from REST API exports  
- Component usage tracking may be incomplete or unavailable  
- Future automation will require diffing and validation of raw input  
- Multi‑file or multi‑team variable usage may require additional ingestion logic  

---

## Future Considerations

- Automate export via GitHub Actions  
- Validate raw input against expected schema  
- Track component usage for impact detection  
- Normalize proposals from multiple design sources  
- Support reverse sync from Canonical → Figma  
- Support multi‑mode and multi‑collection governance  

---

## Related Documents

- ADR‑0001: Canonical Token Model  
- ADR‑0002: Normalization Layer  
- Data Architecture Diagram (`../diagrams/v0-data-architecture.md`)
