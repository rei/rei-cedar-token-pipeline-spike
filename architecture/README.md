# Architecture Index

This directory contains the canonical documentation for Cedar's token pipeline modernization.
It serves as the single entry point for diagrams, ADRs, and technical notes that define how design tokens move from **Figma → Normalization → Canonical Model → Transform Layer → Platform Outputs**.

---

## Document Index

### High‑Level Architecture

| Document | Description |
|---|---|
| **[V0 Architecture Diagram](./diagrams/v0-architecture.md)** | High‑level visualization of the token pipeline from Figma → Canonical → SD → Platform outputs. |
| **[V0 Data Architecture Diagram](./diagrams/v0-data-architecture.md)** | Data‑flow diagram showing how raw Figma inputs become canonical tokens. |

---

## Architecture Decision Records (ADRs)

| ADR | Title | Status | Description |
|---|---|---|---|
| **[ADR‑0001](./ADR/adr-0001-token-canonical-model.md)** | Canonical Token Model | Draft | Defines the governed, platform‑agnostic token shape. Includes the `$extensions.cedar` model for option token platform data, alias token platform references, and the SD pipeline constraint on `{ref}` resolution. |
| **[ADR‑0002](./ADR/adr-0002-token-normalization-layer.md)** | Normalization Layer | Draft | Defines how raw Figma files are transformed into the canonical model. Documents the four-file platform convention, `token-mapping.json`, and the governed invariants. |
| **[ADR‑0003](./ADR/adr-0003-figma-input-contract.md)** | Figma Input Contract | Draft | Documents the structure of raw Figma inputs and the `token-mapping.json` governance contract. Includes the four-file platform input contract and process for adding new platforms or appearances. |
| **[ADR‑0004](./ADR/adr-0004-semantic-token-architecture.md)** | Semantic Token Architecture | Draft | Defines the three-tier token architecture (Options → Alias → Component). Updated with spike findings: `color.option.*` path convention, platform override governance rules. |
| **[ADR‑0005](./ADR/adr-0005-transfrom-layer-and-platform-outputs.md)** | Transform Layer & Platform Outputs | Draft | Defines how canonical tokens are transformed into CSS, iOS, Android, and other outputs. |
| **[ADR‑0005 Addendum](./ADR/adr-0005-addendum-sd-v5-constraints.md)** | SD v5 Pipeline Constraints | Draft | Documents five Style Dictionary v5 constraints discovered in the spike: `$extensions` resolution, `files:[]` + value transform interaction, transform group naming, `dictionary.tokens` access, and the action-owns-resolution pattern. |
| **[ADR‑0006](./ADR/adr-0006-state-layer-system.md)** | State Layer System | Proposed | Defines interactive state tokens (hover, pressed, focus, disabled, selected, error) and the hybrid explicit/computed overlay approach. |
| **[ADR‑0007](./ADR/adr-0007-mode-and-theme.md)** | Modes and Palettes | Proposed | Defines mode architecture (light/dark/high-contrast) and palette architecture. Updated with spike findings on how appearances actually work in the pipeline (option token `appearances.dark` vs Figma mode axis). |
| **[ADR‑0008](./ADR/adr-0008-responsive-adaptive-tokens.md)** | Responsive and Adaptive Tokens | Proposed | Defines breakpoint tokens, fluid spacing, fluid typography, container query tokens, and density tokens. |
| **[ADR‑0009](./ADR/adr-0009-accessibility-requirements.md)** | Accessibility Requirements | Proposed | Embeds WCAG 2.2 Level AA requirements into the token system: focus indicators, touch targets, color contrast, high contrast mode, motion preferences. |

---

## Key Artifacts

| Artifact | Location | Description |
|---|---|---|
| `canonical.json` | `tokens/canonical.json` | The single source of truth. Produced by `normalize.ts`, consumed by Style Dictionary. |
| `token-mapping.json` | `tokens/token-mapping.json` | Governed Figma→canonical path mapping. Required for build. Requires design + engineering review to change. |
| `dist/css/light.css` | `dist/css/light.css` | Web light appearance CSS custom properties. |
| `dist/css/dark.css` | `dist/css/dark.css` | Web dark appearance CSS custom properties. |
| `dist/ios/Colors.xcassets` | `dist/ios/` | Xcode color asset catalog with Display P3 light/dark pairs. |

---

## Developer Reference

| Document | Description |
|---|---|
| **[Pipeline Dictionary](./pipeline-dictionary.md)** | Plain-language reference for every function in the normalization and SD pipeline. |
| **[canonical-breaking-changes.md](./canonical-breaking-changes.md)** | Documents every structural change to `canonical.json` from the spike — required reading for anyone whose code reads from `canonical.json`. |

---

## Spike Notes

| Document | Description |
|---|---|
| **[V0 Spike Plan](./spike/V0-spike-plan.md)** | Original scope and goals. Note: scope expanded from mock data to real REI Figma exports. |
| **[Governance Notes](./notes/governance.md)** | V0 governance validation. Updated with actual spike governance mechanism (`token-mapping.json`). |
| **[Risk Matrix](./notes/risks.md)** | Risk tracking. Updated with spike outcomes and three new risks discovered. |

---

## How to Navigate This Documentation

1. Start with the **V0 Architecture Diagram** for the overall pipeline.
2. Read **ADR‑0001** to understand the canonical token shape and the `$extensions.cedar` model.
3. Read **ADR‑0002** to understand normalization, the four-file convention, and `token-mapping.json`.
4. Read **ADR‑0003** for the Figma input contract and governance process.
5. Read the **ADR‑0005 Addendum** before writing any Style Dictionary transforms or actions.
6. Use the **Pipeline Dictionary** as a function-level reference while reading code.

---

## Spike Completion Status

| Deliverable | Status |
|---|---|
| `canonical.json` (color tokens) | ✓ Complete |
| `token-mapping.json` | ✓ Complete |
| `dist/css/light.css` | ✓ Complete — validated with correct web light hex values |
| `dist/css/dark.css` | ✓ Complete — validated with correct web dark hex values |
| `dist/ios/Colors.xcassets` | ✓ Complete — validated with correct iOS Display P3 values |
| Fluid spacing (`clamp()`) | ✓ Complete |
| `dist/ios/ColorTokens.swift` | ○ Not started — V1 |
| `dist/android/colors.xml` | ○ Not started — V1 |
| `@cedar/types` package | ○ Not started — V1 |
| Diff engine | ○ Partial — PR #4 started, not merged |
| Storybook token browser | ○ Partial — PR #4 started, not merged |

---

## Known V1 Migration Items

- `color.modes` → `color.palettes` path rename (ADR-0001 specifies `color.palettes`; spike uses `color.modes`)
- TypeScript canonical token types (`CanonicalColorToken`, `OptionToken`, `AliasToken`)
- High-contrast mode implementation path (requires ADR-0007 amendment)
- Naming grammar enforcement in normalization
- Alias cycle detection
- `$extensions.cedar` staleness CI check
