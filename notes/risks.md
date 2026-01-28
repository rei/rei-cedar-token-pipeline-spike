# V0 Spike — Risk Matrix

| Risk Category | Description | Likelihood | Impact | Risk Level | Mitigation |
|---------------|-------------|------------|---------|------------|------------|
| **Figma Data Quality** | Mock Figma variables may not reflect real-world naming, structure, or inconsistencies designers introduce. | Medium | High | **H** | Use real Figma exports for V0; validate ingestion early; document deviations. |
| **Normalization Fragility** | V0 normalization only supports color tokens; unexpected shapes or fields may break the pipeline. | Medium | High | **H** | Strict V0 canonical shape validation; fail fast on malformed tokens. |
| **Canonical Model Gaps** | V0 canonical model excludes typography, spacing, shadows, etc., which may hide future complexity. | High | Medium | **H** | Document missing types; create V1 canonical expansion plan. |
| **Alias Resolution Errors** | Incorrect or circular alias references may not be caught in V0. | Low | High | **M** | Add alias validation in normalization; log unresolved references. |
| **Governance Coverage** | V0 governance only checks canonical shape; semantic/naming issues may slip through. | High | Medium | **H** | Treat V0 governance as exploratory; define V1 governance ADR. |
| **Transform Layer Assumptions** | Style Dictionary transforms may not map cleanly from canonical → platform outputs. | Medium | High | **H** | Build minimal transforms early; validate CSS/iOS/Android outputs. |
| **Dev Handoff Mismatch** | Alias tokens in Figma may not match alias tokens in code, causing developer confusion. | Medium | High | **H** | Validate Figma Dev Mode → code mapping with mock components. |
| **Directory Structure Drift** | Repo structure may evolve inconsistently as V0 grows. | Medium | Medium | **M** | Define V0 directory structure before implementation; lock it for spike duration. |
| **Manual Governance Bottleneck** | Manual review of `diff.json` may be slow or error‑prone. | Medium | Medium | **M** | Keep V0 scope small; automate governance in V1. |
| **Mode Expansion Risk** | V0 only supports single-mode; multi-mode may introduce breaking changes later. | High | Medium | **H** | Document mode-handling assumptions; prototype multi-mode in V1. |
| **Designer Workflow Drift** | Designers may create variables or styles that don’t match the expected structure. | Medium | Medium | **M** | Capture real-world examples; feed into V1 governance and normalization rules. |
| **Platform Output Divergence** | CSS, iOS, and Android may require different transforms or naming conventions. | Medium | High | **H** | Validate each platform output independently; document mismatches. |
| **Semantic Layer Instability** | V0 does not enforce semantic grammar; V1 may require renaming or restructuring. | High | Medium | **H** | Treat V0 semantics as provisional; define V1 semantic grammar ADR. |
| **Future Backward Compatibility** | V0 canonical shapes may not be forward-compatible with V1. | Medium | Medium | **M** | Keep V0 canonical minimal; avoid premature structure decisions. |
| **Team Adoption Risk** | Developers or designers may not understand the V0 pipeline or its limitations. | Low | Medium | **L** | Provide clear documentation; include diagrams and examples. |
