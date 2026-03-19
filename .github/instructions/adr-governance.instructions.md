---
description: "Use when creating or editing ADR files. Enforces ADR numbering, status consistency, consolidation rules, and architecture index synchronization."
name: "ADR Governance Rules"
applyTo: "architecture/ADR/*.md,architecture/README.md"
---

# ADR Governance Rules

## ADR numbering and structure

- Use filename format: `adr-####-short-kebab-title.md`
- Keep numeric ADRs sequential with no gaps
- Do not renumber historical ADRs unless explicitly requested
- Keep superseded supplemental files as pointers if external links may exist

## Required ADR sections

- Title (`# ADR-####: ...`)
- Status
- Context
- Decision
- Consequences
- Related documents

If an ADR predates this structure, improve incrementally without rewriting intent.

## Allowed status values

- `Proposed`
- `Draft`
- `Planned`
- `Accepted`
- `Implemented`
- `Superseded`

Use one canonical status per ADR and keep status wording exact.

## Consolidation and addenda

- If an addendum is folded into a base ADR, update the base ADR with normative content
- Keep the addendum file as a superseded compatibility pointer
- Update all references to point to the base ADR section

## Index synchronization

- `architecture/README.md` ADR table must include every primary ADR file
- ADR status in the index should match the ADR file status
- Include superseded addenda as clearly marked compatibility links

## Change hygiene

- Prefer small, focused ADR commits
- Preserve historical context and dates where possible
- Avoid stylistic rewrites that change architectural intent
