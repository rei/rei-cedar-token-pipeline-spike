# ADR-0010: Token Documentation Architecture

## Status
Implemented

---

## Context

Developers need both descriptive docs and governance metadata when consuming tokens in code and Storybook. Figma descriptions provide useful primitive context, but they do not cover release governance fields such as status, deprecation, migration, and used-by references.

This ADR defines a two-authority documentation model:
1. Figma-authored docs for token descriptions
2. Repo-authored governance metadata for lifecycle and usage controls
3. Canonical merge rules and downstream generation behavior

---

## Purpose

Define a governed mechanism for:
- Adding descriptions to primitive tokens in Figma
- Authoring structured governance metadata in-repo for semantic, lifecycle, and type-specific fields
- Preserving both data sources through normalization
- Generating TypeScript outputs and docs artifacts without losing authority boundaries
- Supporting machine-forward metadata for automated reasoning, accessibility validation, and agent-driven token selection
- Separating repo-authored governance from pipeline-computed accessibility and platform data

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

### 2. Repo metadata contract

Governance metadata is authored in `metadata/tokens.json`, keyed by canonical token path.

Example (color token with full metadata):

```json
{
  "color.modes.default.text.base": {
    "status": "stable",
    "badges": [{ "label": "stable", "tone": "stable" }],
    "usage": {
      "roles": ["foreground"],
      "contexts": ["text"],
      "aliases": ["text.base"],
      "pairingRules": {
        "allowedWith": ["color.background.neutral.*", "color.background.brand.*"],
        "prohibitedWith": ["color.background.sale.*"],
        "rationale": "Neutral text on sale backgrounds fails WCAG AA contrast"
      }
    },
    "usedBy": ["cdr-card", "cdr-modal"],
    "authority": "Cedar Design System",
    "accessibility": {
      "oklch": {
        "light": { "l": 0.18, "c": 0.01, "h": 275 },
        "dark": { "l": 0.92, "c": 0.01, "h": 275 }
      },
      "contrastPairs": [
        {
          "with": "color.background.base",
          "ratio": 7.4,
          "level": "AAA",
          "mode": "light"
        }
      ],
      "alternates": {
        "contrastAlternates": [
          { "token": "color.text.strong", "ratio": 7.1, "level": "AAA" }
        ],
        "roleAlternates": ["color.text.secondary"],
        "platformAlternates": {
          "ios": ["color.text.iosFallback"],
          "web": ["color.text.webFallback"]
        }
      },
      "minRequired": "AA"
    }
  }
}
```

This metadata is normalized under `$extensions.cedar.governance` and is not sourced from Figma.

#### Machine-forward metadata model

To support automated reasoning, accessibility validation, and agent-driven token selection, metadata is structured into sibling sections under `$extensions.cedar`:

- **`governance`** - Repo-authored lifecycle metadata (status, badges, deprecation, authority, usedBy)
- **`usage`** - Structured semantic roles and pairing rules (repo-authored)
- **`accessibility`** - Pipeline-computed OKLCH values, contrast pairs, intervals (machine-generated)
- **`platform`** - Platform references and resolved values (pipeline-computed)
- **`colorFamily`** - Transform-layer color family identifier for OKLCH chroma curve overrides (schema-defined)

This separation maintains clear authority boundaries:
- Figma → `$extensions.cedar.docs.summary`
- Repo metadata → `governance`, `usage`, type-specific metadata
- Pipeline → `accessibility`, `platform.resolved`
- Transform layer → `colorFamily` (from token schema, not repo metadata)

#### Type-specific metadata

Different token types include type-specific metadata sections:

- **Color tokens**: `accessibility` (OKLCH values, contrast pairs, intervals, alternates, minRequired)
- **Dimension/Spacing tokens**: No additional metadata required. Fluid spacing uses `clamp()` expressions directly in `$value`, computed from multiple breakpoint files during normalization. Breakpoint tokens use simple dimension values.
- **Typography tokens**: `typography` (font stack, line-height ratio, scale)
- **Shadow tokens**: `elevation` (z-index, depth level)
- **Motion tokens**: `motion` (duration, curve, pattern)

Type-specific sections are optional and only included when relevant to the token's category.

### 3. Normalization layer

The normalization pipeline merges both documentation authorities:

#### `applyTokenMapping()` (normalize-utils.ts)

- Extracts `$description` from each Figma token
- Only includes descriptions that are non-empty after trimming
- Returns description alongside `$type` and `$value`

#### `buildOptionTree()` (normalize-utils.ts)

- Wraps descriptions into `$extensions.cedar.docs.summary`
- Stores `colorFamily` from the token schema mapping entry into `$extensions.cedar.colorFamily`
- Preserves the `$extensions.cedar` structure for Style Dictionary compatibility
- Schema: `$extensions.cedar.docs.summary` → string, `$extensions.cedar.colorFamily` → string (optional)

#### `mergeMetadata()` (merge-metadata.ts)

- Walks canonical leaf tokens by dot path
- Looks up corresponding entries in `metadata/tokens.json`
- Attaches matches under `$extensions.cedar.governance`
- Preserves existing `$extensions.cedar.docs` from Figma without overwrite

#### `validate-metadata.ts`

- Flags canonical tokens with no metadata entry (unreviewed)
- Flags orphaned metadata entries not present in canonical
- Flags incomplete governance entries and deprecated tokens missing migration guidance
- Validates `colorFamily` is a string when present (from canonical-contract.test.ts)

#### Transform layer usage

The `colorFamily` field is consumed by the web CSS transform layer (`style-dictionary/actions/web/web-css-transform.ts`):

- Read from `$extensions.cedar.colorFamily` on color option tokens
- Passed to `hexToCustomOklch()` in `oklch-formulas.ts` to select the appropriate chroma curve
- Falls back to culori's default conversion if `colorFamily` is not provided or not found
- See ADR-0005 for OKLCH chroma curve override details

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
                  },
                  "governance": {
                    "status": "stable",
                    "badges": [{ "label": "stable", "tone": "stable" }],
                    "authority": "Cedar Design System",
                    "usedBy": ["cdr-card", "cdr-modal"]
                  },
                  "usage": {
                    "roles": ["background"],
                    "contexts": ["surfaces"],
                    "semanticTier": "primitive",
                    "aliases": ["surface.base"],
                    "pairingRules": {
                      "allowedWith": ["color.text.neutral.*"],
                      "prohibitedWith": []
                    }
                  },
                  "colorFamily": "warm-grey",
                  "accessibility": {
                    "oklch": {
                      "light": { "l": 0.92, "c": 0.01, "h": 275 },
                      "dark": { "l": 0.18, "c": 0.01, "h": 275 }
                    },
                    "contrastPairs": [
                      {
                        "with": "color.text.base",
                        "ratio": 7.4,
                        "level": "AAA",
                        "mode": "light"
                      }
                    ],
                    "intervals": [
                      {
                        "against": "color.text.base",
                        "mode": "light",
                        "AA": { "minL": 0.85, "maxL": 0.95 },
                        "AAA": { "minL": 0.88, "maxL": 0.95 }
                      }
                    ],
                    "alternates": {
                      "contrastAlternates": [
                        { "token": "color.background.subtle", "ratio": 6.8, "level": "AA" }
                      ],
                      "roleAlternates": ["color.background.raised"],
                      "platformAlternates": {
                        "ios": ["color.background.iosFallback"],
                        "web": ["color.background.webFallback"]
                      }
                    },
                    "minRequired": "AA"
                  },
                  "platform": {
                    "ios": {
                      "light": "color.option.neutral.warm.grey.100",
                      "dark": "color.option.neutral.warm.grey.900"
                    },
                    "web": {
                      "light": "color.option.neutral.warm.grey.100",
                      "dark": "color.option.neutral.warm.grey.900"
                    },
                    "resolved": {
                      "ios": { "light": "#edeae3", "dark": "#1c1c1c" },
                      "web": { "light": "#edeae3", "dark": "#2e2e2b" }
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
}
```

### 4. TypeScript type generation

The `build-style-dictionary.ts` build step:

1. Reads the canonical token tree with descriptions
2. For each token, extracts `$extensions.cedar.docs.summary`
3. Generates JSDoc comments above TypeScript interface properties
4. Produces generated types with inline documentation

Governance metadata is also emitted as docs JSON artifacts for consumers via generated module docs files.

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

1. **Authority split:**
  - Figma is the authority for primitive documentation summaries
  - Repo metadata is the authority for governance fields (status, badges, deprecation, authority, used-by)
  - Repo metadata is the authority for structured usage (roles, contexts, pairing rules)
  - Pipeline is the authority for accessibility data (OKLCH, contrast pairs, intervals)
  - Pipeline is the authority for platform data (references, resolved values)

2. **Canonical storage:**
  - Store Figma docs in `$extensions.cedar.docs`
  - Store repo governance metadata in `$extensions.cedar.governance`
  - Store structured usage in `$extensions.cedar.usage`
  - Store accessibility data in `$extensions.cedar.accessibility`
  - Store platform references and resolved values in `$extensions.cedar.platform`

3. **Description Storage:** Use `$extensions.cedar.docs.summary` to store descriptions in the canonical tree
   - Rationale: Aligns with DTCG `$extensions` convention for tool-specific metadata
   - Rationale: Preserved through Style Dictionary without conflicts
   - Rationale: Accessible during TypeScript generation

4. **Structured usage:** Replace free-form `usage` strings with structured objects
   - `roles`: Array of semantic roles (e.g., ["foreground", "background"])
   - `contexts`: Array of usage contexts (e.g., ["text", "surfaces"])
   - `semanticTier`: Token tier ("primitive", "semantic", "component")
   - `aliases`: Array of common alias names
   - `pairingRules`: Allowed/prohibited token pairings with glob patterns and rationale
   - Rationale: Machine-readable for automated validation and agent-driven token selection

5. **Machine-forward accessibility:** Include structured accessibility data for color tokens
   - `oklch`: Lightness, chroma, hue values per appearance
   - `contrastPairs`: Pre-computed contrast ratios against common backgrounds
   - `intervals`: OKLCH lightness ranges where AA/AAA pass
   - `alternates`: Machine-selectable fallback tokens (contrast, role, platform)
   - `replacements`: Required replacement tokens for deprecated tokens
   - `minRequired`: Minimum WCAG level for this token's role
   - Rationale: Enables automated validation, substitution, and palette evolution

6. **Type-specific metadata:** Include category-specific metadata as sibling sections
   - Color tokens: `accessibility` (OKLCH, contrast pairs, intervals, alternates)
   - Dimension tokens: `layout` (paradigm, scale position, composition)
   - Typography tokens: `typography` (font stack, line-height ratio, scale)
   - Shadow tokens: `elevation` (z-index, depth level)
   - Motion tokens: `motion` (duration, curve, pattern)
   - Rationale: Enables automated validation per token category

7. **Scope - Option vs. Semantic Tokens:**
   - ✅ Option tokens (primitives) **can have descriptions** from Figma
  - ❌ Semantic tokens (aliases) **do not have Figma-authored docs as the source of truth**
  - ✅ Semantic tokens and lifecycle metadata **are governed in repo metadata**
   - Rationale: Semantic tokens represent Cedar component responsibilities, not design system primitives
   - Rationale: Cedar component documentation is the source of truth for semantic usage

8. **Generation strategy:** Extract and merge during build, not at runtime
   - Rationale: Zero runtime cost
   - Rationale: Descriptions and metadata are reference/development tools only

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
Figma token files + metadata/tokens.json
          ↓
  applyTokenMapping() + buildOptionTree() + mergeMetadata()
          ↓
  $extensions.cedar.docs + $extensions.cedar.governance
          ↓
      build-style-dictionary.ts + docs artifacts
          ↓
     generated types + metadata JSON for consumers
```

---

## Consequences

- Canonical output now carries explicit ownership boundaries for docs and governance
- Semantic lifecycle data can be managed without requiring Figma support for governance fields
- Drift risk is reduced because metadata validation can detect missing or stale governance entries
- Figma remains design-value authority while repo metadata governs publication readiness

---

## Future Extensions

- Add stricter CI gating for unreviewed metadata entries by default
- Add auto-stub generation for newly imported canonical token paths
- Add controlled reverse-sync payload previews for governance-safe fields
- Add computed metadata fields (e.g., changeRisk derived from usedBy count + status)

### Additional Type-Specific Metadata

Future token categories may add their own metadata sections:

- **Border tokens**: `border` (corner radius scale, stroke width hierarchy)
- **Grid tokens**: `grid` (column counts, breakpoints, gutter ratios)

Each type-specific section follows the same pattern: structured, machine-readable data that enables automated validation and tooling.

### Deprecated Token Handling

For tokens with `status: "deprecated"`, the `accessibility.replacements` field is required and must specify the token(s) to use instead. This enables automated migration tooling and prevents orphaned deprecated tokens from being suggested as alternates for active tokens.

---

## Related documents

- [ADR-0001: Canonical Token Model](./adr-0001-token-canonical-model.md)
- [ADR-0002: Token Normalization Layer](./adr-0002-token-normalization-layer.md)
- [ADR-0003: Figma Input Contract](./adr-0003-figma-input-contract.md)
- [ADR-0012: Hybrid Alias Resolution](./adr-0012-hybrid-alias-resolution.md)
- [ADR-0011: Harmonic Interval Validation](./adr-0011-harmonic-interval-validation.md)
- [Adding Token Descriptions in Figma](../adding-token-descriptions.md)
- [DTCG Specification](https://design-tokens.github.io/community-group/format/)
