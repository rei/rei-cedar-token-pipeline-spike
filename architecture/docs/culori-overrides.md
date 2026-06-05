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
