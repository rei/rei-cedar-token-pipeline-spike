# ADR-0011: Harmonic Interval Validation

## Status
Future

## Context

As the Cedar token system evolves to support automated reasoning, accessibility validation, and AI-assisted code generation, the metadata model must carry harmonic interval data — the perceptual distance relationships between tokens — and relationship token declarations that encode which interval rules govern which semantic pairs. These are the missing layer between token values and component composition.

WCAG contrast ratios tell you whether a pair passes accessibility standards, but they do not tell you whether the pair plays the correct semantic note. A text color can pass WCAG against a background but still read as "wrong" — too close, too far, or out of key with the design system's harmonic language.

This ADR defines the harmonic validation system that extends ADR-0010's metadata model with:
- `relationships` section (repo-authored) for declaring interval rules and triad membership
- `harmonicInterval` section (pipeline-computed) for deltaL and chroma envelope data
- `harmony-registry.json` artifact for interval rule definitions
- A 6-step validator sequence that checks perceptual correctness

---

## Purpose

Define a governed mechanism for:
- Declaring relationship token rules that govern the perceptual intervals between semantic pairs
- Computing harmonic interval data (deltaL, chroma envelope, sibling chroma ratio) in the pipeline
- Validating that token pairs satisfy their declared interval rules
- Ensuring sibling components share equal visual loudness across different hue families
- Enforcing triad constraints at the component level
- Supporting machine-forward metadata for harmonic correctness checking and agent-driven token selection

---

## Architecture

### 1. Authority model extension

ADR-0010 defines four authorities. This ADR adds a fifth:

| Authority | Owns | Schema path | How populated |
|-----------|-------|-------------|---------------|
| Figma | Primitive descriptions | `$extensions.cedar.docs.summary` | Variable description field in Figma Local Variables UI |
| Repo | Lifecycle governance | `$extensions.cedar.governance` | Authored in metadata/tokens.json |
| Repo | Structured usage | `$extensions.cedar.usage` | Authored in metadata/tokens.json |
| Repo | Relationship declarations | `$extensions.cedar.relationships` | Authored in metadata/tokens.json — points to harmony-registry.json |
| Pipeline | Accessibility data | `$extensions.cedar.accessibility` | Computed by Culori during build — never hand-authored |
| Pipeline | Platform references | `$extensions.cedar.platform` | Computed during build from alias resolution |

### 2. relationships section (repo-authored)

The `relationships` section declares the interval rule that governs this token's semantic pairs. This is the layer between token values and component composition — it provides the "perfect fifth," not the note.

```json
"color.text.primary": {
  "relationships": {
    "intervalRule": "relationship.surface.text",
    // ^ Foreign key into harmony-registry.json.
    // That file defines: ΔL target 0.55 ± 0.02, axis L, type discrete.

    "triadRole": "foreground",
    // ^ Role in the semantic triad: foreground | surface | border

    "triadMembers": {
      "surface": "color.background.base",
      "border":  "color.border.default"
    },
    // ^ The other tokens in this triad.
    // Validator checks all three pair deltas, not just this pair.
    // ΔL(surface→border) must equal ΔL(surface→text) minus ΔL(border→text).

    "siblingClass": "text.primary",
    // ^ OOUX sibling class. All tokens in this class must share
    // the same chroma envelope proportion (see harmonicInterval.chromaEnvelope).

    "modeEnvelope": "inviting"
    // ^ Declares which mode this token is designed for.
    // Validator checks cross-voice mode consistency at component level.
  }
}
```

**Why relationships is repo-authored, not pipeline-computed:**
The interval rules are human-defined design decisions — not derivable from the token values themselves. Declaring that `color.text.primary` belongs to the "inviting" mode envelope requires knowing the design intent. The pipeline computes whether the actual values satisfy the rule (accessibility.harmonicInterval.deltaL.valid), but cannot determine what the rule should be.

The `harmony-registry.json` file (a separate artifact maintained by the design systems team) is the authoritative list of all interval rules. The `relationships.intervalRule` field is a pointer into it, not a copy of its contents.

### 3. harmonicInterval section (pipeline-computed)

The `harmonicInterval` section carries the perceptual interval data that the harmonic validator checks. It has two subsections requiring different mathematics:

- `deltaL` — Linear, additive axis (OKLCH lightness is perceptually uniform)
- `chromaEnvelope` — Curved, parabolic axis (chroma is bounded by the gamut)

```json
"harmonicInterval": {

  "deltaL": {
    // Linear axis — additive arithmetic.
    "actual":       0.54,
    "target":       0.55,
    "tolerance":    0.02,
    "validRange":   [0.53, 0.57],
    "valid":        true,
    "semanticRole": "text.primary",
    "intervalType": "discrete"
    // intervalType: "discrete" | "banded" | "modal"
    // discrete = tight band, blocks on violation
    // banded   = mode range, warns on violation
    // modal    = hue arc constraint
  },

  "chromaEnvelope": {
    // Curved axis — validated against C(L) parabola, not absolute.
    // Formula: C(L) = Cmax × max(0, 1 − ((L − L0) / w)²)
    "Cmax":          0.32,
    "peakL":         0.56,
    "wLight":        0.38,   // half-width on light side of peak
    "wDark":         0.28,   // half-width on dark side (asymmetric)
    "ceilingAtL":    0.29,   // C(L) at this token's lightness
    "actualRatio":   0.63,   // token.C / ceilingAtL
    "targetRatio":   0.70,   // from relationships.intervalRule
    "tolerance":     0.08,
    "valid":         false,
    "note": "Chroma below target proportion — reads as muted for this semantic role"
  },

  "siblingClass":       "text.primary",
  "siblingChromaRatio": 0.63,
  // ^ Stored for sibling parity validation.
  // Validator checks all members of siblingClass share same ratio ± tolerance.
  // This prevents sibling components from reading with unequal visual loudness
  // even when their absolute chroma values differ across hues.

  "triadValid": true,
  "triadDeltas": {
    "surfaceToText":   0.54,
    "surfaceToBorder": 0.35,
    "borderToText":    0.19
    // Constraint: borderToText must equal surfaceToText − surfaceToBorder.
    // 0.54 − 0.35 = 0.19 ✓
  }
}
```

**Why ΔL and ΔC require different mathematics:**
- OKLCH lightness is perceptually uniform — equal ΔL steps produce equal perceived differences. ΔL stacks, subtracts, and adds like musical intervals. The validator uses simple arithmetic.
- Chroma is bounded by the gamut — the maximum achievable chroma at any lightness forms an inverted parabola when hue is held constant (C(L) = Cmax × (1 − ((L − L0) / w)²)). The same absolute ΔC value means completely different things at different lightness positions and for different hues. Chroma must be validated as a proportion of the envelope, not as an absolute number.

Storing both in `harmonicInterval` makes the distinction explicit and machine-readable.

### 4. harmony-registry.json (new artifact)

A separate file maintained by the design systems team. Contains all interval rule definitions and mode envelope definitions. Referenced by `relationships.intervalRule` and `relationships.modeEnvelope`. Versioned independently from the token catalog.

```json
{
  "schemaVersion": "1.0.0",
  "intervals": {
    "relationship.surface.text": {
      "description": "Primary readable contrast",
      "axis": "L",
      "intervalType": "discrete",
      "target": 0.55,
      "tolerance": 0.02,
      "validRange": [0.53, 0.57],
      "onViolation": "error",
      "wcag": "1.4.3"
    },
    "relationship.surface.border": {
      "description": "Framing separation",
      "axis": "L",
      "intervalType": "discrete",
      "target": 0.35,
      "tolerance": 0.02,
      "validRange": [0.33, 0.37],
      "onViolation": "error"
    },
    "relationship.accent.neutral": {
      "description": "Expressive emphasis",
      "axis": "C",
      "intervalType": "banded",
      "mode": "relative",
      "targetRatio": 0.80,
      "tolerance": 0.08,
      "onViolation": "warning"
    }
  },
  "siblingClasses": {
    "text.primary": {
      "chromaRatioTolerance": 0.08
    }
  },
  "modeEnvelopes": {
    "inviting": {
      "deltaL": { "min": 0.28, "max": 0.55 },
      "deltaC": { "min": 0.06, "max": 0.18 },
      "deltaH": { "arc": 30, "relationship": "analogous" }
    }
  }
}
```

---

## Decision

### D1 — relationships is a distinct repo-authored section

**Rationale:** `pairingRules` in `usage` declares what can pair. `relationships` declares the interval that pair must maintain and the triad it belongs to. These are different semantic concerns and must be separately addressable by tooling. Combining them would make the pairing rule opaque to the harmonic validator.

### D2 — harmonicInterval carries both deltaL and chromaEnvelope as named subsections

**Rationale:** ΔL is a linear axis validated by arithmetic subtraction. ΔC is a curved axis validated against the parabola ceiling C(L). These require completely different mathematics. Storing them in named subsections makes the distinction machine-readable and prevents validator implementations from conflating the two.

### D3 — chromaEnvelope stores the parabola parameters (Cmax, peakL, wLight, wDark) per token

**Rationale:** The parabola shape is hue-dependent and asymmetric. Rather than recomputing it at validation time, storing it in the token metadata makes the validator fast and deterministic. Parameters are computed by Culori from gamut boundary analysis during the build pipeline.

### D4 — siblingChromaRatio is stored in harmonicInterval, not in relationships

**Rationale:** The ratio (token.C / ceilingAtL) is a computed value, not a design decision. It belongs in the pipeline-computed `accessibility` section. The sibling class membership is a design decision and belongs in `relationships.siblingClass`. The validator joins these two fields from different sections.

### D5 — triadDeltas is stored in harmonicInterval for all three pair directions

**Rationale:** The triad constraint (borderToForeground = surfaceToForeground − surfaceToBorder) requires all three deltas to be available simultaneously. Storing them together makes the constraint check a single lookup rather than a cross-token join.

### D6 — The existing intervals field (WCAG pass/fail band) is retained unchanged

**Rationale:** The `intervals` field and the `harmonicInterval` field answer different questions. `intervals` says "at what lightness values does this token pass WCAG against this partner." `harmonicInterval.deltaL` says "is the actual lightness delta the correct semantic interval." Both are necessary. A token can pass WCAG and still play the wrong note.

### D7 — intervalRule is a foreign key into harmony-registry.json, not an inline definition

**Rationale:** The relationship token registry is a separate artifact with its own versioning and governance. Inlining interval definitions into individual token metadata would create drift between the registry and the tokens. The pointer pattern keeps the registry as the single source of truth for interval definitions.

---

## Implementation

### computeAccessibility() — new pipeline step

This step runs after `mergeMetadata()` and before `build-style-dictionary.ts`. It must not modify any repo-authored sections.

1. For each color token, resolve `$value` to an OKLCH coordinate using Culori.
2. Write the OKLCH coordinates to `accessibility.oklch` per appearance mode.
3. For each token pair declared in `usage.pairingRules.allowedWith`, compute WCAG contrast ratio using Culori's `wcagContrast()`. Write to `accessibility.contrastPairs`.
4. For the token's hue, compute the chroma parabola parameters (Cmax, peakL, wLight, wDark) by scanning the gamut boundary at 1% L increments. Write to `harmonicInterval.chromaEnvelope`.
5. Compute `ceilingAtL = C(L)` at this token's lightness using the parabola formula.
6. Compute `actualRatio = token.C / ceilingAtL`.
7. Look up the `targetRatio` from the `intervalRule` declared in `relationships.intervalRule` → `harmony-registry.json`.
8. Compute `deltaL.actual` from the `triadMembers` declared in `relationships.triadMembers`.
9. Validate all fields against the registry rules. Write `valid` booleans and `note` strings.
10. Compute `triadDeltas` for all three pair directions. Write `triadValid`.
11. Write `siblingChromaRatio = actualRatio`.

### validate-metadata.ts — new checks

- Flag tokens with `relationships.intervalRule` pointing to a key not present in `harmony-registry.json`
- Flag sibling class members (same `siblingClass` value) whose `siblingChromaRatio` differs by more than the tolerance declared in the registry for that sibling class
- Flag triad violations where `borderToForeground ≠ surfaceToForeground − surfaceToBorder`, within tolerance
- Flag tokens with `relationships.modeEnvelope` set to a value not present in the mode envelope registry

---

## Validator sequence

The harmonic validator runs six checks in order. Each is independent — a check can fail while others pass.

| Step | Check | What it validates | On failure | Severity |
|------|-------|------------------|------------|----------|
| 1 | ΔL interval | `harmonicInterval.deltaL.valid` — is the lightness delta within the valid range for this semantic pair? Linear arithmetic. | Error logged with actual vs. target and semantic role | error — blocks merge |
| 2 | C(L) ceiling | Does token chroma sit below the parabola ceiling (ceilingAtL) for its lightness and hue? | Error — gamut violation, color will clip across platforms | error — blocks merge |
| 3 | ΔC relative | Is `harmonicInterval.chromaEnvelope.actualRatio` within tolerance of `targetRatio`? | Warning — chroma dissonance, unequal visual loudness across hues | warning — annotates PR |
| 4 | ΔH mode | Is the hue within the allowedArc for the declared `modeEnvelope`? | Error — out of key, wrong palette family | error — blocks merge |
| 5 | Sibling parity | Do all members of `siblingClass` share the same `siblingChromaRatio` ± tolerance? | Warning — sibling dissonance, equal-function objects read with unequal visual weight | warning — annotates PR |
| 6 | Triad constraint | Does ΔL(surface→border) equal ΔL(surface→foreground) minus ΔL(border→foreground)? | Error — hierarchy broken at the component level even if individual pairs pass | error — blocks merge |

---

## Consequences

### Positive

- Canonical output carries explicit ownership boundaries across five authorities — no section is ambiguously owned
- The harmonic validator can check all six validation steps (ΔL, C(L) ceiling, ΔC relative, ΔH mode, sibling parity, triad constraint) from token metadata alone — no runtime color computation required
- Sibling components using different hue families will now be caught if their chroma envelope proportions diverge, producing unequal visual loudness
- The triad constraint check catches hierarchy breakdowns that individual WCAG pair checks cannot detect — a component where all pairs pass WCAG but the semantic weights are internally inconsistent
- AI code generation tools consuming the token catalog have access to interval rules, sibling classes, and mode envelopes — sufficient to generate component-level color decisions that are provably correct, not just plausible

### Tradeoffs

- The `harmony-registry.json` is a new artifact that requires its own versioning, governance, and migration tooling when interval definitions change
- The `computeAccessibility()` pipeline step adds build time proportional to the number of token pairs declared in `pairingRules` across all tokens
- The `relationships` section adds metadata authoring overhead for each token that participates in harmonic validation

---

## Future Extensions

- Extend `harmonicInterval` to carry proportion voice data (height:width target ratio, radius:height target ratio) for dimension and spacing tokens
- Add elevation voice to shadow tokens: `harmonicInterval.deltaL` between elevation levels, validated against the Z-interval scale
- Add motion voice to motion tokens: duration and easing curve validation against logarithmic and spring physics curves
- Build VS Code extension that surfaces `harmonicInterval.deltaL.valid` and `chromaEnvelope.valid` as inline decorations on token references
- Build Figma plugin that shows interval values for any selected token pair with live pass/fail indicators against the registry
- Add `changeRisk` to governance, derived from `usedBy` count combined with `harmonicInterval.triadValid` status
- Add cross-section mode consistency checking: validate that all tokens in a component share the same `modeEnvelope` declaration

---

## Related documents

- ADR-0010: Token Documentation Architecture
- ADR-0001: Canonical Token Model
- ADR-0002: Token Normalization Layer
- ADR-0003: Figma Input Contract
- ADR-0012: Hybrid Alias Resolution
- Harmony as Infrastructure — working hypothesis (design systems team)
- harmony-registry.json — interval rule and mode envelope definitions
- DTCG Specification — design-tokens.github.io/community-group/format/
- Culori API docs — culorijs.org — wcagContrast(), clampChroma(), toGamut()
