# ADR-0012: Metadata publish governance and schema contract

## Status
Proposed

---

## Context

Cedar metadata has moved from optional documentation to release-critical contract data. The token pipeline now depends on repo-authored metadata for lifecycle, usage, and semantic mapping, and AI authoring workflows require a single, machine-readable contract source.

Without explicit governance rules, teams risk:

- publishing canonical artifacts with incomplete or stale metadata
- drift between metadata shape and schema definitions
- inconsistent agent-generated token metadata across platforms
- contract breakage that appears only after downstream output generation

---

## Decision

1. Contract-first policy

- `src/schema/token-schema.json` is the governed contract for token and merged metadata shape
- metadata manifests do not mutate schema automatically
- schema changes are explicit reviewed contract changes

2. Publish-readiness gate

- package release must run strict metadata validation before publish
- strict mode treats metadata warnings as publish failures
- publish gate must include normalization, metadata validation, contract tests, and test suite

3. Metadata authority model

- Figma is authoritative for primitive docs (`$extensions.cedar.docs`)
- repo metadata is authoritative for governance (`$extensions.cedar.governance`)
- semantic contract entries (`$extensions.cedar.semantic`) derive from canonical + metadata merge

4. Required validation checks

- metadata entries must reference valid canonical token paths
- metadata naming/grammar rules must pass validation
- metadata completeness checks (status and usage guidance) must run in validation
- canonical schema must include governance and semantic metadata definitions

5. AI authoring readiness

- AI metadata authoring tools must target schema-valid payloads
- schema and ADR rules are the source for prompt/skill constraints
- generated metadata must pass strict validation gates before merge/publish

---

## Consequences

- publish failures surface metadata quality regressions earlier
- schema ownership becomes explicit and auditable
- AI-assisted metadata workflows gain deterministic constraints
- contract changes require intentional governance review rather than accidental drift

Tradeoff:

- stricter gates increase initial PR friction until metadata coverage reaches steady-state quality

---

## Related documents

- [ADR-0001: Canonical token model](./adr-0001-token-canonical-model.md)
- [ADR-0002: Token normalization layer](./adr-0002-token-normalization-layer.md)
- [ADR-0003: Figma input contract](./adr-0003-figma-input-contract.md)
- [ADR-0010: Token documentation architecture](./adr-0010-token-documentation-architecture.md)
- [src/schema/token-schema.json](../../src/schema/token-schema.json)
- [src/normalization/merge-metadata.ts](../../src/normalization/merge-metadata.ts)
- [src/normalization/validate-semantic-metadata.ts](../../src/normalization/validate-semantic-metadata.ts)