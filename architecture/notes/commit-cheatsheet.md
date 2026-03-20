# Commit Cheat Sheet — Cedar Token Pipeline V0 Spike

This spike is documentation-first and artifact-driven.
Commits should be clear, structured, and traceable to assumptions or pipeline layers.

Use lightweight Conventional Commits:

## Commit Types

### feat:
For new artifacts, new layers, or new JSON outputs.

Examples:
- `feat: add schema-backed figma input contract`
- `feat: create normalized token contract`
- `feat: add diff output for color changes`

### docs:
For README updates, architecture notes, assumptions, learnings, and governance.

Examples:
- `docs: add V0 assumptions table`
- `docs: update architecture diagram reference`
- `docs: add governance notes for ADR-0001`

### chore:
For repo scaffolding, folder structure, cleanup, and renaming.

Examples:
- `chore: scaffold repo structure`
- `chore: remove stray os metadata files`

### refactor:
For reorganizing artifacts or improving structure without changing behavior.

Examples:
- `refactor: extract normalization validation module`
- `refactor: simplify ios colorset action`

### test:
For validation coverage, snapshots, or test harnesses.

Examples:
- `test: add canonical resolved precedence coverage`
- `test: add iOS action fallback coverage`

### meta:
For marking progress on assumptions or workstreams.

Examples:
- `meta: validate assumption A3 (one-directional pipeline feasibility)`
- `meta: complete ingestion layer validation`

## Recommended Commit Flow

1. Make a focused change.
2. Stage it:
   `git add .`
3. Commit using a structured message.
