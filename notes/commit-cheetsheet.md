# Commit Cheat Sheet — Cedar Token Pipeline V0 Spike

This spike is documentation‑first and artifact‑driven.  
Commits should be clear, structured, and traceable to assumptions or layers.

Use **lightweight Conventional Commits**:

---

## Commit Types

### feat:
For new artifacts, new layers, or new JSON outputs.

Examples:
- `feat: add raw-figma.json ingestion sample`
- `feat: create normalized token contract`
- `feat: add diff.json for color changes`

---

### docs:
For README updates, architecture notes, assumptions, learnings, governance.

Examples:
- `docs: add V0 assumptions table`
- `docs: update architecture diagram reference`
- `docs: add governance notes for ADR-0001`

---

### chore:
For repo scaffolding, folder structure, cleanup, renaming.

Examples:
- `chore: scaffold repo structure`
- `chore: add diagrams and notes directories`

---

### refactor:
For reorganizing artifacts or improving structure without changing meaning.

Examples:
- `refactor: restructure artifacts folder`
- `refactor: rename normalized.json for clarity`

---

### test:
For manual validation artifacts or before/after snapshots.

Examples:
- `test: add before/after snapshots for diff validation`

---

### meta:
For marking progress on assumptions or workstreams.

Examples:
- `meta: validate assumption A3 (one-directional pipeline feasibility)`
- `meta: complete ingestion layer validation`

---

## Recommended Commit Flow

1. Make a change (artifact, doc, diagram, note)
2. Stage it:  
   `git add .`
3. Commit using a structured message:
