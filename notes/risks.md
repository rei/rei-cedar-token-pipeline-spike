# V0 Spike — Risk Matrix

> **Updated after spike completion.** Rows marked ✓ are resolved. New risks discovered during the spike are added at the bottom.

| Risk Category | Description | Likelihood | Impact | Risk Level | Mitigation | Spike Status |
|---|---|---|---|---|---|---|
| **Figma Data Quality** | Real Figma exports may not match expected structure. | Medium | High | **H** | Use real Figma exports for V0; validate ingestion early. | ✓ Mitigated — spike used real REI Figma exports successfully |
| **Normalization Fragility** | Unexpected Figma shapes may break the pipeline. | Medium | High | **H** | `token-mapping.json` build-fail on unmapped paths. | ✓ Mitigated — build fails immediately on unmapped token path |
| **Canonical Model Gaps** | V0 excludes typography, shadows, etc. | High | Medium | **H** | Document missing types; create V1 expansion plan. | Partial — spacing with `clamp()` is implemented; typography/shadows remain V1 |
| **Alias Resolution Errors** | Circular or unresolvable alias references. | Low | High | **M** | Build-fail on unmapped alias references. | ✓ Mitigated — normalizer throws on unmapped collection references |
| **Governance Coverage** | V0 governance only checks shape; semantic issues slip through. | High | Medium | **H** | `token-mapping.json` is primary governance; V1 adds naming grammar. | Partial — build-fail governance works; naming grammar not yet enforced |
| **Transform Layer Assumptions** | SD transforms may not map cleanly to platform outputs. | Medium | High | **H** | Build minimal transforms; validate outputs. | ✓ Resolved — CSS and iOS colorsets validated with correct values |
| **Dev Handoff Mismatch** | Alias tokens in Figma may not match code. | Medium | High | **H** | Validate Figma Dev Mode → code mapping. | Open — not validated in spike |
| **Directory Structure Drift** | Repo structure evolves inconsistently. | Medium | Medium | **M** | Define V0 directory structure. | ✓ Stable — structure established |
| **Manual Governance Bottleneck** | Manual review of diff.json may be slow. | Medium | Medium | **M** | Keep V0 scope small; automate in V1. | ✓ Resolved — diff.json not the primary mechanism; build-fail governs |
| **Mode Expansion Risk** | V0 single-mode; multi-mode may cause breaking changes. | High | Medium | **H** | Document mode assumptions; prototype in V1. | Partial — multi-appearance validated via option token `appearances.dark`; high-contrast has no implementation path yet |
| **Designer Workflow Drift** | Designers create variables that don't match expected structure. | Medium | Medium | **M** | `token-mapping.json` required review gate surfaces renames immediately. | ✓ Mitigated — build fails on rename with specific error message |
| **Platform Output Divergence** | CSS, iOS, and Android require different transforms. | Medium | High | **H** | Validate each platform output independently. | ✓ Validated — CSS and iOS produce different correct values |
| **Semantic Layer Instability** | V0 semantics provisional; V1 may require restructuring. | High | Medium | **H** | Treat V0 semantics as provisional. | Open — `color.modes` vs `color.palettes` divergence is a known V1 migration item |
| **Future Backward Compatibility** | V0 canonical shapes may not be forward-compatible with V1. | Medium | Medium | **M** | Keep V0 canonical minimal. | Partial — `canonical-breaking-changes.md` documents the delta for consumers |
| **Team Adoption Risk** | Developers may not understand the pipeline. | Low | Medium | **L** | `pipeline-dictionary.md` documents every function. | ✓ Mitigated — pipeline-dictionary.md produced |

---

## New Risks Discovered During the Spike

| Risk | Description | Likelihood | Impact | Risk Level | Mitigation |
|---|---|---|---|---|---|
| **SD v5 `$extensions` resolution** | SD v5 resolves any `{ref}` syntax found anywhere in a token, including inside `$extensions`. Custom code expecting reference strings receives hex values instead. | High | High | **H** | Store path strings without braces in `$extensions.cedar`. Documented in ADR-0005 addendum. |
| **SD transform group name collision** | SD v5 has built-in groups named `ios`, `css`, `android`. Custom groups with the same name may have built-in transforms applied unexpectedly. | Medium | High | **H** | All Cedar transform groups MUST use `cedar/` prefix (e.g. `cedar/ios`). |
| **`token-mapping.json` staleness** | If a designer renames a Figma variable and the mapping is not updated, the build fails with a cryptic path error rather than a clear "mapping is stale" message. | Medium | Medium | **M** | Error messages include the exact Figma path and instructions. CODEOWNERS review gate prevents unreviewed mapping changes. |
| **Four-file convention fragility** | The appearance dimension (light/dark) is encoded in filenames. If filenames change or a file is missing, normalization silently produces incomplete `appearances.dark` data. | Low | High | **M** | Build MUST fail if any of the four required platform files is missing. |
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
