# ADR-0016: Cedar Semantic Color & Interaction State Architecture

## Status
Proposed — **Authoritative / Canonical for this topic.**

This document is the single source of truth for how Cedar authors, derives, and publishes semantic colors and their interaction states. It **consolidates and supersedes**:

- The *Cedar Semantic Color Architecture — Discovery & Validation* narrative (retired; its correct ideas are folded in here).
- **ADR-0004 Addendum: Color Semantic Intents, Variants & Interactive State** (folded in here; retained only as historical detail).
- The state model in **ADR-0006 State Layer System** (superseded here; ADR-0006 is retired as a standalone decision).

It **depends on** and does not restate:
- **ADR-0004** — the three-tier model (Options → Alias → Component) and naming grammar.
- **ADR-0011** — the OKLCH harmonic-interval math used to derive values.
- **ADR-0013** — what each platform consumer actually receives.

**Maturity warning:** several mechanisms described here are **designed but not yet built** (see [Part 7](#part-7--maturity-what-is-real-vs-what-is-designed)). This document defines the target; it does not claim the target exists today.

---

## How to read this document

| If you are… | Read | Skip |
|---|---|---|
| **Design or Product** | Part 1 (the idea + glossary), Part 2, Part 3, the plain-language intros of Part 4 | The math in Part 6, the schema JSON |
| **Design Systems** | Everything | Nothing |
| **Platform Engineering (web/iOS/Android)** | Part 1 glossary, Part 4, Part 5, Part 6 | — |

Every technical section opens with a plain-language paragraph before any JSON or math. The math lives in Part 6 so the rest of the document reads without it.

---

# Part 1 — For everyone

## The one idea

> **Author intent once. Derive behavior consistently. Publish native outputs automatically.**

Instead of a designer hand-picking hundreds of separate colors — one for every button, every hover, every disabled state, on every platform — Cedar captures the *meaning* of a color once and lets the pipeline calculate the rest. A hover is not a new color someone chose; it is a rule applied to the color that already exists.

## Why we are changing

Today's mobile and web color sets grew by hand. The flagship apps illustrate the cost: every component carries an explicit `…_hover`, `…_active`, `…_disabled` value, and **many of those values are identical to the resting color** — bloat with no design meaning. Each new component adds more. Design drifts, accessibility drifts, and every platform maintains its own copy.

## The four layers

Cedar separates four questions that used to be tangled into a single token name:

| Layer | Question it answers | Example |
|---|---|---|
| **1. Meaning** | *What is this color for?* | "a primary action" |
| **2. Variant** | *How should it be expressed?* | "prominent, and vivid" |
| **3. Interaction** | *How does it behave when touched?* | "darken slightly on hover" |
| **4. Platform output** | *What does each platform receive?* | a CSS variable / an iOS color / an Android `ColorStateList` |

Each layer is owned and changed independently. A brand refresh touches Layer 1 values without rewriting interaction rules. A new platform is added at Layer 4 without touching meaning.

## Canonical glossary (one vocabulary, used everywhere)

This table is the **single agreed vocabulary**. Earlier documents used competing words for the same concepts; those are retired in favor of this column. All Cedar color docs, Figma collections, and generated code use these terms.

| Term | Plain-language meaning | Allowed values |
|---|---|---|
| **Intent** | The job the color does | `surface` · `action` · `selection` · `navigation` · `feedback` · `overlay` · `text` · `border` · `icon` |
| **Family** | Which palette identity fulfills the intent | `brand` · `neutral` · `sale` · `success` · `warning` · `error` · `info` |
| **Depth** | How far the color sits from the page background (prominence) | `faint` · `base` · `bold` |
| **Canvas** | The zero point the depth scale measures *from* — near-white in light mode, near-black in dark mode. Not itself a depth variant. | (no token) |
| **Intensity** | How vivid/saturated the color is | `muted` · `base` · `accent` · `vibrant` |
| **Face** (modifier) | Which part of a component the color paints | *surface* (none) · `on` (foreground) · `edge` (border) · `inverse` · `over` |
| **Triad** | The three faces of one colored role: surface (fill), `on` (foreground), `edge` (border) | validated by ADR-0011 |
| **State** | A moment of interaction | `rest` · `hover` · `focus` · `active` · `selected` · `disabled` |
| **Resolution kind** | *How* a state's value is obtained | `identity` (same as rest) · `reference` (another token) · `function` (computed transform) |
| **State transform** | The rule that derives a state's value from `rest` | see [Part 4](#43-state-transforms-re-derived-from-first-principles) |

**Deliberately retired words** — one term per concept; do not reintroduce these:

| Retired term | Replaced by | Reason |
|---|---|---|
| `highlight`, `subtle` | `faint` (depth) | Light-mode-biased English; inverts in dark mode |
| `shade`, `strong` | `bold` (depth) | Implies "darker"; ambiguous between depth and intensity |
| `pressed` | `active` | Platform implementation detail, not a canonical state |
| `visited` | link/web-only note | Not universal; demoted from the canonical state set |
| `error` (as a state) | `feedback.error` (intent/family) | A content category, not an interaction moment |
| `stepDepth`, `override` (state) | `reference` | Leaked implementation detail; a reference can point at a depth-tier sibling or an unrelated token |
| `border` (as an intent) | `surface.edge.*` | No border in the catalog exists that is not framing a surface |

---

# Part 2 — Layer 1: Semantic meaning

**Plain language:** the name of a color describes *what it is for*, never *what it looks like*. `color.action.brand` says "the primary action, in our brand identity." It never says "dark green." If the brand green changes, the name still holds.

## Grammar

Defined in ADR-0004; the color-specific shape is:

```
color.<intent>[.<family>][.<variant>]
color.<intent>.on.<family>[.<variant>]      — foreground face
color.<intent>.edge.<family>[.<variant>]    — border face
color.<intent>.inverse[.<family>][.<variant>]
color.<intent>.over.<family>[.<variant>]
```

**A state never appears in the name.** A token name resolves to its `rest` value only; every other state is derived (Part 4).

## Intents

| Intent | Covers |
|---|---|
| `surface` | page canvas, recessed panels, table rows, surface-selection |
| `action` | button, link |
| `selection` | chip, switch, toggle, checkbox/radio |
| `navigation` | tabs, pagination |
| `feedback` | message/banner success, warning, error, info, sale |
| `overlay` | modal scrim, tooltip |
| `text` | body/label copy with no component role |
| `border` | generic dividers/keylines with no component role |
| `icon` | generic default/emphasis/disabled icon with no component role |

## Hierarchy is NOT a family

"Primary/secondary/tertiary" are **not** families. They describe a component's rank in a composition, not a palette. Welding "secondary" to "neutral" in a token name means a future "brand-colored secondary button" can't be expressed. Hierarchy is resolved at the **component tier** (ADR-0004 Tier 3) as a mapping from rank to alias path:

| Component slot | References |
|---|---|
| `button.primary` | `color.action.brand` |
| `button.secondary` | `color.action.neutral` |
| `button.tertiary` | `color.action.on.brand` (text-only) |
| `button.dark` | `color.action.inverse` |
| `button.sale` | `color.action.sale` |

The alias layer never knows a button is "the primary one." It only knows its intent and family.

---

# Part 3 — Layer 2: Variants (depth × intensity)

**Plain language:** a single 100–900 numeric scale forces two unrelated decisions — "how prominent" and "how vivid" — onto one axis. Cedar splits them so a designer can make one bolder *without* making it more saturated, or vice versa.

- **Depth** — how far from the page background: `faint · base · bold`. (Already implemented in `canonical/tokens.json`.)
- **Intensity** — how much chroma/color: `muted · base · accent · vibrant`.

Together they form a 2-D matrix, giving far more expressive range than a numeric ramp while staying predictable:

```
              muted    base    accent   vibrant
   faint
   base
   bold
```

**Why direction-free words matter:** the old words (`shade` = darker, `highlight` = lighter) silently assumed light mode. In dark mode the darkest tint is the one *closest* to the canvas, not the most emphatic. `depth`/`intensity` describe magnitude, not direction — the appearance mode decides the direction at build time (Part 6). One vocabulary serves light, dark, and future modes with no dark-specific words.

## Two rules that keep variants predictable

**Decision A — variants apply to the fill/surface face only.** Depth and intensity stack on the surface face. Modifier-bearing tokens (`on`, `edge`, `inverse`, `over`) carry a single authored rest value with **no** variants on top.

| Valid | Invalid |
|---|---|
| `color.feedback.error.faint` | `color.feedback.edge.error.bold` |
| `color.action.brand.bold` | `color.action.on.brand.faint` |
| `color.surface.neutral.faint` | `color.surface.edge.neutral.bold` |

**Decision B — canvas is the silent anchor, not a variant.** There is no `…​.canvas` token. The page background is a platform default *outside* the alias system. This guarantees `faint` is always genuinely closer to the canvas than `base`, and `bold` is always furthest — direction stays monotonic in both light and dark modes.

**Intensity maps to real primitive families:** `muted` → `greyscale` (C≈0) · *(base)* → `warm-grey` (C≈0.005–0.018) · `accent` → `natural-grey` or an adjacent chromatic stop (C≈0.010–0.035) · `vibrant` → near-`Cmax` for the hue.

> **Open decision D2:** intensity currently lists `base` for symmetry with depth. The prior addendum omitted it (`muted/accent/vibrant`). Design + design-systems to confirm whether a neutral intensity midpoint is authored or implied.

---

# Part 4 — Layer 3: Interaction & state

## 4.1 The model, in plain language

A resting color is stored once. When a user hovers, presses, focuses, selects, or when a control is disabled, Cedar **derives** that state's color by applying a named rule to the resting color. Designers stop hand-authoring state colors; they choose *how a thing should behave*, and the pipeline computes the pixels.

Every state resolves as exactly one of **three kinds** (detailed in [4.3](#43-state-transforms-re-derived-from-first-principles)):

- **`identity`** — the state looks the same as rest (e.g. a brand button's fill doesn't change on focus; a separate focus ring does the work).
- **`reference`** — the state *is* another already-named token (e.g. hover → the `faint` depth variant), so nothing is computed.
- **`function`** — the state value is derived by a small deterministic transform of the resting color (e.g. "shift lightness toward the canvas a little").

## 4.2 Who owns interaction — resolved

The retired discovery doc said **components** own interaction ("Button → nudge"). The retired addendum authored states on the **alias token**. These conflicted. **Resolution:**

- **V1:** interaction is authored at the **alias layer**, per token, in repo-owned metadata. This is simpler and produces identical precomputed output for native platforms.
- **Future (additive, non-breaking):** a component may override the alias-level interaction with its own profile. The metadata is shaped now so this is a later addition, not a migration.

**Rationale:** for V1 native output — flat precomputed values and Android `ColorStateList` — it makes no observable difference where the profile is declared, so we take the simpler path and keep the more expressive one open.

## 4.3 State transforms, re-derived from first principles

**Plain language:** most states are `identity` or `reference` and need no math at all. Only the remaining `function` states need a transform. **The function names are not yet ratified** — rather than inherit the prior sets (`nudge/push/desaturate/stepDepth` from the addendum, or `nudge/swap/quiet/shift/emphasize` from the discovery doc, which mixed atomic transforms with component profiles), we measured the *actual* lightness deltas in the legacy production tokens and offer two candidate sets that produce identical pipeline output.

**Option A — 3 primitives (minimal, composable):**

| Name | Kind | What it does | Covers |
|---|---|---|---|
| `shiftL(direction, magnitude)` | function | Move along the L axis, `towardCanvas` or `awayFromCanvas`, by `sm` or `lg` | All tonal transitions — small hover steps through large active steps |
| `dim` *(name pending D5)* | function | Reduce chroma to the muted tier and pull L to a neutral midtone | Every disabled state, all families |
| `reference` | reference | Resolve to another named token | Triad swaps (hover fill↔foreground), depth-tier steps (hover → `faint`) |

`shiftL` subsumes `identity` (magnitude 0) and every directional step; direction and magnitude are explicit parameters instead of separate names.

**Option B — 5 named verbs (explicit, easier to audit), with legacy-measured ΔL:**

| Name | Direction | Legacy ΔL | Covers |
|---|---|---|---|
| `contract.sm` | toward canvas | +0.01 to +0.06 | Neutral surface hover/focus; input bg hover |
| `contract.lg` | toward canvas | +0.10 to +0.24 | Switch handle when selected; larger bg transitions |
| `expand.sm` | away from canvas | −0.02 to −0.06 | Chip bg active; minor hover emphasis |
| `expand.lg` | away from canvas | −0.20 to −0.60 | Input/chip edge at focus/active; link active; tabs text active |
| `dim` *(name pending D5)* | chroma → floor | all C→0 | Every disabled state |
| `reference` | — | — | Triad swaps; depth-tier steps |
| `family.swap` | hue change | varies | States that change family entirely (tabs rest→active keyline) |

**Reserved, not in V1:** `nudge` (ΔL < 0.01). Zero instances measured in legacy data; reserved for the OKLCH-authored system where micro-interactions become calibratable. Do not author `nudge` against legacy tokens.

**The genuine question for the group (D3):** ship the parameterized set (Option A — better for OKLCH, where magnitude is computed from the chroma envelope) or the named-verb set (Option B — maps 1:1 to measured legacy patterns, easier for a design reviewer to audit)? Both compile to the same values.

**Focus is special, on purpose.** Focus does not tint the fill. It uses dedicated ring tokens (`color.focus.indicator`, `border.focus.width`, `border.focus.offset`) so focus is visible independently of hover and satisfies WCAG 2.4.7. Focus's fill entry is therefore usually `identity`.

**Disabled converges by rule, not by a flat token.** Applying `dim` to any family lands on a visually consistent muted neutral — which is exactly why the legacy SCSS shows every disabled control hitting nearly the same value regardless of family. We do not need a single hard-coded "universal disabled" token.

> **Open decision D5:** name for the disabled transform. `dim` is the working name but may collide with the `muted` intensity variant in people's heads. Candidates: `dim`, `neutralize`, `suppress`, `flatten`, `deactivate`. The group must ratify one.

### Per-component assignments (measured from the legacy set)

These describe what today's tokens *do* — used to validate the model, not to freeze target values (magnitudes will be recalibrated for the OKLCH palette). Full matrix in the audit spreadsheet's *State Functions* tab.

| Component face | hover | focus | active | selected | disabled |
|---|---|---|---|---|---|
| brand button surface | `reference → .faint` | `identity` | `expand.lg` | — | `dim` |
| brand button `on` | `reference → surface rest` | `identity` | `identity` | — | `dim` |
| brand button `edge` | `identity` | `expand.lg` | `identity` | — | `dim` |
| neutral button surface | `contract.sm` | `contract.sm` | `expand.sm` | — | `dim` |
| neutral button `edge` | `expand.sm` | `expand.lg` | `expand.sm` | — | `dim` |
| input surface | `contract.sm` | `contract.sm` | `contract.sm` | `expand.lg` | `dim` |
| input `edge` | `reference → on rest` | `reference → on rest` | `expand.lg` | `expand.lg` | `dim` |
| chip surface | `contract.sm` | `identity` | `expand.sm` | `expand.lg` | `dim` |
| tabs `edge` (keyline) | `family.swap` | — | `family.swap` | — | `dim` |
| surface neutral | `contract.sm` | — | `contract.sm` | — | — |

## 4.4 Authoring shape (engineering)

State declarations live in repo-owned metadata (same authority model as ADR-0011's relationships). Illustrative:

```json
"color.action.brand": {
  "$extensions": {
    "cedar": {
      "relationships": {
        "triadRole": "surface",
        "triadMembers": {
          "foreground": "color.action.on.brand",
          "border": "color.action.edge.brand"
        },
        "states": {
          "hover":    { "type": "reference", "ref": "color.action.brand.faint" },
          "focus":    { "type": "identity" },
          "active":   { "type": "function",  "fn": "[Option A: shiftL(awayFromCanvas, lg) | Option B: expand.lg]" },
          "disabled": { "type": "function",  "fn": "[D5 name]" }
        }
      }
    }
  }
}
```

- **Repo authors** the *declarations* (`$extensions.cedar.relationships.states`) — pointers into a `state-registry.json`.
- **Pipeline computes** the *values* (`$extensions.cedar.interactionStates`) at build time by running the declared function against the OKLCH envelope ADR-0011 defines. Never hand-authored.

The exact function names and the registry schema are **pending D3** and are not frozen by this document.

## 4.5 Canonical state vocabulary

`rest · hover · focus · active · selected · disabled`

- `pressed` is not canonical — it is the platform name for `active` (Part 5).
- `error` is not a state — it is a `feedback` family with its own states.
- `visited` is a **link-only, web-only** footnote, not a universal state.

---

# Part 5 — Layer 4: Platform materialization

**Plain language:** the derivation math happens **once, at build time**. No app runs OKLCH math at runtime. Each platform receives finished values in the shape it expects, so app teams never see Cedar's internals — satisfying the consumer goals of reduced cognitive load and platform-native feel (ADR-0013).

## Canonical → platform state mapping

| Canonical | Web (CSS) | iOS (UIKit/SwiftUI) | Android (View/Compose) |
|---|---|---|---|
| rest | default | `.normal` | enabled, default |
| hover | `:hover` | pointer hover (iPadOS/Catalyst) — dropped on phone | hover on stylus/mouse/Chromebook — dropped on phone |
| focus | `:focus-visible` | `.focused` | `state_focused` |
| active | `:active` | `.highlighted` | `state_pressed` |
| selected | `[aria-selected]`/`:checked` | `.selected` | `state_selected` |
| disabled | `:disabled` | `.disabled` | `state_enabled=false` |

**Hover is not universal.** It is declared once at the alias layer; each platform's transform decides whether to consume it. Touch-only targets drop it; pointer-capable targets keep it. This is a platform-transform decision, not an authoring one.

## Emission shape per platform

- **Web** — flat custom properties per resolved state: `--cdr-color-action-brand`, `--cdr-color-action-brand-hover`, `-active`, `-disabled`. Component CSS branches via selectors. Live `color-mix()` is a possible future web-only optimization, not assumed.
- **iOS** — named static constants per resolved state (`CdrColor.Action.brand`, `.brandHover`, …). Component code branches on `configuration.isPressed`/`isEnabled`.
- **Android** — `ColorStateList` XML (`<selector>` with `state_pressed`, `state_focused`, `state_selected`, `state_enabled="false"`), each populated with the precomputed value, so a single resource swaps automatically without app-code branching.
- **Figma** — a `State` mode collection: each row is one alias token path, columns are the states, and mode values are the precomputed primitive references. Do **not** create `.hover`/`.active`-suffixed variables; set mode values on the base variable.

**Figma round-trip (not yet implemented):** the pipeline must *push* computed state values back into Figma as library variables via the Figma REST API, in addition to reading rest values from Figma. This round-trip is an open dependency (see Part 7).

**Not a state:** iOS adaptive system colors (`UIColor.label`, etc.) are appearance/accessibility adaptations governed by ADR-0004's platform-override rules — they need a *new option token*, not a state declaration.

---

# Part 6 — The math (reference)

**Plain language:** this is the "how the numbers are calculated" appendix. Design and product do not need it. It defines how a depth tier, an appearance mode, and a state transform turn into an actual value.

## Scope: what is durable vs transitional

The state assignments and ΔL figures in this document were measured against Cedar's **current production hex palette** (pre-OKLCH). Be explicit with stakeholders about which parts survive the remap:

- **Durable** — the taxonomy (intents, families, variants, modifiers, grammar); the resolution model (`identity`/`reference`/`function`); the *kind* assigned to each component state ("brand button hover is a reference-swap" is a design pattern, not a value).
- **Transitional** — every hex value, every measured ΔL, and the specific magnitude per component row. These validate the model against today's system; they are **not** the target values.

## Depth resolution per appearance mode

One magnitude per depth tier, authored once; the appearance mode flips the sign:

```
resolvedL = canvasL + direction(appearance) × magnitude(depthTier)
direction = −1 when appearance is light  (canvas near-white; more emphasis = lower L)
direction = +1 when appearance is dark   (canvas near-black; more emphasis = higher L)
```

## State transforms operate on OKLCH

State functions consume the **same** per-hue chroma envelope ADR-0011 computes (`harmonicInterval.chromaEnvelope` — the `C(L) = Cmax × max(0, 1 − ((L − L0)/w)²)` parabola). They do **not** define new curve math. `shiftL` moves along L; `dim` moves along C toward the chroma floor at a neutral midtone.

## Authority split (extends ADR-0011)

| Authority | Owns | Schema path |
|---|---|---|
| Repo | Interaction-state declarations | `$extensions.cedar.relationships.states` |
| Repo (separate file) | Atomic function definitions + magnitudes | `state-registry.json` |
| Pipeline | Computed interaction values | `$extensions.cedar.interactionStates` |

Interaction state and appearance mode **compose, not substitute**: a state is layered on top of whichever mode (light/dark/high-contrast) is active.

## `state-registry.json` (to be created)

A design-systems-owned file, versioned independently from `metadata/tokens.json`, holding the function definitions that `relationships.states[n].fn` points at. All magnitudes below are **placeholders pending design calibration**:

```json
{
  "schemaVersion": "1.0.0",
  "functions": {
    "shiftL": {
      "axis": "L",
      "params": ["direction", "magnitude"],
      "direction": { "enum": ["towardCanvas", "awayFromCanvas"] },
      "magnitude": { "enum": ["sm", "lg"], "values": { "sm": "TBD", "lg": "TBD" } },
      "onViolation": "warning"
    },
    "dim": {
      "axis": "C",
      "target": "chromaFloor",
      "lightnessTarget": "neutralMidtone",
      "onViolation": "error"
    }
  }
}
```

---

# Part 7 — Maturity: what is real vs what is designed

**Stated plainly so no one over-trusts this document.**

| Capability | Status in the spike |
|---|---|
| Semantic grammar (intent.family.variant) | **Built** — in `canonical/tokens.json` |
| Depth variants (`faint/base/bold`) | **Built** |
| Intensity variants (`muted/base/accent/vibrant`) | Partial / not fully populated |
| `relationships.states` on tokens | **Not built** — no token carries state declarations yet |
| `interactionStates` (computed) | **Not built** |
| `state-registry.json` | **Does not exist** |
| `harmony-registry.json` | **Does not exist** |
| Derived state values for any platform | **Not built** |
| Figma state round-trip (push computed values via REST API) | **Not implemented** |
| OKLCH primitive → semantic remap | First-pass audit complete; **not ratified** |

**The load-bearing risk:** the entire "derive instead of duplicate" promise — the reduction from **232+ hand-authored color tokens down to ~82** — depends on the OKLCH transform magnitudes (`shiftL` steps, `dim` targets). **Every magnitude is a placeholder pending design's calibration across all 24 palettes.** Until that calibration exists and is validated, this architecture is a validated *direction*, not a shippable implementation.

---

# Open decisions (require design + product + native-eng sign-off)

- **D1 — Interaction ownership:** author at alias layer for V1, component override added later (non-breaking). *Recommended: accept.*
- **D2 — Intensity axis:** `muted/accent/vibrant`, or add an explicit `base` midpoint for symmetry with depth?
- **D3 — State-transform set:** Option A (3 primitives: `shiftL`, `dim`, `reference`) or Option B (5 named: `contract.sm/lg`, `expand.sm/lg`, `dim`, plus `reference`/`family.swap`)? Final names. Both compile identically.
- **D4 — Vocabulary confirmation:** `pressed`→`active` platform mapping; `error` is a family not a state; `visited` is link/web-only. *Recommended: accept.*
- **D5 — Disabled-transform name:** `dim`, `neutralize`, `suppress`, `flatten`, or `deactivate` (avoid clashing with the `muted` intensity variant)?
- **D6 — Native contract:** confirm iOS named-constants + Android `ColorStateList` are acceptable, or whether a Swift state-resolution helper is warranted.

---

# Superseded / retired documents

| Document | Disposition |
|---|---|
| *Cedar Semantic Color Architecture — Discovery & Validation* | **Retired.** Correct ideas folded into this ADR. |
| ADR-0004 Addendum: Color Semantic Intents, Variants & Interactive State | **Folded in / superseded.** Kept only as historical detail. |
| ADR-0006: State Layer System | **Superseded.** Its state model is replaced by Part 4 here. |

---

# Related documents

- **ADR-0004** — Semantic Token Architecture (three-tier model, grammar)
- **ADR-0007** — Modes and Palettes (appearance mode composition)
- **ADR-0009** — Accessibility Requirements (focus, contrast)
- **ADR-0011** — Harmonic Interval Validation (the OKLCH math this depends on)
- **ADR-0013** — Consumer Models (what each platform receives)
- `state-registry.json` *(to be created)* — interaction-state function definitions
- `harmony-registry.json` *(to be created)* — interval rule and mode envelope definitions
