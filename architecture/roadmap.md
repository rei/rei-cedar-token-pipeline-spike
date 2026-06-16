# Cedar Token Pipeline — Roadmap Overview

**Audience:** Design, product, and engineering leadership
**Last updated:** 2026-06-10

---

## What this pipeline does

Cedar's token pipeline takes design decisions authored in Figma and delivers them as production-ready outputs for every platform Cedar supports: **web (CSS), iOS (Xcode colorsets), Android, and Tailwind**. The pipeline is automated, governed, and version-controlled — meaning design changes flow through a reviewable, testable process before reaching consumers.

---

## Where we are today (V0 spike — complete)

The V0 spike validated the end-to-end pipeline for **color** and **spacing** tokens. These capabilities are working and tested:

| Capability | What it means |
|---|---|
| **Figma → canonical model** | Design variables are pulled from Figma and normalized into a single source of truth (`canonical/tokens.json`) |
| **Schema-governed mapping** | Every Figma variable path is explicitly mapped; renames are caught automatically at build time |
| **Web CSS output** | Light and dark CSS custom properties with hex fallbacks and OKLCH modern color |
| **iOS colorsets** | Xcode asset catalogs with Display P3 color for light and dark appearances |
| **Fluid spacing** | Responsive `clamp()`-based spacing that scales across breakpoints |
| **Typography primitives** | Font size, weight, family, line-height, letter-spacing, and style tokens pulled from Figma |
| **TypeScript types** | Generated type definitions so consumers get autocomplete and compile-time safety |
| **Docs metadata** | Token descriptions from Figma flow into JSDoc comments and metadata JSON |
| **Governance metadata** | Repo-owned lifecycle data (status, deprecation, usage) merged into canonical model |
| **Sale palette** | Separate palette with inheritance from default — only overrides what it changes |

---

## Broader vision — the NX monorepo

The token spike is not an isolated effort. It produces the decisions that feed directly into the planned **Cedar NX monorepo** structure, which reorganizes Cedar into a governed multi-platform system:

- **`libs/core`** — source of truth for tokens, component schema, and docs schema
- **`libs/ui-*`** — platform implementations: `ui-vue`, `ui-swift`, `ui-android`, `ui-figma`
- **`libs/docs`** — documentation as first-class libraries: component docs, token docs, AI catalog
- **`tools/`** — NX executors and generators: normalize, style-dictionary, validate-schema, scaffold

NX boundary tags enforce clean dependency direction: `libs/core` has no platform deps, `libs/ui-*` imports only from `core`, and `ui-*` packages cannot import each other.

### Four upcoming ADRs before `libs/ui-*` can be wired

The monorepo diagram shows a red box at the bottom: four ADRs are missing before platform libraries can be connected to the core token pipeline. The spike is actively producing the decisions that unblock these:

| ADR | Purpose | Spike dependency |
|---|---|---|
| **ADR-013 — Component-schema contract** | How `ui-vue`, `ui-swift`, `ui-android` validate compliance against `libs/core/component-schema` at CI | Needs semantic token real data to test the schema against actual component needs |
| **ADR-014 — Token ↔ component integration boundary** | Package naming, version coupling, how components consume CSS vars from the token pipeline | Blocked by the unresolved SASS mixin output question — needs ADR-0014 decision first |
| **ADR-015 — AI catalog format** | The JSON-LD `@context` shape and `llms.txt` structure as a governed contract | Defines what gets published to external consumers and how agents discover Cedar tokens |
| **ADR-016 — rei-cedar ingestion** | What transforms before import from the existing `rei-cedar` repo, what stays, what gets deleted | Affects `ui-vue` which is described as "rei-cedar adapted" |

The spike's role: keep it running, document decisions as draft ADRs as they land, don't finalize the monorepo structure until ADR-013 and 014 have at least a "Planned" status.

### Agent strategy and consumer AI experience

The monorepo introduces an agent layer that works across the structure. Two consumer groups need Cedar token guidance from AI:

**Internal REI product teams** — using Copilot, Cursor, or Windsurf in their own app repos. They need:
- Inline token guidance while they work (correct paths, semantic over primitive, deprecated warnings)
- A consumer skill file with usage guidance (not pipeline guidance)
- Getting-started snippets for each agent platform

**External OSS consumers** — same outputs published to the docs site and npm package. The `llms.txt` at the docs site root is the primary discovery mechanism when an external developer's agent encounters Cedar.

ADR-015 governs the format of both. This is why that ADR is a prerequisite for the consumer experience — you can't publish a governed contract that isn't yet decided.

### Typography gap example

A concrete example of work feeding the ADRs: the **Typography Token Gaps** ticket addresses two structural issues that block semantic token adoption:

1. **Fluid text primitives** — `text.size` is currently a flat static scale. Needs `text.size.fluid` with clamp-based values (like `spacing.scale`) and `text.size.static` (like `spacing.static`) so web gets fluid typography and native gets static.

2. **Semantic typography layer** — No `text.semantic` equivalent of `color.semantic`. Needs named text style tokens (e.g., "heading.sans", "title") that group primitives together and use `$extensions.cedar` to specify platform variants (fluid for web, static for iOS/Android).

This work unblocks ADR-0014 (composite style values) and provides real semantic token data for ADR-013 (component-schema contract) to validate against.

---

## What's decided and coming next

These decisions are made and scoped. Work is planned or in progress.

### Semantic token architecture (ADR-0004 — Planned)

Formalizes the three-tier model that the spike validated: **Options → Alias → Semantic**. This gives designers a clear mental model: options are the palette, aliases are the design intent (e.g., "surface", "text-primary"), and semantic tokens are component-specific.

**Why it matters for design:** Establishes the naming grammar designers will use in Figma going forward.
**Why it matters for product:** Defines the contract consumers build against — stability here means fewer breaking changes.

### Transform layer and platform outputs (ADR-0005 — Planned)

Defines how canonical tokens become platform-specific outputs (CSS, iOS, Android, TypeScript). Documents the Style Dictionary v5 constraints the pipeline must follow.

**Why it matters:** This is the machinery that ensures every platform gets correct, consistent values from the same source.

---

## What's proposed and needs alignment

These decisions have detailed proposals written. They need stakeholder review before implementation begins.

### Modes and palettes (ADR-0007 — Proposed)

Defines how light mode, dark mode, high-contrast mode, and surface-scoped palettes (default, sale) work across platforms.

- Light/dark and default/sale are validated and working
- High-contrast mode needs a governance decision and new Figma files
- Web uses runtime CSS custom properties; native uses static enum variants

**Decision needed:** High-contrast mode priority and timeline.

### Responsive and adaptive tokens (ADR-0008 — Proposed)

Fluid spacing with `clamp()` is implemented. Remaining proposals: fluid typography, container query tokens, and density tokens.

**Decision needed:** Which responsive capabilities to pursue for V1 vs defer.

### Consumer models (ADR-0013 — Proposed)

Defines the eight consumer models Cedar will support: Cedar components, CSS/vanilla web, Sass, TypeScript/JS, Tailwind CSS, iOS, Android, and Figma. Draws a clear line between what the token repo produces (Layer 1: atomic values) and what platform libraries own (Layer 2: composite styles, integration adapters).

**Decision needed:** Which consumer models are committed for V1 launch vs phased.

### Composite style values (ADR-0014 — Proposed)

Establishes the rule: **the token repo ships atomic single-value tokens only**. Composite styles (like Sass typography mixins) move to platform-specific libraries. Figma text styles are decomposed into atomic tokens on export.

**Why it matters for design:** Designers keep authoring named text styles in Figma. The pipeline pulls them apart into individual tokens automatically.
**Why it matters for product:** Unblocks multi-platform delivery — the same token works on web, iOS, and Android without platform assumptions baked in.

**Decision needed:** Confirmation that existing Sass mixin consumers have a migration path before this ships.

### Cedar Tailwind preset (ADR-0015 — Proposed)

Defines `@rei/cedar-tailwind-preset` as the official integration for Tailwind-based teams. Preserves Cedar's fluid spacing and runtime palette switching via CSS custom properties — capabilities that vanilla Tailwind loses.

**Why it matters for product:** DXP and other Tailwind-adopting teams get Cedar token alignment without giving up Tailwind's developer experience.

**Decision needed:** DXP team alignment on adoption timeline and migration support.

---

## Future — not yet scoped

These are documented directions that will matter eventually but are not blocking current work.

### State layer system (ADR-0006 — Future)

Interactive state tokens: hover, pressed, focus, disabled, selected, error. Defines a hybrid approach where states are explicit tokens with metadata for future computed overlays.

**When it matters:** When Cedar components need consistent interactive state behavior across platforms.

### Accessibility requirements (ADR-0009 — Future)

Embeds WCAG 2.2 Level AA into the token system: focus indicators, touch targets, color contrast metadata, high-contrast mode, motion preferences.

**When it matters:** When Cedar commits to accessibility validation as part of the token pipeline (not just component testing).

### Harmonic interval validation (ADR-0011 — Future)

Perceptual correctness checking — validates that color pairs in the palette maintain consistent visual relationships (lightness intervals, chroma envelopes, contrast ratios).

**When it matters:** When the palette grows beyond the current families and automated quality checks become necessary.

---

## Status definitions

| Status | Meaning |
|---|---|
| **Implemented** | Decision is made, code is working and tested |
| **Accepted** | Decision is made, implementation approach is locked |
| **Draft** | Decision is forming, details still evolving |
| **Planned** | Decision is made, implementation is scoped but not started |
| **Proposed** | Detailed proposal exists, needs stakeholder alignment before work begins |
| **Future** | Direction is documented, not yet scoped or prioritized |

---

## Key risks and open questions

From the [risk matrix](./notes/risks.md):

- **Reverse sync to Figma** — pipeline can pull from Figma but cannot push approved changes back. Placeholder only.
- **High-contrast mode** — no Figma files or implementation path yet. Requires ADR-0007 amendment.
- **Composite foundations** — typography, radius, shadow, prominence canonical contracts are the biggest V1 architecture expansion.
- **Android output** — not implemented. Priority depends on whether Android becomes a committed consumer.
- **Governance enforcement** — policy is documented but CI checks for naming grammar, alias cycles, and staleness are not fully implemented.

---

## How to read the full details

Each ADR linked above contains the complete decision context, rationale, and consequences. The [architecture index](./README.md) has the full table with links to every document.
