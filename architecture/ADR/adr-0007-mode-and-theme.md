# ADR-0007: Modes and Palettes

## Status
Proposed (V1)

## Context

Cedar's design system must support multiple dimensions of variability:

- **Multi-platform**: Web, iOS, Android
- **Multi-mode**: Light, Dark, High Contrast
- **Multi-palette**: Default, Sale, Member, Holiday
- **Multi-surface**: Cards, tiles, modules, pages

However, each platform has significant constraints:

- Figma supports only a single mode axis
- Figma cannot represent surface-scoped palette modules
- Sass, iOS, and Android do not support dynamic variable composition
- Only Web runtime supports dynamic palette switching via CSS custom properties

This ADR defines Cedar's mode architecture, palette architecture, and cross-platform strategy.

---

## Decision

Cedar adopts a separation of concerns approach:

1. **Environmental modes** as the single Figma mode axis
2. **Platform differences** as canonical model metadata
3. **Palettes** as surface-scoped semantic mappings
4. **Platform-specific palette implementations** (dynamic Web, static Native)

---

## 1. Mode Architecture

### Figma Mode Set

Cedar defines three environmental modes:

- `light`
- `dark`
- `high-contrast`

### What Modes Represent

Modes represent environmental context, not platform or palette differences.

**Modes may vary:**
- Color values
- Typography values
- Elevation values
- Spacing
- Border radius

**Modes must NOT vary:**
- Token names
- Semantic roles
- Token tiers
- Platform-specific values

---

## 2. Platform Differences

### Platform as Metadata, Not Modes

Platform-specific values are stored in the canonical model under `$extensions.cedar.platformOverrides`:

```json
{
  "font": {
    "body": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{font.family.primary}",
        "fontSize": { "value": 16, "unit": "px" }
      },
      "$extensions": {
        "cedar": {
          "platformOverrides": {
            "ios": {
              "fontFamily": "SF Pro Text"
            },
            "web": {
              "fontFamily": "Inter"
            },
            "android": {
              "fontFamily": "Roboto"
            }
          }
        }
      }
    }
  }
}
```

### Platform Resolution

Style Dictionary resolves platform values:

1. Read the token's base `$value`
2. Check for platform override in `$extensions.cedar.platformOverrides[platform]`
3. Use override if present, otherwise use base value
4. Apply platform-specific transforms (naming, units, formats)

### Why Platform is Not a Mode

- Platform differences are the exception, not the rule
- Most tokens are platform-agnostic
- Platform differences are overrides to shared semantics
- Treating platforms as modes would create 9 modes (3 environments × 3 platforms)
- Modes in Figma are one-dimensional and cannot represent platform × environment

---

## 3. Palette Architecture

### Palettes are Surface-Scoped

**Critical distinction:**

A **palette** affects a single surface (card, tile, module), not an entire page or application.

Multiple palettes can exist on the same page simultaneously:

```html
<page theme="light">
  <card palette="default">...</card>
  <card palette="sale">...</card>
  <card palette="member">...</card>
</page>
```

This surface-scoped behavior is why palettes cannot be represented as Figma modes.

### Palette Definition

Palettes are defined in the canonical model as semantic mappings:

```json
{
  "palettes": {
    "default": {
      "color.surface.base": "{options.color.neutral.0}",
      "color.surface.accent": "{options.color.blue.600}",
      "color.surface.muted": "{options.color.neutral.100}",
      "color.text.base": "{options.color.neutral.900}",
      "color.text.accent": "{options.color.blue.700}"
    },
    "sale": {
      "color.surface.base": "{options.color.red.50}",
      "color.surface.accent": "{options.color.red.700}"
    },
    "member": {
      "color.surface.base": "{options.color.purple.50}",
      "color.surface.accent": "{options.color.purple.700}"
    }
  }
}
```

### Palette Inheritance Rules

1. Palettes specify only the tokens they override
2. All non-overridden tokens inherit from the `default` palette
3. The `default` palette must define all semantic tokens
4. Palettes cannot inherit from other palettes (only from default)
5. Palettes cannot add new tokens, only override existing ones

This inheritance model prevents palette proliferation and ensures consistency.

### Palette Precedence

Palette resolution occurs:

1. After mode resolution (light/dark/high-contrast)
2. After platform override resolution
3. Before final value output

---

## 4. Platform-Specific Palette Behavior

Palette implementation differs by platform capability:

| Platform | Palette Behavior | Implementation |
|----------|-----------------|----------------|
| Web | Dynamic switching | CSS custom properties with `data-palette` attribute |
| iOS | Static variants | Enum-based palette selection at component instantiation |
| Android | Static variants | Enum-based palette selection at component instantiation |
| Sass | Static variants | Build-time palette selection via imports |

### Why This Difference Exists

This is an architectural limitation, not a roadmap gap:

- Native platforms do not support dynamic CSS-style variable scoping
- Components must choose their palette at creation time
- Multiple palette instances are supported (different components use different palettes)
- Runtime palette switching on a single component instance is not supported on native platforms

### Web Implementation (Dynamic)

```css
/* Default palette */
:root {
  --cdr-color-surface-base: #FFFFFF;
  --cdr-color-surface-accent: #0055CC;
}

/* Sale palette */
[data-palette="sale"] {
  --cdr-color-surface-base: #FEE9E0;
  --cdr-color-surface-accent: #CC0000;
}

/* Member palette */
[data-palette="member"] {
  --cdr-color-surface-base: #F3E5FF;
  --cdr-color-surface-accent: #7700CC;
}
```

Usage:

```html
<div class="card" data-palette="sale">
  <!-- Uses sale palette values -->
</div>
```

### iOS/Android Implementation (Static)

```swift
// iOS
public enum Palette {
  case `default`, sale, member
  
  var surfaceBase: Color {
    switch self {
      case .default: return Color(hex: "FFFFFF")
      case .sale: return Color(hex: "FEE9E0")
      case .member: return Color(hex: "F3E5FF")
    }
  }
}

// Usage
Card(palette: .sale)
```

```kotlin
// Android
enum class Palette {
  DEFAULT, SALE, MEMBER;
  
  val surfaceBase: Color
    get() = when (this) {
      DEFAULT -> Color(0xFFFFFFFF)
      SALE -> Color(0xFFFEE9E0)
      MEMBER -> Color(0xFFF3E5FF)
    }
}

// Usage
Card(palette = Palette.SALE)
```

---

## 5. Design Workflow

### Token Design (In Figma)

Designers work in the Semantic Token Library:

1. Create semantic tokens (e.g., `color.surface.base`, `color.action.accent`)
2. Define values across three modes: `light`, `dark`, `high-contrast`
3. Add platform overrides as metadata when platform-specific values are required
4. Publish variables to normalization pipeline

### Palette Design (Outside Figma)

Palettes are defined as data mappings, not Figma infrastructure.

**Option A: YAML specification**

```yaml
palettes:
  sale:
    name: "Sale Palette"
    description: "Used for promotional surfaces"
    scope: "surface"
    overrides:
      color.surface.base: options.color.red.50
      color.surface.accent: options.color.red.700
  
  member:
    name: "Member Palette"
    description: "Used for member-exclusive content"
    scope: "surface"
    overrides:
      color.surface.base: options.color.purple.50
      color.surface.accent: options.color.purple.700
```

**Option B: Figma table**

A single Figma page with a table showing palette mappings:

| Token          | Default     | Sale      | Member       |
|----------------|-------------|-----------|--------------|
| surface.base   | neutral.0   | red.50    | purple.50    |
| surface.accent | blue.600    | red.700   | purple.700   |
| surface.muted  | neutral.100 | (inherit) | (inherit)    |
| text.base      | neutral.900 | (inherit) | (inherit)    |

This makes inheritance explicit and reviewable.

### Platform Preview

Designers can preview platform-specific values through:

**Option A: Figma Plugin**
- Reads `platformOverrides` metadata
- Temporarily swaps displayed values
- Toggles between iOS/Web/Android preview
- Does not modify actual token values

**Option B: Platform Component Libraries**
- Separate libraries for iOS, Web, Android
- Each consumes semantic tokens with platform-specific values applied
- Designers open relevant library to see platform context

---

## 6. Component Library Architecture

### Semantic Token Library (Single Source)

Contains:
- Option tokens (primitives)
- Alias tokens
- Semantic tokens
- Mode definitions (light, dark, high-contrast)
- Platform override metadata

### Platform Component Libraries

Web, iOS, and Android component libraries:

**Consume:**
- Semantic tokens from Token Library
- Platform-specific values from overrides
- Mode variations

**Do NOT:**
- Define tokens
- Modify token values
- Rename tokens
- Delete tokens

Token ownership remains centralized to prevent drift and accidental breakage.

---

## 7. Canonical Model Integration

### Mode Representation

Mode values are stored in the canonical model under mode-specific paths:

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
              "dark": "{options.color.neutral.900}",
              "high-contrast": "{options.color.neutral.0}"
            }
          }
        }
      }
    }
  }
}
```

### Platform Override Representation

```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "{font.family.primary}"
  },
  "$extensions": {
    "cedar": {
      "platformOverrides": {
        "ios": { "fontFamily": "SF Pro Text" },
        "web": { "fontFamily": "Inter" },
        "android": { "fontFamily": "Roboto" }
      }
    }
  }
}
```

### Palette Representation

```json
{
  "$extensions": {
    "cedar": {
      "palettes": {
        "default": {
          "color.surface.base": "{options.color.neutral.0}"
        },
        "sale": {
          "color.surface.base": "{options.color.red.50}"
        }
      }
    }
  }
}
```

---

## 8. Transform Layer Responsibilities

Style Dictionary consumes the canonical model and:

1. Resolves mode values for target environment
2. Applies platform overrides for target platform
3. Generates palette variants per platform capability
4. Applies platform naming conventions
5. Outputs platform-specific files

### Output Structure

```
dist/
  css/
    light.css
    dark.css
    high-contrast.css
    palettes.css
  ios/
    ColorTokens+Light.swift
    ColorTokens+Dark.swift
    ColorTokens+HighContrast.swift
    Palette.swift
  android/
    colors-light.xml
    colors-dark.xml
    colors-high-contrast.xml
    palettes.xml
```

---

## 9. Governance Rules

### Mode Governance

- Mode list is fixed at three: `light`, `dark`, `high-contrast`
- New modes require ADR approval
- Mode names must be lowercase, single-word
- Modes represent environmental context only

### Platform Override Governance

- Platform overrides are optional
- Overrides must preserve semantic intent
- Overrides must be validated for type correctness
- Overrides should be the exception, not the rule

### Palette Governance

- Default palette must define all semantic tokens
- New palettes require design review
- Palettes can only override tokens, not add new ones
- Palette overrides must maintain semantic roles
- Palette inheritance must be validated at build time

---

## 10. Consequences

### Positive

- Designers can preview environmental modes (light/dark/high-contrast)
- Designers can preview platform differences (via plugin or libraries)
- Palettes remain manageable and surface-scoped
- Semantics remain platform-agnostic
- Canonical model stays clean
- Style Dictionary can resolve all combinations
- Web retains dynamic palette behavior
- Native platforms receive appropriate static variants
- Prevents mode explosion (3 modes, not 9+)
- Prevents platform drift through centralized token ownership

### Negative

- Designers cannot preview all palette combinations in Figma
- Platform differences require plugin or separate libraries to preview
- Palettes must be specified outside Figma variable system
- Native platforms cannot support dynamic palette switching (architectural limitation)

---

## 11. Future Considerations

- Automated mode validation
- Palette preview tooling (Figma plugin)
- Automated contrast validation per mode
- Palette inheritance visualization tools
- Multi-brand palette variants
- Platform override usage analytics

---

## Related Documents

- ADR-0001: Canonical Token Model
- ADR-0002: Normalization Layer
- ADR-0004: Semantic Token Architecture
- ADR-0005: Transform Layer & Platform Outputs