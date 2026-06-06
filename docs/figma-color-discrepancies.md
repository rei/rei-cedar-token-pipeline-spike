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

| Step | Current Hex | Current L | Formula L | Difference |
|------|-------------|-----------|-----------|------------|
| 600 | `#78AE7B` | 0.70 | 0.62 | +0.08 (too light) |
| 700 | `#57985D` | 0.62 | 0.54 | +0.08 (too light) |
| 800 | `#398141` | 0.54 | 0.46 | +0.08 (too light) |

**Action needed:** Either update the hex values to match the formula L values, or confirm the current hex values are intentional and the formula parameters need adjustment.

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
