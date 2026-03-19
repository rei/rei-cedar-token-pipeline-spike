# V0 Spike — Risk Matrix

> **Updated after spike completion.** Rows marked ✓ are resolved. New risks discovered during the spike are added at the bottom.

| Risk Category | Description | Likelihood | Impact | Risk Level | Mitigation | Spike Status |
|---|---|---|---|---|---|---|
| **Figma Data Quality** | Real Figma exports may not match expected structure. | Medium | High | **H** | Use real Figma exports for V0; validate ingestion early. | ✓ Mitigated — spike used real REI Figma exports successfully |
| **Normalization Fragility** | Unexpected Figma shapes may break the pipeline. | Medium | High | **H** | `src/schema/token-schema.json` build-fail on unmapped paths. | ✓ Mitigated — build fails immediately on unmapped token path |
| **Canonical Model Gaps** | V0 excludes composite foundations (typography, radius, shadow, prominence, etc.). | High | High | **H** | Define canonical contracts and output rules for composite foundations; implement incrementally by domain. | Partial — spacing with `clamp()` is implemented; most composite foundations remain V1 |
| **Alias Resolution Errors** | Circular or unresolvable alias references. | Low | High | **M** | Build-fail on unmapped alias references. | ✓ Mitigated — normalizer throws on unmapped collection references |
| **Governance Coverage** | V0 governance only checks shape; semantic issues slip through. | High | Medium | **H** | The Figma input contract in `src/schema/token-schema.json` is primary governance; V1 adds naming grammar. | Partial — build-fail governance works; naming grammar not yet enforced |
| **Transform Layer Assumptions** | SD transforms may not map cleanly to platform outputs. | Medium | High | **H** | Build minimal transforms; validate outputs. | ✓ Resolved — CSS and iOS colorsets validated with correct values |
| **Dev Handoff Mismatch** | Alias tokens in Figma may not match code. | Medium | High | **H** | Validate Figma Dev Mode → code mapping. | Open — not validated in spike |
| **Directory Structure Drift** | Repo structure evolves inconsistently. | Medium | Medium | **M** | Define V0 directory structure. | ✓ Stable — structure established |
| **Manual Governance Bottleneck** | Manual review of diff.json may be slow. | Medium | Medium | **M** | Keep V0 scope small; automate in V1. | ✓ Resolved — diff.json not the primary mechanism; build-fail governs |
| **Mode Expansion Risk** | V0 single-mode; multi-mode may cause breaking changes. | High | Medium | **H** | Document mode assumptions; prototype in V1. | Partial — multi-appearance validated via option token `appearances.dark`; high-contrast has no implementation path yet |
| **Designer Workflow Drift** | Designers create variables that don't match expected structure. | Medium | Medium | **M** | The schema mapping required review gate surfaces renames immediately. | ✓ Mitigated — build fails on rename with specific error message |
| **Figma Round-Trip Drift** | Pipeline can ingest Figma changes, but cannot publish approved rejections/overrides back to Figma. | High | High | **H** | Implement `tokens-to-figma` with dry-run diffs, approval gates, and audit logs for reverse sync actions. | Open — sync-back script is still a placeholder |
| **Platform Output Divergence** | CSS, iOS, and Android require different transforms. | Medium | High | **H** | Validate each platform output independently and ship parity tests for every supported platform. | Partial — CSS and iOS validated; Android output not implemented |
| **Semantic Layer Instability** | V0 semantics provisional; V1 may require restructuring. | High | Medium | **H** | Treat V0 semantics as provisional. | Open — `color.modes` vs `color.palettes` divergence is a known V1 migration item |
| **Future Backward Compatibility** | V0 canonical shapes may not be forward-compatible with V1. | Medium | Medium | **M** | Keep V0 canonical minimal. | Partial — ADRs and architecture docs capture current structural deltas for consumers |
| **Governance Enforcement Gap** | Governance policy requires dual review and CI checks, but enforcement artifacts are incomplete. | Medium | High | **H** | Add CODEOWNERS for schema and canonical contracts, plus CI checks for naming grammar, alias cycles, and staleness. | Open — policy is documented, enforcement is not fully implemented |
| **Team Adoption Risk** | Developers may not understand the pipeline. | Low | Medium | **L** | Keep orchestration thin and docs current. | Partial — architecture docs exist, but a dedicated pipeline dictionary is not present |

---

## New Risks Discovered During the Spike

| Risk | Description | Likelihood | Impact | Risk Level | Mitigation |
|---|---|---|---|---|---|
| **SD v5 `$extensions` resolution** | SD v5 resolves any `{ref}` syntax found anywhere in a token, including inside `$extensions`. Custom code expecting reference strings receives hex values instead. | High | High | **H** | Store path strings without braces in `$extensions.cedar`. Documented in ADR-0005 addendum. |
| **SD transform group name collision** | SD v5 has built-in groups named `ios`, `css`, `android`. Custom groups with the same name may have built-in transforms applied unexpectedly. | Medium | High | **H** | All Cedar transform groups MUST use `cedar/` prefix (e.g. `cedar/ios`). |
| **Schema mapping staleness** | If a designer renames a Figma variable and the schema mapping is not updated, the build fails with a path error. | Medium | Medium | **M** | Error messages include the exact Figma path and instructions. CODEOWNERS review gate prevents unreviewed mapping changes. |
| **Reverse-sync decision ambiguity** | Teams can detect drift but lack a governed decision workflow for “accept in code” vs “push back to Figma”. | Medium | High | **H** | Add PR workflow states (accept/reject/defer), and require explicit reverse-sync action when rejecting Figma changes. |
| **Four-file convention fragility** | The appearance dimension (light/dark) is encoded in filenames. If filenames change or a file is missing, normalization can produce incomplete platform data. | Low | High | **M** | Input validation now warns on missing baseline files and fails on unmapped imported collections; strict CI enforcement is a V1 follow-up. |
| **`dictionary.tokens` path navigation** | Option tokens are in `dictionary.tokens` but not `dictionary.allTokens` (filtered out). Code that uses `allTokens` cannot find them. | Medium | Medium | **M** | All option token resolution uses `dictionary.tokens` with explicit path navigation. Documented in ADR-0005 addendum. |
| **High-contrast mode has no path** | The four-file Figma input structure encodes only light and dark. There is no `web-high-contrast.json` file. Adding high-contrast mode requires a governance decision and new Figma files. | Low | High | **M** | Documented as an open architectural question in ADR-0007. Requires ADR amendment before scoping. |

---

## Open Questions — Status

| # | Question | Status |
|---|---|---|
| 1 | Can SD resolve platform overrides from metadata? | ✓ **Yes** — action reads `$extensions.cedar.platformOverrides` via `dictionary.tokens` |
| 2 | Do designers need to preview all palette combinations? | Open — not validated with users |
| 3 | Is a Figma plugin for platform preview feasible? | Open — technical investigation needed |
| 4 | Can palettes be specified outside Figma with inheritance rules? | ✓ **Partially** — separate `alias.color.*.json` per palette works; YAML governance not yet validated |
| 5 | How often do platform overrides actually differ? | ✓ **Answered** — iOS vs web: blues differ (intentional), warm-grey.900 light differs (intentional), dark values mostly same |
| 6 | Can palette inheritance be validated at build time? | Open — not yet implemented |
| 7 | How do designers think about palette creation? | Open — user research needed |
| 8 | What is the canonical reject workflow for Figma updates (including sync-back ownership and approvals)? | Open — workflow not defined yet |

---

## Delivery Prioritization Matrix (Effort + Criticality)

This section translates risks into planning signals for different definitions of success.

Effort scale:
- `S` = 1-3 days
- `M` = 1-2 weeks
- `L` = 2-4 weeks
- `XL` = 4+ weeks or cross-team dependency heavy

Criticality scale:
- `High` = required for this success definition
- `Med` = materially improves success, but not blocking
- `Low` = optional for this success definition

| Capability / Feature | Effort | Criticality: Color-Only Success | Criticality: Figma-Only Success | Criticality: Full Multi-Platform Success | Notes |
|---|---|---|---|---|---|
| Schema-backed Figma ingest + mapping build-fail | `S` (maintain) | High | High | High | Already implemented; keep healthy and reviewed. |
| Reverse sync workflow (`tokens-to-figma`) with reject/approve path | `L` | Med | Med | High | Needed when code should be source of truth for rejected Figma changes. |
| Composite foundations (typography, radius, shadow, prominence) canonical contract | `L` to `XL` | Low | Med | High | Biggest architecture expansion beyond color + spacing. |
| Android output (`colors.xml`, type/dimen strategy) | `M` to `L` | Low | Low | High | Not required unless Android becomes a committed consumer. |
| `color.modes` -> `color.palettes` migration | `M` | Med | Med | High | Contract cleanup to reduce future breaking changes. |
| Governance enforcement artifacts (CODEOWNERS + CI checks for naming/alias cycles/staleness) | `M` | Med | Med | High | Prevents drift and protects scale-up. |
| Diff + impact workflow completion (PR-friendly change intelligence) | `M` | Med | Med | Med to High | Strongly recommended before larger team adoption. |
| High-contrast mode path definition and implementation | `M` to `L` | Low | Low | Med to High | Criticality depends on accessibility target and product commitments. |

### Recommended MVP by Success Definition

If PM defines success as **Color-Only**:
- Must-have: ingest governance, stable web+iOS color outputs, mapping review controls.
- Can defer: reverse sync, Android, composite foundations, high-contrast.

If PM defines success as **Figma-Only (one-way for now)**:
- Must-have: ingest governance, explicit accept/reject policy documented in PR workflow.
- Strongly consider: reverse-sync design now (implementation can be phased) to avoid process dead-ends.

If PM defines success as **Full Multi-Platform**:
- Must-have: reverse sync, Android output, composite foundations, governance enforcement, and `color.palettes` migration.
- Nice-to-have but valuable early: completed diff/impact pipeline and high-contrast path.
