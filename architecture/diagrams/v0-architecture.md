# V0 Architecture — Cedar Token Pipeline Spike (Actual)

This document describes the **V0 architecture as built and validated** during the Cedar token pipeline spike.
It has been updated from the original plan to reflect what was actually implemented.

---

## What Changed from the Original Plan

The original V0 plan described:
- Mock data and mock components
- A Diff Layer producing `diff.json`
- An Impact Detection layer producing `impact.json`
- Manual governance via `governance.md`
- Single-mode (light only)

**What the spike actually produced:**
- Real REI Figma exports (not mock data)
- No Diff Layer (started in PR #4, not merged)
- No Impact Detection
- Automated governance via schema-backed Figma input contract build-fail
- Multi-appearance (light and dark) via four platform files

---

## Architectural Goals — Status

| Goal | Status |
|---|---|
| Design originates token changes | ✓ Figma Variables API → normalization pipeline |
| One-directional pipeline validated | ✓ Figma → Canonical → SD → Platform outputs |
| Normalized token contract established | ✓ `canonical/tokens.json` with DTCG structure |
| Produce SD-ready platform outputs | ✓ CSS (light + dark) and iOS colorsets |
| Reverse-sync path documented | ○ Deferred to V1 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    FIGMA                            │
│  Variables API → eight JSON files in tokens/        │
└──────────────────────┬──────────────────────────────┘
                       │ (GitHub Action)
                       ▼
┌─────────────────────────────────────────────────────┐
│              NORMALIZATION LAYER                    │
│                                                     │
│  token-schema.json ──→ normalize.ts                 │
│  (governance contract)   (TypeScript)               │
│         │                    │                      │
│         │    ┌───────────────┘                      │
│         ▼    ▼                                      │
│      canonical/tokens.json                          │
│      (single source of truth)                       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              STYLE DICTIONARY                       │
│                                                     │
│  cedar/ios platform          cedar/web platform     │
│  ├── name/ios-camel          ├── name/camel          │
│  └── ios-colorset action     └── web-css action     │
│        │                           │                │
│        ▼                           ▼                │
│  Colors.xcassets/           light.css + dark.css    │
└─────────────────────────────────────────────────────┘
```

---

## Layer-by-Layer Breakdown

### 1. Figma (Proposal Environment)

Designers originate token changes in Figma. The pipeline consumes Figma Variables via the REST API.

Figma is the **originating environment**, not the canonical source of truth.

**Output:** Eight or more JSON files in `tokens/` (populated by GitHub Action)

---

### 2. Normalization Layer

`normalize.ts` transforms all Figma input files into `canonical/tokens.json`.

**Governance mechanism:** the Figma input contract in `src/schema/token-schema.json` is the explicit, version-controlled mapping from Figma collection paths to canonical `color.option.*` paths. The build fails immediately if any Figma token path is not in the mapping. This is the primary governance mechanism — not a separate validation step.

**Inputs:**
- `tokens/*.json` — Figma exports
- `src/schema/token-schema.json` — governance contract

**Output:** `canonical/tokens.json`

**What normalization does NOT do:**
- Infer canonical paths from Figma names (all mappings are explicit)
- Apply naming grammar enforcement (V1)
- Validate alias cycles (V1)
- Publish or version

---

### 3. Governance Layer

**Original plan:** Manual canonical shape validation.

**Actual implementation:** schema mapping build-fail. Any unmapped Figma path fails the build with a specific error naming the path. This is automatic, not manual.

Manual governance notes are still maintained in `../notes/governance.md` for cases where judgment is required (e.g. deciding whether a value difference warrants a `platformOverride` vs a new option token).

---

### 4. Style Dictionary (Transform Layer)

Consumes `canonical/tokens.json` and produces platform outputs via custom actions.

**Two platforms validated:**

**`cedar/ios`** — produces `Colors.xcassets/`
- Name transform: `name/ios-camel` (drops structural path segments, produces camelCase)
- Action: `ios-colorset` — resolves option token references, applies iOS platform overrides, converts to Display P3, writes `.colorset` files

**`cedar/web`** — produces `light.css` and `dark.css`
- Action: `web-css` — resolves option token references, reads web light `$value` and dark `appearances.dark`, writes CSS custom properties

**Key SD v5 constraints discovered:**
- Value transforms don't run before actions when `files: []` — all resolution happens in actions
- SD resolves `{ref}` syntax in `$extensions` — path strings must be stored without braces
- Built-in SD transform groups (`ios`, `css`) must not be used — namespace as `cedar/ios`, `cedar/web`

See ADR-0005 Addendum for full constraint documentation.

---

### 5. Output Layer

**Validated outputs:**

| Output | Description |
|---|---|
| `dist/css/light.css` | CSS custom properties, web-light values |
| `dist/css/dark.css` | CSS custom properties, web-dark values |
| `dist/ios/Colors.xcassets/` | Xcode color asset catalog, iOS Display P3 light/dark |

**Not yet implemented (V1):**

| Output | Description |
|---|---|
| `dist/ios/ColorTokens.swift` | Swift constants |
| `dist/android/colors.xml` | Android color resources |
| `@rei/tokens` NPM package | Distribution |

---

## Deferred Capabilities (V1)

- Diff layer and impact detection (PR #4 started, not merged)
- Reverse-sync payload generation for Figma
- External proposal intake into normalized contract

---

## V1 Work Remaining

Derived from spike findings:

- `color.modes` → `color.palettes` path rename
- TypeScript canonical token types
- Diff engine and Storybook token browser (PR #4 work)
- Naming grammar enforcement in normalization
- Alias cycle detection
- High-contrast mode implementation path
- Android output
- Swift constants output
- `@rei/tokens` NPM publishing
- `$extensions.cedar` staleness CI check
- CODEOWNERS on `src/schema/token-schema.json`

---

## Related Files

- `../README.md` — Architecture index
- `../notes/governance.md` — Governance validation
- `../notes/risks.md` — Risk matrix
- `../../README.md` — Project overview
