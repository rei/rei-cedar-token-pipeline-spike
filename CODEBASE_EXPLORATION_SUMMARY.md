# Cedar Token Pipeline — Codebase Exploration Summary

## 1. TOKEN NAMING CONVENTIONS AND GRAMMAR

### Canonical Token Naming Pattern

Canonical tokens use **dot-delimited, lowercase segments** with no hyphens or underscores.

#### Semantic Alias Token Grammar (Primary)
```
<category>.<intent>[.<family>][.<variant>]
```

**Optional modifiers:**
```
<category>.<intent>.on.<intent>
<category>.<intent>.inverse.<variant>
<category>.<intent>.over.<variant>
```

#### Real Examples

**Color tokens:**
- `color.modes.default.surface.base` → semantic color for page background
- `color.modes.default.border.subtle` → low-emphasis border
- `color.text.primary` → primary text color
- `color.action.accent` → action button accent
- `color.action.fill.accent.ghost.hover` → state family hover transform

**Spacing tokens:**
- `spacing.component.sm` → small component spacing
- `spacing.layout.md` → medium layout spacing
- `spacing.scale.-50` → spacing scale value

**Typography tokens:**
- `type.heading.lg` → large heading
- `type.body.md` → medium body text

**Radius tokens:**
- `radius.interactive.md` → medium interactive element radius

**Shadow tokens:**
- `shadow.card.default` → default card shadow

#### Foundation Token Naming (Brand-Driven, Private)
Foundations use brand-inspired names (NOT semantic):
- `color.option.neutral.warm.grey.300` → actual palette value
- `color.option.brand.blue.600` → brand blue
- `font.family.sans` → font family foundation
- `space.025`, `space.050` → spacing scale primitives

### Naming Rules (Enforced by Normalization)

Canonical paths MUST:
- ✓ Use dot-delimited segments
- ✓ Use lowercase only
- ✓ Contain no hyphens, underscores, or slashes
- ✓ Contain no platform names (`css`, `ios`, `android`, etc.)
- ✓ Contain no component names or implementation details
- ✓ Reflect semantic structure only
- ✗ NO Figma naming constructs or hyphenated segments

---

## 2. TAXONOMY FIELD STRUCTURE

### Current Taxonomy Fields (From TokenAuthoringStudio)

The authoring surface defines these taxonomy categories:

```typescript
type TaxonomyKey =
  | "foundation"      // Category: color, type, radius, spacing, motion
  | "intent"          // UX role: brand, primary, surface, action, error, etc.
  | "role"            // Function: fill, border, text, icon, on-fill
  | "variant"         // Tonal emphasis: base, subtle, accent, highlight, shade
  | "stateFamily"     // State transform: ghost, nudge
  | "state"           // Interactive state: default, hover, pressed, disabled, selected, focus
  | "tier"            // Accessibility: AA, AAA
  | "breakpoint";     // Responsive: mobile, tablet, desktop, wide
```

### Default Taxonomy Values

```typescript
const DEFAULT_TAXONOMY: TaxonomyMap = {
  foundation: ["color", "type", "radius", "prominence", "spacing", "motion"],
  intent: [
    "brand", "primary", "secondary", "tertiary", "surface",
    "action", "navigation", "error", "success", "warning", "info",
    "outline", "overlay"
  ],
  role: ["fill", "on-fill", "border", "text", "icon"],
  variant: ["highlight", "subtle", "muted", "base", "accent", "shade", "strong", "vibrant"],
  stateFamily: ["ghost", "nudge"],
  state: ["default", "hover", "pressed", "disabled", "selected", "focus"],
  tier: ["AA", "AAA"],
  breakpoint: ["mobile", "tablet", "desktop", "wide"],
};
```

### Metadata Type Definition

File: [src/types/token-metadata.ts](src/types/token-metadata.ts)

```typescript
export interface TokenMetadata {
  status?: "stable" | "experimental" | "deprecated" | "unreviewed";
  token?: string;                    // Slug for docs
  intent?: string;                   // Semantic intent statement
  role?: string;                     // Functional role
  derivedFrom?: string;              // Related semantic ancestor
  platformMap?: Record<Platform, string>;  // Platform-specific targets
  states?: Record<string, string>;   // State-specific mappings
  modes?: Record<string, string | TokenModeValue>;
  stability?: "stable" | "beta" | "experimental" | "deprecated";
  figmaVariableId?: string;
  badges?: TokenBadge[];
  usage?: string;
  deprecation?: DeprecationInfo;
  usedBy?: string[];                 // Components depending on token
  figma?: { collection?: string; variable?: string };
  validation?: TokenValidationMetadata;
  // ... more fields
}
```

### Token Record Shape (Authoring Surface State)

File: [stories/TokenAuthoringStudio.stories.ts](stories/TokenAuthoringStudio.stories.ts#L1-L50)

```typescript
type TokenRecord = {
  id: string;
  name: string;                                    // e.g., "color.modes.default.surface.base"
  value: string;                                   // e.g., "{color.option.neutral.white}"
  description: string;
  layer: "foundation" | "semantic" | "stateFamily" | "component";
  taxonomy: Partial<Record<TaxonomyKey, string>>;  // TAXONOMY BINDING
  links: string[];                                 // Related token IDs
};
```

### IMPORTANT: Token Layer Definition

```typescript
function guessLayer(name: string): Layer {
  const lower = name.toLowerCase();
  if (lower.startsWith("cdr.") || lower.includes("component")) return "component";
  if (lower.includes(".ghost.") || lower.includes(".nudge.") || lower.includes(".hover"))
    return "stateFamily";
  if (lower.startsWith("color.") || lower.startsWith("type.") || 
      lower.startsWith("space.") || lower.startsWith("radius."))
    return "semantic";
  return "foundation";
}
```

---

## 3. TOKEN AUTHORING SURFACE COMPONENT STRUCTURE

### Main Component: TokenAuthoringStudio.stories.ts

File: [stories/TokenAuthoringStudio.stories.ts](stories/TokenAuthoringStudio.stories.ts)

**Purpose:** Spike/prototype surface for authoring semantic tokens, managing taxonomy binding, state family derivation, and export.

#### Component State Shape

```typescript
type ViewTab = "author" | "taxonomy" | "connections" | "export";

type StudioState = {
  tab: ViewTab;
  search: string;
  layerFilter: Layer | "all";
  selectedTokenId: string | null;
  taxonomyFocus: TaxonomyKey;
  
  // State derivation controls
  deriveFamily: "ghost" | "nudge";
  deriveState: "hover" | "pressed" | "disabled" | "selected" | "focus";
  deriveDarkMode: boolean;
  
  // Data
  tokens: TokenRecord[];
  taxonomy: TaxonomyMap;
  
  // Output
  exportPreview: string;
  lastMessage: string;
  importPreview: ImportPreview | null;
  categoryFilter: string;
};
```

#### Seed Tokens (Example Data)

```typescript
const SEED_TOKENS: TokenRecord[] = [
  {
    id: "tok-foundation-spruce",
    name: "color.brand.primary.base",
    value: "oklch(38% 0.12 165)",
    description: "Primary Cedar spruce foundation value.",
    layer: "foundation",
    taxonomy: { foundation: "color", intent: "brand", variant: "base" },
    links: ["tok-semantic-action-fill-accent"],
  },
  {
    id: "tok-semantic-action-fill-accent",
    name: "color.action.fill.accent",
    value: "{color.brand.primary.base}",
    description: "Semantic action fill accent ancestor.",
    layer: "semantic",
    taxonomy: { intent: "action", role: "fill", variant: "accent" },
    links: ["tok-state-family-ghost"],
  },
  // ... more sample tokens
];
```

---

## 4. TOKEN SELECTION AND DISPLAY

### Import/Selection Flow

File: [stories/TokenAuthoringStudio.stories.ts#L197-L230](stories/TokenAuthoringStudio.stories.ts#L197)

```typescript
function toTokenFromRecord(record: Record<string, string>): TokenRecord | null {
  // Accepts flexible field aliases for import
  const name = getField(record, [
    "name", "token", "token name", "token_name", 
    "tokenname", "variable", "field name"
  ]);
  if (name.length === 0) return null;

  const value = getField(record, ["value", "$value", "token value", "token_value", "hex", "oklch"]);
  const description = getField(record, ["description", "$description", "notes", "note", "intent", "usage"]);
  const layerRaw = getField(record, ["layer", "tier", "token layer"]);

  const layer = validLayer ? layerRaw : guessLayer(name);

  return {
    id: createId("tok"),
    name,
    value,
    description,
    layer,
    taxonomy: {},  // ← EMPTY — NOT AUTO-POPULATED FROM NAME
    links: [],
  };
}
```

### Display Tabs

1. **Author** — Edit token properties, taxonomy
2. **Taxonomy** — View/manage taxonomy vocabulary
3. **Connections** — Visualize token dependencies
4. **Export** — Preview JSON output

---

## 5. EXISTING NAME PARSING AND RECONSTRUCTION FUNCTIONS

### Token Name Helpers

File: [src/stories/utils/tokenNameHelpers.ts](src/stories/utils/tokenNameHelpers.ts)

```typescript
function splitTokenName(name: string): string[] {
  return String(name || "")
    .trim()
    .replace(/^--/, "")
    .split("-")
    .filter(Boolean);
}

function toCamel(parts: string[]): string {
  if (parts.length === 0) return "";
  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

// EXPORT FUNCTIONS
export function toCamelCase(tokenName: string): string {
  return toCamel(splitTokenName(tokenName));
}

export function toCamelCaseNoPrefix(tokenName: string): string {
  const parts = splitTokenName(tokenName);
  const trimmed = parts.length > 2 && parts[0] === "cdr" ? parts.slice(2) : parts;
  return toCamel(trimmed);
}
```

**Note:** These helpers are designed for **hyphen-separated names** (CSS tokens), not dot-delimited canonical names.

### Token Output Utilities for Name Generation

File: [src/build/token-output-utils.ts](src/build/token-output-utils.ts#L1-L50)

```typescript
interface ModuleDefinition {
  theme: string;
  responsibility: string;
  moduleFileName: string;
  interfaceName: string;
  unionTypeName: string;
  matchesToken: (token: TransformedToken) => boolean;
  getTokenName: (token: TransformedToken) => string;  // NAME GENERATOR
}

function toPascalCase(value: string): string {
  const parts = value.match(/[a-zA-Z0-9]+/g) ?? [];
  return parts
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

// Example: Maps canonical path to CSS module token names
const MODULE_DEFINITIONS: ModuleDefinition[] = [
  createModuleDefinition("cdr-color-surface", (token) => {
    // token.path = ["color", "modes", "default", "surface", "base"]
    // Returns: ["base"]
    if (token.path[0] !== "color" || token.path[1] !== "modes" || token.path[3] !== "surface")
      return [];
    return token.path.slice(4);
  }),
  // ... more module definitions
];
```

---

## 6. SEMANTIC TOKEN STRUCTURE (CANONICAL + METADATA)

### Canonical Token Schema

File: [src/types/canonical-token.ts](src/types/canonical-token.ts)

```typescript
export interface CanonicalToken {
  $value: string | number | boolean;
  $type: string;
  $extensions?: CanonicalTokenExtensions;
}

export interface CanonicalTokenExtensions {
  cedar?: {
    docs?: TokenDocumentation;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface CanonicalTokenGroup {
  [tokenName: string]: CanonicalToken | CanonicalTokenGroup;
}

export interface CanonicalRoot {
  [section: string]: CanonicalTokenGroup;
}
```

### Semantic Token Contract Entry

File: [canonical/semantic-tokens.json](canonical/semantic-tokens.json)

```json
{
  "color.modes.default.surface.base": {
    "alias": "{color.option.neutral.white}",
    "canonicalPath": "color.modes.default.surface.base",
    "docs": {
      "design": "First step in the surface elevation scale...",
      "summary": "Default page and container background.",
      "usage": "Use for all page backgrounds and container bases."
    },
    "stability": "stable",
    "status": "unreviewed",
    "token": "surface-base",
    "type": "color",
    "value": "{color.option.neutral.white}"
  }
}
```

---

## 7. KEY TYPE DEFINITIONS AND CONSTANTS

### Type Definitions

- **TokenMetadata** ([src/types/token-metadata.ts](src/types/token-metadata.ts)) — Governance, status, usage, deprecation
- **CanonicalToken** ([src/types/canonical-token.ts](src/types/canonical-token.ts)) — $value, $type, $extensions
- **TokenRecord** ([stories/TokenAuthoringStudio.stories.ts](stories/TokenAuthoringStudio.stories.ts)) — UI authoring shape
- **TransformedToken** (from style-dictionary) — Path-based token representation for output generation

### Validation Schema

File: [src/schema/token-schema.json](src/schema/token-schema.json)

- Defines Figma Input Contract (ADR-0003)
- Token metadata patterns and validation rules
- Platform support definitions

---

## 8. CRITICAL DISCOVERY: TAXONOMY AUTO-POPULATION GAP

### Current Issue

When a token is imported/selected in the authoring surface:
- ✓ Name updates automatically
- ✓ Value updates automatically
- ✗ **Taxonomy fields do NOT auto-populate from the token name**

```typescript
return {
  id: createId("tok"),
  name,                    // "color.modes.default.surface.base"
  value,
  description,
  layer,
  taxonomy: {},            // ← EMPTY! Should derive from name
  links: [],
};
```

### What's Needed

1. **Parse function**: `tokenName → taxonomy fields`
   - Input: `"color.modes.default.surface.base"`
   - Output: `{ foundation: "color", intent: "surface", variant: "base", ...}`

2. **Reconstruct function**: `taxonomy fields → tokenName`
   - Input: `{ foundation: "color", intent: "surface", variant: "base" }`
   - Output: `"color.modes.default.surface.base"`

---

## 9. KEY FILES SUMMARY

| Category | File | Purpose |
|----------|------|---------|
| **Types & Schema** | [src/types/token-metadata.ts](src/types/token-metadata.ts) | Token governance metadata structure |
| | [src/types/canonical-token.ts](src/types/canonical-token.ts) | Canonical token model |
| **Authoring UI** | [stories/TokenAuthoringStudio.stories.ts](stories/TokenAuthoringStudio.stories.ts) | Main token authoring component prototype |
| **Utilities** | [src/stories/utils/tokenNameHelpers.ts](src/stories/utils/tokenNameHelpers.ts) | Hyphen-name transformations (for CSS tokens) |
| | [src/build/token-output-utils.ts](src/build/token-output-utils.ts) | Module definition and name generation |
| **Normalization** | [src/normalization/normalize-utils.ts](src/normalization/normalize-utils.ts) | Token path parsing and description parsing |
| | [src/normalization/merge-metadata.ts](src/normalization/merge-metadata.ts) | Canonical path collection |
| **Canonical Data** | [canonical/semantic-tokens.json](canonical/semantic-tokens.json) | Semantic token contract output |
| **Schema/Config** | [src/schema/token-schema.json](src/schema/token-schema.json) | Figma Input Contract & validation rules |
| **Architecture Docs** | [architecture/ADR/adr-0004-semantic-token-architecture.md](architecture/ADR/adr-0004-semantic-token-architecture.md) | Definitive semantic naming grammar |
| | [architecture/ADR/adr-0001-token-canonical-model.md](architecture/ADR/adr-0001-token-canonical-model.md) | Canonical structure and rules |

---

## 10. NEXT STEPS FOR IMPLEMENTATION

These notes link to the immediate task of implementing taxonomy auto-population:

1. **Implement `parseTokenPath(canonicalPath: string): Partial<Record<TaxonomyKey, string>>`**
   - Parse dot-delimited path into taxonomy components
   - Handle category-specific grammars (color, spacing, typography, etc.)
   - Map path segments to TaxonomyKey values

2. **Implement `reconstructTokenName(taxonomy: Partial<Record<TaxonomyKey, string>>): string`**
   - Reverse operation: rebuild canonical path from taxonomy fields
   - Ensure strict adherence to grammar rules

3. **Wire bidirectional binding in UI**
   - On token selection: Call `parseTokenPath()` to populate taxonomy
   - On taxonomy field change: Call `reconstructTokenName()` to update name field
   - Add validation to maintain grammar compliance

4. **Consider error handling**
   - Invalid paths or taxonomy combinations
   - Missing required fields
   - Invalid field values per category

---

## References

- **ADR-0001**: Canonical Token Model
- **ADR-0004**: Semantic Token Architecture (Primary reference for naming)
- **ADR-0010**: Token Documentation Architecture
