# Governance Notes — V0 Spike

This document captures **governance validation** performed during the Cedar token pipeline V0 spike.
Governance rules are applied **during normalization** to prevent invalid or malformed tokens from reaching downstream platforms.

V0 implemented governance in two layers: **build-fail on unmapped paths** (primary) and **canonical shape validation** (secondary).

---

## What Changed from the Original Plan

The original V0 plan described manual canonical shape validation as the governance mechanism. The spike produced a more robust automated mechanism: the Figma input contract in `src/schema/token-schema.json` as the explicit, version-controlled boundary between design and engineering.

The original plan also assumed `$value` on alias tokens would be a hex string. The spike validated DTCG alias references (`{color.option.*}`) as `$value`, which is more architecturally correct but changes the validation rules.

---

## Primary Governance Mechanism: `src/schema/token-schema.json`

The most significant governance outcome of the V0 spike is the Figma input contract in `src/schema/token-schema.json` — a governed mapping from every Figma collection path to its canonical `color.option.*` path.

### How it works

- Every Figma token path in every `options.color.*.json` file MUST have an entry in `src/schema/token-schema.json`
- Every alias reference in `alias.color.*.json` MUST reference a mapped collection
- The build **throws immediately** with a specific error if either condition fails

This means governance is enforced automatically at build time, not through manual review of `diff.json`.

### Example build error

```
[token-mapping] Unknown Figma token path "neutral-palette.warm-warm.100"
(from platform "web-light"). Add an entry to src/schema/token-schema.json or rename
the Figma variable to match an existing entry.
```

### Governance implications

When a designer renames a Figma variable or group, the build fails with a message naming the exact path. Engineering and design must agree on the canonical name, update `src/schema/token-schema.json` in a PR, and the build passes again.

The schema contract MUST have required reviewers from both design and engineering (CODEOWNERS).

---

## Secondary Governance: Canonical Shape Validation

Every token in `canonical/tokens.json` is validated against these rules:

### Option tokens (`color.option.*`) are valid if:

- `$type` is `"color"`
- `$value` is a concrete hex string (`#RRGGBB` or `#RRGGBBAA`)
- `$extensions.cedar` (if present) contains only `appearances` and/or `platformOverrides`
- `$extensions.cedar.resolved` may be present and, when present, MUST contain only resolved platform/appearance values derived from the option token contract

### Alias tokens (`color.modes.*`) are valid if:

- `$type` is `"color"`
- `$value` is a DTCG alias reference (`{color.option.*}`)
- `$extensions.cedar.ios` and `$extensions.cedar.web` are present with `light` and `dark` keys
- All path strings in `$extensions.cedar` do NOT use brace syntax (SD resolves braces)
- `$extensions.cedar.resolved` may be present and, when present, MUST match the option-token-derived platform/appearance values

### A token is **invalid** if:

- `$value` is a platform-specific string (`UIColor(...)`, CSS `var(--...)`, etc.)
- `$value` contains an alias reference that doesn't resolve to a `color.option.*` path
- `$type` is anything other than `"color"` for color tokens
- `$extensions.cedar.resolved` is present but does not match the option-token-derived values
- The canonical path contains hyphens or platform names in structural segments

---

## V0 Spike Governance Outcomes

### What was validated

| Question | Answer |
|---|---|
| Can build-fail enforce Figma naming governance? | ✓ Yes — the schema-backed Figma input contract provides this |
| Can alias `$value` be a DTCG ref instead of hex? | ✓ Yes — validated end-to-end |
| Do platform values (iOS vs web) differ? | ✓ Yes — intentional, handled via `platformOverrides` |
| Can dark mode values be derived without Figma dark mode files? | ✓ Yes — via `$extensions.cedar.appearances.dark` on option tokens |

### What was NOT validated

- Naming grammar enforcement (no hyphens in canonical paths — partially enforced by the schema mapping but not validated at runtime)
- Semantic grammar enforcement (token naming intent/family/variant rules)
- Alias cycle detection
- Multi-palette token inheritance validation

---

## Open Governance Questions Answered by Spike

**Q: Can Style Dictionary resolve platform overrides from metadata?**
Yes. Actions have access to `dictionary.tokens` and can resolve option token references, read `$extensions.cedar.platformOverrides`, and apply them at build time. The current pipeline also writes `$extensions.cedar.resolved` during normalization so transforms/actions can consume pre-resolved values when useful.

**Q: How often do platform overrides actually differ?**
In the current Cedar palette: iOS and web warm-grey neutrals differ (intentional palette decision). iOS and web blues differ. Most other tokens are identical across platforms.

**Q: Can palettes be specified outside Figma with inheritance rules?**
Partially validated. The `sale` palette is implemented as a separate `alias.color.sale.json` file. Inheritance (sale only overrides tokens it changes) works via the separate palette structure.

---

## V1 Governance Requirements

Building on spike findings, V1 governance must add:

- Canonical path naming grammar enforcement (no hyphens, no platform names in structural segments)
- Semantic token naming intent validation
- Alias cycle detection
- CI staleness check: `$extensions.cedar` consistency with current Figma platform files
- Automated diff between canonical snapshots (PR #4 started this)
- Figma input contract (`src/schema/token-schema.json`) CODEOWNERS with required reviewers
- Breaking change detection and semantic versioning
