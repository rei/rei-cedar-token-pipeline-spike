
# Architecture Index

This directory contains the canonical documentation for Cedar’s token pipeline modernization. It serves as the single entry point for diagrams, ADRs, and technical notes that define how design tokens move from Figma → GitHub → Style Dictionary → published packages.

---

## Document Index

### High-Level Architecture

| Document | Description |
|---------|-------------|
| **V0 Architecture Diagram** | Early visualization of the token pipeline from Figma → Canonical → SD → NPM. |

---

### Architecture Decision Records (ADRs)

| ADR | Title | Status | Description |
|-----|--------|---------|-------------|
| **[ADR‑0001](./ADR/adr-0001-token-canonical-model.md)** | Token Canonical Model | Draft | Defines the governed, platform‑agnostic token shape used as the source of truth. |
| **[ADR‑0002](./ADR/adr-0002-token-normalization-layer.md)** | Normalization Layer | Planned | Defines how raw Figma variables are transformed into the canonical model. |
| **[ADR‑0003](./ADR/adr-0003-figma-input-contract.md)** | Figma Input Contract | Planned | Documents assumptions and structure of raw Figma variable payloads. |
| **ADR‑0004** | Token Pipeline Architecture | Planned | Describes the full system architecture including CI/CD, transforms, and publishing. |

---

## How to Navigate This Documentation

- Start with the **V0 Architecture Diagram** to understand the overall flow.  
- Read **ADR‑0001** to understand the canonical token model and governance rules.  
- Follow with **ADR‑0002** once normalization rules are drafted.  
- Use **ADR‑0003** to validate assumptions about Figma’s API.  
- Finish with **ADR‑0004** for the end‑to‑end pipeline and CI/CD logic.  

This sequence mirrors the actual build order of the pipeline.

---

## Future Additions

- Native platform outputs (iOS, Android)  
- Figma write‑back considerations  
- Versioning strategy  
- Impact analysis and change detection  
- Governance workflows  
