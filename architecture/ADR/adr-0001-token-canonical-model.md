# ADR‑0001: Canonical Token Model and Shape Constraints (Draft)

## Status
Proposed (V0 Spike)

## Context
Cedar currently produces design tokens for web, iOS, and Android, but the native outputs are significantly out of date and are not actively consumed by product teams today. The existing token definitions are curated in a web‑shaped YAML structure and compiled through Style Dictionary into CSS, JS, and legacy native formats.

Recently, Cedar introduced a TypeScript output and an initial interface contract to improve type safety and consumption on the web. The current token structure is curated with the intention of aligning with the W3C Design Token Community Group (DTCG) specification as closely as Style Dictionary allows, but there is no enforced canonical schema or validation layer.

This spike focuses on a limited, web‑only workflow: creating a small set of Figma assets, extracting tokens via the Figma REST API, transforming them into a governed Canonical Token Model, and generating CSS variables through Style Dictionary. Native platform outputs and bidirectional Figma ↔ Style Dictionary synchronization are future requirements but explicitly out of scope for this spike.

To support a one‑directional Figma → Style Dictionary pipeline, the system needs a canonical token model that defines the authoritative shape all tokens must conform to before entering the pipeline.

## Decision
Establish a **Canonical Token Model** aligned with the W3C Design Token Community Group (DTCG) specification. This model defines the governed, platform‑agnostic shape all design tokens must conform to before entering the Cedar token pipeline.

This model:
- uses DTCG‑standard fields (`$value`, `$type`, `$description`, `$extensions`)
- supports nested token grouping
- allows aliasing through DTCG‑compatible references
- enforces required fields and valid types
- removes design‑only metadata
- stabilizes token shapes for downstream consumption
- ensures reproducibility and diff‑friendly outputs

A future normalization layer may transform raw Figma exports into this canonical model, but the canonical model itself is the architectural contract defined by this ADR.

Style Dictionary consumes a **transformed** version of the canonical model, not the canonical model directly.

## Alignment with DTCG
The Canonical Token Model defined in this ADR is aligned with the **W3C Design Token Community Group (DTCG) Specification**. Cedar adopts the DTCG’s core token types and value structures as the baseline schema and applies additional Cedar‑specific governance rules through `$extensions.cedar`.

Cedar may extend or restrict DTCG‑defined fields where required by governance, platform constraints, or semantic clarity.

## Canonical Token Shape (V0)

```json
{
  "color": {
    "background": {
      "default": {
        "$type": "color",
        "$value": "#FFFFFF",
        "$description": "Default background color.",
        "$extensions": {
          "cedar": {
            "figmaId": "1234",
            "docs": {
              "category": "colors",
              "type": "background",
              "example": "color"
            }
          }
        }
      }
    }
  }
}

```

## Shape Constraints

- tokens must use DTCG‑standard fields (`$value`, `$type`, `$description`, `$extensions`)
- `$type` must match a governed enum (color, dimension, typography, radii, opacity, etc.)
- `$value` must match the schema for its `$type`
- tokens must be nested; flattened IDs are not part of the canonical model
- `$extensions.cedar` may include metadata such as `figmaId`
- tokens must not introduce duplicate paths
- tokens must not introduce platform‑specific overrides
- tokens must not include design‑only metadata (geometry, layout, plugin artifacts)

## Examples

### Color token

```json
{
  "color": {
    "background": {
      "default": {
        "$type": "color",
        "$value": "#FFFFFF",
        "$description": "Default background color.",
        "$extensions": {
          "cedar": {
            "figmaId": "1234",
            "docs": {
              "category": "colors",
              "type": "background",
              "example": "color"
            }
          }
        }
      }
    }
  }
}
```

### Dimension token

#### fixed

```json
{
  "spacing": {
    "200": {
      "$type": "dimension",
      "$value": "16px",
      "$extensions": {
        "cedar": {
          "figmaId": "5678",
          "docs": {
              "category": "spacing",
              "type": "fixed space",
              "example": "spacing fixed"
            }
          
        }
      }
    }
  }
}
```

#### fluid 

```json
{
  "scale": {
    "0": {
      "$type": "dimension",
      "$value": {
        "min": "0.2rem",
        "ideal": "0.2rem + 0.11cqi",
        "max": "0.3rem"
      },
      "$description": "Fluid spacing using a min/ideal/max clamp structure.",
      "$extensions": {
        "cedar": {
          "docs": {
            "type": "fluid space",
            "category": "spacing",
            "example": "clamp"
          }
        }
      }
    }
  }
}
```

## Canonical Model Governance: Do’s and Don’ts

| **Category** | **Do** | **Don’t** |
|--------------|--------|-----------|
| **Platform Neutrality** | Keep the canonical model free of platform‑specific constructs. | Encode CSS (`clamp()`, `calc()`, `cqi`), iOS (`UIColor`), Android (`dp`, `sp`), or SD‑specific logic. |
| **Value Structure** | Represent composite or fluid values as structured objects (`min`, `ideal`, `max`). | Store composite values as CSS expressions or platform‑specific formulas. |
| **DTCG Compliance** | Use DTCG fields: `$value`, `$type`, `$description`, `$extensions`. | Add custom top‑level fields like `docs`, `figmaId`, or non‑DTCG metadata. |
| **Token Paths** | Use semantic, platform‑agnostic nesting (`color/background/default`). | Use SD‑shaped or file‑system‑shaped paths (`options/color/warm-grey-900`). |
| **Aliasing** | Use DTCG alias syntax referencing canonical paths (`{color.background.default}`). | Use SD alias paths (`{options.color.warm-grey-900}`). |
| **Metadata** | Store Cedar‑specific metadata under `$extensions.cedar`. | Scatter metadata across the token or mix it with DTCG fields. |
| **Type Governance** | Use governed `$type` enums (`color`, `dimension`, `font`, etc.). | Invent new types like `"clamp"` or `"fluid"` that aren’t part of the governed type system. |
| **Descriptions** | Write `$description` as a human‑readable explanation of intent. | Encode implementation details or platform logic in `$description`. |
| **Validation** | Validate tokens before transformation (schema, types, alias resolution). | Allow invalid shapes, duplicate paths, or platform‑specific constructs into the canonical model. |
| **Transforms** | Let platform transforms generate CSS, iOS, Android, and Figma outputs. | Bake platform logic into the canonical source of truth. |
