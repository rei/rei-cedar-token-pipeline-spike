# Architecture Index

This directory contains the canonical documentation for Cedar’s token pipeline modernization.  
It serves as the single entry point for diagrams, ADRs, and technical notes that define how design tokens move from **Figma → Normalization → Canonical Model → Transform Layer → Platform Outputs**.

All V0‑specific behavior is documented in the **V0 Spike Plan** and not in the ADRs.

---

## Document Index

### High‑Level Architecture

| Document | Description |
|---------|-------------|
| **[V0 Architecture Diagram](./diagrams/v0-architecture.md)** | Draft | High‑level visualization of the token pipeline from Figma → Canonical → SD → NPM. |
| **[V0 Data Architecture Diagram](./diagrams/v0-data-architecture.md)** | Draft | Data‑flow diagram showing how raw Figma inputs become canonical tokens. |

---

## Architecture Decision Records (ADRs)

| ADR | Title | Status | Description |
|-----|--------|---------|-------------|
| **[ADR‑0001](./ADR/adr-0001-token-canonical-model.md)** | Canonical Token Model | Draft | Defines the governed, platform‑agnostic token shape used as the source of truth. |
| **[ADR‑0002](./ADR/adr-0002-token-normalization-layer.md)** | Normalization Layer | Draft | Defines how raw Figma variables are transformed into the canonical model. |
| **[ADR‑0003](./ADR/adr-0003-figma-input-contract.md)** | Figma Input Contract | Draft | Documents assumptions and structure of raw Figma variable payloads. |
| **[ADR‑0004](./ADR/adr-0004-semantic-token-architecture.md)** | Semantic Token Architecture | Planned | Defines how options, alias tokens, and component tokens relate semantically. |
| **[ADR‑0005](./ADR/adr-0005-transfrom-layer-and-platform-outputs.md)** | Transform Layer & Platform Outputs | Planned | Defines how canonical tokens are transformed into CSS, iOS, Android, and other outputs. |

---

## How to Navigate This Documentation

1. Start with the **V0 Architecture Diagram** for the overall pipeline.  
2. Read **ADR‑0001** to understand the canonical token model.  
3. Continue with **ADR‑0002** to understand normalization rules.  
4. Use **ADR‑0003** to understand raw Figma input assumptions.  
5. Review **ADR‑0004** for semantic token structure (options → alias → component).  
6. Finish with **ADR‑0005** for platform transforms and output generation.

This sequence mirrors the actual build order of the pipeline.

---

## Future Additions

- Native platform outputs (iOS, Android)  
- Figma write‑back considerations  
- Versioning strategy  
- Impact analysis and change detection  
- Governance workflows  
- Multi‑mode and multi‑collection support  
- Token lifecycle and semantic versioning  
