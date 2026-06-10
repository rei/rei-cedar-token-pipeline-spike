# Cedar NX Monorepo — Integrated Agent Strategy

> This document bridges the current token spike and the planned NX monorepo. It covers what needs to be decided before the monorepo can be wired, what the agent layer looks like across that structure, and how to support internal and external consumers with a consistent AI experience.

**Current status:** The token spike is producing decisions that unblock the monorepo. ADR-0013, 0014, and 0015 are Proposed. ADR-016 (rei-cedar ingestion) is not yet written. The broader vision is documented in `architecture/roadmap.md`.

---

## 1. What the SVG tells us — and what it leaves open

The monorepo structure is well-reasoned. The dependency direction is clean: `libs/core` is source of truth, `libs/ui-*` consumes it, `libs/docs` consumes both, `apps/` consumes everything. NX boundary tags enforce this in CI.

But the red box at the bottom of the diagram is honest: **three ADRs are Proposed and one is missing before `libs/ui-*` can be wired**, and the spike still has open questions that feed directly into those ADRs. Until those decisions land, any agent working in `ui-swift`, `ui-android`, or `ui-vue` is operating without a governed contract.

### What's decided (ADR-001 through 012, `libs/core/tokens`)
- Canonical token model, normalization process, Figma input contract
- Style Dictionary v5 transform layer, platform output formats
- Mode/theme support, documentation architecture
- Hybrid alias resolution (ADR-0012 — Accepted)

### What's not decided yet (three Proposed ADRs + one missing ADR + spike blockers)

**ADR-013 — component-schema contract** (Proposed)
How do `ui-vue`, `ui-swift`, and `ui-android` validate compliance against `libs/core/component-schema` at CI? This is the missing bridge between the core schema (JSON Schema · props · variants · a11y · states) and platform implementations.
- Spike blocker: semantic token data needed to validate the schema against actual component needs (see typography gap ticket).

**ADR-014 — composite style values** (Proposed)
Package naming, version coupling, how components consume CSS vars from the token pipeline. Defines the rule: token repo contains atomic single-value tokens only; composite styles live in platform libraries.
- Spike blocker: unresolved SASS mixin output question — until the next styles output format is defined, this ADR cannot be finalized.

**ADR-015 — AI catalog format** (Proposed)
The JSON-LD `@context` shape and `llms.txt` structure as a governed contract. `libs/docs/ai-catalog` depends entirely on this decision. This is also the ADR that defines what gets published to external consumers.

**ADR-016 — rei-cedar ingestion** (not yet written)
What transforms before import from the existing `rei-cedar` repo, what stays, what gets deleted. Directly affects `ui-vue` which is described as "rei-cedar adapted."

**ADR-0006/0008** (Future)
State layer and density decisions needed before Swift and Android can conform to the schema. iOS currently only knows color — density and interactive states are undefined.

**Android — fully undiscovered**
`ui-android` shows Compose + XML and Maven output, but the token consumption pattern, component structure, and CI validation approach are all open questions.

---

## 2. The spike's role right now

The spike is not just a prototype — it is producing the decisions that feed ADR-013 through 015 and the missing ADR-016. Specifically:

- **SASS mixin / styles output** → unblocks ADR-014
- **Semantic token real data** (you + design) → unblocks ADR-013 (schema can't be validated without real tokens)
- **Typography gap implementation** → provides real semantic token data for ADR-013/014 validation
- **iOS color-only baseline** → first conformance target for ADR-013, before state/density (ADR-0006/0008)
- **Android discovery** → sets the scope for ADR-016 and the platform transform layer

The right posture for the spike right now is: **keep it running, document decisions as they land, move ADR-013/014/015 from Proposed to Planned/Accepted, write ADR-016 as Proposed, don't try to finalize the monorepo structure until ADR-013 and 014 have at least a "Planned" status.**

---

## 2.1 Broader Vision — NX Monorepo Structure

The planned NX monorepo structure organizes Cedar into clean dependency layers:

- **`libs/core`** — Source of truth, no platform dependencies
  - `tokens` — Canonical token model, normalization, Style Dictionary transforms
  - `component-schema` — JSON Schema for props, variants, a11y, states
  - `docs-schema` — Documentation structure and metadata

- **`libs/ui-*`** — Platform implementations
  - `ui-vue` — "rei-cedar adapted" (requires ADR-016 for ingestion strategy)
  - `ui-swift` — iOS components (requires ADR-0006/0008 for state/density)
  - `ui-android` — Android components (requires discovery + ADR-013)
  - `ui-figma` — Figma plugin and bi-directional sync (ADR-003)

- **`libs/docs`** — Documentation as first-class library
  - `component-docs` — MDX, usage, a11y documentation
  - `token-docs` — Generated from canonical tokens
  - `ai-catalog` — JSON-LD + llms.txt for consumer AI (ADR-015)

- **`tools/`** — NX executors and generators
  - `normalize` — ADR-002 pipeline
  - `style-dictionary` — Per-platform transforms (ADR-005)
  - `validate-schema` — Contract + metadata gate (ADR-013)
  - `generators` — Scaffold from schema

NX boundary tags enforce dependency direction: `libs/core` cannot import `libs/ui-*`, `libs/ui-*` cannot import each other, `libs/docs` can import both.

---

## 3. Agent readiness by layer

The monorepo has four distinct layers that agents interact with differently. Each needs its own approach.

### Layer A — `libs/core` (source of truth, no platform deps)

This is the most governed layer and the highest risk if an agent gets it wrong. ADR-001 through 012 already exist. The gap is routing.

**What agents need before touching this layer:**
- Read `adr-catalog.json` and identify which ADRs govern the file they're editing
- Confirm the file's governance tier in `file-dictionary.json`
- Run `pnpm tokens:build && pnpm test:contract` before committing

**Skill needed: `core-tokens`**
Covers `libs/core/tokens`, `libs/core/component-schema`, `libs/core/docs-schema`. Routes agents to the correct ADRs via the catalog, enforces the no-platform-deps boundary (`scope:core` tag), and points to the canonical outputs as ground truth before any edit.

**Skill needed: `core-schema`**
Specifically for `libs/core/component-schema` and `libs/core/docs-schema`. Once ADR-013 and 015 exist, this skill enforces those contracts. Until then, it should explicitly tell agents these areas are under active design and to flag any work here for human review before merging.

### Layer B — `libs/ui-*` (platform implementations)

This layer cannot be properly skilled until ADR-013 and 014 exist. Writing a `ui-vue` or `ui-swift` skill now would just encode guesses.

**What to do now:** Add a stub `AGENTS.md` note in each `ui-*` package that reads:

```
ADR-013 (component-schema contract) and ADR-014 (token integration boundary)
are not yet Accepted. Do not make structural changes to this package without
checking their current status in adr-catalog.json first.
```

**What to do when ADRs land:**

- `ui-vue` skill: rei-cedar ingestion rules (ADR-016), CSS var consumption pattern (ADR-014), schema compliance validation command
- `ui-swift` skill: color token format (current), plus state/density once ADR-006/008 amendments land
- `ui-android` skill: to be defined after discovery — do not write this skill until Android patterns are understood
- `ui-figma` skill: bi-directional sync rules, Figma Variables API contract (ADR-003)

**NX boundary rule to embed in all `ui-*` skills:**
`scope:ui-*` can import `scope:core` only. No cross-platform imports. Any agent suggestion that imports from another `ui-*` package is a boundary violation.

### Layer C — `libs/docs` (documentation as first-class lib)

Three packages: `component-docs` (MDX · usage · a11y), `token-docs` (generated from canonical), `ai-catalog` (JSON-LD + llms.txt).

`ai-catalog` is the most important for the agent strategy because it is the published output that consumer agents read. It depends on ADR-015.

**Skill needed: `docs-authoring`**
For `component-docs`. Covers MDX structure, editorial style (existing `component-doc-editorial.instructions.md` gets folded in), a11y documentation requirements, and the authority boundary from ADR-010 (what Figma owns vs what the repo owns).

**Skill needed: `ai-catalog`**
For `libs/docs/ai-catalog`. This skill is also the **consumer-facing publishing contract** — it defines what gets put into `llms.txt` and the JSON-LD catalog, in what format, and how it gets versioned with the package. Depends on ADR-015. Do not write this skill until that ADR is at least in "Draft" status.

### Layer D — `tools/` (NX executors and generators)

Four tools: `normalize` (ADR-002 pipeline), `style-dictionary` (per-platform transforms), `validate-schema` (contract + metadata gate), `generators` (scaffold from schema).

Agents touching tools are modifying the build pipeline itself — the highest governance overhead of any layer.

**Skill needed: `pipeline-tools`**
Before touching any executor or generator: read the ADR governing that tool's domain (ADR-002 for normalize, ADR-005 for style-dictionary, ADR-013 for validate-schema once it exists). The skill should also enforce that tool changes include a contract test update — `validate-schema` changes without a corresponding test change are a red flag.

---

## 4. The `AGENTS.md` hierarchy for NX

NX monorepos need agents oriented at two levels: the workspace root and per-package. These serve different purposes.

### Root `AGENTS.md` — workspace orientation

Lives at the repo root. Read by all agents on every task. Should be short — under 60 lines. Contains:

- The four NX boundary rules (core can't import ui-*, ui-* can't import each other, etc.)
- Pointer to `adr-catalog.json` as the routing table
- Pointer to `file-dictionary.json` for governance tiers
- The validation command for each layer
- A "before you touch `ui-*`" warning about ADR-013/014 status
- The PR audit block requirement

### Per-package `AGENTS.md` — package-specific contract

Lives in each `libs/` and `tools/` package. Contains only what's specific to that package: which ADRs govern it, which files are generated (do not edit), and which validation command to run. Agents load the root first, then the package-level file. Together they replace the need for a single monolithic skill.

This hierarchy also works well for Devin, Copilot, and Cursor because all three respect nested instruction files in different ways — the root file handles common rules, package files handle specifics without bloating the root.

---

## 5. Consumer AI experience

Two consumer groups need different outputs from `libs/docs/ai-catalog`.

### Internal REI product teams

They are using Copilot, Cursor, or Windsurf in their own app repos. They need Cedar token guidance inline while they work — correct token paths, semantic over primitive, deprecated token warnings.

What they need published:
- `llms.txt` at the package root pointing to the token catalog and type definitions
- A consumer skill file (`cedar-tokens.SKILL.md`) in `dist/skills/` with usage guidance, not pipeline guidance
- A short getting-started snippet for each agent platform (Copilot instructions, Cursor rules, Windsurf workflow)

The consumer skill is scoped to: finding the right token, checking governance status, avoiding deprecated tokens, consuming CSS vars correctly, and understanding the semantic/primitive boundary.

### External OSS consumers

Same outputs, but published to the docs site and the npm package. The `llms.txt` at the docs site root is the primary discovery mechanism when an external developer's agent encounters Cedar in their codebase.

ADR-015 governs the format of both. This is why that ADR is a prerequisite for the consumer experience — you can't publish a governed contract that isn't yet decided.

---

## 6. Skills summary — what to write and when

| Skill | Depends on | Write when |
|---|---|---|
| `core-tokens` | ADR-001 through 012 | Now — these ADRs exist |
| `core-schema` (stub) | ADR-013, 015 | Stub now, complete when ADR-013 reaches Planned |
| `docs-authoring` | ADR-010 | Now — ADR-010 exists |
| `adr-authoring` | All ADRs | Now — covers authoring process itself |
| `pipeline-tools` | ADR-002, 005 | Now for normalize/sd, expand when ADR-013 reaches Planned |
| `ui-vue` | ADR-013 (Planned), 014 (Planned), 016 (Proposed) | When ADR-013/014 reach Planned and ADR-016 is Proposed |
| `ui-swift` | ADR-013 (Planned), ADR-0006/0008 (Future) | After state/density decisions land (ADR-0006/0008 move from Future) |
| `ui-android` | Android discovery + ADR-013 (Planned) | After Android patterns are understood |
| `ui-figma` | ADR-003 | Now — ADR-003 exists |
| `ai-catalog` | ADR-015 (Proposed) | When ADR-015 reaches Planned |
| `cedar-tokens` (consumer) | ADR-015 (Planned), stable token schema | When ADR-015 reaches Accepted |

Skills that cannot be written yet are not gaps — they're honest unknowns. Writing them now would encode guesses that become technical debt when the ADRs change.

---

## 7. Measuring agent effectiveness

Three things to track, all low-cost to implement.

**PR audit block** (immediate, no tooling)
Add to the root PR template. Every agent-assisted PR records: which agent, which ADRs referenced, which catalog files read, any token paths invented vs catalog-verified, and what was missing or unclear. This is the primary signal for the first 4–6 weeks.

**Token coverage report** (generated by build)
`pnpm nx run tokens:build` emits `dist/reports/token-coverage.json` — total tokens, with governance metadata, with docs, deprecated, gaps. Surface this in Storybook or the docs app. Agents can read this report and flag gaps to maintainers.

**Agent feedback log** (`architecture/notes/agent-feedback.md`)
A structured append-only log. Devin adds an entry at the end of every session: task, ADRs read, catalog files used, what was missing, token paths invented. Over time this surfaces which ADRs need better summaries and which catalog files agents consistently skip.

---

## 8. What to do this week

Given everything that's in flight, the highest-value actions that don't require waiting on ADRs:

1. **Create root `AGENTS.md`** — workspace orientation, boundary rules, pointer to `adr-catalog.json`, warning about ADR-013/014 status. Under 60 lines.

2. **Create `architecture/notes/agent-feedback.md`** — empty file with the schema as a comment. Devin can start logging immediately.

3. **Add `agentSummary` and `affectedFiles` to each entry in `adr-catalog.json`** — one sentence per ADR that tells an agent what it must know before touching that domain. This is the single highest token-efficiency improvement: agents read the summary and only pull the full ADR if the summary flags relevance.

4. **Write `core-tokens` skill** — this is the only `libs/core` skill that can be fully written now. It covers the most governed, most risky layer and the ADRs exist to back it up.

5. **Write ADR-016 as Proposed** — rei-cedar ingestion strategy. This is the missing ADR that blocks `ui-vue`.

6. **Move ADR-013/014/015 from Proposed to Planned** — once the open questions in each are resolved, advance their status to unblock platform library work.

Everything else — `ui-*` skills, the consumer catalog, the `llms.txt` — waits on those ADRs. That is the correct order.
