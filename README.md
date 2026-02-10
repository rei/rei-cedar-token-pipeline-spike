# Cedar Token Pipeline — V0 Spike

This repository contains the **V0 spike** for Cedar’s proposed design token pipeline exploration.  
The goal of this spike is to **manually validate** a one‑directional workflow from **Figma Variables → ingestion → normalization → diffing → governance → Style Dictionary outputs**, and to establish a **future‑ready architecture** that can support bidirectional sync without re‑architecture.

This spike is **exploratory**, **manual**, and **documentation‑first**.  
It is not intended to be production code.

---

## Purpose of This Spike

This V0 spike supports:

- Establish a **mock Figma token ecosystem**
- Build an **automated ingestion layer** using Figma Variables API
- Validate **Design Token (W3C) formatting**
- Establish **automated workflows** via GitHub Actions

---

## Scope of V0

### In Scope

- One‑directional flow: **Figma → Style Dictionary**
- Automation via **GitHub Actions**
- Ingestion of Figma variables using REST API
- Normalization into W3C design token contract
- Validation and error handling
- Documentation of assumptions, risks, and learnings
- Architecture that supports future bidirectional sync

### Out of Scope

- Real token publishing
- Real Figma plugin development
- Full bidirectional sync (placeholder implemented)

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
