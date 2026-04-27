# Token Pipeline — Quick Reference Card

## Token Naming Patterns

### Canonical Format (Dot-Delimited, Lowercase)
```
<category>.<intent>[.<family>][.<variant>][.<mode>][.<state>]
```

| Pattern | Example | TaxonomyKey | Values |
|---------|---------|-------------|--------|
| `color` | `color.modes.default.surface.base` | foundation | color, type, spacing, radius, motion |
| `.intent` | `.surface` | intent | surface, action, text, error, success, warning |
| `.role` | `.fill` | role | fill, border, text, icon, on-fill |
| `.variant` | `.base`, `.subtle` | variant | base, subtle, accent, highlight, shade |
| `.mode` | `.default` (from `.modes.default`) | — | default, dark, light, sale |
| `.state` | `.hover` | state | default, hover, pressed, disabled, selected, focus |

### Category-Specific Grammars

**Color**
```
color.<intent>[.<role>][.<variant>][.<state>]
Examples: color.surface.base, color.action.fill.accent, color.text.primary
```

**Spacing**
```
spacing.<context>.<size>
Examples: spacing.component.sm, spacing.layout.md, spacing.scale.-50
```

**Typography**
```
type.<category>.<size>
Examples: type.heading.lg, type.body.md, type.label.sm
```

**Radius**
```
radius.<context>.<size>
Examples: radius.container.md, radius.interactive.sm
```

---

## Taxonomy Field Structure

### TaxonomyKey Values (8 Fields)

```typescript
type TaxonomyKey =
  | "foundation"      // Category: color, type, spacing, radius, motion
  | "intent"          // UX role: surface, action, text, error, success, warning
  | "role"            // Function: fill, border, text, icon, on-fill
  | "variant"         // Tonal: base, subtle, accent, highlight, shade, strong
  | "stateFamily"     // State transform: ghost, nudge
  | "state"           // Interactive: default, hover, pressed, disabled, focus, selected
  | "tier"            // Accessibility: AA, AAA
  | "breakpoint";     // Responsive: mobile, tablet, desktop, wide
```

### TokenRecord (Authoring Shape)
```typescript
{
  id: string;
  name: string;                          // "color.modes.default.surface.base"
  value: string;                         // "{color.option.neutral.white}"
  description: string;
  layer: "foundation" | "semantic" | "stateFamily" | "component";
  taxonomy: Partial<Record<TaxonomyKey, string>>;
  links: string[];
}
```

---

## Path Parsing Rules

### Foundation vs. Semantic Path Structure

**Foundation paths:**
```
<category>.option.<palette>.<step>...
Example: color.option.neutral.warm.grey.300
```

**Semantic paths:**
```
<category>.modes.<mode>.<intent>[.<role>][.<variant>]
Example: color.modes.default.surface.base
```

### Layer Detection
```typescript
foundation  → name starts with raw foundation pattern (color.option, space.025)
semantic    → name starts with category.modes or semantic intent (color.action)
stateFamily → name contains .ghost., .nudge., or state keywords
component   → name starts with cdr. or contains "component"
```

---

## Key Files for Reference

### Naming Grammar & Architecture
- [ADR-0004: Semantic Token Architecture](architecture/ADR/adr-0004-semantic-token-architecture.md) ← **AUTHORITATIVE** for naming
- [ADR-0001: Canonical Token Model](architecture/ADR/adr-0001-token-canonical-model.md) — Canonical structure

### Implementation Files
- [TokenAuthoringStudio.stories.ts](stories/TokenAuthoringStudio.stories.ts) — Main UI component
- [token-metadata.ts](src/types/token-metadata.ts) — MetadataType definitions
- [canonical-token.ts](src/types/canonical-token.ts) — Canonical structure
- [tokenNameHelpers.ts](src/stories/utils/tokenNameHelpers.ts) — Existing name utils (hyphen-based)
- [token-output-utils.ts](src/build/token-output-utils.ts) — Name generation from canonical

### Data & Schema
- [semantic-tokens.json](canonical/semantic-tokens.json) — Live token examples
- [token-schema.json](src/schema/token-schema.json) — Figma Input Contract

---

## Implementation Checklist for Taxonomy Binding

- [ ] Create `parseCanonicalPath(name: string): Partial<Record<TaxonomyKey, string>>`
  - Extract segments from dot-delimited path
  - Map to TaxonomyKey fields based on grammar
  - Handle category-specific rules

- [ ] Create `reconstructCanonicalPath(taxonomy: Partial<Record<TaxonomyKey, string>>): string`
  - Rebuild path from taxonomy fields
  - Validate required fields present
  - Follow category-specific grammar

- [ ] Wire in authoring surface
  - On token selection: `taxonomy = parseCanonicalPath(token.name)`
  - On taxonomy change: `name = reconstructCanonicalPath(taxonomy)`
  - Add validation for invalid combinations

---

## Common Patterns

### Split tokenpath into segments
```typescript
const parts = path.split('.'); // ["color", "modes", "default", "surface", "base"]
```

### Validate canonical naming rules
✓ Dot-delimited, lowercase, no hyphens/underscores
✗ No platform names (web, ios, android)
✗ No component names (cdr.)
✗ No Figma constructs (slash, groups)

### Test data (from TokenAuthoringStudio)
```typescript
"color.brand.primary.base"           // Foundation
"color.modes.default.surface.base"   // Semantic
"color.action.fill.accent"           // Simplified semantic
"color.action.fill.accent.ghost.hover" // With state family
```

---

*Last updated: During codebase exploration phase*
