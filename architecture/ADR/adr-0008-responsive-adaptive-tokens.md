# ADR-0008: Responsive and Adaptive Tokens

## Status
Proposed (V1.2)

## Context

Cedar’s current responsive system includes some foundational pieces but lacks a unified, canonical model. Several areas require definition to support modern responsive behavior:

- **Breakpoint tokens** — existing viewport thresholds (xs, sm, md, lg) plus missing xl/xxl
- **Fluid spacing** — spacing that adapts to viewport or container size
- **Responsive typography** — type that scales across device sizes
- **Container queries** — component-level responsiveness
- **Layout density** — compact, comfortable, and spacious variants

### Current State

Cedar provides four established breakpoints:

- xs: 0px  
- sm: 768px  
- md: 992px  
- lg: 1232px  

But Cedar does not yet provide:

- Larger breakpoints for modern desktop widths (xl, xxl)  
- A formalized canonical structure for fluid spacing  
- A fluid typography system  
- Container query tokens  
- Density multipliers  

### The Problem

Without a comprehensive responsive token system:

- Breakpoints are sometimes hard‑coded or inconsistently applied  
- Spacing does not scale smoothly across screen sizes  
- Typography remains static across device classes  
- Components cannot adapt to the size of their container  
- Layout density varies without a semantic mechanism to control it  

This ADR defines a complete responsive token model for Cedar V1.2+, preserving existing breakpoint values while introducing the structures needed for modern responsive behavior.

---

## Decision

Cedar adopts a **hybrid responsive system** that combines:

1. **Fixed breakpoints** — existing values (xs, sm, md, lg) plus new xl/xxl  
2. **Fluid tokens** — smooth scaling using clamp() and container query units  
3. **Container query tokens** — enabling component-level responsiveness  
4. **Density tokens** — a future mechanism for scaling spacing semantically  

Core principles:

- Mobile‑first design  
- Preserve existing Cedar breakpoint values  
- Use fluid spacing for page‑level layout, fixed spacing for component internals  
- Prefer container queries over media queries when supported  
- Use semantic, platform‑agnostic naming  

---

## 1. Breakpoint Tokens

### Current Cedar Breakpoints

Cedar’s existing breakpoints remain unchanged:

| Token | Current Value | Viewport Range | Use Case |
|-------|---------------|----------------|----------|
| `breakpoint.xs` | 0px | 0–767px | Mobile portrait |
| `breakpoint.sm` | 768px | 768–991px | Mobile landscape, small tablet |
| `breakpoint.md` | 992px | 992–1231px | Tablet, small laptop |
| `breakpoint.lg` | 1232px | 1232–1439px | Desktop, large laptop |

### New Breakpoints (V1.2)

Two additional breakpoints support modern large displays:

| Token | Value | Viewport Range | Use Case |
|-------|-------|----------------|----------|
| `breakpoint.xl` | 1440px | 1440–1919px | Large desktop |
| `breakpoint.xxl` | 1920px | 1920px+ | Extra‑large desktop, 4K |

### Canonical Representation (Illustrative)

```json
{
  "breakpoint": {
    "md": {
      "$type": "dimension",
      "$value": "992px",
      "$extensions": {
        "cedar": {
          "min": 992,
          "max": 1231
        }
      }
    }
  }
}
```

## 2. Fluid Spacing Tokens

### Current State

Cedar includes some fluid spacing behavior today, but it is not defined in the canonical token model. Existing implementations vary in structure and are not consistently represented across the system.

Fluid spacing tokens provide a standardized way to express spacing that adapts smoothly to viewport or container size.

---

### Fluid Spacing Scale

Fluid spacing defines a range between a minimum and maximum value. These values scale proportionally as available space increases.

| Token | Min | Max |
|-------|------|------|
| `spacing.fluid.0` | 0px | 0px |
| `spacing.fluid.100` | 2px | 6px |
| `spacing.fluid.200` | 8px | 12px |
| `spacing.fluid.300` | 12px | 20px |
| `spacing.fluid.400` | 16px | 28px |
| `spacing.fluid.500` | 20px | 36px |
| `spacing.fluid.600` | 24px | 48px |
| `spacing.fluid.700` | 32px | 64px |
| `spacing.fluid.800` | 40px | 80px |
| `spacing.fluid.900` | 48px | 96px |

These values are illustrative and demonstrate how spacing can scale across a layout.

---

### Canonical Representation

Fluid spacing uses a min/ideal/max structure stored in `$extensions`, with `$value` referencing the computed output.

```json
{
  "spacing": {
    "fluid": {
      "300": {
        "$type": "dimension",
        "$value": "{spacing.fluid.300.computed}",
        "$extensions": {
          "cedar": {
            "fluid": {
              "min": { "value": 0.75, "unit": "rem" },
              "ideal": {
                "value": 0.75,
                "unit": "rem",
                "scale": { "value": 0.44, "unit": "cqi" }
              },
              "max": { "value": 1.25, "unit": "rem" }
            }
          }
        }
      }
    }
  }
}
```

**Note:** `cqi` = container query inline size units (1cqi = 1% of container width)

### Transform Output (CSS)

```css
--cdr-spacing-fluid-300: clamp(0.75rem, 0.75rem + 0.44cqi, 1.25rem);
--cdr-spacing-fluid-400: clamp(1rem, 1rem + 0.66cqi, 1.75rem);
```

---

## 3. Fluid Typography Tokens

### Fluid Typography Scale

Typography scales smoothly between mobile and desktop sizes using viewport-relative units:

| Token | Min (xs) | Max (xl+) | Formula |
|-------|----------|-----------|---------|
| `type.fluid.body.small` | 14px | 14px | Fixed (no scaling) |
| `type.fluid.body.medium` | 16px | 18px | `clamp(1rem, 0.95rem + 0.22vw, 1.125rem)` |
| `type.fluid.body.large` | 18px | 20px | `clamp(1.125rem, 1.05rem + 0.33vw, 1.25rem)` |
| `type.fluid.heading.small` | 20px | 24px | `clamp(1.25rem, 1.1rem + 0.66vw, 1.5rem)` |
| `type.fluid.heading.medium` | 24px | 32px | `clamp(1.5rem, 1.2rem + 1.32vw, 2rem)` |
| `type.fluid.heading.large` | 32px | 48px | `clamp(2rem, 1.4rem + 2.64vw, 3rem)` |
| `type.fluid.heading.xlarge` | 40px | 64px | `clamp(2.5rem, 1.6rem + 3.96vw, 4rem)` |
| `type.fluid.display` | 48px | 96px | `clamp(3rem, 1.5rem + 6.6vw, 6rem)` |

**Note:** Uses `vw` (viewport width) for global scaling, not `cqi` (container-based)

```json
{
  "type": {
    "fluid": {
      "body": {
        "medium": {
          "$type": "typography",
          "$value": {
            "fontFamily": "{font.family.primary}",
            "fontWeight": 400,
            "fontSize": "{type.fluid.body.medium.fontSize}",
            "lineHeight": 1.5,
            "letterSpacing": "0em"
          },
          "$extensions": {
            "cedar": {
              "fluid": {
                "fontSize": {
                  "min": { "value": 1, "unit": "rem" },
                  "ideal": {
                    "value": 0.95,
                    "unit": "rem",
                    "scale": { "value": 0.22, "unit": "vw" }
                  },
                  "max": { "value": 1.125, "unit": "rem" }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Transform Output (CSS)

```css
/* Fluid body text */
--cdr-type-fluid-body-medium-font-size: clamp(1rem, 0.95rem + 0.22vw, 1.125rem);
--cdr-type-fluid-body-medium-line-height: 1.5;

```


---

## 4. Container Query Tokens

### Current Gap

Cedar does not currently define container query breakpoints.  
As a result, components cannot adapt based on the size of their container, and teams implement container‑based responsiveness inconsistently or not at all.

Container query tokens provide a semantic way to express size thresholds at the component level, complementing viewport breakpoints.

---

### Container Query Breakpoints

These values illustrate how container breakpoints can be defined as tokens:

| Token | Value |
|-------|--------|
| `container.breakpoint.xs` | 0px |
| `container.breakpoint.sm` | 400px |
| `container.breakpoint.md` | 600px |
| `container.breakpoint.lg` | 900px |
| `container.breakpoint.xl` | 1200px |

Container breakpoints differ from viewport breakpoints because they apply to the width of a component’s containing block rather than the full viewport.

---

### Canonical Representation

```json
{
  "container": {
    "breakpoint": {
      "md": {
        "$type": "dimension",
        "$value": "600px",
        "$extensions": {
          "cedar": {
            "min": 600,
            "max": 899
          }
        }
      }
    }
  }
}
```

This structure mirrors Cedar’s viewport breakpoint tokens.

---

## 5. Layout Density Tokens

### What Density Tokens Are

Density tokens express **how tightly or loosely spaced a layout should feel**.  
They act as a semantic multiplier applied to existing spacing tokens, allowing an interface to become more compact or more spacious without redefining component internals.

A density token does not define spacing itself—it defines **how much to scale** the spacing that already exists.

---

### Cedar’s Current Gap

Cedar does not currently provide density tokens.  
As a result:

- Components always render at a single “comfortable” spacing level  
- There is no token‑driven way to support compact or spacious modes  
- Designers and engineers manually adjust spacing when different densities are needed  
- Layouts cannot adapt to user preference or context (e.g., data‑dense screens vs. touch‑first screens)

Introducing density tokens would give Cedar a consistent, semantic mechanism for expressing layout tightness across the system.
This group of tokens would:
- Allow layouts to adapt to different contexts (dense data vs. touch‑first UI)
- Provide a semantic, token‑driven way to scale spacing
- Reduce the need for one‑off spacing overrides
- Enable future user‑controlled preferences (e.g., accessibility modes)

---

### Illustrative Density Levels

These values are examples only, showing how density could conceptually scale spacing:

| Token | Multiplier |
|-------|-----------|
| `density.compact` | 0.75 |
| `density.comfortable` | 1.0 |
| `density.spacious` | 1.25 |

---

### Canonical Representation

```json
{
  "density": {
    "compact": {
      "$type": "number",
      "$value": 0.75
    },
    "comfortable": {
      "$type": "number",
      "$value": 1.0
    },
    "spacious": {
      "$type": "number",
      "$value": 1.25
    }
  }
}
```

### How Density Could Be Used 

```css
/* Base spacing tokens */
--cdr-spacing-scale-300: 12px;

/* Density multiplier */
--cdr-density: var(--cdr-density-comfortable);

/* Example application */
.component {
  padding: calc(var(--cdr-spacing-scale-300) * var(--cdr-density));
}

/* Switching density */
[data-density="compact"] {
  --cdr-density: var(--cdr-density-compact);
}

[data-density="spacious"] {
  --cdr-density: var(--cdr-density-spacious);
}
```



### Implementation Pattern

```vue
<template>
  <div :data-density="userDensityPreference">
    <!-- All components inherit density -->
    <CdrButton>Save</CdrButton>
    <CdrCard>...</CdrCard>
  </div>
</template>

<script>
export default {
  computed: {
    userDensityPreference() {
      // Read from user preferences
      return this.$store.state.user.densityPreference || 'comfortable';
    }
  }
}
</script>
```
---

## Future Considerations

- Content-based breakpoints (in addition to viewport-based)
- Aspect ratio-based responsive tokens
- Orientation-specific tokens (portrait vs landscape)
- Foldable device support
- Dynamic density based on device capabilities
- Performance monitoring for fluid token calculations
