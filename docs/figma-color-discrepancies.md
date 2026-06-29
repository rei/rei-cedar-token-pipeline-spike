# Figma Color Variable Discrepancies

## Overview

Our color system uses a mathematical formula to generate color palettes. The Figma color variables should match the formula output, but we found some discrepancies where the hex values don't align with the computed OKLCH values.

This document lists the specific issues for the design team to review.

---

## What's the Formula?

The Cedar color system uses a parabolic chroma curve formula:

```
C(L) = Cmin + (Cmax - Cmin) × (1 - ((L - Lo) / W)²)
```

Where:
- **L** = Lightness (0–1)
- **C(L)** = Chroma at that lightness
- **Cmax** = Peak chroma (brightest color)
- **Lo** = Lightness level at peak chroma
- **W** = Width of the curve (different for light vs dark side)
- **Cmin** = Minimum chroma (floor)

Each color family has its own parameters (hue, Cmax, Lo, Wlight, Wdark, Cmin).

---

## The Issue

When we convert the Figma hex values to OKLCH, they don't match the formula output. This means either:

1. **The hex values were entered incorrectly** (copy-paste errors, typos)
2. **The formula parameters need adjustment** (if the current hex values are intentional)

---

## Discrepancies Found

### 1. success-green (Steps 600, 700, 800)

The lightness values are shifted by 1 step. The current hex values are too light.

**Status:** ios-light has been updated with correct values as a preview. Full fix (all modes) pending design validation (Monday).

| Step | Current Hex (web-light) | Current L | Formula L | Correct Hex | Difference |
|------|------------------------|-----------|-----------|-------------|------------|
| 600 | `#78AE7B` | 0.70 | 0.62 | `#57985D` | +0.08 (too light) |
| 700 | `#57985D` | 0.62 | 0.54 | `#398141` | +0.08 (too light) |
| 800 | `#398141` | 0.54 | 0.48 | `#296E32` | +0.06 (too light) |
| 900 | `#27682F` | 0.46 | 0.46 | `#27682F` | ✓ correct |

**Note:** The spec document had a copy-paste error where steps 800 and 900 both showed `oklch(0.46 0.110 146)`. Step 800 should have L=0.48 (interpolated between 700's 0.54 and 900's 0.46).

**Action needed:** After design validates the preview values on Monday, update the Figma variables for all modes (web-light, web-dark, ios-dark) with the correct hex values.

---

### 2. warning-yellow (Steps 900, 1000, 1100)

The chroma values are lower than the formula output.

| Step | Current Hex | Current C | Formula C | Difference |
|------|-------------|-----------|-----------|------------|
| 900 | `#9D5F00` | 0.120 | 0.140 | -0.020 (too low) |
| 1000 | `#774600` | 0.099 | 0.121 | -0.022 (too low) |
| 1100 | `#502C00` | 0.075 | 0.094 | -0.019 (too low) |

**Action needed:** Either update the hex values to match the formula C values, or confirm the current hex values are intentional and the formula parameters need adjustment.

---

## How to Verify

If you want to see the formula output for any color family, the parameters are in:
`style-dictionary/actions/web/oklch-formulas.ts`

The current parameters for success-green and warning-yellow are:

```typescript
"success-green": {
  hue: 146,
  cmax: 0.12,
  lo: 0.54,
  wlight: 0.65,
  clightMin: 0.015,
  wdark: 0.30,
  cdarkMin: 0.005,
},
"warning-yellow": {
  hue: 73,
  cmax: 0.15,
  lo: 0.62,
  wlight: 0.37,
  clightMin: 0.015,
  wdark: 0.25,
  cdarkMin: 0.05,
},
```

---

## Next Steps

1. **Review the discrepancies above** — Are the current hex values intentional, or should they match the formula?
2. **If formula is correct:** Update the Figma variables with the correct hex values, then re-sync.
3. **If hex values are correct:** Let us know which formula parameters need adjustment (Cmax, Lo, W, etc.).

Once you've made updates in Figma, run the sync command and the validation test will confirm everything aligns.

---

## Latest Design Parameters (June 2026)

Design has provided updated color family parameters for 16 families. The current spike implementation in `oklch-formulas.ts` uses outdated parameters and needs to be updated.

**Design Source:** See the token remap CSV at `/Users/mhewson/Downloads/cedar_token_remap_v3 - Color Token Remap.csv` for the complete dataset including OKLCH and HEX values for all 16 steps (000-1500) of each family.

### Updated Color Family Parameters

The following families have updated parameters from design:

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

**Note:** The "greyscale" family uses a different approach (achromatic, no hue/chroma). See the design dataset for specific values.

### New Families Added

The following families are new and need to be added to `COLOR_FAMILIES`:
- sage-green
- natural-grey
- membership-text
- lichen
- apex-moss
- golden-moss
- membership-yellow

### How to Update

1. **Open** `style-dictionary/actions/web/oklch-formulas.ts` in the spike
2. **Replace** the `COLOR_FAMILIES` constant with the updated parameters above
3. **Add** the 7 new families that don't exist yet
4. **Run** the test suite: `npm test style-dictionary/actions/web/oklch-formulas.test.ts`
5. **Validate** that the generated OKLCH values match the design dataset
6. **Coordinate** with design to confirm the math produces expected color outputs

See [culori-overrides.md](../architecture/docs/culori-overrides.md) for detailed implementation guidance and [color-gamut-mapping.md](../architecture/docs/color-gamut-mapping.md) for color space context.
