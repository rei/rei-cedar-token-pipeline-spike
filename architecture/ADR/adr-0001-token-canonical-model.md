# ADR‑0001: Canonical Token Model

## Status
Draft

> [!NOTE]
> Spike work implements only a minimal subset of this ADR for pipeline validation.
> Full implementation begins in V1.

---

## Context

Cedar's design token pipeline requires a stable, governed, platform‑agnostic representation of design intent.
This representation — the **Canonical Token Model** — is the single source of truth for all downstream transformations.

It serves as:

- normalization output
- Style Dictionary input
- semantic token resolution
- lifecycle validation
- governance and breaking‑change rules
- future bi‑directional sync with Figma

The canonical model is produced by the Normalization Layer (ADR‑0002) from raw Figma inputs (ADR‑0003).
It must be:

- semantically meaningful
- structurally consistent
- free of platform assumptions
- stable across versions
- diff‑friendly
- machine‑validatable

---

## Purpose

The Canonical Token Model defines:

- the allowed token types
- the structure of `$value` for each type
- how primitive, alias, and semantic tiers relate
- how references (aliases) are represented
- how pre‑resolved platform lookup caches are attached without affecting semantics
- how composite tokens (typography, shadows, etc.) are modeled
- how palettes and their surface scope are expressed
- how platform overrides are expressed (future‑facing)
- how metadata is preserved
- how validation is enforced

This model is the **only** format consumed by Style Dictionary and other platform transformers.

---

## Canonical Token Structure

Every token in the canonical model MUST follow this structure:

```json
{
  "$type": "<canonical-type>",
  "$value": "<structured-value-or-alias>",
  "$extensions": {
    "cedar": { }
  }
}
```

### Required fields

- `$type` — canonical token type
- `$value` — structured, platform‑agnostic value or alias reference

### Optional fields

- `$extensions.cedar` — Cedar-specific metadata. This is the only location for non-DTCG data.

### SD Pipeline Constraint

**`$extensions` string values are subject to Style Dictionary alias resolution.** SD v5 resolves any `{ref}` syntax it finds anywhere in a token object, including inside `$extensions`. Any string value intended for custom code consumption MUST be stored without braces (e.g. `"color.option.neutral.white"` not `"{color.option.neutral.white}"`). This is a hard constraint of the SD v5 pipeline, not a design choice.

### Prohibited

Canonical tokens MUST NOT contain:

- CSS strings
- platform‑specific values in `$value`
- flattened or stringified composite tokens
- implicit units
- platform naming conventions
- Figma slash notation
- tool‑specific metadata outside `$extensions.cedar`

### Notes

- `$value` MUST be either a structured value (for option tokens) or a DTCG‑style alias reference.
- `$extensions.cedar` MUST NOT affect `$value` or token resolution.
- `$resolved` MUST NOT affect `$value` or token resolution (see `$resolved` Rules).
- Composite tokens MUST use structured objects, never strings.
- All canonical tokens MUST be valid according to the canonical JSON Schema.

---

## Option Token Platform Data

### Purpose

Option tokens carry all platform- and appearance-specific hex values directly on the token itself. This keeps the canonical model self-contained: any transform that needs a specific hex value for a specific platform and appearance can find it on the option token without any external lookup.

### Structure

`$extensions.cedar` is **only present when there is something to say**. Option tokens identical across all platforms and appearances have no `$extensions` at all:

```json
{ "$type": "color", "$value": "#ffffff" }
```

**`appearances`** — only present when the dark value differs from `$value`:
```json
{
  "$type": "color",
  "$value": "#2e2e2b",
  "$extensions": {
    "cedar": {
      "appearances": { "dark": "#edeae3" }
    }
  }
}
```

**`platformOverrides`** — only present when a platform value genuinely differs from web. May coexist with `appearances`:
```json
{
  "$type": "color",
  "$value": "#2e2e2b",
  "$extensions": {
    "cedar": {
      "appearances": { "dark": "#edeae3" },
      "platformOverrides": {
        "ios": { "light": "#1c1c1c" }
      }
    }
  }
}
```

When both `light` and `dark` differ on iOS:
```json
"platformOverrides": {
  "ios": { "light": "#0040dd", "dark": "#0a84ff" }
}
```

### Resolution Order

To resolve an option token to its final hex for a given platform and appearance:

1. `$extensions.cedar.platformOverrides.<platform>.<appearance>` — most specific, wins if present
2. `$extensions.cedar.appearances.<appearance>` — appearance variant, no platform specificity
3. `$value` — canonical web-light fallback

```ts
function resolveOptionHex(token, platform, appearance) {
  const cedar = token.$extensions?.cedar;
  const override = cedar?.platformOverrides?.[platform]?.[appearance];
  if (override) return override;
  if (appearance === 'dark' && cedar?.appearances?.dark) return cedar.appearances.dark;
  return token.$value;
}
```

### Rules

`platformOverrides` MUST:
- be populated by the Normalization Layer, not the Transform Layer
- only be present when the platform value genuinely differs from the web canonical
- use the same platform and appearance keys as the Figma Input Contract (ADR‑0003)

`platformOverrides` MUST NOT:
- be present on alias tokens (platform data lives on option tokens only)
- contain alias references — only concrete hex values

`appearances` MUST:
- only be present when the dark value differs from `$value`
- contain only concrete hex values

### When to Use `platformOverrides` vs a New Option Token

A `platformOverride` is appropriate when:
- The same semantic concept (`warm-grey.900` = "darkest neutral") intentionally resolves to different hex values on different platforms by design
- The difference is a platform palette decision, not a different semantic intent

A new option token is appropriate when:
- The platform uses a genuinely different concept (e.g. a system color like `UIColor.label` on iOS that has no web equivalent)
- The semantic meaning differs, not just the hex value

This distinction must be reviewed and approved during normalization. The Normalization Layer MUST NOT infer which case applies — it must be declared in `token-mapping.json`.

---

## Palette Root Metadata (`$meta`)

Each palette root (`color.modes.default`, `color.modes.sale`, etc.) carries `$meta` inside `$extensions.cedar`:

```json
{
  "color": {
    "modes": {
      "default": {
        "$extensions": {
          "cedar": {
            "$meta": { "scope": "root", "isBaseline": true }
          }
        },
        "surface": { ... },
        "text": { ... }
      }
    }
  }
}
```

**Pragmatic note:** `$extensions` is technically a DTCG token-level key, not a group-level key. Placing it on a group node (`color.modes.default`) is a known deviation from strict DTCG compliance. It works because SD reads the tree without enforcing this constraint, and it is the only DTCG-safe way to attach metadata that survives SD's token parsing pipeline. This placement is intentional and documented here as a governed exception.

The CSS transform reads `$extensions.cedar.$meta.scope` to determine whether to emit `:root {}` (scope `"root"`) or `[data-palette="x"] {}` (scope `"surface"`) selectors.

---

## Alias Token Platform References

### Purpose

Alias tokens carry references to the option tokens that back them per platform and appearance. These are stored as plain dot-path strings (no braces) in `$extensions.cedar`.

### Structure

```json
{
  "$type": "color",
  "$value": "{color.option.neutral.warm.grey.900}",
  "$extensions": {
    "cedar": {
      "ios": {
        "light": "color.option.neutral.warm.grey.900",
        "dark":  "color.option.neutral.warm.grey.900"
      },
      "web": {
        "light": "color.option.neutral.warm.grey.900",
        "dark":  "color.option.neutral.warm.grey.900"
      }
    }
  }
}
```

The path strings are stored **without braces** because SD v5 resolves any `{ref}` syntax it finds in `$extensions`, which would replace the path string with a resolved hex value before custom transforms or actions can read it.

### Current Data Finding

Analysis of the current token data shows that every alias token maps to the same option path in both light and dark appearances — the appearance inversion is entirely encoded on the option token itself (via `appearances.dark`). The per-appearance structure is kept for future correctness when this may not hold.

---

## Palette Structure

### Palettes vs Modes

The canonical model distinguishes two orthogonal concepts:

**Palettes** (`default`, `sale`, `membership-event`, …)
Semantic palette variants that define which option tokens each semantic role points to.
Palettes are surface‑scoped — multiple palettes can be active simultaneously on different surfaces within the same page.

**Appearances** (`light`, `dark`, `high-contrast`)
Environmental rendering contexts that control how option token values resolve per platform.
Appearances are page‑level or system‑level — only one appearance is active at a time.

These must not be conflated. A single palette (e.g. `sale`) resolves correctly across all appearances. An appearance does not change which semantic roles a palette defines — only the concrete primitive values those roles resolve to.

### Canonical Palette Location

> **V0/V1 Divergence:** The spike implementation uses `color.modes` as the nesting key rather than `color.palettes` as specified here. This is a known divergence introduced during the spike for pragmatic reasons. Migration to `color.palettes` is required before V1 ships. All transform layer filters, name transforms, and canonical structure consumers must be updated at that time. Do not introduce new code that depends on `color.modes` — treat it as a deprecated spike artifact.

Palettes are stored under `color.palettes`:

```json
{
  "color": {
    "palettes": {
      "default": {
        "$meta": {
          "scope": "root",
          "isBaseline": true
        },
        "text": {
          "base": {
            "$type": "color",
            "$value": "{color.option.neutral.warm.grey.900}",
            "$resolved": {
              "ios": { "light": "#1c1c1c", "dark": "#edeae3" },
              "web": { "light": "#2e2e2b", "dark": "#edeae3" }
            }
          }
        }
      },
      "sale": {
        "$meta": {
          "scope": "surface",
          "inheritsFrom": "default",
          "cssAttribute": "data-palette"
        },
        "text": {
          "base": {
            "$type": "color",
            "$value": "{color.option.brand.red.600}",
            "$resolved": {
              "ios": { "light": "#c7370f", "dark": "#610a0a" },
              "web": { "light": "#c7370f", "dark": "#610a0a" }
            }
          }
        }
      }
    }
  }
}
```

### Palette `$meta`

Every palette MUST declare a `$meta` block at the palette root (not on individual tokens).
`$meta` is consumed only by the Transform Layer and has no effect on token semantics or `$value`.

| Field | Required | Description |
|-------|----------|-------------|
| `scope` | yes | `"root"` for the baseline palette, `"surface"` for all others |
| `isBaseline` | on root only | `true` — signals the Transform Layer to emit `:root` declarations |
| `inheritsFrom` | on surface palettes | Name of the palette to inherit unoverridden tokens from |
| `cssAttribute` | on surface palettes | HTML attribute used for surface‑scoped switching (e.g. `"data-palette"`) |

### Palette Inheritance Rules

- The `default` palette MUST define all semantic tokens.
- Non‑default palettes specify only the tokens they override.
- Unoverridden tokens inherit from `default` via the CSS cascade — no duplication in the canonical model.
- Palettes MUST NOT inherit from other non‑default palettes (only from `default`).
- Palettes MUST NOT add new semantic token paths — only override existing ones.

### Transform Layer Behaviour

When `scope` is `"root"` and `isBaseline` is `true`, the CSS Transform emits:

```css
:root {
  --cdr-text-base: #2e2e2b;
  /* all tokens */
}
```

When `scope` is `"surface"` and `inheritsFrom` is `"default"`, the CSS Transform emits only the delta:

```css
[data-palette="sale"] {
  --cdr-text-base: #c7370f;
  /* only tokens that differ from default */
}
```

Unoverridden tokens fall through to `:root` via the CSS cascade.

---

## Canonical Token Path Rules

Canonical token paths MUST follow a strict, deterministic grammar.
These paths define the semantic hierarchy of the canonical model and MUST NOT reflect platform or tool‑specific structures.

### Path Grammar

Canonical token paths MUST:

- use dot‑delimited segments
- use lowercase only
- contain no hyphens, underscores, or slashes
- contain no platform names (`css`, `ios`, `android`, etc.)
- contain no component names or implementation details
- contain no Figma naming constructs (slash notation, groups, collections)
- reflect semantic structure only

### Notes

- Path segments MUST be meaningful semantic categories (e.g. `color.action.accent`).
- Normalization (ADR‑0002) is responsible for converting Figma variable names — including hyphenated names — into canonical dot‑notation paths according to ADR‑0003.
- Canonical paths MUST remain stable across versions unless a breaking change is explicitly governed.

---

## Canonical Naming Grammar & Transform Relationship

The canonical model defines the authoritative naming grammar for all Cedar design tokens.
Canonical token paths MUST use dot‑delimited notation, and this structure is the only naming format consumed by downstream transformation layers.

### Canonical Naming Rules

Canonical token paths MUST:

- use dot‑delimited segments
- use lowercase only
- contain no hyphens, underscores, or slashes
- contain no platform names (`css`, `ios`, `android`, etc.)
- contain no component names or implementation details
- reflect semantic structure only

### Relationship to Figma Naming

Normalization (ADR‑0002) is responsible for converting Figma's slash‑notation variable names and hyphenated collection names into canonical dot‑notation paths according to the Figma Input Contract (ADR‑0003).
The canonical model MUST NOT contain Figma naming constructs or hyphenated path segments.

### Relationship to Platform Transforms

All platform transformers — including Style Dictionary — MUST consume the canonical model and MUST NOT read raw Figma data directly.

Transform layers MAY convert canonical paths into platform‑specific naming conventions:

- CSS: kebab‑case
- iOS: camelCase
- Android: snake_case

The canonical dot‑notation path remains the single source of truth and MUST NOT be altered by platform transforms.

---

## Supported Canonical Token Types

The canonical model defines a set of token types that MUST be represented using structured, platform‑agnostic values.
All token types MUST conform to the canonical JSON Schema and MUST NOT use platform‑specific formats.

---

### 1. Color

#### Rules

- Hex and RGBA objects are implicitly **sRGB**.
- Wide‑gamut colors MUST declare a `space` field.
- Allowed `space` values:
  - `"srgb"` (implicit)
  - `"display-p3"`
- P3 values MUST be normalized floats (`0–1`).
- Platform transforms are responsible for converting P3 to platform‑specific equivalents.

#### Allowed `$value` formats

- `"#RRGGBB"`
- `{ "r": 255, "g": 255, "b": 255, "a": 1 }`
- `{ "space": "display-p3", "r": 1, "g": 1, "b": 1 }`

#### Not allowed in `$value`

- CSS strings (`rgba(...)`, `hsl(...)`)
- HSL strings
- platform‑specific formats (UIColor, ARGB hex)

---

### 2. Dimension

All dimensional values MUST be structured:

```json
{ "value": 16, "unit": "px" }
```

#### Allowed units

- `px`
- `unitless`
- `percent`
- `em` (discouraged in canonical)
- `rem` (discouraged in canonical)

---

### 3. Fluid Dimension

Fluid dimensions express values that scale between a minimum and maximum across viewport widths.
They are produced by the Normalization Layer from multi-breakpoint spacing input files.

```json
{
  "$type": "fluid",
  "$value": "clamp(14.08px, 0.62vw + 12.096px, 24px)"
}
```

The `clamp()` string is the canonical value for fluid tokens.
Platform transforms that do not support fluid values (iOS, Android) MUST use the minimum value.

---

### 4. Typography (Composite Token)

Typography tokens MUST be structured objects.
No CSS strings or platform font stacks.

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

#### Rules

- `fontFamily` MUST be a semantic alias
- `fontWeight` MUST be numeric (100–900) or an alias
- `fontSize`, `lineHeight`, `letterSpacing` MUST be structured `{ value, unit }`
- `lineHeight` MUST declare its unit

---

### 5. Shadow (Composite Token)

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

#### Rules

- MUST be an array of shadow layers
- each layer MUST use structured dimension objects
- `color` MUST be a canonical color or alias

---

### 6. Other Composite Types

Future composite types (e.g. grid, border, motion, transitions, layout primitives) MUST follow the same structured, platform‑agnostic pattern:

- no CSS strings
- no platform‑specific values
- no flattened or stringified structures
- MUST use structured objects for all numeric or dimensional values

---

### Notes

- All token types MUST be validated by the canonical JSON Schema.
- New token types MUST define a canonical shape, validation rules, and normalization rules before being added to the system.

---

## Alias Rules

### Aliases MUST remain unresolved in `$value`

Canonical tokens may reference other canonical tokens using DTCG alias syntax:

```json
"$value": "{color.text.base}"
```

Aliases in `$value` MUST NOT be resolved, flattened, or replaced during normalization or canonicalization.
Pre‑computed resolved values belong in `$resolved`, not in `$value` (see `$resolved` Rules).

### Requirements

Alias tokens MUST:

- reference a valid canonical token path
- use DTCG alias syntax (`{path.to.token}`)
- preserve semantic relationships
- be validated for cycles
- be validated for type compatibility

Alias tokens MUST NOT:

- contain raw values in `$value`
- resolve other aliases in `$value`
- reference platform‑specific tokens
- reference Figma variable names or slash notation

### Rationale

Leaving aliases unresolved in `$value`:

- preserves semantic intent
- enables platform‑specific resolution strategies
- supports diff‑friendly governance
- avoids premature flattening
- ensures consistent behaviour across all platforms

### Example

```json
{
  "color": {
    "palettes": {
      "default": {
        "action": {
          "accent": {
            "$type": "color",
            "$value": "{color.option.warm.grey.600}",
            "$resolved": {
              "ios": { "light": "#6b6b6b", "dark": "#9a9a9a" },
              "web": { "light": "#6b6b6b", "dark": "#9a9a9a" }
            },
            "$extensions": {
              "cedar": {
                "source": "figma",
                "figmaName": "Primary/Button/Background"
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Metadata Rules

All metadata not defined by DTCG MUST be stored under:

```
$extensions.cedar
```

Metadata MAY include:

- `figmaId`
- `styleId`
- `variableCollectionId`
- documentation metadata
- raw mode identifiers
- provenance information from normalization

### Requirements

Metadata MUST:

- be stored only under `$extensions.cedar`
- be preserved during normalization and canonicalization
- be ignored by token resolution and platform transforms
- not affect `$value` or token semantics

Metadata MUST NOT:

- appear outside `$extensions.cedar` (with the exception of `$resolved` and `$meta`, which are governed by their own rules)
- change the meaning of a token
- override canonical values
- encode platform‑specific behaviour
- encode Figma naming structures

### Notes

- Metadata is optional but strongly recommended for governance and traceability.
- Metadata MUST NOT be used as a substitute for semantic structure or canonical fields.
- Future metadata fields MUST be added under `$extensions.cedar` to maintain schema stability.
- `$resolved` and palette `$meta` are first‑class canonical fields governed by separate rules in this ADR, not metadata stored under `$extensions.cedar`.

---

## Canonical Token Tiers

The canonical model defines three tiers of tokens.
These tiers are essential for semantic token implementation, lifecycle validation, and governance.

### 1. Option Tokens

Option tokens are the lowest‑level, non‑alias, non‑semantic values.
They represent raw, concrete design values.

Examples:

- raw colors
- raw spacing values
- raw typography metrics
- raw radii

#### Requirements

Option tokens MUST:

- define a concrete `$value`
- be stable and versioned
- use structured values appropriate to their type

Option tokens MUST NOT:

- reference other tokens
- contain aliases
- contain platform‑specific values
- carry a `$resolved` field (their `$value` is already concrete)

#### Relationship to Normalization

Normalization (ADR‑0002) typically produces **alias** tokens derived from Figma variables.
Option tokens are generally authored manually as part of the design system's foundational palette and are not expected to be generated from Figma inputs.

#### Example

```json
{
  "color": {
    "option": {
      "warm": {
        "grey": {
          "600": {
            "$type": "color",
            "$value": "#6B6B6B"
          }
        }
      }
    }
  }
}
```

---

### 2. Alias Tokens

Alias tokens reference other canonical tokens using DTCG alias syntax.
They are the semantic backbone of Cedar — the stable API consumed by designers and developers.

Alias tokens MUST:

- reference a valid canonical token path in `$value`
- preserve semantic relationships
- be validated for cycles
- be validated for type compatibility
- carry a `$resolved` field for color tokens (populated by the Normalization Layer)

Alias tokens MUST NOT:

- contain raw values in `$value`
- resolve other aliases in `$value`
- reference platform‑specific tokens
- reference Figma variable names or slash notation

#### Example

```json
{
  "color": {
    "palettes": {
      "default": {
        "action": {
          "accent": {
            "$type": "color",
            "$value": "{color.option.warm.grey.600}",
            "$resolved": {
              "ios": { "light": "#6b6b6b", "dark": "#9a9a9a" },
              "web": { "light": "#6b6b6b", "dark": "#9a9a9a" }
            },
            "$extensions": {
              "cedar": {
                "source": "figma",
                "figmaName": "Primary/Button/Background"
              }
            }
          }
        }
      }
    }
  }
}
```

---

### 3. Semantic Tokens

Semantic tokens represent design intent, not implementation details.
They define the meaning of a token within the design system.

Examples:

- `color.palettes.default.action.accent`
- `color.palettes.default.text.primary`
- `space.component.sm`

#### Requirements

Semantic tokens MUST:

- reference option or alias tokens
- remain stable across palettes, appearances, and versions
- support multi‑palette and multi‑appearance structures

Semantic tokens MUST NOT:

- contain raw values
- encode platform‑specific behaviour
- reference Figma naming constructs

---

### Notes

- The tier hierarchy (Option → Alias → Semantic) MUST be preserved across all token categories.

---

## Platforms

Platform overrides allow a semantic token to define platform‑specific values without polluting `$value`.

Overrides are stored under `$extensions.cedar.platformOverrides`.

```json
{
  "$type": "color",
  "$value": "{color.palettes.default.action.accent}",
  "$extensions": {
    "cedar": {
      "platformOverrides": {
        "ios": { "$value": "#123456" },
        "android": { "$value": "#654321" }
      }
    }
  }
}
```

Platform overrides MUST:

- be optional
- be validated for type correctness

Platform overrides MUST NOT:

- change the canonical `$value`

The Transform Layer MAY choose to consume overrides per platform.

---

## Canonical JSON Structure

The canonical model MUST be a deeply nested JSON object representing semantic hierarchy.

Top‑level keys reflect token categories. Color tokens are organised under `color.option` (foundational option values) and `color.modes` (semantic alias tokens per palette). `color.primitives` MUST NOT appear in the canonical output — the four Figma platform files are normalization input only, consumed via `token-mapping.json` to build `color.option`.

```json
{
  "color": {
    "option": {
      "neutral": {
        "warm": {
          "grey": {
            "900": {
              "$type": "color",
              "$value": "#2e2e2b",
              "$extensions": {
                "cedar": {
                  "appearances": { "dark": "#edeae3" },
                  "platformOverrides": {
                    "ios": { "light": "#1c1c1c" }
                  }
                }
              }
            }
          }
        },
        "white": { "$type": "color", "$value": "#ffffff" },
        "overlay": {
          "light":  { "$type": "color", "$value": "#ffffffd9" },
          "subtle": { "$type": "color", "$value": "#ffffffbf" }
        }
      },
      "brand": {
        "blue": {
          "600": {
            "$type": "color",
            "$value": "#0b2d60",
            "$extensions": {
              "cedar": {
                "appearances": { "dark": "#406eb5" },
                "platformOverrides": {
                  "ios": { "light": "#0040dd", "dark": "#0a84ff" }
                }
              }
            }
          }
        }
      }
    },
    "modes": {
      "default": {
        "$extensions": {
          "cedar": {
            "$meta": { "scope": "root", "isBaseline": true }
          }
        },
        "text": {
          "base": {
            "$type": "color",
            "$value": "{color.option.neutral.warm.grey.900}",
            "$extensions": {
              "cedar": {
                "ios": {
                  "light": "color.option.neutral.warm.grey.900",
                  "dark":  "color.option.neutral.warm.grey.900"
                },
                "web": {
                  "light": "color.option.neutral.warm.grey.900",
                  "dark":  "color.option.neutral.warm.grey.900"
                }
              }
            }
          }
        }
      }
    }
  },
  "spacing": {
    "scale": {
      "-100": {
        "$type": "fluid",
        "$value": "clamp(4.8px, 0.25vw + 4px, 8px)"
      }
    },
    "component": {
      "sm": {
        "$type": "number",
        "$value": "{spacing.scale.-100}"
      }
    }
  }
}
```

---

## Validation Requirements

The canonical model MUST be validated using:

### 1. JSON Schema (source of truth)

Validates:

- token structure
- allowed `$type` values
- `$value` shape per type
- `$resolved` shape (platform → appearance → hex)
- `$meta` shape on palette roots
- color format correctness
- dimensional units
- composite token structure
- alias syntax
- path grammar (no hyphens, no platform names)

### 2. TypeScript types (generated from schema)

Validates:

- developer usage
- transform logic
- helper utilities

### 3. CI Enforcement

- Invalid canonical tokens MUST fail the build.
- Stale `$resolved` values (inconsistent with `$value`) MUST emit a warning.
- Palettes missing `$meta` MUST fail the build.
- Palette inheritance cycles MUST fail the build.

---

## Non‑Responsibilities

The canonical model does **not**:

- define platform‑specific values
- resolve aliases in `$value`
- generate CSS, iOS, or Android output
- enforce design‑time constraints in Figma
- store platform transforms

Those responsibilities belong to other layers.

---

## Future Considerations

- Canonical motion tokens
- Canonical grid and layout tokens
- Canonical accessibility tokens
- `$resolved` for non‑color token types (e.g. fluid spacing min‑value per platform)
- Automated staleness detection for `$resolved` in CI

---

## Related Documents

- ADR‑0002: Normalization Layer
- ADR‑0003: Figma Input Contract
- ADR‑0007: Modes and Palettes
- Data Architecture Diagram (`../diagrams/v0-data-architecture.md`)