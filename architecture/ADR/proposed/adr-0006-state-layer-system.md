# ADR‑0006: State Layer System

## Status
Proposed

## Context

Interactive components require visual feedback for user actions and system states. Cedar must define a consistent, accessible, and platform-appropriate approach to interactive states:

- **Hover** - pointer over interactive element
- **Pressed** - active click/tap state
- **Focus** - keyboard/assistive technology focus
- **Disabled** - non-interactive state
- **Selected** - toggle or selection state
- **Error** - validation failure state

Design systems approach states in two ways:

**Explicit State Tokens** (Current Cedar approach)
- Designers manually select new palette values for each state
- Each state is an independent token (color.action.accent, color.action.accent.hover)
- No computed relationships between states
- Example: Material 2, Carbon v10

**Overlay-Based States** (Material 3 approach)
- Base color + semi-transparent overlay = state color
- Overlay color (white/black) determined by base luminance
- Consistent tonal shifts across all components
- Computed at build time or runtime

---

## Decision

Cedar adopts a **hybrid state system** that supports both explicit state tokens and prepares for computed overlay states (Future).

### Explicit State Tokens with Metadata

Designers define state colors by selecting palette values. The canonical model stores these as explicit tokens with metadata describing their derivation.

### VFuture: Computed Overlay States

Transform layer computes state colors from base + overlay. Explicit tokens serve as fallback for legacy support.

This hybrid approach:
- Ships without blocking on overlay computation
- Preserves designer control during transition
- Enables future automation
- Maintains backward compatibility

---

## 1. State Types

Cedar defines six interactive state types:

| State | Trigger | Purpose |
|-------|---------|---------|
| **Hover** | Pointer over element | Indicate interactivity |
| **Pressed** | Active click/tap | Confirm interaction |
| **Focus** | Keyboard/AT navigation | Show current focus |
| **Disabled** | Non-interactive | Prevent interaction |
| **Selected** | Toggle/selection active | Show selection state |
| **Error** | Validation failure | Indicate invalid input |

---

## 2. Architecture: Explicit State Tokens

### Token Naming

State tokens follow the semantic naming pattern:

```
color.<intent>.<family>.<variant>.<state>
```

**Examples:**
```
color.action.accent
color.action.accent.hover
color.action.accent.pressed
color.action.accent.focus
color.action.accent.disabled
```

### Canonical Representation

```json
{
  "color": {
    "action": {
      "accent": {
        "$type": "color",
        "$value": "{options.color.blue.1000}",
        "$extensions": {
          "cedar": {
            "luminance": 0.30,
            "stateLayer": "white"
          }
        }
      },
      "accent": {
        "hover": {
          "$type": "color",
          "$value": "{options.color.blue.900}",
          "$extensions": {
            "cedar": {
              "derivedFrom": "{color.action.accent}",
              "stateType": "hover",
              "overlayEquivalent": {
                "base": "{color.action.accent}",
                "layer": "white",
                "opacity": 0.08
              }
            }
          }
        },
        "pressed": {
          "$type": "color",
          "$value": "{options.color.blue.800}",
          "$extensions": {
            "cedar": {
              "derivedFrom": "{color.action.accent}",
              "stateType": "pressed",
              "overlayEquivalent": {
                "base": "{color.action.accent}",
                "layer": "white",
                "opacity": 0.12
              }
            }
          }
        }
      }
    }
  }
}
```

### State Metadata

Metadata enables future overlay computation without breaking existing tokens:

**Required metadata:**
- `derivedFrom` - base token this state derives from
- `stateType` - hover, pressed, focus, disabled, selected, error
- `overlayEquivalent` - computed overlay that produces equivalent result

**Optional metadata:**
- `luminance` - base color luminance (0-1)
- `stateLayer` - recommended overlay color (white or black)

---

## 3. State Guidelines

### Hover States

Purpose: Indicate interactivity before user commits to action

**Light surfaces:**
- Darken by 1-2 steps in palette
- Or apply 8% black overlay equivalent

**Dark surfaces:**
- Lighten by 1-2 steps in palette
- Or apply 8% white overlay equivalent

**Examples:**
```
blue.1000 → blue.900 (hover)
blue.100 → blue.200 (hover on light)
```

### Pressed States

Purpose: Confirm user action in progress

**Light surfaces:**
- Darken by 2-3 steps in palette
- Or apply 12% black overlay equivalent

**Dark surfaces:**
- Lighten by 2-3 steps in palette
- Or apply 12% white overlay equivalent

**Examples:**
```
blue.1000 → blue.800 (pressed)
blue.100 → blue.300 (pressed on light)
```

### Focus States

Purpose: Show keyboard/assistive technology focus

**Approach: Focus indicator tokens, not color change**

Focus uses dedicated outline tokens:
```
color.focus.indicator
border.focus.width
border.focus.offset
```

Focus does NOT change the element's background color.

**Rationale:**
- Accessible (WCAG 2.4.7 requires visible focus)
- Platform-consistent (browsers provide default focus)
- Separates focus from hover (can be focused without hover)

### Disabled States

Purpose: Indicate non-interactive element

**Approach: Opacity reduction**

```
color.action.accent.disabled
opacity.disabled (0.38)
```

Disabled states use reduced opacity rather than separate color values.

**Rationale:**
- Consistent across all components
- Maintains color relationships
- Accessible (sufficient contrast with background)

### Selected States

Purpose: Show active selection or toggle

**Approach: Separate selected token**

```
color.action.accent.selected
color.navigation.item.selected
```

Selected is NOT a state overlay but a distinct semantic token.

**Rationale:**
- Selection is persistent, not transient
- Selected elements may still have hover/pressed states
- Semantically different from interaction states

### Error States

Purpose: Indicate validation failure

**Approach: Separate error intent**

```
color.error.base
color.error.hover
color.error.pressed
```

Error uses the error intent, not a state modifier on action.

**Rationale:**
- Error is a semantic intent, not an interaction state
- Error can have its own hover/pressed states
- Distinct from disabled (error is actionable)

---

## 6. VFuture Architecture: Computed Overlay States

Introduces computed overlay states, where state colors are generated algorithmically from a base token, an overlay color, and an opacity value. This model aligns Cedar with modern design systems and reduces long‑term maintenance overhead.

### Why Computed States Are Needed

Explicit state tokens provide stability and designer control, but they do not scale as Cedar grows. Computed overlay states address several architectural limitations:

- **System-wide consistency**  
  Manual palette selection leads to drift over time. Computed overlays ensure uniform tonal shifts for hover and pressed states across all intents and components.

- **Reduced token proliferation**  
  Every semantic color currently requires multiple explicit state variants. Computed states dramatically reduce the number of tokens designers must maintain.

- **Predictable, algorithmic behavior**  
  Overlay-based states produce consistent results regardless of the underlying color family, improving accessibility and reducing visual noise.

- **Cross-platform alignment**  
  Native platforms (e.g., Android) already use overlay-based state layers. Computed states allow Cedar to unify behavior across web and native.

- **Future automation**  
  Computed states enable automated generation in the transform layer and future Figma tooling, reducing manual work and human error.

This update does not replace explicit tokens; it augments them. Explicit tokens remain as fallbacks for legacy platforms and intentional overrides.

---

### Preconditions for Computed State Tokens

Several architectural and platform conditions must be met before Cedar can adopt computed overlay states as the default:

- **Reliable luminance metadata**  
  Base tokens must include luminance values to determine whether the overlay layer should be white or black.

- **Canonical overlay opacity tokens**  
  Hover and pressed opacities must be standardized (e.g., `state.hover.opacity`, `state.pressed.opacity`).

- **Stable semantic token architecture**  
  Computed states depend on predictable base colors; semantic tokens must be normalized and stable.

- **Transform-layer support**  
  The build pipeline must be able to compute overlay results consistently across platforms.

- **Platform capability**  
  Web platforms must support `color-mix()` or equivalent functionality, or the transform layer must precompute static values.

- **Fallback strategy**  
  Explicit tokens must remain available for platforms that cannot compute overlays at runtime.

- **Accessibility validation**  
  Generated states must meet contrast and visibility requirements across all intents and surfaces.

When these conditions are met, Cedar can transition from explicit state tokens to computed overlays without breaking existing components or requiring designers to manually maintain state variants.

---

### Overlay Token Definitions

```json
{
  "state": {
    "hover": {
      "opacity": {
        "$type": "number",
        "$value": 0.08
      }
    },
    "pressed": {
      "opacity": {
        "$type": "number",
        "$value": 0.12
      }
    }
  }
}
```

### Overlay Layer Selection
Overlay color is determined by the luminance of the base token:

```
if (luminance < 0.5) {
  overlayColor = white
} else {
  overlayColor = black
}
```
### Computed State Generation
The transform layer generates state tokens algorithmically:

```js
function generateStateToken(baseToken, stateType) {
  const luminance = calculateLuminance(baseToken.value);
  const overlayColor = luminance < 0.5 ? 'white' : 'black';
  const opacity = STATE_OPACITY[stateType];

  return {
    $type: 'color',
    $value: `color-mix(in srgb, ${baseToken.value}, ${overlayColor} ${opacity})`
  };
}
```

---

## 7. Focus Indicator Tokens

Focus requires dedicated tokens, not color states:

```json
{
  "color": {
    "focus": {
      "indicator": {
        "$type": "color",
        "$value": "{options.color.blue.600}"
      }
    }
  },
  "border": {
    "focus": {
      "width": {
        "$type": "dimension",
        "$value": { "value": 2, "unit": "px" }
      },
      "offset": {
        "$type": "dimension",
        "$value": { "value": 2, "unit": "px" }
      }
    }
  }
}
```

---

## 8. Opacity Tokens

Disabled and other transparency states use opacity tokens:

```json
{
  "opacity": {
    "disabled": {
      "$type": "number",
      "$value": 0.38
    },
    "subtle": {
      "$type": "number",
      "$value": 0.6
    },
    "overlay": {
      "$type": "number",
      "$value": 0.9
    }
  }
}
```

---

## 9. Governance Rules

### State Token Naming

- State tokens must use the `.state` suffix (hover, pressed, focus, etc.)
- State tokens must reference a base token in metadata
- State tokens must declare state type in metadata

### State Creation

- Designers select state values from existing palette
- Normalization validates state tokens reference valid base tokens
- Transform layer preserves explicit values
- Transform layer may compute overlays in future (with explicit fallback)

### Breaking Changes

Changing a state token's value is a minor version bump (not major) because:
- States are ephemeral, not persistent
- State changes don't affect layout or structure
- Components remain functionally identical

---

## 10. Consequences

### Positive

- Designers maintain control over state appearance
- Metadata prepares for future computed overlays
- Hybrid approach enables gradual migration
- Explicit tokens ensure cross-platform consistency
- Focus indicators are accessible and platform-appropriate
- Disabled states use consistent opacity approach

### Negative

- Designers must manually create state tokens
- State token proliferation (every accent token needs hover/pressed variants)
- Metadata complexity in canonical model
- VFuture migration requires transform layer updates
- Overlay computation may produce unexpected results for some colors

---

## 11. Future Considerations

- Automated state token generation in Figma plugin
- Luminance-based overlay selection validation
- Contrast ratio checking for generated states
- Platform-specific state behavior (native ripples on Android)
- Motion states (loading, skeleton, shimmer)
- Custom state types for domain-specific needs

---
