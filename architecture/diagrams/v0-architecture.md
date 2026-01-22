# V0 Architecture — Cedar Token Pipeline Spike

This document describes the **V0 architecture** for Cedar’s token pipeline spike.  
V0 is intentionally **one‑directional (Figma → Style Dictionary)** but is architected with **explicit future ports** that allow bidirectional sync to be added later **without re‑architecture**.

The goal of this architecture is to validate feasibility, reduce manual effort, and establish a stable foundation for future automation.

---

## Architectural Goals

- Support PM’s requirement that **design originates token changes**
- Validate a **manual, one‑directional pipeline** from Figma → SD
- Establish a **normalized token contract** as the canonical interface
- Demonstrate **diffing**, **impact detection**, and **governance**
- Produce **SD‑ready outputs** (CSS + Figma‑shaped JSON)
- Ensure the architecture is **future‑proof** for reverse‑sync

---

## Architecture Diagrams

### Production Pipeline Overview

![V0 Architecture](../assets/v0-architecture.png)

### V0 spike architecture
 

### Notes:
- **Port A (future sync‑back):** SD → Figma using the Figma‑shaped JSON output  
- **Port B (future proposal intake):** Alternative design‑side proposal sources → Normalized Contract  
- V0 implements only the **downward flow**, but the architecture is intentionally shaped to support both ports later.

---

##  Layer‑by‑Layer Breakdown

### 1. **Figma (Proposal Environment)**
- Designers originate token changes.
- Figma Variables API provides raw JSON.
- This is not the canonical source of truth — only the **originating environment**.

### 2. **Ingestion Layer**
- Raw Figma JSON is exported manually.
- No transformation occurs here.
- Output: `raw-figma.json`

### 3. **Normalized Token Contract**
- The central, direction‑agnostic token format.
- Designed to be consumed by SD and future reverse‑sync.
- Output: `normalized.json`

### 4. **Diff Layer**
- Compares two normalized snapshots.
- Detects:
  - added tokens  
  - modified tokens  
  - removed tokens  
- Output: `diff.json`

### 5. **Impact Detection**
- Maps variable changes to affected components.
- Output: `impact.json`

### 6. **Governance Layer**
- Applies ADR‑based validation rules.
- Determines which changes are allowed or rejected.
- Output: `governance.md` (notes)

### 7. **Style Dictionary (Canonical Source of Truth)**
- Consumes normalized tokens.
- Produces platform‑specific outputs.
- In V0, this is simulated manually.

### 8. **Output Layer**
- **CSS variables** for consumers  
- **Figma‑shaped JSON** for future sync‑back  
- Outputs:
  - `sd-output-css.txt`
  - `sd-output-figma.json`

---

## Future‑Ready Ports

### **Port A — Sync Back to Figma**
- Uses SD’s Figma‑shaped JSON output.
- Enables SD → Figma updates.
- Prevents drift.
- Not implemented in V0.

### **Port B — Design Proposal Intake**
- Allows proposals from:
  - Figma plugins  
  - design tools  
  - external proposal systems  
- Normalizes proposals into the token contract.
- Not implemented in V0.

---

## Why This Architecture Is Future‑Proof

- The **normalized token contract** is the backbone of both directions.
- Governance sits **between** proposal and canonical truth.
- SD outputs include a **Figma‑shaped JSON** payload for future sync‑back.
- Diffing and impact detection are **direction‑agnostic**.
- No layer needs to be rewritten when bidirectional sync is added.

---

## Related Files

- `/README.md` — V0 overview and assumptions  
- `/artifacts/` — JSON artifacts for each layer  
- `/notes/` — governance, risks, learnings  

---


