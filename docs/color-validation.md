# Color Output Validation

## Purpose

The color validation suite compares generated Cedar color outputs against design reference values for every supplied family and step. It is an evergreen test: new rows added to the normalized CSV fixtures are automatically included in the report.

## Reference data

Raw Figma exports:

- `assets/color-family-parameters.csv`
- `assets/color-output-references.csv`

Normalized fixtures consumed by the test:

- `assets/normalized-color-family-parameters.csv`
- `assets/normalized-color-output-references.csv`

Run normalization after replacing the raw Figma exports:

```bash
pnpm colors:normalize
```

Normalization is intentionally structural. It canonicalizes family aliases, pads numeric steps, normalizes numeric formatting and hex casing, and derives the canonical token name. It does not silently correct a design value. The v1.8 OKLCH columns are authoritative; hex differences are reported in the per-step report but do not fail a row when the generated OKLCH is within tolerance. Invalid hex values and missing source tokens remain test failures for design review.

## Comparison method

The suite uses Culori's CIEDE2000 implementation (`differenceCiede2000`) through the local `deltaE` wrapper in `style-dictionary/validation/color-reference.ts`. The installed Culori version does not expose a function literally named `deltaE`; `differenceCiede2000` is the equivalent API.

Comparisons are performed in the relevant color representation:

- Web: generated OKLCH versus the CSV's expected OKLCH.
- iOS: generated Display P3 components versus CSV P3 components, when supplied.
- Android sRGB: generated sRGB color versus the CSV hex, when supplied.
- Android P3: generated Display P3 components versus CSV P3 components, when supplied.

The web comparison uses the serialized OKLCH precision emitted by the CSS transform. iOS P3 values use four decimal places for RGB and three for alpha, matching the colorset action.

## Tolerance thresholds

These are the initial platform defaults and should be reviewed with Design:

| Platform | Delta E method | Maximum Delta E | Rationale |
|---|---|---:|---|
| Web | CIEDE2000 | 1.0 | Allows the displayed design values' rounding while remaining near the just-noticeable range. |
| iOS | CIEDE2000 | 0.5 | iOS P3 components are emitted at four-decimal precision. |
| Android | CIEDE2000 | 1.0 | Allows sRGB quantization and platform-specific output rounding. |

Thresholds are code-level policy, not per-row design data. Any future exception should be reviewed explicitly and documented with a reason.

## Reports

Run only the validation suite:

```bash
pnpm test:color-validation
```

Run it as part of the complete Vitest suite:

```bash
pnpm test
```

The reporter includes:

- family and step
- PASS, FAIL, or ERROR status; `*` marks a non-authoritative hex display difference
- calculated Delta E for web rows
- per-family totals
- iOS and Android reference coverage

## Current reference coverage

The supplied v1.8 fixture contains 16 families and 290 color rows. The greyscale family is excluded because Design confirmed it is not part of v1.8. The fixture currently contains no iOS P3 or Android references, so those platforms are reported as unavailable rather than treated as passing.

The suite currently identifies issues that must be resolved before the full validation suite is green:

- Several high-step references do not have corresponding primitive source tokens in the repository.
- Some generated web OKLCH values exceed the provisional Delta E 1.0 threshold.
- Repository/Figma hex differences are retained as informational differences because the v1.8 OKLCH strings are the source of truth.

The formula parameters in `style-dictionary/actions/web/oklch-formulas.ts` are synchronized with the supplied family-parameter CSV. Any subsequent design change should update the CSV first, then run the validation suite to determine whether the formula or token source also needs to change.
