# Data Architecture — Cedar Token Pipeline

This document defines the data‑layer architecture for Cedar’s token pipeline. It describes the data shapes, environment boundaries, and transformation layers that govern how tokens move from Figma → GitHub → Style Dictionary → NPM.

The purpose of this diagram is to provide a stable reference for ADR‑0001 (Canonical Token Model), ADR‑0002 (Normalization Layer), and all future pipeline work.

---

## Overview

The data architecture is structured around three core principles:

- **Raw → Normalized → Canonical → Transformed**
- **Environment boundaries are explicit** (Figma, GitHub, SD, Distribution)
- **Only the Canonical Token Model is the source of truth**

This diagram complements the V0 architecture by focusing specifically on data flow, not process flow.

---

## Data Architecture Diagram

![V0 Data Architecture](../assets/v0-data-architecture.png)

---

## Layer Definitions

### 1. Raw Figma Variables (Figma Environment)

The ungoverned, design‑shaped JSON exported from Figma’s Variables API.

- Originating data  
- Contains design metadata  
- Not suitable for direct consumption  
- Input to the Normalization Layer  

**Artifact:** `raw-figma.json`

---

### 2. Normalization Layer (GitHub Environment)

Transforms Raw Figma Variables into the governed Canonical Token Model.

- Applies structural normalization  
- Enforces naming, typing, and semantic rules  
- Removes design‑only metadata  
- Produces a stable, platform‑agnostic shape  

**Artifact:** `canonical.json` (pre‑validation)

---

### 3. Canonical Token Model (GitHub Environment)

The **single source of truth** for all downstream transforms.

- Defined by ADR‑0001  
- Platform‑agnostic  
- Direction‑agnostic  
- Versionable and governed  
- Consumed by Style Dictionary and future sync‑back  

**Artifact:** `canonical.json` (validated)

---

### 4. SD Config & Transform (Style Dictionary Environment)

Consumes the Canonical Token Model and produces platform‑specific outputs.

- CSS variables  
- Figma‑shaped JSON (for future sync‑back)  
- Additional formats (TS, iOS, Android) can be added later  

**Artifacts:**  
- `css/`  
- `figma.json`  
- `tokens.json` (optional)

---

### 5. Packaged Output (GitHub / CI Environment)

Bundles all SD outputs into a distributable package.

- Includes all platform outputs  
- Prepared for publishing  

**Artifact:** `dist/`

---

### 6. NPM Registry (Distribution Environment)

Receives the versioned token package.

- Consumers install via NPM  
- This is the distribution layer, not the source of truth  

**Artifact:** `@rei/tokens`

---

## Environment Boundaries

The architecture explicitly separates:

- **Figma** — proposal environment  
- **GitHub** — governance + canonical truth  
- **Style Dictionary** — transform engine  
- **NPM** — distribution  

This ensures clarity in ownership, debugging, and future automation.

---

## Relationship to ADRs

- **ADR‑0001** defines the Canonical Token Model  
- **ADR‑0002** defines the Normalization Layer  
- **ADR‑0003** defines the Figma Input Contract  
- **ADR‑0004** defines the full pipeline architecture  

This document provides the shared data foundation for all of them.

