# ADR‑0002: Token Normalization Layer

## Status
Draft

---

## Context

The Figma export pipeline produces raw JSON files that reflect Figma's internal variable structure. These files are not suitable for direct consumption by Style Dictionary or platform SDKs because they:

- use hyphenated Figma group and collection names as path segments
- contain platform-specific copies of the same logical option tokens (four files: `web-light`, `web-dark`, `ios-light`, `ios-dark`)
- embed Figma metadata (`$extensions`, `$description`) that must be stripped
- reference option tokens by Figma collection path, not canonical `color.option.*` paths

The Normalization Layer transforms these raw inputs into the Canonical Token Model (ADR‑0001).

---

## Decision

The Normalization Layer is a TypeScript script (`normalize.ts`) that:

1. Reads `token-mapping.json` — the governed Figma Input Contract (ADR‑0003)
2. Processes option files via explicit path mapping (never string inference)
3. Produces a single `canonical.json` with the canonical structure
4. Fails loudly if any Figma token path is not declared in the mapping

---

## Pipeline Steps

### 1. Load token-mapping.json

`token-mapping.json` maps every Figma collection path to its canonical `color.option.*` path. The normalizer throws a build error if this file is missing.

### 2. Partition input files

Files are categorised by filename convention:

| Pattern | Category |
|---|---|
| `spacing.<bp>.json` | Fluid spacing breakpoint files |
| `options.color.<platform-appearance>.json` | Option color primitives (e.g. `web-light`) |
| `alias.color.<palette>.json` | Semantic alias tokens per palette |
| Other | Spacing alias, typography, etc. |

**The four-file convention is load-bearing.** The appearance dimension (light/dark) is encoded in the filename — there is no single Figma file that contains both appearances. The normalizer reconstructs the appearance dimension by comparing the four platform files. The following four files are required and governed:

| File | Platform | Appearance |
|---|---|---|
| `options.color.web-light.json` | web | light — canonical `$value` source |
| `options.color.web-dark.json` | web | dark |
| `options.color.ios-light.json` | ios | light |
| `options.color.ios-dark.json` | ios | dark |

If a new platform or appearance is added, the normalization layer MUST be updated to include it in `mergeColorVariants`. This requires an ADR amendment.

### 3. Fluid spacing

Per-breakpoint spacing files are combined using the `clamp()` formula to produce fluid `spacing.scale.*` tokens.

### 4. Option color files → `color.option`

Each `options.color.*.json` file is processed through `applyTokenMapping`:

- Every Figma token path is looked up in `token-mapping.json`
- If found, the token is written to its canonical `color.option.*` path
- If not found, the build **throws immediately** — this is the designer rename guard

The four platform files produce a **platformLookup table** mapping `"web-light"` → `{ "color.option.neutral.warm.grey.900": "#hex", ... }`.

The `web-light` snapshot is used as the authoritative `$value` source for `color.option`. The other three files contribute only to the lookup table.

**`color.primitives` is NOT written to `canonical.json`.** The four platform files are normalization input only.

### 5. Alias files

Alias files are cleaned (Figma metadata stripped) and alias references rewritten from Figma collection paths to canonical `color.option.*` paths using `token-mapping.json`. The clean step throws if an alias references an unmapped collection path.

Semantic tokens are nested under `color.modes.<palette>`.

### 6. Platform data and palette metadata (`mergeColorVariants`)

`mergeColorVariants` performs two jobs in a single pass:

**6a. Option token platform data**

Compares all four platform snapshots and writes appearance values and platform overrides onto each `color.option.*` token:

- `web-light.$value` → option token `$value` (canonical fallback)
- `web-dark` differs from `web-light` → write to `$extensions.cedar.appearances.dark`
- `ios-light` differs from `web-light` → write to `$extensions.cedar.platformOverrides.ios.light`
- `ios-dark` differs from `web-dark` → write to `$extensions.cedar.platformOverrides.ios.dark`

Only values that genuinely differ are written. Tokens identical across all four platforms have no `$extensions.cedar` at all.

**6b. Alias token platform references**

Walks every alias token under `color.modes.*` and writes `$extensions.cedar.ios/web` as plain dot-path strings pointing to the backing option token per platform and appearance.

These are stored **without braces** — SD v5 resolves any `{ref}` syntax in `$extensions`, which would replace the path string with a hex value before custom actions can read it.

**6c. Palette root `$meta`**

Stamps `$extensions.cedar.$meta` on each palette root so the CSS transform knows whether to emit `:root {}` or `[data-palette="x"] {}` selectors.

### 7. Output

`canonical.json` is written with the structure defined in ADR‑0001:

```
color.option.*  — option tokens with $value (web-light hex), $extensions.cedar.appearances, platformOverrides
color.modes.*   — alias tokens with $value (alias ref), $extensions.cedar.ios/web path references
spacing.*       — spacing tokens
```

`color.primitives` MUST NOT appear in the output.

---

## Governed Invariants

- `token-mapping.json` is required — missing file fails the build
- Any Figma token path not in `token-mapping.json` fails the build
- Any alias reference to an unmapped collection fails the build
- `color.primitives` MUST NOT appear in the canonical output
- Option tokens MUST have concrete `$value` (no aliases)
- Option tokens MUST NOT have `$resolved` — platform data lives in `$extensions.cedar`
- Alias tokens MUST have `$extensions.cedar.ios` and `$extensions.cedar.web` populated
- `$extensions.cedar` path strings MUST NOT use `{ref}` brace syntax (SD resolves them)

### Required CI Checks (V1)

- Build MUST fail if any Figma token path is unmapped
- CI MUST warn if `$extensions.cedar.appearances` or `platformOverrides` on option tokens are inconsistent with the current Figma platform files (staleness detection)
- `token-mapping.json` MUST require review from both design and engineering leads before merge

### `token-mapping.json` Governance

`token-mapping.json` is the formal boundary between design and engineering. Changes require:
- A PR with both a design approver and an engineering approver
- The build MUST fail before the PR if the mapping is inconsistent with the current Figma files
- CODEOWNERS MUST list both a design lead and an engineering lead as required reviewers

---

## Non-Responsibilities

The Normalization Layer does NOT:

- infer canonical paths from Figma names (all mappings are explicit)
- generate platform-specific output (handled by the Transform Layer, ADR‑0005)
- validate semantic token relationships (handled by ADR‑0004 rules)
- publish or version canonical.json

---

## Related Documents

- ADR‑0001: Canonical Token Model
- ADR‑0003: Figma Input Contract
- ADR‑0005: Transform Layer & Platform Outputs
