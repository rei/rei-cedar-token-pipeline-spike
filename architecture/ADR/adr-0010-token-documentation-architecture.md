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
- Authoring governance metadata in-repo for semantic and lifecycle fields
- Preserving both data sources through normalization
- Generating TypeScript outputs and docs artifacts without losing authority boundaries

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

Example:

```json
{
  "color.modes.default.surface.base": {
    "status": "stable",
    "badges": [{ "label": "stable", "tone": "stable" }],
    "usage": "Use for base page and container backgrounds.",
    "usedBy": ["cdr-card", "cdr-modal"],
    "consumerNotes": "Foundational surface token.",
    "authority": "Cedar Design System"
  }
}
```

This metadata is normalized under `$extensions.cedar.governance` and is not sourced from Figma.

### 3. Normalization layer

The normalization pipeline merges both documentation authorities:

#### `applyTokenMapping()` (normalize-utils.ts)

- Extracts `$description` from each Figma token
- Only includes descriptions that are non-empty after trimming
- Returns description alongside `$type` and `$value`

#### `buildOptionTree()` (normalize-utils.ts)

- Wraps descriptions into `$extensions.cedar.docs.summary`
- Preserves the `$extensions.cedar` structure for Style Dictionary compatibility
- Schema: `$extensions.cedar.docs.summary` → string

#### `mergeMetadata()` (merge-metadata.ts)

- Walks canonical leaf tokens by dot path
- Looks up corresponding entries in `metadata/tokens.json`
- Attaches matches under `$extensions.cedar.governance`
- Preserves existing `$extensions.cedar.docs` from Figma without overwrite

#### `validate-metadata.ts`

- Flags canonical tokens with no metadata entry (unreviewed)
- Flags orphaned metadata entries not present in canonical
- Flags incomplete governance entries and deprecated tokens missing migration guidance

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
                    "usage": "Use for base page and container backgrounds.",
                    "usedBy": ["cdr-card", "cdr-modal"]
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
  - Repo metadata is the authority for governance fields (status, badges, deprecation, usage guidance, used-by)

2. **Canonical storage:**
  - Store Figma docs in `$extensions.cedar.docs`
  - Store repo governance metadata in `$extensions.cedar.governance`

3. **Description Storage:** Use `$extensions.cedar.docs.summary` to store descriptions in the canonical tree
   - Rationale: Aligns with DTCG `$extensions` convention for tool-specific metadata
   - Rationale: Preserved through Style Dictionary without conflicts
   - Rationale: Accessible during TypeScript generation

4. **Scope - Option vs. Semantic Tokens:**
   - ✅ Option tokens (primitives) **can have descriptions** from Figma
  - ❌ Semantic tokens (aliases) **do not have Figma-authored docs as the source of truth**
  - ✅ Semantic tokens and lifecycle metadata **are governed in repo metadata**
   - Rationale: Semantic tokens represent Cedar component responsibilities, not design system primitives
   - Rationale: Cedar component documentation is the source of truth for semantic usage

5. **Generation strategy:** Extract and merge during build, not at runtime
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

### Rich Documentation Object

The `docs` and `governance` objects may be extended:

```json
{
  "$extensions": {
    "cedar": {
      "docs": {
        "summary": "...",
        "usage": "...",
        "design": "...",
        "related": ["..."]
      },
      "governance": {
        "status": "experimental",
        "deprecation": {
          "removedIn": "v4.0.0",
          "migrateToToken": "color.modes.default.surface.base"
        }
      }
    }
  }
}
```

---

## Related documents

- [ADR-0001: Canonical Token Model](./adr-0001-token-canonical-model.md)
- [ADR-0002: Token Normalization Layer](./adr-0002-token-normalization-layer.md)
- [ADR-0003: Figma Input Contract](./adr-0003-figma-input-contract.md)
- [ADR-0011: Hybrid Alias Resolution](./adr-0011-hybrid-alias-resolution.md)
- [Adding Token Descriptions in Figma](../adding-token-descriptions.md)
- [DTCG Specification](https://design-tokens.github.io/community-group/format/)
