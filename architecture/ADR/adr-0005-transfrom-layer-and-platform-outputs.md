# ADR‑0005: Transform Layer & Platform Outputs

## Status  
Planned

## Context  
The Canonical Token Model (ADR‑0001) defines a governed, platform‑agnostic representation of design tokens. However, this canonical shape cannot be consumed directly by:

- web platforms (CSS, Sass, JS)  
- native platforms (iOS, Android, React Native)  
- design tools (Figma sync‑back)  

The Transform Layer is responsible for converting canonical tokens into platform‑specific formats while preserving semantic relationships, resolving aliases, and applying platform‑appropriate conventions.

This ADR defines how Style Dictionary and custom transforms convert canonical tokens into consumable platform outputs.

---

## Purpose  
The Transform Layer is responsible for:

- resolving alias references to final values  
- converting structured values to platform formats  
- applying platform naming conventions  
- generating theme/mode variants  
- producing optimized output artifacts  
- maintaining semantic metadata for tooling  

It is the **only** layer that generates platform‑specific code.

---

## Architecture Overview

```
Canonical Token Model (JSON)
        ↓
Style Dictionary Core
        ↓
    ┌───┴───┬───────┬─────────┐
    ↓       ↓       ↓         ↓
  CSS     iOS   Android   Figma JSON
```

---

## Alias → Canonical → Platform Flow

The Transform Layer does not operate directly on alias tokens. Instead, alias tokens are resolved during normalization (ADR‑0002) into canonical tokens (ADR‑0001). The Transform Layer consumes only canonical tokens and produces platform‑specific outputs.

Figma Variables (Alias Tokens)
        ↓  Normalization (ADR‑0002)
Canonical Token Model (ADR‑0001)
        ↓  Transform Layer (ADR‑0005)
Platform Outputs (CSS, iOS, Android, JS, Figma JSON)

Example Flow:

- **Alias Token (Figma):** `color.action.primary.accent`
- **Canonical Token (JSON):**
```json
{
  "$type": "color",
  "$value": "{options.color.blue.spruce.green.1000}"
}
```
- Platform Outputs: --cdr-color-action-primary-accent: #004D40;

----

## Transform Responsibilities

### 1. Alias Resolution

Canonical tokens preserve aliases:
```json
{
  "color": {
    "action": {
      "accent": {
        "$type": "color",
        "$value": "{options.color.blue.spruce.green.1000}"
      }
    }
  }
}
```

Style Dictionary resolves these to final values per platform:

**CSS:**
```css
--cdr-color-action-accent: #004D40;
```

**iOS:**
```swift
public static let colorActionAccent = Color(hex: "004D40")
```

**Android:**
```xml
<color name="cdr_color_action_accent">#004D40</color>
```

### 2. Naming Convention Transformation

Canonical uses dot notation. Platforms use their conventions:

| Canonical | CSS | iOS | Android |
|-----------|-----|-----|---------|
| `color.action.accent` | `--cdr-color-action-accent` | `colorActionAccent` | `cdr_color_action_accent` |
| `spacing.scale.200` | `--cdr-spacing-scale-200` | `spacingScale200` | `cdr_spacing_scale_200` |
| `typography.heading.large` | `--cdr-typography-heading-large-*` | `typographyHeadingLarge` | `cdr_typography_heading_large_*` |

### 3. Value Format Transformation

#### Color Transforms

**Canonical:**
```json
{
  "$type": "color",
  "$value": { "r": 255, "g": 255, "b": 255, "a": 1 }
}
```

**Platform Outputs:**

**CSS:**
```css
--cdr-color-value: rgba(255, 255, 255, 1);
```

**iOS (UIKit):**
```swift
UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0)
```

**Android:**
```xml
<color name="cdr_color_value">#FFFFFFFF</color>
```

#### P3 Color Transforms

**Canonical:**
```json
{
  "$type": "color",
  "$value": { 
    "space": "display-p3", 
    "r": 1.0, 
    "g": 0.5, 
    "b": 0.0 
  }
}
```

**Platform Outputs:**

**CSS:**
```css
--cdr-color-value: color(display-p3 1.0 0.5 0.0);
```

**iOS (SwiftUI):**
```swift
Color(.displayP3, red: 1.0, green: 0.5, blue: 0.0)
```

**Android (fallback to sRGB):**
```xml
<!-- P3 converted to nearest sRGB equivalent -->
<color name="cdr_color_value">#FF7F00</color>
```

#### Dimension Transforms

**Canonical:**
```json
{
  "$type": "dimension",
  "$value": { "value": 16, "unit": "px" }
}
```

**Platform Outputs:**

**CSS:**
```css
--cdr-spacing-value: 16px;
```

**iOS:**
```swift
public static let spacingValue: CGFloat = 16.0
```

**Android:**
```xml
<dimen name="cdr_spacing_value">16dp</dimen>
```

#### Fluid Dimension Transforms

**Canonical:**
```json
{
  "$type": "dimension",
  "$value": {
    "min": { "value": 0.2, "unit": "rem" },
    "ideal": { "value": 0.2, "unit": "rem", "scale": { "value": 0.11, "unit": "cqi" } },
    "max": { "value": 0.3, "unit": "rem" }
  }
}
```

**CSS:**
```css
--cdr-spacing-fluid-0: clamp(0.2rem, 0.2rem + 0.11cqi, 0.3rem);
```

**iOS/Android:**
```swift
// Fluid spacing not supported - use min value
public static let spacingFluid0: CGFloat = 3.2 // 0.2rem * 16
```

### 4. Composite Token Transforms

#### Typography

**Canonical:**
```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "{font.family.brand}",
    "fontWeight": 500,
    "fontSize": { "value": 16, "unit": "px" },
    "lineHeight": { "value": 24, "unit": "px" },
    "letterSpacing": { "value": -0.2, "unit": "px" }
  }
}
```

**CSS (multiple properties):**
```css
--cdr-typography-heading-large-font-family: "Proxima Nova", system-ui, sans-serif;
--cdr-typography-heading-large-font-weight: 500;
--cdr-typography-heading-large-font-size: 16px;
--cdr-typography-heading-large-line-height: 24px;
--cdr-typography-heading-large-letter-spacing: -0.2px;
```

**iOS:**
```swift
public struct TypographyHeadingLarge {
    public static let fontFamily = "ProximaNova-Medium"
    public static let fontSize: CGFloat = 16.0
    public static let lineHeight: CGFloat = 24.0
    public static let letterSpacing: CGFloat = -0.2
}
```

**Android:**
```xml
<style name="CdrTypographyHeadingLarge">
    <item name="android:fontFamily">@font/proxima_nova_medium</item>
    <item name="android:textSize">16sp</item>
    <item name="android:lineHeight">24sp</item>
    <item name="android:letterSpacing">-0.0125</item>
</style>
```

#### Shadow

**Canonical:**
```json
{
  "$type": "shadow",
  "$value": [
    {
      "color": "{color.shadow.ambient}",
      "offsetX": { "value": 0, "unit": "px" },
      "offsetY": { "value": 2, "unit": "px" },
      "blur": { "value": 4, "unit": "px" },
      "spread": { "value": 0, "unit": "px" }
    }
  ]
}
```

**CSS:**
```css
--cdr-shadow-elevation-1: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
```

**iOS:**
```swift
public struct ShadowElevation1 {
    public static let color = UIColor(white: 0, alpha: 0.1)
    public static let offset = CGSize(width: 0, height: 2)
    public static let blur: CGFloat = 4.0
    public static let spread: CGFloat = 0.0
}
```

**Android:**
```xml
<!-- Android uses elevation, not box-shadow -->
<dimen name="cdr_shadow_elevation_1">2dp</dimen>
```

---

## Mode & Theme Handling

### Strategy: Separate Output Files Per Mode

Canonical tokens store mode information in `$extensions.cedar.modes`:

```json
{
  "color": {
    "surface": {
      "base": {
        "$type": "color",
        "$value": "{options.color.neutral.0}",
        "$extensions": {
          "cedar": {
            "modes": {
              "light": "{options.color.neutral.0}",
              "dark": "{options.color.neutral.900}"
            }
          }
        }
      }
    }
  }
}
```

Style Dictionary generates separate files per mode:

**Output Structure:**
```
dist/
  css/
    light.css
    dark.css
  ios/
    ColorTokens+Light.swift
    ColorTokens+Dark.swift
  android/
    colors-light.xml
    colors-dark.xml
```

**CSS Light Mode:**
```css
:root {
  --cdr-color-surface-base: #FFFFFF;
}
```

**CSS Dark Mode:**
```css
:root {
  --cdr-color-surface-base: #000000;
}
```

### Mode Selection

**Web (CSS):**
Uses media query or data attribute:
```css
@media (prefers-color-scheme: dark) {
  @import 'dark.css';
}

/* OR */

[data-theme="dark"] {
  @import 'dark.css';
}
```

**iOS:**
```swift
if traitCollection.userInterfaceStyle == .dark {
    ColorTokens.Dark.colorSurfaceBase
} else {
    ColorTokens.Light.colorSurfaceBase
}
```

**Android:**
```xml
<!-- res/values/colors.xml (light mode) -->
<color name="cdr_color_surface_base">#FFFFFF</color>

<!-- res/values-night/colors.xml (dark mode) -->
<color name="cdr_color_surface_base">#000000</color>
```

---

## State Handling

### Approach: Explicit State Tokens (V0)

For V0, states are **explicit semantic tokens**, not computed overlays.

**Canonical:**
```json
{
  "color": {
    "action": {
      "accent": {
        "$type": "color",
        "$value": "{options.color.blue.spruce.green.1000}"
      },
      "accent": {
        "hover": {
          "$type": "color",
          "$value": "{options.color.blue.spruce.green.900}"
        }
      }
    }
  }
}
```

**CSS:**
```css
--cdr-color-action-accent: #004D40;
--cdr-color-action-accent-hover: #00695C;
```

**Usage:**
```css
.button {
  background: var(--cdr-color-action-accent);
}

.button:hover {
  background: var(--cdr-color-action-accent-hover);
}
```

### Future: Overlay System (V1+)

A future Material-style overlay system would work like this:

**Canonical (semantic + state layer):**
```json
{
  "color": {
    "action": {
      "accent": {
        "$type": "color",
        "$value": "{options.color.blue.spruce.green.1000}"
      }
    }
  },
  "state": {
    "hover": {
      "opacity": {
        "$type": "number",
        "$value": 0.08
      }
    }
  }
}
```

**CSS (computed at runtime or build):**
```css
--cdr-color-action-accent: #004D40;
--cdr-state-hover-opacity: 0.08;

.button {
  background: var(--cdr-color-action-accent);
}

.button:hover {
  /* Overlay white or black based on background luminance */
  background: color-mix(
    in srgb, 
    var(--cdr-color-action-accent), 
    var(--cdr-state-layer-hover) var(--cdr-state-hover-opacity)
  );
}
```

This approach is out of scope for V0 but the architecture supports it.

---

## Style Dictionary Configuration

### Build Process

```javascript
// style-dictionary.config.js
const StyleDictionary = require('style-dictionary');

module.exports = {
  source: ['canonical-tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios/',
      files: [{
        destination: 'ColorTokens.swift',
        format: 'ios-swift/class.swift',
        className: 'ColorTokens',
        filter: {
          attributes: {
            category: 'color'
          }
        }
      }]
    }
  }
};
```

### Custom Transforms

**Structured Dimension Transform:**
```javascript
StyleDictionary.registerTransform({
  name: 'dimension/structured',
  type: 'value',
  matcher: (token) => token.$type === 'dimension',
  transformer: (token) => {
    const { value, unit } = token.$value;
    return `${value}${unit}`;
  }
});
```

**P3 Color Transform:**
```javascript
StyleDictionary.registerTransform({
  name: 'color/p3-css',
  type: 'value',
  matcher: (token) => token.$type === 'color' && token.$value.space === 'display-p3',
  transformer: (token) => {
    const { r, g, b } = token.$value;
    return `color(display-p3 ${r} ${g} ${b})`;
  }
});
```

**Typography Composite Transform:**
```javascript
StyleDictionary.registerTransform({
  name: 'typography/css-props',
  type: 'value',
  matcher: (token) => token.$type === 'typography',
  transformer: (token, options) => {
    // Expand composite token into multiple CSS custom properties
    // This happens in the format, not the transform
    return token.$value;
  }
});
```

---

## Platform Output Formats

### CSS Variables
- **Format:** Custom properties with `--cdr-` prefix  
- **File:** `tokens.css` (or per-mode files)  
- **Usage:** Direct in stylesheets  

### Sass Variables
- **Format:** Sass variables with `$cdr-` prefix  
- **File:** `_tokens.scss`  
- **Usage:** Import in Sass files  

### JavaScript/TypeScript
- **Format:** ES modules with named exports  
- **File:** `tokens.js` / `tokens.d.ts`  
- **Usage:** Import in JS/TS applications  

### iOS Swift
- **Format:** Swift structs with static properties  
- **File:** `ColorTokens.swift`, `SpacingTokens.swift`  
- **Usage:** Import in Swift code  

### Android XML
- **Format:** XML resources  
- **File:** `colors.xml`, `dimens.xml`, `styles.xml`  
- **Usage:** Reference via `@color/` 

### Figma JSON (for sync-back)
- **Format:** Figma Variables API shape  
- **File:** `figma-variables.json`  
- **Usage:** POST to Figma API  


### Output Grouping & File Splitting

To improve clarity, bundle size, and platform ergonomics, the Transform Layer emits grouped output files per token category.

Example: 
`dist/css/color.css`

- Enables tree‑shaking and selective imports  
- Reduces bundle size for web and native  
- Mirrors the canonical token categories  
- Improves developer discoverability  
- Supports future per‑component bundles (V1+)  

The Transform Layer is responsible for splitting output by category, but **not** for versioning or publishing these files.

---

## Validation & Quality Checks

The Transform Layer MUST validate:

- All aliases resolve successfully  
- No circular references  
- All required tokens are present  
- Platform-specific constraints are met (e.g., Android color format)  
- Output files are valid (parseable CSS, Swift, XML)  
- No duplicate token names within a platform  

Failed builds MUST:
- Report clear error messages  
- Indicate which token failed  
- Show the transformation step that failed  
- Block CI/CD pipeline  

---


## Output Artifacts

In addition to platform‑specific token files, the Transform Layer produces several cross‑platform artifacts that support developer tooling, type safety, and component integration.

### 1. Configuration Map

A machine‑readable index describing:

- token categories  
- token paths  
- platform output locations  
- mode/theme availability  
- token metadata (`$type`, `$extensions.cedar`)  

**Example:**
```json
{
  "color.action.accent": {
    "type": "color",
    "platform": {
      "css": "dist/css/color.css",
      "ios": "dist/ios/ColorTokens.swift",
      "android": "dist/android/colors.xml"
    }
  }
}
```

This enables:

- IDE autocomplete
- token usage tracking
- documentation generation
- static analysis

### 2. `@cedar/types` Package

The Transform Layer generates a TypeScript declaration package that provides:

- strongly typed token names
- token categories
- token value types
- mode‑aware token signatures

Example:
```ts
export type ColorToken =
  | "color.action.accent"
  | "color.surface.base"
  | "color.text.muted";

```

This ensures:

- type‑safe token usage in JS/TS
- consistent naming across platforms
- IDE autocomplete for token names


### 3. Component Prop Interfaces

For Cedar Vue components, the Transform Layer generates prop interfaces that map component props to semantic alias tokens.
Example:

```ts
export interface ButtonProps {
  backgroundColor?: "color.action.accent" | "color.surface.base";
  textColor?: "color.action.on.accent" | "color.text.base";
}
```

- design → dev parity
- type‑safe component theming
- consistent token usage across teams
- future theming support

These interfaces are published alongside the component library and consumed by downstream teams.

This enables:

## Non-Responsibilities

The Transform Layer does **not**:

- define token semantics (ADR-0004)  
- normalize Figma input (ADR-0002)  
- validate canonical structure (ADR-0001)  
- manage token versioning  
- publish packages to NPM  
- sync tokens back to Figma (future work)
- Versioning of platform outputs is handled outside the Transform Layer.  

---

## Future Considerations

- Computed state overlays (Material-style)  
- Runtime token switching  
- Per-component token bundles (tree-shaking)  
- Multi-brand token variants  
- Animated token transitions  
- A11y contrast validation  
- Token usage tracking  

---

## Related Documents

- ADR-0001: Canonical Token Model  
- ADR-0002: Normalization Layer  
- ADR-0004: Semantic Token Architecture  
- Style Dictionary Documentation  
- DTCG Specification