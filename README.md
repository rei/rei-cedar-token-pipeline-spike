# Cedar Token Pipeline — V0 Spike

This repository contains the **V0 spike** for Cedar’s proposed design token pipeline exploration.  
The goal of this spike is to **manually validate** a one‑directional workflow from **Figma Variables → ingestion → normalization → diffing → governance → Style Dictionary outputs**, and to establish a **future‑ready architecture** that can support bidirectional sync without re‑architecture.

This spike is **exploratory**, **manual**, and **documentation‑first**.  
It is not intended to be production code.

---

## Purpose of This Spike

This V0 spike supports:

- Establish a **mock Figma token ecosystem**
- Build a **manual ingestion layer** using Figma Variables API output
- Demonstrate **awareness & impact detection**
- Validate **Style Dictionary integration**

The spike also produces:

- A **normalized token contract**
- A **manual diff + impact model**
- A **governance checkpoint**
- A **future‑proofed architecture** with explicit ports for reverse‑sync

---

## Scope of V0

### In Scope

- One‑directional flow: **Figma → Style Dictionary**
- Manual ingestion of Figma variable JSON
- Manual normalization into SD‑ready token contract
- Manual diffing and impact detection
- Manual governance application
- Manual SD output simulation (CSS + Figma‑shaped JSON)
- Documentation of assumptions, risks, and learnings
- Architecture that supports future bidirectional sync

### Out of Scope

- Automation
- GitHub Actions
- CI/CD
- Real token publishing
- Real Figma plugin development
- Bidirectional sync (future V1+)

---

## V0 Architecture (Future‑Ready)

```text
Figma (proposal environment)
        ↓
Raw Variables JSON (ingestion)
        ↓
Normalized Token Contract  ←— Future Port B (design proposal intake)
        ↓
Diff Layer
        ↓
Impact Detection
        ↓
Governance Layer
        ↓
Style Dictionary (canonical)
        ↓
Outputs:
  • CSS variables
  • Figma‑shaped JSON  ←— Future Port A (sync back to Figma)
