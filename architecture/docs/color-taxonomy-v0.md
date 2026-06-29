# Cedar Color Taxonomy V0

**SCOPE — READ BEFORE USING**

This document works from Cedar's current PRODUCTION hex values, which predate the OKLCH primitive system. It is a diagnostic baseline, not a final color spec.

**DURABLE** (carries forward into the OKLCH remap): the taxonomy below — intents, families, variants, modifiers — and the state-resolution model (identity / reference / swap / function, rather than hand-authored values per state).

**TRANSITIONAL** (will be replaced): every hex value and measured ΔL in the Color Token Remap and Function Usage tabs. Those reflect what the legacy system happens to do today, used to confirm the taxonomy and state model can fully describe the existing component set before OKLCH primitives are mapped onto it.

---

## Cedar Design Token Taxonomy

Color Semantic Alias Layer — Intent · Family · Variant · Modifier · State

---

## 01 — GRAMMAR

All color semantic alias tokens follow this structure:

```
color.<intent>[.<family>][.<variant>]
color.<intent>.<modifier>.<family>[.<variant>]
```

Segments are lowercase, dot-delimited. No hyphens, underscores, component names, platform names, or literal values in the path.

### Grammar examples

| Token | Description |
|-------|-------------|
| `color.surface.neutral` | Page canvas — surface intent, neutral family, base depth (implicit) |
| `color.surface.neutral.faint` | Recessed panel — surface intent, neutral family, faint depth |
| `color.surface.edge.neutral` | Generic divider / table rule — the border face of the neutral surface |
| `color.action.brand` | Primary button fill — action intent, brand family, base depth |
| `color.action.brand.faint` | Primary button hover fill — same intent+family, faint depth tier |
| `color.action.on.brand` | Primary button text/icon — foreground face of action·brand |
| `color.action.edge.brand` | Primary button border — border face of action·brand |
| `color.feedback.error.faint` | Error message background light — feedback intent, error family, faint depth |
| `color.feedback.edge.error` | Error border/icon — border face of feedback·error |
| `color.text.neutral.muted` | Secondary/placeholder text — text intent, neutral family, muted intensity |

---

## 02 — INTENTS — What UX function does this color serve?

| Intent | Description |
|--------|-------------|
| **surface** | Page canvas and recessed panels, plus the border/edge of any surface (table rules, dividers — see note below). Depth-resolved: surface.neutral = page white; surface.neutral.faint = recessed panel. |
| **action** | Buttons, links, and any element that initiates a task or navigation. Hierarchy rank (primary/secondary) is resolved at the component tier, not here. |
| **selection** | Controls that offer a choice or capture input: chip, switch, toggle, checkbox, radio, text input. |
| **navigation** | Tabs, pagination, breadcrumb, and other wayfinding elements. |
| **feedback** | Messages and banners that react to user action or system state: success, warning, error, info, sale, neutral. |
| **overlay** | Surfaces that float above the page: modal scrim, tooltip. Semi-transparent values live here. |
| **text** | Generic body and label copy with no specific component role. When copy is inside an intent role (e.g. button text), use color.action.on.* instead. |
| **icon** | Generic icons outside a component role. Role-specific icons use the component intent (e.g. color.action.on.*). |

**RETIRED:** a standalone `border` intent. Every border in the catalog is the edge of some surface — a table rule, a card divider, a page-level keyline. There is no border that exists independent of a surface to frame, so border is not a separate concept: it is color.surface.edge.* — the edge modifier applied to the surface intent. This also resolves the apparent overlap between `edge` (a modifier) and `border` (a former intent): they were never two competing vocabularies, `border` was an incomplete application of `edge`.

---

## 03 — FAMILIES — Which palette grouping?

Families describe an objective property of the palette (hue/chroma identity), not a hierarchy rank. 'Primary' and 'secondary' are not families — they describe component-level hierarchy and live at Tier 3 (component tokens).

| Family | Description |
|--------|-------------|
| **brand** | The spruce green system. Used across action, surface, and navigation intents. |
| **neutral** | The warm-grey scale. Used across all intents as the default/unbranded palette. |
| **sale** | Promotional emphasis. Distinct from feedback families — it is marketing intent, not status. |
| **success** | Feedback intent only. |
| **warning** | Feedback intent only. |
| **error** | Feedback intent only. Also used on selection.edge.error for input validation. |
| **info / link** | Feedback intent (info messages) and action intent (links, pagination). |

---

## 04 — VARIANTS — Two-axis system replacing lightness-named vocabulary

The previous vocabulary (subtle · muted · highlight · accent · strong · vibrant · shade) encoded rendered appearance — specifically light-mode lightness direction. 'Shade' means darker in English, but in dark mode the darkest tone sits closest to the canvas, not furthest from it. Names that encode lightness direction are mode-biased by definition.

The fix: split into two independent, direction-free axes. Neither axis uses a word that implies a lightness direction.

### DEPTH AXIS — Perceptual distance from the canvas anchor (faint · base · bold)

| Tier | Description |
|------|-------------|
| **faint** | Low emphasis. Sits close to the canvas. In light mode: lighter than base. In dark mode: darker than base. Same logic, opposite L direction. |
| **base** | Default. The rest-state value of the token. Most authored alias tokens resolve here implicitly. |
| **bold** | High emphasis. Sits far from the canvas. In light mode: darker than base. In dark mode: lighter than base. |

**Resolution rule:** `resolvedL = canvasL + direction(mode) × magnitude(depth-tier)`

- `direction = -1` in light mode (canvas near-white; more emphasis = lower L)
- `direction = +1` in dark mode (canvas near-black; more emphasis = higher L)
- One magnitude per tier, authored once. The appearance mode flips the sign.

### INTENSITY AXIS — Chroma / saturation (muted · accent · vibrant)

| Tier | Description |
|------|-------------|
| **muted** | Low saturation. Used for disabled states, subdued text, placeholder copy. |
| **(base)** | Default saturation. Applied implicitly; omitted from the token name unless distinguishing from muted or vibrant. |
| **accent** | Mid-high saturation. Interactive emphasis — focused or selected states. |
| **vibrant** | High saturation. Reserved for elevated, expressive, or promotional contexts. |

Chroma does not flip by appearance mode the way lightness does — a saturated colour is equally saturated in both modes. The intensity axis is stable across modes without any sign-flip rule.

### Old vocabulary mapping

| Old | New | Reason |
|-----|-----|--------|
| subtle | → faint (depth) | Implies a rendered appearance; mode-biased |
| highlight | → faint (depth) | Implies light fill; breaks in dark mode |
| shade | → bold (depth) | Explicitly implies darker; inverts meaning in dark mode |
| strong | → bold (depth) | Ambiguous: could mean depth OR intensity |
| muted | → muted (intensity) | Kept — describes saturation, not lightness direction |
| vibrant | → vibrant (intensity) | Kept — describes saturation, not lightness direction |
| accent | → accent (intensity) | Kept — describes saturation emphasis |

---

## 05 — MODIFIERS — Triad face and role relationship

Modifiers give every role exactly three addressable faces. These map 1:1 onto ADR-0011's triadRole model, so relationship.triadMembers can point directly at token paths without inference. `edge` covers every border in the system — including what used to be the standalone `border` intent (see §02).

| Modifier | Role | Example | Description |
|----------|------|---------|-------------|
| (none) | surface | `color.action.brand` | The surface face. Default when no modifier is present. |
| on | foreground | `color.action.on.brand` | Foreground content sitting on top of the fill. |
| edge | border | `color.surface.edge.neutral` | The border framing any surface — role-specific (action.edge.*) or generic (surface.edge.*). |
| inverse | — | `color.action.inverse` | Flipped fill/foreground roles. Used for dark-surface contexts. |
| over | — | `color.overlay.neutral` | Semi-transparent surfaces floating above the canvas. |

---

## 06 — STATE — Authored intent, pipeline-computed value

Interaction state never appears in the token path. A token name always resolves to its rest value. State is declared in repo-authored metadata (relationships.states) and computed at build time by one of these functions:

| Function | Description |
|----------|-------------|
| **nudge** | Shift L by a small magnitude toward the chroma peak. Hover on neutral surfaces. |
| **push** | Shift L by a medium magnitude away from the chroma peak. Active / pressed states. |
| **stepDepth** | Re-resolve the entire triad at a different (already-named) depth tier — e.g. hover → the .faint variant of the same token. |
| **desaturate** | Reduce chroma to the gamut floor and shift L toward a neutral midtone. All disabled states across all families. |

**State canonical vocabulary:** rest · hover · focus · active · selected · disabled

Note: hover is not a universal state — it is dropped for touch-only native targets at the platform transform layer.

---

## 07 — HIERARCHY — Not in the alias layer

Primary / secondary / tertiary describe which rank a component occupies in a composition — a UI-pattern decision, not a color-semantics decision. The alias layer never knows a button is 'the primary one'. Hierarchy rank is a mapping at Tier 3 (Component tokens):

| Component | Token | Description |
|-----------|-------|-------------|
| button.primary | `color.action.brand` | Dominant CTA — brand family, base depth |
| button.secondary | `color.action.neutral` | Supporting action — neutral family, base depth |
| button.tertiary | `color.action.on.brand` | Lowest emphasis — foreground-only, no fill |
| button.dark | `color.action.inverse` | Dark-surface context |
| button.sale | `color.action.sale` | Promotional emphasis |

---

## Design Validation Required

This is V0 of the taxonomy. Design must validate and test against this before it becomes the final color spec. The taxonomy structure (intents, families, variants, modifiers, state model) is durable and will carry forward into the OKLCH remap. The specific hex values and ΔL measurements are transitional and will be replaced when OKLCH primitives are mapped onto this taxonomy.
