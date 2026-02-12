# ADR-0015: Accessibility Requirements

## Status
Proposed (V2)

## Context

Cedar must provide an accessible experience that meets or exceeds WCAG 2.2 Level AA standards. Accessibility cannot be an afterthought—it must be embedded in the token system itself.

Critical accessibility requirements include:

- **Focus indicators** - visible keyboard focus (WCAG 2.4.7, 2.4.11, 2.4.13)
- **Touch targets** - minimum interactive size (WCAG 2.5.5, 2.5.8)
- **Color contrast** - sufficient text/background contrast (WCAG 1.4.3, 1.4.11)
- **Motion preferences** - respect reduced motion (WCAG 2.3.3)
- **High contrast mode** - support for high contrast themes
- **Text spacing** - allow text override (WCAG 1.4.12)

Without accessibility tokens:
- Developers use arbitrary focus styles
- Interactive elements are too small to tap
- Color combinations fail contrast checks
- Motion animations ignore user preferences
- High contrast mode is unsupported

Material and Carbon have some accessibility tokens but lack comprehensive coverage. Cedar needs a complete accessibility token system that makes it **easy to build accessible components by default**.

This ADR defines Cedar's accessibility tokens and requirements.

---

## Decision

Cedar adopts **accessibility-first tokens** that embed WCAG 2.2 Level AA requirements directly into the design system.

Core principles:
1. **Accessible by default** - tokens ensure compliance without extra work
2. **Progressive enhancement** - support AAA where feasible
3. **User preferences** - respect system accessibility settings
4. **Testable** - all tokens have measurable success criteria

---

## 1. Focus Indicator Tokens

### WCAG Requirements

**2.4.7 Focus Visible (Level AA):**
- Keyboard focus indicator is visible

**2.4.11 Focus Not Obscured (Minimum) (Level AA):**
- Focus indicator is not entirely hidden

**2.4.13 Focus Appearance (Level AAA):**
- Focus indicator has 3:1 contrast with unfocused state
- Focus indicator has 3:1 contrast with background
- Focus indicator is at least 2px thick

### Focus Indicator Tokens

| Token | Value | WCAG Level |
|-------|-------|------------|
| `color.focus.indicator` | `#0055CC` | AA |
| `border.focus.width` | `2px` | AAA (minimum) |
| `border.focus.width.enhanced` | `3px` | AAA (enhanced) |
| `border.focus.offset` | `2px` | AA |
| `border.focus.style` | `solid` | AA |

### Canonical Representation

```json
{
  "color": {
    "focus": {
      "indicator": {
        "$type": "color",
        "$value": "#0055CC",
        "$extensions": {
          "cedar": {
            "contrast": {
              "againstWhite": 4.58,
              "againstBlack": 4.58
            },
            "wcag": "AA"
          }
        }
      }
    }
  },
  "border": {
    "focus": {
      "width": {
        "$type": "dimension",
        "$value": { "value": 2, "unit": "px" },
        "$extensions": {
          "cedar": {
            "wcag": "AAA",
            "minRequired": 2
          }
        }
      },
      "width": {
        "enhanced": {
          "$type": "dimension",
          "$value": { "value": 3, "unit": "px" }
        }
      },
      "offset": {
        "$type": "dimension",
        "$value": { "value": 2, "unit": "px" }
      },
      "style": {
        "$type": "string",
        "$value": "solid"
      }
    }
  }
}
```

### Focus Indicator Implementation

```css
/* Default focus style */
:focus-visible {
  outline: var(--cdr-border-focus-width) var(--cdr-border-focus-style) var(--cdr-color-focus-indicator);
  outline-offset: var(--cdr-border-focus-offset);
}

/* Enhanced focus (AAA) */
.enhanced-focus :focus-visible {
  outline-width: var(--cdr-border-focus-width-enhanced);
}

/* Custom focus for specific components */
.button:focus-visible {
  outline: var(--cdr-border-focus-width) solid var(--cdr-color-focus-indicator);
  outline-offset: var(--cdr-border-focus-offset);
}
```

### Focus Indicator Validation

All focus indicators must pass:
- **Visibility test:** Focus is visible in all modes (light, dark, high-contrast)
- **Contrast test:** 3:1 contrast ratio with unfocused state
- **Thickness test:** Minimum 2px outline
- **Offset test:** Clear separation from element

---

## 2. Touch Target Tokens

### WCAG Requirements

**2.5.5 Target Size (Enhanced) (Level AAA):**
- Interactive targets are at least 44×44 CSS pixels

**2.5.8 Target Size (Minimum) (Level AA):**
- Interactive targets are at least 24×24 CSS pixels (with spacing exceptions)

### Touch Target Tokens

| Token | Value | WCAG Level | Use Case |
|-------|-------|------------|----------|
| `size.target.minimum` | `24px` | AA | Absolute minimum (with spacing) |
| `size.target.standard` | `44px` | AAA | Recommended for all targets |
| `size.target.comfortable` | `48px` | AAA+ | Touch-first interfaces |

### Canonical Representation

```json
{
  "size": {
    "target": {
      "minimum": {
        "$type": "dimension",
        "$value": { "value": 24, "unit": "px" },
        "$extensions": {
          "cedar": {
            "wcag": "AA",
            "requiresSpacing": true
          }
        }
      },
      "standard": {
        "$type": "dimension",
        "$value": { "value": 44, "unit": "px" },
        "$extensions": {
          "cedar": {
            "wcag": "AAA"
          }
        }
      },
      "comfortable": {
        "$type": "dimension",
        "$value": { "value": 48, "unit": "px" },
        "$extensions": {
          "cedar": {
            "wcag": "AAA",
            "enhanced": true
          }
        }
      }
    }
  }
}
```

### Touch Target Implementation

```css
/* Icon-only button (AAA compliant) */
.icon-button {
  min-width: var(--cdr-size-target-standard);
  min-height: var(--cdr-size-target-standard);
}

/* Link in dense text (AA compliant with spacing) */
.text-link {
  min-height: var(--cdr-size-target-minimum);
  padding-block: var(--cdr-spacing-scale-200); /* Adds spacing for 24px minimum */
}

/* Touch-first interface (AAA enhanced) */
.touch-interface .button {
  min-width: var(--cdr-size-target-comfortable);
  min-height: var(--cdr-size-target-comfortable);
}
```

### Touch Target Validation

All interactive elements must:
- **Size test:** Minimum 44×44px (or 24×24px with spacing)
- **Spacing test:** Adjacent targets have sufficient gap
- **Nested test:** Nested interactive elements don't conflict

---

## 3. Color Contrast Tokens

### WCAG Requirements

**1.4.3 Contrast (Minimum) (Level AA):**
- Text: 4.5:1 (large text: 3:1)
- UI components: 3:1

**1.4.11 Non-text Contrast (Level AA):**
- UI components and graphical objects: 3:1

### Contrast Validation Metadata

Color tokens include contrast metadata for validation:

```json
{
  "color": {
    "text": {
      "base": {
        "$type": "color",
        "$value": "#1A1A1A",
        "$extensions": {
          "cedar": {
            "contrast": {
              "againstSurfaceBase": 14.8,
              "wcagLevel": "AAA",
              "meetsAA": true,
              "meetsAAA": true
            }
          }
        }
      },
      "muted": {
        "$type": "color",
        "$value": "#6B6B6B",
        "$extensions": {
          "cedar": {
            "contrast": {
              "againstSurfaceBase": 4.54,
              "wcagLevel": "AA",
              "meetsAA": true,
              "meetsAAA": false
            }
          }
        }
      }
    }
  }
}
```

### Contrast Requirements by Token Type

**Body text (16px):**
- AA: 4.5:1
- AAA: 7:1

**Large text (18px+ or 14px+ bold):**
- AA: 3:1
- AAA: 4.5:1

**UI components (borders, icons, graphics):**
- AA: 3:1

**Disabled state:**
- No contrast requirement (allowed to be low contrast)

### Contrast Validation

All color pairings must pass automated contrast checking:

```javascript
// CI validation
function validateContrast(foreground, background, fontSize, fontWeight) {
  const ratio = getContrastRatio(foreground, background);
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
  
  const requiredRatio = isLargeText ? 3 : 4.5;
  
  if (ratio < requiredRatio) {
    throw new Error(`Contrast ratio ${ratio} fails WCAG AA (required ${requiredRatio})`);
  }
}
```

---

## 4. High Contrast Mode Tokens

### High Contrast Mode Support

Cedar supports high contrast mode via mode tokens (ADR-0007):

```json
{
  "color": {
    "text": {
      "base": {
        "$type": "color",
        "$value": "{options.color.neutral.900}",
        "$extensions": {
          "cedar": {
            "modes": {
              "light": "{options.color.neutral.900}",
              "dark": "{options.color.neutral.50}",
              "high-contrast": "{options.color.neutral.1000}"
            }
          }
        }
      }
    }
  }
}
```

### High Contrast Mode Guidelines

High contrast mode must:
- Increase all contrast ratios to AAA (7:1 for text)
- Remove or strengthen all subtle UI elements (shadows, gradients)
- Thicken borders and focus indicators
- Ensure all interactive states are clearly visible

**Example transformations:**

```css
/* Light mode */
--cdr-color-text-base: #1A1A1A; /* 14.8:1 */
--cdr-color-text-muted: #6B6B6B; /* 4.54:1 - AA only */

/* High contrast mode */
[data-theme="high-contrast"] {
  --cdr-color-text-base: #000000; /* 21:1 - AAA */
  --cdr-color-text-muted: #000000; /* No muted text in HC - use base */
  --cdr-border-focus-width: 3px; /* Thicker focus */
}
```

---

## 5. Motion Preference Tokens

### WCAG Requirement

**2.3.3 Animation from Interactions (Level AAA):**
- Motion animation triggered by interaction can be disabled

### Motion Preference Detection

```json
{
  "motion": {
    "preference": {
      "reduce": {
        "$type": "boolean",
        "$value": "prefers-reduced-motion: reduce",
        "$extensions": {
          "cedar": {
            "mediaQuery": "(prefers-reduced-motion: reduce)"
          }
        }
      }
    }
  }
}
```

### Reduced Motion Implementation

```css
/* Default: animations enabled */
.button {
  transition: background-color var(--cdr-duration-fast) var(--cdr-easing-standard);
}

/* Reduced motion: instant transitions */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: var(--cdr-duration-instant) !important;
    transition-duration: var(--cdr-duration-instant) !important;
  }
}
```

### Motion Preference Guidelines

When reduced motion is preferred:

**Remove:**
- Parallax effects
- Zoom/scale animations
- Rotation animations
- Bouncing/spring animations
- Infinite/looping animations

**Keep (but instant):**
- Opacity transitions
- Position changes (but 0ms duration)
- Focus indicators

**Exception:**
- Essential motion (loading spinners, progress bars) - keep but simplify

---

## 6. Text Spacing Tokens

### WCAG Requirement

**1.4.12 Text Spacing (Level AA):**
- Line height at least 1.5× font size
- Paragraph spacing at least 2× font size
- Letter spacing at least 0.12× font size
- Word spacing at least 0.16× font size

### Text Spacing Tokens

```json
{
  "typography": {
    "spacing": {
      "lineHeight": {
        "minimum": {
          "$type": "number",
          "$value": 1.5,
          "$extensions": {
            "cedar": {
              "wcag": "AA",
              "minRequired": 1.5
            }
          }
        },
        "comfortable": {
          "$type": "number",
          "$value": 1.6
        }
      },
      "paragraphSpacing": {
        "minimum": {
          "$type": "number",
          "$value": 2.0,
          "$extensions": {
            "cedar": {
              "wcag": "AA",
              "multipliesFont": true
            }
          }
        }
      },
      "letterSpacing": {
        "minimum": {
          "$type": "number",
          "$value": 0.12,
          "$extensions": {
            "cedar": {
              "wcag": "AA",
              "multipliesFont": true
            }
          }
        }
      },
      "wordSpacing": {
        "minimum": {
          "$type": "number",
          "$value": 0.16,
          "$extensions": {
            "cedar": {
              "wcag": "AA",
              "multipliesFont": true
            }
          }
        }
      }
    }
  }
}
```

### Text Spacing Implementation

```css
/* Cedar typography already meets WCAG requirements */
.body-text {
  line-height: 1.5; /* WCAG minimum */
  margin-bottom: 2em; /* Paragraph spacing */
}

/* User text spacing override support */
.user-text-spacing {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}

p {
  margin-bottom: 2em !important;
}
```

---

## 7. Accessible Typography Tokens

### Minimum Font Sizes

| Token | Value | WCAG Guidance |
|-------|-------|---------------|
| `typography.size.minimum` | `14px` | Absolute minimum (AA with sufficient contrast) |
| `typography.size.body` | `16px` | Recommended body text |
| `typography.size.large` | `18px` | Large text threshold (relaxed contrast) |

### Implementation

```json
{
  "typography": {
    "size": {
      "minimum": {
        "$type": "dimension",
        "$value": { "value": 14, "unit": "px" },
        "$extensions": {
          "cedar": {
            "wcag": "AA",
            "requiresEnhancedContrast": true,
            "contrastRequired": 4.5
          }
        }
      },
      "body": {
        "$type": "dimension",
        "$value": { "value": 16, "unit": "px" }
      },
      "large": {
        "$type": "dimension",
        "$value": { "value": 18, "unit": "px" },
        "$extensions": {
          "cedar": {
            "wcag": "AA",
            "contrastRequired": 3.0
          }
        }
      }
    }
  }
}
```

---

## 8. Platform Implementation

### Web (CSS)

```css
/* Focus indicators */
:focus-visible {
  outline: 2px solid var(--cdr-color-focus-indicator);
  outline-offset: 2px;
}

/* Touch targets */
.button {
  min-width: 44px;
  min-height: 44px;
}

/* High contrast mode */
@media (prefers-contrast: more) {
  :root {
    --cdr-color-text-base: #000000;
    --cdr-border-focus-width: 3px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Text spacing override support */
.text-content {
  line-height: 1.5;
  letter-spacing: normal;
}
```

### iOS (Swift)

```swift
// Focus indicators (via accessibility traits)
Button("Save")
  .accessibilityAddTraits(.isButton)
  .accessibilityHint("Double tap to save")

// Touch targets
Button("Icon")
  .frame(minWidth: 44, minHeight: 44)

// Reduced motion
@Environment(\.accessibilityReduceMotion) var reduceMotion

if reduceMotion {
  // Skip animations
} else {
  // Animate
}

// High contrast
@Environment(\.accessibilityDifferentiateWithoutColor) var highContrast

if highContrast {
  // Use patterns/shapes in addition to color
}
```

### Android (Kotlin)

```kotlin
// Touch targets
button.setMinimumWidth(44.dp.toPx())
button.setMinimumHeight(44.dp.toPx())

// Reduced motion
val durationScale = Settings.Global.getFloat(
  contentResolver,
  Settings.Global.ANIMATOR_DURATION_SCALE,
  1f
)

if (durationScale == 0f) {
  // Disable animations
}

// Content descriptions
button.contentDescription = "Save button"
```

---

## 9. Accessibility Testing Requirements

### Automated Testing

All components must pass automated accessibility tests:

**axe-core checks:**
- Color contrast
- Focus order
- Focus visible
- Touch target size
- ARIA labels
- Heading hierarchy

**Custom Cedar checks:**
- All tokens meet WCAG requirements
- Focus indicators are 2px minimum
- Interactive elements are 44×44px minimum
- High contrast mode is supported

### Manual Testing

All components must pass manual testing:

**Keyboard navigation:**
- All interactive elements are keyboard accessible
- Focus order is logical
- Focus is always visible
- Escape key dismisses modals/menus

**Screen reader testing:**
- All content is announced correctly
- Interactive elements have labels
- State changes are announced
- Error messages are associated with inputs

**Zoom testing:**
- Content reflows at 200% zoom
- No horizontal scrolling at 400% zoom
- Text remains readable

---

## 10. Governance Rules

### Token Accessibility Requirements

All new tokens must:
- Include WCAG metadata if accessibility-related
- Pass automated contrast checking (if color)
- Meet minimum size requirements (if dimension)
- Document accessibility implications

### Breaking Changes

Changing accessibility token values is a **major version** change if:
- Reduces accessibility (e.g., thinner focus indicator)
- Breaks WCAG compliance
- Removes accessibility feature

Improving accessibility is a **minor version** change.

---

## 11. Consequences

### Positive

- WCAG 2.2 Level AA compliance by default
- Accessible components are easier to build
- Automated accessibility testing
- User preferences respected (motion, contrast, spacing)
- Clear accessibility documentation
- Testable accessibility requirements

### Negative

- Adds complexity to token system
- Some tokens have strict constraints (e.g., 44px minimum)
- High contrast mode requires extra work
- Platform differences in accessibility APIs
- Testing overhead increased

---

## 12. Future Considerations

- WCAG 3.0 (APCA contrast) support
- Voice control optimization
- Cognitive accessibility tokens
- Reading mode support
- Haptic feedback tokens (mobile)
- Screen reader-specific optimizations

---

## Related Documents

- ADR-0009: Foundation Tokens
- ADR-0010: State System
- ADR-0011: Component Token Patterns
- ADR-0012: Motion System