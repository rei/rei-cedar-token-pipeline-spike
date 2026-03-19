# ADR‑0005 Addendum: Style Dictionary v5 Pipeline Constraints

## Status
Draft — Addendum to ADR‑0005

## Context

The spike validated the Transform Layer architecture against Style Dictionary v5.3.3. Several constraints were discovered that are not documented in the base ADR-0005. This addendum records them as hard architectural constraints that any future pipeline work must account for.

---

## Constraint 1: SD v5 resolves `{ref}` syntax everywhere in a token

SD v5 resolves all DTCG alias references (`{path.to.token}`) it finds **anywhere in a token object**, including inside `$extensions`. This means any string value stored in `$extensions.cedar` that uses brace syntax will be replaced with the resolved hex value before transforms or actions run.

**Impact:** Platform path references in `$extensions.cedar.ios/web` MUST be stored as plain dot-path strings without braces:

```json
// WRONG — SD resolves this to "#0b2d60" before the action reads it
"ios": { "light": "{color.option.brand.blue.600}" }

// CORRECT — SD ignores plain strings
"ios": { "light": "color.option.brand.blue.600" }
```

**Rule:** Any `$extensions.cedar` value intended for custom code consumption MUST NOT use `{ref}` brace syntax.

---

## Constraint 2: Value transforms only run for tokens in `files[]`

In SD v5, value transforms are only applied to tokens that flow through a file formatter in `files[]`. If `files: []` is set (no file output), value transforms **do not run** before actions execute.

**Impact:** For the iOS colorset output, `files: []` is intentional — we produce no text files, only the binary `.colorset` asset catalog via an action. Because of this constraint, the iOS action owns all value resolution (option reference → platform override → P3 conversion) directly, rather than relying on a value transform.

**Rule:** If a platform uses `files: []`, value transforms cannot be used for that platform's output. All value resolution must be performed inside the action.

---

## Constraint 3: Transform group name collision with SD built-ins

SD v5 ships with built-in transform groups including `ios`, `ios-swift`, `android`, `css`, `js`. Registering a custom transform group with the same name does not cleanly override the built-in — SD may apply its own group transforms (including `color/UIcolor` on iOS) which corrupt `$extensions` values.

**Rule:** All Cedar custom transform groups MUST use a namespaced name with the `cedar/` prefix:
- `cedar/ios` not `ios`
- `cedar/web` not `css`
- `cedar/android` not `android`

---

## Constraint 4: `dictionary.tokens` is available in actions

In SD v5, the `dictionary` object passed to actions contains:
- `dictionary.allTokens` — flat array of tokens that passed the platform filter (transformed)
- `dictionary.tokens` — the full nested token tree from the source JSON (not filtered)

Option tokens (`color.option.*`) are not included in `allTokens` because the platform filter selects only `color.modes.default.*` tokens. However, they ARE present in `dictionary.tokens` and can be accessed via path navigation.

**Rule:** Actions that need to resolve option token values must use `dictionary.tokens` with explicit dot-path navigation, not `dictionary.allTokens`.

---

## Constraint 5: `$extensions` is preserved but non-spec keys are stripped

SD v5 preserves `$extensions` through the pipeline because it is a DTCG-spec key. However, any other non-spec top-level keys on a token (e.g. a custom `$meta` or `$resolved`) are stripped during SD's token parsing phase.

**Rule:** All Cedar metadata MUST live inside `$extensions.cedar`. Nothing at the top level of a token beyond `$type`, `$value`, `$description`, and `$extensions` will survive SD's pipeline.

---

## Architecture Pattern: Action-Owns-Resolution

The combination of constraints 1, 2, and 4 produces a consistent pattern for native platform outputs:

```
canonical/tokens.json
  ↓ SD parses tokens, resolves $value aliases natively
  ↓ name/cedar-ios transform: produces token.name (camelCase)
  ↓ Action runs with dictionary access:
      1. Read $extensions.cedar.ios.light/dark (plain path strings)
      2. Navigate dictionary.tokens to find option token
      3. Call resolveOptionHex(optionNode, 'ios', 'light'|'dark')
      4. Write platform-specific output file
```

This is the only reliable pattern for native outputs in SD v5 when:
- The output is not a text file (colorsets, XML, etc.)
- Values require platform-specific resolution
- The resolution chain involves `$extensions` data

---

## Related Documents

- ADR‑0001: Canonical Token Model (SD pipeline constraint documented there)
- ADR‑0005: Transform Layer & Platform Outputs (base document)
