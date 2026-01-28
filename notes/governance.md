# Governance Notes — V0 Spike

This document captures **manual governance validation** performed during the Cedar token pipeline V0 spike.  
Governance rules are applied **before Style Dictionary consumption** to prevent invalid or malformed tokens from reaching downstream platforms.

V0 uses a **single governance rule** derived from ADR‑0001 (Canonical Token Model).  
Future versions will expand governance coverage and automate enforcement.

---

# V0 Governance Rule

## Canonical Shape Validation (V0‑Only)

Every token must conform to the **V0 canonical model**, which supports:

- color tokens only  
- single mode (light)  
- structured color values (`"#RRGGBB"` or RGBA objects)  
- alias references using DTCG syntax  
- `$extensions.cedar` metadata  

### A token is **valid** in V0 if:

- `$type` is `"color"`
- `$value` is a valid color (hex or RGBA object)
- `$extensions.cedar` (if present) is an object
- the canonical path is unique
- the token is valid JSON

### A token is **invalid** in V0 if:

- `$type` is anything other than `"color"`
- `$value` is a platform‑specific string (e.g., `"UIColor(...)"`)
- `$value` is an invalid color format
- the token introduces duplicate canonical paths
- the token contains malformed JSON

> **Important:**  
> V0 does *not* enforce naming grammar, semantic grammar, tier rules, or platform‑agnostic naming.  
> These responsibilities begin in **V1**.

---

# Validation Process

### 1. Start with `diff.json`
Identify added, modified, and removed tokens.

### 2. Apply V0 canonical shape validation
Check:

- `$type`  
- `$value`  
- `$extensions.cedar`  
- uniqueness of canonical paths  
- JSON correctness  

### 3. Document outcomes
Record:

- approved tokens  
- rejected tokens  
- rationale for rejection  

---

# Governance Outcomes (Example)

## Approved Changes

| Token Name                     | Type   | Change Type | Notes                               |
|-------------------------------|--------|-------------|-------------------------------------|
| `options.color.warm.grey.600` | color  | Added       | Valid V0 canonical shape            |
| `color.action.accent`         | color  | Modified    | Alias preserved, valid structure    |

## Rejected Changes

| Token Name                     | Type   | Change Type | Rejection Reason                          |
|-------------------------------|--------|-------------|--------------------------------------------|
| `color.background.primary`    | color  | Added       | Invalid color format (`rgba(...)` string)  |
| `fontSize.body`               | size   | Added       | Invalid type for V0 (`size` not supported) |

---

# Notes

- Rejected tokens are excluded from `normalized.json`
- Governance validation occurs **before** Style Dictionary consumption
- No consumer breakage observed during V0
- V1 governance will include:
  - naming grammar enforcement  
  - semantic grammar enforcement  
  - token lifecycle rules  
  - platform compatibility checks  
  - automated enforcement  
  - sync‑back feedback loop to Figma  

---

# Next Steps

- Define V1 governance rules across all ADRs  
- Add automated governance validation in CI  
- Add semantic + naming grammar enforcement  
- Add multi‑mode governance  
- Add token lifecycle and versioning rules  
- Define governance feedback payload for Port A (sync‑back to Figma)  
