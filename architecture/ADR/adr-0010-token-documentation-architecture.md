# ADR-0010: Token Documentation Architecture

## Status
Implemented

---

## Context

Developers need to understand the purpose and usage of design tokens when consuming them in code. Descriptions added in Figma should automatically flow through the token pipeline and appear in generated TypeScript type definitions as JSDoc comments.

This ADR describes how token descriptions are:
1. Captured from Figma
2. Normalized and stored in the canonical token tree
3. Extracted and formatted as JSDoc in generated types

---

## Purpose

Define a governed mechanism for:
- Adding descriptions to tokens in Figma
- Preserving descriptions through the normalization pipeline
- Generating rich TypeScript type definitions with inline documentation

---

## Architecture

### 1. Figma Input Contract

Token descriptions are added in Figma's **Local Variables** UI:

```
Collection: neutral-palette
Variable: warm-grey / 100
Description: "Warm neutral base, used for backgrounds"
```

Descriptions are exported by the Figma sync as `$description` fields in token files:

```json
{
  "warm-grey": {
    "100": {
      "$type": "color",
      "$value": "#edeae3",
      "$description": "Warm neutral base, used for backgrounds"
    }
  }
}
```

**Guidelines:**
- Descriptions should be 5-12 words describing the purpose/usage
- Keep to one concise sentence (under 100 characters)
- Focus on semantic intent, not technical details
- Empty descriptions are ignored during normalization

### 2. Normalization Layer

The normalization pipeline extracts descriptions from Figma tokens:

#### `applyTokenMapping()` (normalize-utils.ts)

- Extracts `$description` from each Figma token
- Only includes descriptions that are non-empty after trimming
- Returns description alongside `$type` and `$value`

#### `buildOptionTree()` (normalize-utils.ts)

- Wraps descriptions into `$extensions.cedar.docs.summary`
- Preserves the `$extensions.cedar` structure for Style Dictionary compatibility
- Schema: `$extensions.cedar.docs.summary` → string

#### Canonical Token Structure

```json
{
  "color": {
    "option": {
      "neutral": {
        "warm": {
          "grey": {
            "100": {
              "$value": "#edeae3",
              "$type": "color",
              "$extensions": {
                "cedar": {
                  "docs": {
                    "summary": "Warm neutral base, used for backgrounds"
                  }
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

### 3. TypeScript Type Generation

The `build-style-dictionary.ts` build step:

1. Reads the canonical token tree with descriptions
2. For each token, extracts `$extensions.cedar.docs.summary`
3. Generates JSDoc comments above TypeScript interface properties
4. Produces generated types with inline documentation

#### Generated TypeScript

```typescript
export interface CdrColorOptionTokens {
  /** Warm neutral base, used for backgrounds */
  "color_option_neutral_warm_grey_100": string;
  
  "color_option_neutral_warm_grey_300": string;
}
```

---

## Decision

1. **Description Storage:** Use `$extensions.cedar.docs.summary` to store descriptions in the canonical tree
   - Rationale: Aligns with DTCG `$extensions` convention for tool-specific metadata
   - Rationale: Preserved through Style Dictionary without conflicts
   - Rationale: Accessible during TypeScript generation

2. **Scope - Option vs. Semantic Tokens:**
   - ✅ Option tokens (primitives) **can have descriptions** from Figma
   - ❌ Semantic tokens (aliases) **do not have Figma descriptions** 
   - Rationale: Semantic tokens represent Cedar component responsibilities, not design system primitives
   - Rationale: Cedar component documentation is the source of truth for semantic usage

3. **Generation Strategy:** Extract during build, not at runtime
   - Rationale: Zero runtime cost
   - Rationale: Descriptions are reference/development tools only

---

## Implementation Details

### For Designers Adding Descriptions in Figma

1. Open your Figma file
2. Activate **Assets → Local Variables**
3. Select a variable (e.g., `neutral-palette / warm-grey / 100`)
4. Scroll down in the right panel to **Description**
5. Enter a concise description: "Purpose of this token"
6. Sync to cedar-token-pipeline

Descriptions auto-flow through the next pipeline run.

### For Developers Consuming Generated Types

Generated types include helpful JSDoc comments:

```typescript
import { CdrColorOptionTokens } from '@rei-dot-com/types/foundations/colors';

// TypeScript IDE shows:
// "Warm neutral base, used for backgrounds"
const bgColor: string = CdrColorOptionTokens['color_option_neutral_warm_grey_100'];
```

### For Pipeline Maintainers

The normalization process:

```
Figma token files → applyTokenMapping() → buildOptionTree()
                     ↓
                 Extract $description
                     ↓
           $extensions.cedar.docs.summary
                     ↓
              build-style-dictionary.ts
                     ↓
        renderModuleInterface() extracts docs → JSDoc
```

---

## Future Extensions

### Semantic Token Documentation

In a future phase, semantic tokens may gain documentation through:
- Cedar component documentation system
- Token annotation system in alias files
- Component metadata federation

### Rich Documentation Object

The `docs` field may be extended:

```json
{
  "$extensions": {
    "cedar": {
      "docs": {
        "summary": "...",
        "usage": "...",
        "design": "...",
        "related": ["..."]
      }
    }
  }
}
```

---

## References

- [ADR-0001: Canonical Token Model](./adr-0001-token-canonical-model.md)
- [ADR-0002: Token Normalization Layer](./adr-0002-token-normalization-layer.md)
- [ADR-0003: Figma Input Contract](./adr-0003-figma-input-contract.md)
- [Adding Token Descriptions in Figma](../adding-token-descriptions.md)
- [DTCG Specification](https://design-tokens.github.io/community-group/format/)
