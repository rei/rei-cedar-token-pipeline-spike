# Culori Overrides

## Overview

Cedar uses the [culori](https://culorijs.org/) library for accurate color space conversions in the token pipeline. However, Cedar's design system specifies custom color formulas that override culori's default conversions to match design intent.

This document captures:
- Why we override culori's default conversions
- Custom formulas implemented
- Design spec parameters
- Future extension points for additional color space overrides

---

## OKLCH Override (Web Platform)

### Why Override?

Culori's default sRGB → OKLCH conversion produces mathematically correct color space conversions, but Cedar's design system specifies custom chroma curves for perceptual alignment with brand requirements. Rather than using culori's chroma, the pipeline applies a parabolic chroma formula with per-family parameters while using culori's lightness (derived from the hex value).

### Implementation

**File:** `style-dictionary/actions/web/oklch-formulas.ts`

#### Resolution Tiers

The function `hexToCustomOklch(hex, colorFamily?)` resolves OKLCH values as follows:

1. **Custom formula path:** When `colorFamily` is provided and found in `COLOR_FAMILIES` → uses culori’s hex→L plus the parabolic chroma formula with the family’s fixed hue.

2. **Warning + fallback:** When `colorFamily` is provided but NOT found in `COLOR_FAMILIES` → logs a warning (so missing families surface during builds) and falls back to culori’s default OKLCH conversion.

3. **Culori passthrough:** When `colorFamily` is omitted (e.g., Storybook preview of arbitrary colors) → culori’s default OKLCH conversion with no custom chroma.

#### Parabolic Chroma Formula

```
C(L) = Cmin + (Cmax - Cmin) * (1 - ((L - Lo) / W)^2)
```

Where:
- `L`: Lightness (0-1 in formula, 0-100 in OKLCH)
- `C(L)`: Chroma at lightness L
- `Cmax`: Chroma Peak
- `Lo`: Lightness level at Chroma Peak
- `W`: Width of curve (Wlight for L ≥ Lo, Wdark for L ≤ Lo)
- `Cmin`: Chroma floor (Clight-min for light side, Cdark-min for dark side)
- `Lmax`: 0.98
- `Lmin`: 0.20

#### Adding New Color Families

When designers add new palette families in Figma:

1. Add the collection entry to `src/schema/token-schema.json` with a `colorFamily` field
2. Add corresponding formula parameters to `COLOR_FAMILIES` in `oklch-formulas.ts`
3. The schema-driven test will automatically fail if step 2 is missing, surfacing the gap

### Color Families

| Family | Hue | Cmax | Lo | Wlight | Clight-min | Wdark | Cdark-min |
|--------|-----|------|----|--------|------------|-------|-----------|
| alpine-lake-blue | 259 | 0.13 | 0.55 | 0.65 | 0.025 | 0.30 | 0.0625 |
| info-blue | 200 | 0.08 | 0.60 | 0.45 | 0.0075 | 0.30 | 0.03 |
| blue-spruce-green | 166 | 0.10 | 0.71 | 0.265 | 0.01 | 0.43 | 0.04 |
| success-green | 146 | 0.12 | 0.54 | 0.65 | 0.015 | 0.30 | 0.005 |
| warm-grey | 82 | 0.0185 | 0.52 | 0.465 | 0.0015 | 0.335 | 0.005 |
| warning-yellow | 73 | 0.15 | 0.62 | 0.37 | 0.015 | 0.25 | 0.05 |
| error-red | 30 | 0.18 | 0.52 | 0.60 | 0.015 | 0.35 | 0.08 |
| sale-red | 34 | 0.19 | 0.55 | 0.42 | 0.015 | 0.325 | 0.09 |

### Color Family Resolution

Color families are resolved via `$extensions.cedar.colorFamily` on canonical option tokens, populated from `src/schema/token-schema.json` during normalization. Each collection entry in the schema can declare a `colorFamily` field:

```json
{
  "warm-grey": {
    "canonicalPrefix": "color.option.neutral",
    "colorFamily": "warm-grey",
    "tokens": { ... }
  }
}
```

The `colorFamily` is attached to each token's `$extensions.cedar` during normalization, then passed through to the web CSS transform and Storybook.

### Usage

**Web CSS Transform:** `style-dictionary/actions/web/web-css-transform.ts`

The transform extracts `colorFamily` from `$extensions.cedar.colorFamily` on the option token and passes it to `hexToCustomOklch`.

```typescript
import { hexToCustomOklch } from './oklch-formulas';

function formatOklch(hex: string, colorFamily?: string): string {
  return hexToCustomOklch(hex, colorFamily);
}
```

**Storybook:** `stories/lib/web-color-format.ts`

Storybook can optionally pass `colorFamily` for accurate preview, or omit it to fall back to culori’s default conversion.

```typescript
import { hexToCustomOklch } from "../../style-dictionary/actions/web/oklch-formulas";

export function toWebOklch(value: string): string {
  if (!isHexColor(value)) return value;
  return hexToCustomOklch(value);
}
```

### Output Format

Web CSS outputs both hex (fallback) and OKLCH (modern browsers):
```css
:root {
  --cdr-surface-raised: #edeae3;
  --cdr-surface-raised: oklch(93.744% 0.0048 82);
}
```

Lightness is derived from hex via culori. Chroma is computed from the parabolic formula using the family’s parameters. Hue is fixed per family.

### Testing

**File:** `style-dictionary/actions/web/oklch-formulas.test.ts`

The test suite is **schema-driven** and does not hardcode palette values:
1. **Formula math** — chroma peaks at Lo, stays within Cmin–Cmax bounds
2. **Determinism** — same hex + family always produces same output
3. **Schema coverage** — dynamically reads `token-schema.json` and verifies every declared `colorFamily` has a `COLOR_FAMILIES` entry (fails fast when new families are added to Figma but formula params are missing)
4. **Warning behavior** — unknown family logs a warning and falls back to culori
5. **Parameter ranges** — every `COLOR_FAMILIES` entry has valid hue, cmax, etc.

### Browser Support

- Chrome 111+
- Firefox 113+
- Safari 15.4+

---

## Display P3 Override (iOS Platform)

### Why Override?

Culori provides accurate sRGB → Display P3 conversion, which is used for iOS colorsets. No custom override is currently needed for Display P3.

### Implementation

**File:** `style-dictionary/actions/ios/ios-color-action.ts`

**Current approach:** Use culori's direct conversion
```typescript
import { converter, parse } from 'culori';

const toP3 = converter('p3');

function hexToP3Components(hex: string) {
  const parsed = parse(hex);
  const p3 = toP3(parsed);
  // Extract and format P3 RGB components
}
```

### Future Extension Point

If Cedar's design system specifies custom Display P3 conversion formulas in the future, they can be implemented here following the same pattern as the OKLCH override.

---

## Future Extension Points

### Potential Additional Overrides

1. **P3 for Web:** If web platforms add Display P3 support with custom requirements
2. **Rec.2020:** For wide-gamut displays with brand-specific requirements
3. **Custom Color Spaces:** Any future Cedar-specific color space definitions

### Pattern for Adding New Overrides

1. Create a new file in `style-dictionary/actions/web/` or `style-dictionary/actions/ios/`
2. Implement custom conversion function with design spec parameters
3. Add `colorFamily` entries to `src/schema/token-schema.json` if needed
4. Update the relevant transform action to use the custom function
5. Update this document with the new override details
6. Update relevant ADRs (ADR-0005 for transform layer, ADR-0009 for accessibility if contrast calculations affected)

---

## Related Documentation

- ADR-0005: Transform Layer & Platform Outputs
- ADR-0009: Accessibility Requirements
- Design Spec: OKLCH Lightness Curves (internal design documentation)

---

## Latest Design Parameters Update (June 2026)

Design has provided updated color family parameters for 16 families. The current `COLOR_FAMILIES` constant in `oklch-formulas.ts` needs to be updated with these new parameters.

**Design Source:** See the token remap CSV at `/Users/mhewson/Downloads/cedar_token_remap_v3 - Color Token Remap.csv` for the complete dataset including OKLCH and HEX values for all 16 steps (000-1500) of each family.

### Updated Color Family Parameters

The following table shows the complete updated parameter set:

| Family | Hue | Cmax | Lo | Wlight | Clight-min | Wdark | Cdark-min |
|--------|-----|------|----|--------|------------|-------|-----------|
| alpine-lake-blue | 259 | 0.13 | 0.55 | 0.65 | 0.025 | 0.30 | 0.0625 |
| blue-spruce-green | 166 | 0.10 | 0.71 | 0.265 | 0.01 | 0.43 | 0.04 |
| sage-green | 158 | 0.055 | 0.72 | 0.26 | 0.012 | 0.47 | 0.022 |
| natural-grey | 89 | 0.035 | 0.84 | 0.14 | 0.004 | 0.59 | 0.01 |
| warm-grey | 82 | 0.0185 | 0.52 | 0.465 | 0.0015 | 0.335 | 0.005 |
| sale-red | 39 | 0.19 | 0.55 | 0.44 | 0.015 | 0.315 | 0.045 |
| membership-text | 173 | 0.10 | 0.60 | 0.36 | 0.01 | 0.3433 | 0.03 |
| lichen | 120 | 0.22 | 0.71 | 0.1008 | 0.05 | 0.6292 | 0.05 |
| apex-moss | 116 | 0.20 | 0.76 | 0.2393 | 0.03 | 0.52 | 0.0625 |
| golden-moss | 104 | 0.1355 | 0.755 | 0.225 | 0.006 | 0.377 | 0.04 |
| membership-yellow | 95 | 0.20 | 0.86 | 0.12 | 0.0115 | 0.61 | 0.05 |
| info-blue | 200 | 0.0825 | 0.60 | 0.36 | 0.0075 | 0.30 | 0.03 |
| success-green | 146 | 0.1154 | 0.665 | 0.4097 | 0.015 | 0.3803 | 0.005 |
| warning-yellow | 92 | 0.155 | 0.53 | 0.33 | 0.012 | 0.29 | 0.04 |
| error-red | 30 | 0.185 | 0.46 | 0.46 | 0.015 | 0.2432 | 0.08 |
| greyscale | — | — | — | — | — | — | — |

**Note:** The "greyscale" family is achromatic (no hue/chroma). See the design dataset for specific step values if needed.

### Changes Summary

**New families to add:**
- sage-green (Hue: 158, Cmax: 0.055)
- natural-grey (Hue: 89, Cmax: 0.035)
- membership-text (Hue: 173, Cmax: 0.10)
- lichen (Hue: 120, Cmax: 0.22) - **high chroma**
- apex-moss (Hue: 116, Cmax: 0.20) - **high chroma**
- golden-moss (Hue: 104, Cmax: 0.1355)
- membership-yellow (Hue: 95, Cmax: 0.20) - **high chroma**

**Families with updated parameters:**
- success-green: Cmax 0.12 → 0.1154, Lo 0.54 → 0.665, Wlight 0.65 → 0.4097, Wdark 0.30 → 0.3803
- warning-yellow: Hue 73 → 92, Cmax 0.15 → 0.155, Lo 0.62 → 0.53, Wlight 0.37 → 0.33, Wdark 0.25 → 0.29
- error-red: Cmax 0.18 → 0.185, Lo 0.52 → 0.46, Wdark 0.35 → 0.2432, Cdark-min 0.08 → 0.08 (unchanged)
- sale-red: Hue 34 → 39, Wlight 0.42 → 0.44, Wdark 0.325 → 0.315, Cdark-min 0.09 → 0.045
- info-blue: Cmax 0.08 → 0.0825, Wlight 0.45 → 0.36, Wdark 0.30 → 0.30 (unchanged)
- warm-grey: No changes (parameters match)

### How to Update

**Step 1: Update COLOR_FAMILIES constant**

Open `style-dictionary/actions/web/oklch-formulas.ts` and replace the `COLOR_FAMILIES` constant with the updated parameters above.

```typescript
export const COLOR_FAMILIES: Record<string, ColorFamilyParams> = {
  "alpine-lake-blue": {
    hue: 259,
    cmax: 0.13,
    lo: 0.55,
    wlight: 0.65,
    clightMin: 0.025,
    wdark: 0.30,
    cdarkMin: 0.0625,
  },
  // ... add all 16 families from the table above
};
```

**Step 2: Add new families to token-schema.json**

For each new family, add an entry to `src/schema/token-schema.json`:

```json
{
  "sage-green": {
    "canonicalPrefix": "color.option.sage-green",
    "colorFamily": "sage-green",
    "tokens": { ... }
  }
}
```

**Step 3: Run tests**

```bash
npm test style-dictionary/actions/web/oklch-formulas.test.ts
```

The schema-driven test will automatically verify that every `colorFamily` in the schema has a corresponding `COLOR_FAMILIES` entry.

**Step 4: Validate output**

Generate tokens and verify that the OKLCH values match the design dataset:

```bash
npm run build
```

Check the output in `dist/themes/rei-dot-com/css/` to confirm the generated OKLCH values match the design's provided OKLCH values for each step.

**Step 5: Coordinate with design**

Share the generated output with design to validate that the math produces expected color outputs. If discrepancies exist, adjust parameters and repeat.

### See Also

- [Figma Color Discrepancies](../../docs/figma-color-discrepancies.md) - For tracking specific hex/OKLCH mismatches
- [Color Gamut Mapping](./color-gamut-mapping.md) - For context on color space conversions and platform requirements
- Story 0.6 in Token Pipeline Backlog - [token-pipeline-backlog.md](../../../../docs/token-pipeline-backlog.md)
