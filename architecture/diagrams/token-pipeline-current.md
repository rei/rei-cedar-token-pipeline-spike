# Cedar Token Pipeline — Current Architecture

```mermaid
flowchart TB
    subgraph Figma["Figma Input (ADR-0003)"]
        F1[options.color.*.json]
        F2[options.text.*.json]
        F3[options.spacing.*.json]
        F4[alias.color.*.json]
    end

    subgraph Norm["Normalization Layer (ADR-0002)"]
        N1[Schema Mapping<br/>token-schema.json]
        N2[Four-file Convention<br/>web-light, web-dark, ios-light, ios-dark]
        N3[Governance Validation<br/>build-fail on unmapped paths]
        N4[Metadata Merge<br/>$extensions.cedar.governance]
    end

    subgraph Canon["Canonical Model (ADR-0001)"]
        C1[Options<br/>color.option.*<br/>text.*<br/>spacing.*]
        C2[Aliases<br/>color.modes.*<br/>spacing.component/layout]
        C3[$extensions.cedar<br/>platformOverrides<br/>appearances<br/>resolved<br/>docs<br/>governance]
    end

    subgraph Trans["Transform Layer (ADR-0005)"]
        T1[Style Dictionary v5]
        T2[Culori / OKLCH Formulas]
        T3[Platform-specific Actions]
        T4[Type Generation]
    end

    subgraph Out["Platform Outputs"]
        W1[Web CSS<br/>light.css, dark.css<br/>OKLCH + hex fallbacks]
        W2[iOS Colorsets<br/>Colors.xcassets<br/>Display P3]
        W3[TypeScript Types<br/>@rei/cdr-tokens/types]
        W4[Docs Metadata<br/>.docs.json]
    end

    subgraph Cons["Consumers (ADR-0013)"]
        CED[Cedar Components]
        WEB[Web Apps]
        IOS[iOS Apps]
        AND[Android<br/>pending]
        TAIL[Tailwind<br/>ADR-0015]
    end

    subgraph Future["Future / Not Implemented"]
        FUT1[State Layer<br/>ADR-0006]
        FUT2[Accessibility<br/>ADR-0009]
        FUT3[Harmonic Validation<br/>ADR-0011]
        FUT4[Android Output<br/>ADR-0013]
        FUT5[Semantic Typography<br/>ADR-0004 + typography gap]
    end

    F1 --> N1
    F2 --> N1
    F3 --> N1
    F4 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> C1
    N4 --> C2
    C1 --> C3
    C2 --> C3
    C1 --> T1
    C2 --> T1
    C3 --> T2
    C3 --> T3
    T1 --> T4
    T2 --> T4
    T3 --> T4
    T4 --> W1
    T4 --> W2
    T4 --> W3
    T4 --> W4
    W1 --> CED
    W1 --> WEB
    W2 --> IOS
    W3 --> CED
    W3 --> WEB
    W3 --> IOS
    W4 --> CED
    W4 --> WEB
    W4 --> IOS
    T4 --> AND
    T4 --> TAIL

    C1 -.-> FUT5
    Canon -.-> FUT1
    Canon -.-> FUT2
    Canon -.-> FUT3
    Trans -.-> FUT4

    classDef impl fill:#e6fffa,stroke:#2c7a7b,stroke-width:2px
    classDef planned fill:#fffaf0,stroke:#c05621,stroke-width:2px
    classDef proposed fill:#fef3c7,stroke:#d97706,stroke-width:2px
    classDef future fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,stroke-dasharray: 5 5

    class F1,F2,F3,F4,N1,N2,N3,N4,C1,C2,C3,T1,T2,T3,T4,W1,W2,W3,W4 impl
    class TAIL proposed
    class AND future
    class FUT1,FUT2,FUT3,FUT4,FUT5 future
```

## Layer Descriptions

| Layer | ADR | Status | Description |
|---|---|---|---|
| **Figma Input** | ADR-0003 | Implemented | Four-file platform convention, schema-backed path mapping in `token-schema.json` |
| **Normalization** | ADR-0002 | Implemented | Transforms raw Figma files into canonical model with governance validation |
| **Canonical Model** | ADR-0001 | Draft | Platform-agnostic token shape with `$extensions.cedar` for platform data, resolved values, docs, and governance metadata |
| **Transform Layer** | ADR-0005 | Planned | Style Dictionary v5 pipeline with platform-specific transforms, OKLCH formulas, and type generation |
| **Platform Outputs** | — | Implemented | Web CSS (light/dark with OKLCH), iOS colorsets (Display P3), TypeScript types, docs metadata |
| **Consumers** | ADR-0013 | Proposed | Cedar components, web apps, iOS apps, Android (pending), Tailwind (ADR-0015) |

## Key Architectural Decisions

- **ADR-0012 (Hybrid Alias Resolution)** — Alias `$value` references remain as canonical source of truth; pre-resolved values in `$extensions.cedar.resolved` give transforms deterministic values without dictionary traversal
- **ADR-0010 (Token Documentation Architecture)** — Split authority: Figma owns descriptions in `$extensions.cedar.docs`, repo owns governance metadata in `$extensions.cedar.governance`
- **ADR-0007 (Modes and Palettes)** — Light/dark modes and default/sale palettes implemented via `$extensions.cedar.appearances` on option tokens
- **ADR-0008 (Responsive and Adaptive Tokens)** — Fluid spacing with `clamp()` implemented; container query tokens and density tokens proposed
- **ADR-0014 (Composite Style Values)** — Token repo contains atomic single-value tokens only; composite styles live in platform libraries (cedar-styles, iOS library, Android library, Tailwind preset)
