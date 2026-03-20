## Summary

- Describe what changed.
- Include why the change is needed.

## Scope Lock

- Primary intent (one sentence):
- In scope:
- Out of scope (non-goals):

## Change Budget

- Estimated changed files:
- Estimated changed lines:
- If this exceeds normal scope, justify why it should remain a single PR:

## Governance Tier Classification

List the files changed in this PR by tier from `architecture/notes/file-dictionary.md`.

- Tier 1 (Contracts):
- Tier 2 (Build Logic):
- Tier 3 (Artifacts/Tests):
- Tier 4 (Tooling/Workspace):

## Required Checks

- [ ] I mapped changed files to tiers above.
- [ ] Tier 1 changes include ADR or contract rationale.
- [ ] Tier 2 changes include tests or validation evidence.
- [ ] Tier 3 changes are traceable to source/build output.
- [ ] Tier 4 changes are isolated to a focused commit (or intentionally grouped with rationale).

## Impact Note (Required for Tier 1 and Tier 2)

- Behavior impact:
- Contract impact:
- Rollback plan:

## Architecture Safety Check

- [ ] This PR does not unintentionally combine runtime and architecture scope.
- [ ] If both architecture docs and runtime code changed, I explicitly documented why they must ship together.

## Validation Evidence

- [ ] `pnpm test` (or targeted tests) passed
- [ ] Normalization output validated (if applicable)
- [ ] Style Dictionary outputs validated (if applicable)

## Ownership and Review

- [ ] CODEOWNERS paths were respected.
- [ ] Additional reviewers requested when cross-tier changes are included.
