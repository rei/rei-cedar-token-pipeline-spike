# Copilot Working Rules for Focused Changes

These rules are mandatory for AI-assisted changes in this repository.

## Branch and PR scope

- Default to one intent per branch and per PR
- Do not combine runtime behavior changes, architecture decisions, and tooling refactors in one PR unless explicitly requested
- Prefer small intentional updates over broad cleanups

## Scope-split guardrail

When a proposed change touches both groups below, stop and ask whether to split into separate PRs unless the user explicitly asks to combine:

- Architecture/docs scope: `architecture/**`, `README.md`, `.github/instructions/**`
- Runtime/build scope: `src/**`, `style-dictionary/**`, `scripts/**`, `package.json`, workflows

If combined work is approved, include a brief rationale in the PR summary.

## Change budget guidance

- Target <= 10 changed files and <= 300 changed lines per PR
- If larger, split into stacked PRs or use `scope:large` with explicit justification

## Safety and intent

- For any change that can alter architecture behavior, reference the related ADR in the PR
- Treat accidental architectural shifts as blockers and call them out before editing
- Keep generated artifacts separate from logic edits when possible
