# ADR-0011: Hybrid Alias Resolution (`$extensions.cedar.resolved`)

- Status: Accepted
- Date: 2026-03-19

## Context

The current pipeline keeps semantic alias tokens as references to option tokens (`$value: "{color.option.*}"`) and resolves final platform/appearance values inside Style Dictionary actions.

This works, but action-time dictionary traversal increases complexity and can be sensitive to build-time ordering. We also need stronger guarantees that refactors do not silently break when Figma naming, collections, or mode files change.

## Decision

Adopt a hybrid model for semantic color aliases:

1. Keep alias `$value` references unchanged (`{color.option.*}`) as the canonical source of truth.
2. Continue writing platform reference paths in `$extensions.cedar.<platform>.<appearance>`.
3. Add pre-resolved values in `$extensions.cedar.resolved.<platform>.<appearance>` during normalization.
4. Add normalization input validation that compares imported files against the Figma Input Contract and fails on clear contract mismatches.

Example shape:

```json
{
  "$value": "{color.option.brand.blue.400}",
  "$type": "color",
  "$extensions": {
    "cedar": {
      "ios": { "light": "color.option.brand.blue.400", "dark": "color.option.brand.blue.400" },
      "web": { "light": "color.option.brand.blue.400", "dark": "color.option.brand.blue.400" },
      "resolved": {
        "ios": { "light": "#0a84ff", "dark": "#0040dd" },
        "web": { "light": "#406eb5", "dark": "#0b2d60" }
      }
    }
  }
}
```

## Consequences

### Positive

- Preserves primitive-to-alias linkage and token semantics.
- Gives transforms/actions a deterministic value source without mandatory dictionary traversal.
- Improves debuggability and snapshot testing of canonical data.
- Reduces silent failures by validating imported Figma data against schema mapping.

### Tradeoffs

- Duplicates data (reference plus resolved values).
- Requires normalization rerun after upstream token changes to refresh resolved values.

## Guardrails

- Alias `$value` references MUST remain references; do not replace with static literals.
- `resolved` is additive and optional for consumers.
- Consumers SHOULD prefer `resolved` when present and fallback to existing lookup logic.
