# Adding Token Descriptions in Figma

## Overview

Token descriptions are metadata added in Figma that flow through the token pipeline and appear as JSDoc comments in generated TypeScript types. They help developers understand the purpose and usage of design tokens.

## Where to Add Descriptions

### For Option Tokens (Primitive Colors)

Option tokens are defined in Figma collections (e.g., "neutral-palette") with variables like:
- `neutral-palette / warm-grey / 100`
- `brand-palette / blue / 400`

To add a description:

1. Open your Figma file
2. Navigate to **Assets → Local Variables**
3. Find the variable you want to describe (e.g., `neutral-palette / warm-grey / 100`)
4. Click on the variable to select it
5. In the right panel, scroll down to find the **Description** field
6. Enter a clear, concise description of the color's purpose

### For Semantic Tokens (Aliases)

Semantic tokens are defined in the alias files (e.g., `alias.color.default.json`). These tokens reference option tokens and represent semantic use cases (e.g., "surface", "text-primary").

**Note:** Descriptions for semantic tokens should come from Cedar component documentation, not from Figma. The pipeline treats semantic tokens as UI component responsibilities.

## Description Guidelines

### For Option Tokens

Descriptions should be brief and describe the **purpose or use case** of the color:

✅ **Good Examples:**
- "Warm neutral base, used for backgrounds"
- "Light neutral, used for subtle borders"
- "Brand blue for primary actions"
- "Accent red for alerts and error states"

❌ **Avoid:**
- Technical hex values ("This is #2e2e2b")
- Redundant information ("A grey color")
- Implementation details ("Used in buttons")
- Extra whitespace or formatting

### Optimal Length

- **Ideal:** 5-12 words
- **Maximum:** One concise sentence (under 100 characters)

### Avoid Empty Descriptions

If a token doesn't have a clear purpose, investigate whether it's needed or if it should be documented differently.

## How Descriptions Flow Through the Pipeline

1. **Figma Sync** → Descriptions are exported as `$description` fields in option token files
2. **Normalization** → The `applyTokenMapping` function extracts descriptions from Figma tokens
3. **Canonical Tree** → Descriptions are stored in `$extensions.cedar.docs.summary`
4. **Type Generation** → Descriptions become JSDoc comments in TypeScript type definitions

## Examples

### Option Token Description in Figma

```
Collection: neutral-palette
Variable: warm-grey / 100
Description: Warm neutral base, used for backgrounds
```

### Generated Canonical Token

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

### Generated TypeScript Type

```typescript
export interface CdrColorOptionTokens {
  /** Warm neutral base, used for backgrounds */
  "color_option_neutral_warm_grey_100": string;
  // ... other tokens
}
```

## Current Status

- ✅ Option tokens support descriptions (Figma → canonical → TypeScript)
- ✅ Descriptions appear as JSDoc comments in generated types
- ⏳ Semantic token descriptions will be added in a future phase

## Related Documentation

- [ADR-0001: Token Canonical Model](./ADR/adr-0001-token-canonical-model.md) - Describes the token structure
- [ADR-0004: Semantic Token Architecture](./ADR/adr-0004-semantic-token-architecture.md) - Describes semantic tokens
- [Token Normalization](./ADR/adr-0003-figma-input-contract.md) - Describes the Figma Input Contract
