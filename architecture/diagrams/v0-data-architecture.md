# Data Architecture — Cedar Token Pipeline (V0 Spike — Actual)

This document defines the **actual data‑layer architecture produced by the V0 spike**.
It has been updated from the original plan to reflect what was built and validated.

---

## Overview

The V0 spike produced a working pipeline with the following principles:

- **Eight input files → one canonical/tokens.json → platform outputs**
- **`src/schema/token-schema.json` is the governance contract between Figma and the canonical model**
- **The canonical model is the single source of truth**
- **Platform outputs are produced by custom SD actions, not standard formatters**

---

## Data Flow

```
Figma Variables API (GitHub Action)
         │
         ▼
tokens/ directory (8+ JSON files)
  ├── options.color.web-light.json   ─┐
  ├── options.color.web-dark.json    ─┤ Four platform files
  ├── options.color.ios-light.json   ─┤ (appearance × platform)
  ├── options.color.ios-dark.json    ─┘
  ├── alias.color.default.json       ─┐ Semantic alias files
  ├── alias.color.sale.json          ─┘ (one per palette)
  ├── spacing.alias.json
  └── spacing.<bp>.json (×17 breakpoint files)
         │
         ▼
token-schema.json ───────────────────────┐
(Figma path → canonical path contract)   │
                                         ▼
normalize.ts (Normalization Layer)
  1. Load src/schema/token-schema.json
  2. Process platform files → color.option.* + platformLookup table
  3. Process alias files → color.modes.* with $extensions.cedar
  4. Write appearance + platformOverrides onto option tokens
  5. Write alias token platform references ($extensions.cedar.ios/web)
         │
         ▼
canonical/tokens.json (Single Source of Truth)
  ├── color.option.*    — option tokens with platform data
  ├── color.modes.*     — alias tokens with platform references
  └── spacing.*         — fluid clamp() spacing tokens
         │
         ▼
Style Dictionary (cedar/ios + cedar/web platforms)
  ├── ios-colorset action:
  │     reads $extensions.cedar.ios.{light,dark}
  │     → resolves option token via dictionary.tokens
  │     → applies platformOverrides + appearances
  │     → writes Display P3 .colorset files
  │
  └── web-css action:
        reads $extensions.cedar.web.{light,dark}
        → resolves option token via dictionary.tokens
        → reads $value (light) and appearances.dark (dark)
        → writes CSS custom properties
         │
         ▼
dist/
  ├── css/
  │     ├── light.css   — :root { --cdr-* } web-light values
  │     └── dark.css    — :root { --cdr-* } web-dark values
  └── ios/
        └── Colors.xcassets/
              └── <tokenName>.colorset/Contents.json (×N)
```

---

## Layer Definitions

### 1. Raw Figma Files (Figma / GitHub Action Environment)

Eight or more JSON files exported from the Figma Variables API by the GitHub Action and placed in `tokens/`.

**File naming convention (load-bearing):**

| File pattern | Contents |
|---|---|
| `options.color.<platform>-<appearance>.json` | Option color primitives per platform×appearance |
| `alias.color.<palette>.json` | Semantic alias tokens per palette |
| `spacing.<breakpoint>.json` | Spacing values at a specific viewport breakpoint |
| `spacing.alias.json` | Spacing alias tokens |

The appearance dimension (light/dark) is encoded in the filename because Figma's mode system is one-dimensional and cannot export both appearances in one file.

**Note:** The normalization script reads from the filesystem. The GitHub Action populates `tokens/` as a separate upstream step.

---

### 2. `src/schema/token-schema.json` (Governance Contract)

The explicit, version-controlled mapping from every Figma collection path to its canonical `color.option.*` path.

- Required for build — missing file fails immediately
- Any unmapped Figma token path fails the build with a specific error
- Requires design + engineering review to change (CODEOWNERS)

**This is the primary governance mechanism**, not a separate validation step.

---

### 3. Normalization Layer (GitHub Environment)

`normalize.ts` transforms all input files into a single `canonical/tokens.json`.

Key steps:
- Applies schema mapping to translate Figma paths to canonical paths
- Builds `color.option.*` tree from `web-light` as the canonical `$value` source
- Builds `platformLookup` table from all four platform files
- Writes `$extensions.cedar.appearances.dark` on option tokens where web-dark differs from web-light
- Writes `$extensions.cedar.platformOverrides.ios` on option tokens where iOS differs from web
- Writes `$extensions.cedar.ios/web` path references on alias tokens

**Artifact:** `canonical/tokens.json` — there is no separate validation step. The build fails on invalid input during normalization.

---

### 4. Canonical Token Model (GitHub Environment)

The single source of truth for all downstream transforms.

Structure:
```
color.option.*   — option tokens (concrete $value, platform data in $extensions.cedar)
color.modes.*    — alias tokens (DTCG alias $value, platform refs in $extensions.cedar)
spacing.*        — spacing tokens (fluid clamp() values)
```

`color.primitives` does NOT exist in the canonical output. The four platform files are normalization input only.

---

### 5. Style Dictionary Transform Layer (Build Environment)

Consumes `canonical/tokens.json` and produces platform outputs via custom actions.

**Platform: `cedar/ios`**
- Action: `ios-colorset`
- Reads `$extensions.cedar.ios.{light,dark}` path references from alias tokens
- Navigates `dictionary.tokens` to find option tokens
- Applies `platformOverrides` and `appearances` to resolve final hex
- Converts to Display P3 components
- Writes `.colorset` asset catalog

**Platform: `cedar/web`**
- Action: `web-css`
- Reads `$extensions.cedar.web.{light,dark}` path references from alias tokens
- Navigates `dictionary.tokens` to find option tokens
- Reads `$value` for light, `$extensions.cedar.appearances.dark` for dark
- Writes CSS custom properties

**SD v5 constraint:** Value transforms do not run before actions when `files: []`. All value resolution is performed inside actions, not value transforms.

---

### 6. Platform Outputs

**Validated in spike:**
- `dist/css/light.css` — CSS custom properties, web-light values
- `dist/css/dark.css` — CSS custom properties, web-dark values
- `dist/ios/Colors.xcassets/` — Xcode color asset catalog, iOS Display P3 values

**Not yet implemented (V1):**
- `dist/ios/ColorTokens.swift` — Swift constants file
- `dist/android/colors.xml` — Android color resources
- `@rei/tokens` NPM package

---

## Environment Boundaries

| Environment | Responsibility |
|---|---|
| **Figma** | Design origination — variables, collections, modes |
| **GitHub Action** | Exports Figma variables to `tokens/` JSON files |
| **GitHub / CI** | Normalization, canonical/tokens.json production, build-fail governance |
| **Style Dictionary** | Platform-specific output generation |
| **NPM** | Distribution (V1) |

---

## Relationship to ADRs

- **ADR‑0001** defines the Canonical Token Model and `$extensions.cedar` shape
- **ADR‑0002** defines the Normalization Layer and four-file convention
- **ADR‑0003** defines the Figma Input Contract and schema-backed mapping contract
- **ADR‑0005** defines the Transform Layer and platform outputs
- **ADR‑0005 Addendum** documents SD v5 constraints discovered in the spike
