# Governance Notes — V0 Spike

This document captures manual governance validation performed during the Cedar token pipeline V0 spike.  
Governance rules are applied **before Style Dictionary consumption** to prevent invalid or breaking token changes from reaching consumers.

V0 uses a **single ADR rule** for manual validation.  
Future versions will expand governance coverage and automate enforcement.

---

## Governance Rule Applied

**ADR‑0001: Token Normalization and Shape Constraints**

- Tokens must conform to normalized shape:
  - `name` must follow platform‑agnostic naming convention
  - `value` must be type‑safe and mode‑aware
  - `type` must be one of: `color`, `typography`, `spacing`, `radii`, `opacity`
- Tokens must not introduce:
  - duplicate names
  - invalid types
  - platform‑specific overrides

---

## Validation Process

1. **Start with `diff.json`**
   - Identify added, modified, and removed tokens

2. **Apply ADR‑0001 manually**
   - Review each token against normalization rules
   - Flag violations

3. **Document outcomes**
   - Approved tokens
   - Rejected tokens
   - Notes on rejection rationale

---

## Governance Outcomes

### Approved Changes

| Token Name | Type | Change Type | Notes |
|------------|------|-------------|-------|
| `color.background.primary` | `color` | Added | Valid name, type, and value |
| `spacing.sm` | `spacing` | Modified | Value updated, shape preserved |

### Rejected Changes

| Token Name | Type | Change Type | Rejection Reason |
|------------|------|-------------|------------------|
| `bgPrimary` | `color` | Added | Invalid name format (not normalized) |
| `fontSize.body` | `size` | Added | Invalid type (`size` not in allowed list) |
| `color.background.primary.dark` | `color` | Added | Platform‑specific override not allowed in V0 |

---

## 📌 Notes

- Rejected tokens were excluded from `normalized.json`
- Governance validation occurred **before SD consumption**
- No consumer breakage observed
- Future governance will include:
  - multiple ADR rules
  - automated enforcement
  - sync‑back feedback loop

---

## Next Steps

- Expand governance coverage to include:
  - token lifecycle rules
  - platform compatibility checks
  - semantic versioning
- Define governance feedback payload for future Port A (sync‑back to Figma)
- Document governance rules in a shared ADR index

