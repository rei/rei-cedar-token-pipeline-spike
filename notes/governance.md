# Governance Notes — V0 Spike

This document captures **governance validation** performed during the Cedar token pipeline V0 spike.
Governance rules are applied **during normalization** to prevent invalid or malformed tokens from reaching downstream platforms.

V0 implemented governance in two layers: **build-fail on unmapped paths** (primary) and **canonical shape validation** (secondary).

---

## What Changed from the Original Plan

The original V0 plan described manual canonical shape validation as the governance mechanism. The spike produced a more robust automated mechanism: `token-mapping.json` as the explicit, version-controlled boundary between design and engineering.

The original plan also assumed `$value` on alias tokens would be a hex string. The spike validated DTCG alias references (`{color.option.*}`) as `$value`, which is more architecturally correct but changes the validation rules.

---

## Primary Governance Mechanism: token-mapping.json

The most significant governance outcome of the V0 spike is `token-mapping.json` — a governed mapping from every Figma collection path to its canonical `color.option.*` path.

### How it works

- Every Figma token path in every `options.color.*.json` file MUST have an entry in `token-mapping.json`
- Every alias reference in `alias.color.*.json` MUST reference a mapped collection
- The build **throws immediately** with a specific error if either condition fails

This means governance is enforced automatically at build time, not through manual review of `diff.json`.

### Example build error

```
[token-mapping] Unknown Figma token path "neutral-palette.warm-warm.100"
(from platform "web-light"). Add an entry to token-mapping.json or rename
the Figma variable to match an existing entry.
```

### Governance implications

When a designer renames a Figma variable or group, the build fails with a message naming the exact path. Engineering and design must agree on the canonical name, update `token-mapping.json` in a PR, and the build passes again.

`token-mapping.json` MUST have required reviewers from both design and engineering (CODEOWNERS).

---

## Secondary Governance: Canonical Shape Validation

Every token in `canonical.json` is validated against these rules:

### Option tokens (`color.option.*`) are valid if:

- `$type` is `"color"`
- `$value` is a concrete hex string (`#RRGGBB` or `#RRGGBBAA`)
- `$extensions.cedar` (if present) contains only `appearances` and/or `platformOverrides`
- No `$resolved` key exists (deprecated)

### Alias tokens (`color.modes.*`) are valid if:

- `$type` is `"color"`
- `$value` is a DTCG alias reference (`{color.option.*}`)
- `$extensions.cedar.ios` and `$extensions.cedar.web` are present with `light` and `dark` keys
- All path strings in `$extensions.cedar` do NOT use brace syntax (SD resolves braces)
- No `$resolved` key exists (deprecated)

### A token is **invalid** if:

- `$value` is a platform-specific string (`UIColor(...)`, CSS `var(--...)`, etc.)
- `$value` contains an alias reference that doesn't resolve to a `color.option.*` path
- `$type` is anything other than `"color"` for color tokens
- `$extensions.cedar` contains a `$resolved` key (spike artifact, must not exist in V1)
- The canonical path contains hyphens or platform names in structural segments

---

## V0 Spike Governance Outcomes

### What was validated

| Question | Answer |
|---|---|
| Can build-fail enforce Figma naming governance? | ✓ Yes — `token-mapping.json` provides this |
| Can alias `$value` be a DTCG ref instead of hex? | ✓ Yes — validated end-to-end |
| Do platform values (iOS vs web) differ? | ✓ Yes — intentional, handled via `platformOverrides` |
| Can dark mode values be derived without Figma dark mode files? | ✓ Yes — via `$extensions.cedar.appearances.dark` on option tokens |

### What was NOT validated

- Naming grammar enforcement (no hyphens in canonical paths — partially enforced by token-mapping.json but not validated at runtime)
- Semantic grammar enforcement (token naming intent/family/variant rules)
- Alias cycle detection
- Multi-palette token inheritance validation

---

## Open Governance Questions Answered by Spike

**Q: Can Style Dictionary resolve platform overrides from metadata?**
Yes. Actions have access to `dictionary.tokens` and can resolve option token references, read `$extensions.cedar.platformOverrides`, and apply them at build time.

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
- `token-mapping.json` CODEOWNERS with required reviewers
- Breaking change detection and semantic versioning
