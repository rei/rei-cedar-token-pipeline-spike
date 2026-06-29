# Color Gamut Mapping and Cross-Platform Color Reproduction

## Overview

This document explains OKLCH to hex mapping, color gamut concepts, and how to determine when colors need to shift for different platforms (Display P3, CMYK, Android). It provides formulas and logic for understanding color space conversions and when variations are required.

---

## Color Spaces and Gamuts

### What is a Color Gamut?

A **color gamut** is the range of colors that can be displayed or reproduced by a device or color space. Different color spaces have different gamuts:

- **sRGB**: Standard web color space, ~35% of visible colors
- **Display P3**: Wider gamut used by Apple devices, ~50% of visible colors
- **CMYK**: Print color space, different gamut than RGB
- **Rec.2020**: Ultra-wide gamut, ~70% of visible colors

### OKLCH Color Space

**OKLCH** is a perceptually uniform color space designed for modern color workflows:

- **L**: Lightness (0–1), perceptually uniform
- **C**: Chroma (0–0.37), colorfulness/saturation
- **H**: Hue (0–360°), color family

**Advantages over HSL/RGB:**
- Perceptually uniform — equal numeric changes produce equal perceptual changes
- Better for color manipulation and interpolation
- Designed for wide-gamut workflows

---

## OKLCH ↔ Hex (sRGB) Conversion

### Hex to OKLCH

```javascript
import { converter } from 'culori';

const toOklch = converter('oklch');
const hex = '#57985D';
const oklch = toOklch(hex);

// Result: { mode: 'oklch', l: 0.5409, c: 0.1208, h: 145.8 }
```

### OKLCH to Hex

```javascript
import { converter, formatHex } from 'culori';

const toRgb = converter('rgb');
const oklch = { mode: 'oklch', l: 0.62, c: 0.11, h: 146 };
const hex = formatHex(toRgb(oklch));

// Result: '#57985D'
```

### When Conversion Shifts Colors

**Gamut clamping** occurs when converting from a wide gamut to a narrow one:

1. If an OKLCH color is outside sRGB gamut, it gets clamped to the nearest sRGB color
2. This can shift hue, reduce chroma, or change lightness
3. High-chroma colors (especially in reds, cyans, magentas) are most affected

**Example:**
```
OKLCH: l=0.5, c=0.25, h=320 (magenta) → outside sRGB gamut
Hex conversion: clamped to sRGB → c reduced to ~0.18, hue may shift
```

---

## Platform-Specific Color Requirements

### Display P3 (Apple Devices)

**When to use P3:**
- iOS apps targeting modern Apple devices
- macOS apps
- Safari on Apple devices

**Gamut relationship:**
- P3 is ~25% larger than sRGB
- Colors in sRGB are always in P3
- Colors in P3 may not be in sRGB

**When colors shift:**
- P3 colors with high chroma (C > ~0.15) may be outside sRGB
- When displayed on non-P3 displays, they get gamut-mapped to sRGB
- This can cause noticeable color differences

**Strategy:**
```javascript
// Determine if color needs P3 variant
function needsP3Variant(oklch) {
  // High chroma colors benefit from P3
  return oklch.c > 0.15;
}

// Generate P3 variant (no gamut clamping)
const toP3 = converter('p3');
const p3 = toP3(oklch);
```

**Token approach:**
- Store canonical OKLCH values
- Generate sRGB hex for web
- Generate P3 hex for iOS when chroma > threshold
- Fallback to sRGB hex for P3 if no variant needed

---

### CMYK (Print)

**When to use CMYK:**
- Print materials (brochures, packaging)
- Physical products
- Brand guidelines for print

**Gamut relationship:**
- CMYK gamut is different from RGB (not strictly smaller/larger)
- Some RGB colors cannot be reproduced in CMYK
- CMYK has limited ability to produce bright, saturated colors

**When colors shift:**
- Bright, saturated RGB colors often desaturate in CMYK
- Neons, bright blues/purples are problematic
- Very dark colors may lose detail

**Strategy:**
```javascript
// Determine if color needs CMYK variant
function needsCmykVariant(oklch) {
  // High chroma or very light/dark colors
  return oklch.c > 0.12 || oklch.l < 0.2 || oklch.l > 0.95;
}

// Convert to CMYK (using color management profile)
const cmyk = rgbToCmyk(toRgb(oklch), { profile: 'USWebCoatedSWOP' });
```

**Token approach:**
- Store canonical OKLCH values
- Generate CMYK values using ICC profile conversion
- Flag colors that have significant CMYK shifts
- Consider adjusting formula parameters for print-specific palettes

---

### Android

**When to use Android-specific variants:**
- Android apps targeting specific device capabilities
- When leveraging wide-gamut displays on high-end Android devices

**Gamut relationship:**
- Most Android devices use sRGB by default
- High-end devices support Display P3 or wider
- Android 12+ supports wide color via `ColorSpace`

**When colors shift:**
- Similar to P3: high-chroma colors benefit from wide gamut
- Legacy devices will gamut-map to sRGB
- Color management varies by Android version

**Strategy:**
```javascript
// Determine if color needs wide-gamut variant for Android
function needsWideGamutVariant(oklch) {
  return oklch.c > 0.15;
}

// Generate wide-gamut hex (P3 or Rec.2020)
const wideGamutHex = formatHex(toRgb(oklch, { space: 'p3' }));
```

**Token approach:**
- Store canonical OKLCH values
- Generate sRGB hex for baseline Android
- Generate P3 hex for wide-gamut Android (optional)
- Use Android's ColorSpace API for proper rendering

---

## Formulas for Determining Color Shifts

### Chroma Threshold for Gamut Clamping

A color will be gamut-clamped if its chroma exceeds the sRGB gamut at that lightness and hue.

**Approximate sRGB chroma limits by hue:**
```javascript
const SRGB_CHROMA_LIMITS = {
  red: 0.18,      // 0° ± 30°
  yellow: 0.20,   // 90° ± 30°
  green: 0.16,    // 150° ± 30°
  cyan: 0.18,     // 210° ± 30°
  blue: 0.20,     // 270° ± 30°
  magenta: 0.18,  // 330° ± 30°
};

function willBeGamutClamped(oklch) {
  const hueRange = getHueRange(oklch.h);
  const limit = SRGB_CHROMA_LIMITS[hueRange];
  return oklch.c > limit;
}
```

### Delta E for Color Difference

Use Delta E (CIEDE2000) to measure perceptual difference between color spaces:

```javascript
import { deltaE } from 'culori';

function colorDifference(color1, color2) {
  return deltaE(color1, color2);
}

// If deltaE > 2, the difference is perceptible
// If deltaE > 5, the difference is significant
```

**When to create variants:**
```javascript
function shouldCreateVariant(srgbColor, targetSpaceColor) {
  const diff = deltaE(srgbColor, targetSpaceColor);
  return diff > 2; // Perceptible difference
}
```

---

## Token Pipeline Strategy

### Canonical Storage

Store colors in OKLCH as the source of truth:

```json
{
  "color": {
    "option": {
      "success-green": {
        "600": {
          "$value": "oklch(0.62 0.11 146)",
          "$type": "color",
          "$extensions": {
            "cedar": {
              "colorFamily": "success-green"
            }
          }
        }
      }
    }
  }
}
```

### Platform-Specific Generation

Generate platform-specific values during build:

```javascript
// For web (sRGB)
const webHex = formatHex(toRgb(oklch));

// For iOS (P3 when beneficial)
const iosHex = needsP3Variant(oklch) 
  ? formatHex(toRgb(oklch, { space: 'p3' }))
  : webHex;

// For print (CMYK)
const cmyk = needsCmykVariant(oklch)
  ? rgbToCmyk(toRgb(oklch), profile)
  : null;
```

### Variant Decision Tree

```
┌─────────────────────────────────────┐
│  Canonical OKLCH color              │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
   Is C > 0.15?        Is C > 0.12?
        │                   │
   ┌────┴────┐        ┌────┴────┐
   │         │        │         │
  Yes       No       Yes       No
   │         │        │         │
   │         │        │    Use sRGB
   │         │        │    for all
   │         │        │
   │    Use sRGB   Generate
   │    for web    CMYK variant
   │                 for print
   │
Generate P3 variant
for iOS/Android
wide-gamut
```

---

## Practical Guidelines

### For Designers

1. **Work in a wide-gamut color space** (Display P3 or ProPhoto RGB) when possible
2. **Check gamut warnings** in design tools (Figma, Sketch, Adobe)
3. **Preview in sRGB** to understand how colors will appear on web
4. **Request print proofs** for critical brand colors

### For Developers

1. **Store canonical OKLCH values** in token system
2. **Generate platform-specific values** at build time
3. **Use color management** for accurate conversions
4. **Test on target devices** to verify color reproduction

### For the Token Pipeline

1. **Validate Figma hex values** against OKLCH formula (contract test)
2. **Flag high-chroma colors** that may need P3 variants
3. **Generate CMYK values** using ICC profiles for print
4. **Document color shifts** for transparency

---

## References

- [OKLCH Specification](https://bottosson.github.io/posts/oklab/)
- [Display P3 Color Space](https://developer.apple.com/documentation/coregraphics/cgcolorspace/1619564-displayp3)
- [CIEDE2000 Delta E](https://en.wikipedia.org/wiki/Color_difference#CIEDE2000)
- [sRGB vs P3 Gamut Comparison](https://blog.maximerouffy.com/posts/the-p3-color-space/)
- [CMYK Color Management](https://www.color.org/icc1.pdf)

---

## Latest Design Parameters Update (June 2026)

Design has provided updated color family parameters for 16 families. These parameters control the parabolic chroma formula used in the OKLCH override.

**Design Source:** See the token remap CSV at `/Users/mhewson/Downloads/cedar_token_remap_v3 - Color Token Remap.csv` for the complete dataset.

### Parameter Update Context

The spike's current `COLOR_FAMILIES` constant in `oklch-formulas.ts` uses outdated parameters. The new design parameters include:

- **7 new families**: sage-green, natural-grey, membership-text, lichen, apex-moss, golden-moss, membership-yellow
- **Updated parameters** for existing families (alpine-lake-blue, blue-spruce-green, success-green, warning-yellow, error-red, sale-red, warm-grey, info-blue)
- **16 total families** (up from 8 previously)

### Impact on Color Gamut

The updated parameters affect:
- **Chroma peaks (Cmax)**: Higher Cmax values mean more saturated colors at peak lightness
- **Lightness at peak (Lo)**: Determines where in the lightness scale the most saturated color appears
- **Curve width (Wlight/Wdark)**: Controls how quickly chroma fades as you move away from the peak
- **Chroma floors (Clight-min/Cdark-min)**: Minimum chroma at the extremes of the lightness scale

These parameters directly influence whether colors fall within sRGB gamut or require P3 variants. Higher Cmax values (e.g., lichen at 0.22, sale-red at 0.19) may push colors outside sRGB gamut, requiring P3 variants for iOS.

### How to Update

See [culori-overrides.md](./culori-overrides.md) for the complete parameter table and implementation steps. Briefly:

1. Update `COLOR_FAMILIES` in `style-dictionary/actions/web/oklch-formulas.ts`
2. Add the 7 new families
3. Run tests to validate
4. Verify generated OKLCH values match design dataset
