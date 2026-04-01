# V0 Spike Plan — Cedar Token Pipeline

Validate the feasibility of Cedar's end‑to‑end token pipeline:

`Figma → Normalization → Canonical Model → Transform Layer → Platform Outputs`

The spike is not intended to produce production‑ready assets.
Its purpose is to **learn**, **de‑risk**, and **prove the architecture**.

---

> **Note:** This document is the original spike plan. A "Spike Actuals" section at the bottom records what was actually built and how it differs from the plan. Read the plan for context and intent; read the Actuals for what to use as the basis for V1.

---

# V0 Scope

V0 uses **mock data and mock components** to validate the architecture without inheriting legacy Cedar complexity.

### V0 Includes
- A **mock options library** (~10 colors, structured like Cedar options)
- A **mock alias color library** (generated as we build components)
- A **mock component library** (1–2 components using alias tokens)
- A **mock consumer app** (validates dev handoff)
- A **mock Figma file** containing:
  - mock options variables
  - mock alias variables
  - mock components using alias tokens

### V0 Does *Not* Include
- Real Cedar tokens
- Real Cedar palette
- Real semantic taxonomy
- Real component tokens
- Naming grammar enforcement
- State metadata
- Overlay‑based states
- Multi‑mode support
- Publishing or versioning

V0 is **pipeline validation only**.

---

# V0 Figma Input Contract (Spike‑Only)

V0 uses a **minimal, mock Figma input contract** to validate ingestion and normalization without inheriting real Cedar complexity.

### V0 Figma Inputs
The mock Figma file must contain:

- **Mock option variables** — ~10 color primitives, single mode (light/default)
- **Mock alias variables** — map directly to mock options
- **Mock components** — 1–2 components using alias tokens only

### V0 Figma Exports
V0 originally planned to export a single `raw-figma-variables.json` containing mock options + mock alias tokens.

---

# V0 Normalization Contract (Spike‑Only)

V0 normalization validates transformation from raw Figma variables → canonical tokens.

For V0, normalization will:
- Convert Figma variable IDs → canonical token paths
- Apply DTCG structure (`$type`, `$value`)
- Preserve Figma metadata in `$extensions.cedar`
- Process only mock color primitives (options) and mock alias tokens
- Preserve Figma names as‑is (no semantic naming enforcement)

---

# Goals (Organized by ADR)

## ADR‑0001 — Validate the Canonical Model

**Questions:**
- Can we generate valid canonical JSON from mock Figma variables?
- Does the canonical structure hold up under real‑world complexity?
- Can we enforce schema validation in CI?

## ADR‑0002 — Validate Normalization Layer

**Questions:**
- Can we reliably map Figma variable names → alias tokens?
- Can we detect invalid or ambiguous names?
- Can we extract metadata (figmaId, collections)?

## ADR‑0003 — Validate Figma Input Contract

**Output:** Export mock options/alias JSON, validate naming conventions, validate semantic mapping.

## ADR‑0004 — Validate Options → Alias → Component Flow

**Questions:**
- Can we alias mock options tokens cleanly?
- Can we detect when designers use primitives instead of alias tokens?

## ADR‑0005 — Validate Transform Layer & Platform Outputs

**Questions:**
- Can Style Dictionary consume the canonical model?
- Can we generate CSS, iOS, and Android outputs?
- Can we preserve alias relationships until the transform step?

---

# Success Criteria

The spike is successful if:

- We can generate valid canonical JSON from mock Figma data
- We can transform canonical tokens into CSS, iOS, and Android outputs
- We can generate a `@cedar/types` package
- We can generate component prop interfaces
- We can validate alias tokens in Figma Dev Mode
- We can identify gaps in options, alias tokens, and state tokens
- We can produce a clear list of V1 requirements

---

# Deliverables

- `canonical/tokens.json` (V0)
- `schema.json` (canonical schema)
- `dist/themes/rei-dot-com/css/color.css`
- `dist/themes/rei-dot-com/ios/ColorTokens.swift`
- `dist/android/colors.xml`
- `@cedar/types` package
- Mock component library
- Mock consumer app
- Updated ADR‑0001 → ADR‑0005
- Spike summary document

---

---

# Spike Actuals

*What was actually built, and how it differs from the plan above.*

## Scope Changes

**Mock data → Real data.** The spike used real REI Figma exports, not mock data. This increased the complexity significantly but produced validated outputs against real design values.

**Single file → Eight files.** The planned single `raw-figma-variables.json` became eight specialized input files with a load-bearing naming convention:

| File | Role |
|---|---|
| `options.color.web-light.json` | Web light palette — canonical `$value` source |
| `options.color.web-dark.json` | Web dark palette |
| `options.color.ios-light.json` | iOS light palette |
| `options.color.ios-dark.json` | iOS dark palette |
| `alias.color.default.json` | Default palette semantic aliases |
| `alias.color.sale.json` | Sale palette semantic aliases |
| `spacing.alias.json` | Spacing alias tokens |
| `spacing.<bp>.json` ×17 | Per-breakpoint spacing values |

**New mandatory artifact: `src/schema/token-schema.json`.** The planned "preserve Figma names as-is" approach was replaced with an explicit mapping contract. Every Figma collection path must be declared in the schema's Figma input contract. Build fails on unmapped paths. This is the primary governance mechanism.

## Canonical Model Changes

The canonical path prefix changed from `options.color.*` (as planned) to `color.option.*` (DTCG-compliant, no platform names in path).

The canonical `$value` on alias tokens is now a DTCG alias reference (`{color.option.neutral.warm.grey.900}`), not a flat hex string. The planned single-mode (light only) model became a multi-appearance model with:

- `$extensions.cedar.appearances.dark` on option tokens for dark appearance values
- `$extensions.cedar.platformOverrides.ios` on option tokens where iOS differs from web
- `$extensions.cedar.ios/web` path references on alias tokens

`$extensions.cedar.resolved` is now implemented as an additive optimization on alias tokens. Alias `$value` remains the source-of-truth DTCG reference.

## Normalization Changes

The planned "preserve Figma names as-is" normalization became an explicit mapping step via the Figma input contract in `src/schema/token-schema.json`. Semantic renames (e.g. `base-neutrals.white-85` → `overlay.light`) are declared in the schema, not inferred in code.

## Transform Layer Changes

The planned standard SD formatters and `outputReferences` approach was replaced by custom actions (`ios-colorset`, `web-css`) that own the full resolution chain. This was required because:

- Value transforms don't run before actions when `files: []`
- SD resolves `{ref}` syntax in `$extensions` before custom code runs
- Built-in SD transform group names (`ios`, `css`) conflict with Cedar's groups

Custom transform groups use the `cedar/` namespace (`cedar/ios`, `cedar/web`).

## Deliverables — Actual Status

| Planned Deliverable | Status |
|---|---|
| `canonical/tokens.json` (V0) | ✓ Complete — real REI tokens, not mock |
| `src/schema/token-schema.json` | ✓ Complete — contract artifact not in original plan |
| `dist/themes/rei-dot-com/css/light.css` | ✓ Complete — validated with correct values |
| `dist/themes/rei-dot-com/css/dark.css` | ✓ Complete — validated with correct values |
| `dist/themes/rei-dot-com/ios/Colors.xcassets/` | ✓ Complete — validated with correct iOS P3 values |
| Fluid spacing (`clamp()`) | ✓ Complete |
| `schema.json` | ○ Not implemented — build-fail governance used instead |
| `dist/themes/rei-dot-com/ios/ColorTokens.swift` | ○ Not started — V1 |
| `dist/android/colors.xml` | ○ Not started — V1 |
| `@cedar/types` package | ○ Not started — V1 |
| Mock component library | ○ Not started — superseded by real Figma exports |
| Mock consumer app | ○ Not started |
| Diff engine / Storybook | ○ Partial — PR #4 started, not merged |

## Success Criteria — Status

| Criterion | Status |
|---|---|
| Generate valid canonical JSON from Figma data | ✓ Yes — with real REI data |
| Transform canonical tokens into CSS | ✓ Yes — light and dark |
| Transform canonical tokens into iOS output | ✓ Yes — Display P3 colorsets |
| Transform canonical tokens into Android output | ✗ Not done |
| Generate `@cedar/types` package | ✗ Not done |
| Generate component prop interfaces | ✗ Not done |
| Validate alias tokens in Figma Dev Mode | ✗ Not done |
| Identify gaps for V1 | ✓ Yes — see V1 migration items in README |

## New Learnings for V1

1. **The four-file Figma structure is load-bearing** — the appearance dimension is in the filename, not the file. This must be formally documented as a governed contract (done in ADR-0003).

2. **SD v5 has five specific constraints** that affect architecture decisions. These are documented in ADR-0005 (constraints section). Anyone building new transforms must read it first.

3. **The Figma input contract in `src/schema/token-schema.json` is more valuable than separate schema validation** — it surfaces designer renames as build errors immediately, with specific error messages, without requiring a separate validation tool.

4. **iOS and web use intentionally different palettes** — `warm-grey.900` is `#1c1c1c` on iOS light but `#2e2e2b` on web light. This is a design decision, modeled via `platformOverrides`.

5. **High-contrast mode has no implementation path** with the current four-file structure. An ADR amendment is required before scoping it.
