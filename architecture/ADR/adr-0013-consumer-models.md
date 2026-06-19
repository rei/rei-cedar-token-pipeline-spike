# ADR-0013: Cedar Token Consumer Models — Supported Outputs and Contracts

**Status:** Proposed  
**Date:** 2026-06-09  
**Context:** Cedar token spike — Figma-pulled pipeline, multi-platform delivery  
**Stakeholders:** Design system team, token spike team, iOS, Android, DXP platform engineering, design  
**Related:**
- ADR-0014: Composite Style Values — What Belongs in the Token Repository
- ADR-0015: Cedar Tailwind Preset — Multi-Platform Token Alignment Strategy

---

## Purpose

This document defines every consumer model Cedar commits to supporting, what Cedar produces for each, who owns the integration layer, and where Cedar's responsibility ends.

It is the prerequisite to the token spike. The pipeline the spike produces must be scoped against this document. If a consumer model is not listed here, the spike does not build for it. If a consumer model needs to be added, this ADR is updated first — before pipeline work begins.

The other ADRs in this series describe specific solutions in depth. This document defines the full surface those solutions must cover.

---

## The Two Layers Cedar Owns

Before defining consumer models, it is important to be precise about what Cedar produces and at what layer.

**Layer 1 — The token repository (platform-agnostic)**
Single-value design decisions expressed as named constants. This is what the token spike produces. Every consumer model receives its raw contract from this layer. No composite values, no platform-specific syntax, no usage assumptions.

**Layer 2 — Platform libraries (platform-specific)**
Cedar-owned adapters, component libraries, and style packages that sit on top of the token repository and provide composite expressions for each platform. The token spike does not build these — but it must produce output that makes them possible.

Consumer models that need a Layer 2 adapter are noted below.

---

## Consumer Models

### 1. Cedar Components (Web)

**What they are:** The primary Cedar web component library (`@rei/cedar`). Vue components that implement Cedar's design language.

**What the token spike produces:**
CSS custom properties, published as a global stylesheet:
```css
:root {
  --cdr-font-size-heading-900: 2.5rem;
  --cdr-space-scale-5: clamp(1.6rem, 1.5rem + 0.44cqi, 2rem);
  --cdr-color-background-primary: #ffffff;
}
```

**Integration layer:** None. Components consume CSS custom properties directly. The component library is the authoritative composite expression for web — it references atomic tokens and owns the combination.

**Cedar's boundary:** Cedar components own the composite style. Consumers of Cedar components do not need to touch tokens directly for standard usage.

**Token spike scope:** Generate CSS custom property stylesheet as a primary deliverable.

---

### 2. CSS / Vanilla Web

**What they are:** Teams or surfaces that apply Cedar tokens directly in handwritten CSS, without a framework or Cedar components — custom marketing templates, CMS-rendered content, third-party component overrides.

**What the token spike produces:**
The same CSS custom property stylesheet as Cedar Components. No additional output needed.

```css
.custom-surface {
  background-color: var(--cdr-color-background-primary);
  padding: var(--cdr-space-scale-5);
}
```

**Integration layer:** None for atomic usage. Cedar ships a `@rei/cedar-styles` package (Layer 2) with CSS utility classes for composite typography styles, as an escape hatch. The token spike does not build this — it is a component library concern.

**Cedar's boundary:** Cedar provides the custom properties and documents their usage. Composition is the consumer's responsibility unless they use Cedar components or the cedar-styles escape hatch.

**Token spike scope:** Covered by CSS custom property output. No additional work.

---

### 3. Sass

**What they are:** Teams using Sass/SCSS as their stylesheet authoring tool, who want Cedar token values available as Sass variables alongside CSS custom properties.

**What the token spike produces:**
A generated Sass variable file that maps Cedar token names to their CSS custom property references:

```scss
// @rei/cdr-tokens/scss/_tokens.scss
$cdr-font-size-heading-900: var(--cdr-font-size-heading-900);
$cdr-space-scale-5: var(--cdr-space-scale-5);
$cdr-color-background-primary: var(--cdr-color-background-primary);
```

Note: Sass variables reference the CSS custom properties, not the raw values. This preserves runtime resolution — fluid spacing and palette modes work correctly even when accessed via Sass variables.

**Integration layer:** None for atomic usage. Composite Sass mixins (formerly in the token repository) are the responsibility of `@rei/cedar-styles` — a Layer 2 concern. See ADR: Composite Style Values.

**Cedar's boundary:** Cedar provides atomic Sass variables. Composite mixins are not part of the token contract.

**Token spike scope:** Generate Sass variable file as a secondary web deliverable.

---

### 4. TypeScript / JavaScript

**What they are:** Tooling, build scripts, design tooling integrations, CSS-in-JS consumers, and any context where token values are needed as JavaScript constants.

**What the token spike produces:**
A generated ESM module with typed token constants:

```ts
// @rei/cdr-tokens — named exports
export const cdrFontSizeHeading900 = 'var(--cdr-font-size-heading-900)' as const;
export const cdrSpaceScale5 = 'var(--cdr-space-scale-5)' as const;
export const cdrColorBackgroundPrimary = 'var(--cdr-color-background-primary)' as const;

// Also export as a typed map for tooling consumers
export const cdrTokens = {
  fontSizeHeading900: cdrFontSizeHeading900,
  spaceScale5: cdrSpaceScale5,
  colorBackgroundPrimary: cdrColorBackgroundPrimary,
} as const;

export type CdrTokens = typeof cdrTokens;
```

**Integration layer:** None. Raw ESM constants are sufficient for most JS/TS consumers. CSS-in-JS consumers apply them directly as property values.

**Cedar's boundary:** Cedar provides constants. How they are applied in JS/TS rendering is the consumer's concern.

**Token spike scope:** Generate ESM + TypeScript declarations as a primary deliverable.

---

### 5. Tailwind CSS

**What they are:** Teams using Tailwind as their primary styling framework — currently DXP and potentially others. They author styles as utility classes in templates and expect those classes to resolve to Cedar design values.

**What the token spike produces:**
A generated Tailwind theme object where every value references a CSS custom property — not a resolved static value. This preserves runtime resolution for fluid spacing and palette modes:

```ts
// @rei/cdr-tokens/tailwind
export const cedarTokensTailwind = {
  spacing: {
    'cdr-scale-1': 'var(--cdr-space-scale-1)',
    'cdr-scale-3': 'var(--cdr-space-scale-3)',
    'cdr-scale-5': 'var(--cdr-space-scale-5)',
  },
  colors: {
    'cdr-background-primary': 'var(--cdr-color-background-primary)',
    'cdr-text-primary': 'var(--cdr-color-text-primary)',
    'cdr-text-inverse': 'var(--cdr-color-text-inverse)',
  },
  borderRadius: {
    'cdr-sharp': 'var(--cdr-radius-sharp)',
    'cdr-soft': 'var(--cdr-radius-soft)',
    'cdr-softest': 'var(--cdr-radius-softest)',
    'cdr-round': 'var(--cdr-radius-round)',
  }
}
```

**Integration layer:** Yes — the Cedar Tailwind Preset (`@rei/cedar-tailwind-preset`) wraps this output and provides the consumer-facing config. The preset is a Layer 2 concern maintained by Cedar alongside token releases. See ADR: Cedar Tailwind Preset.

**Cedar's boundary:** Cedar owns the token theme object and the preset. Tailwind layout utilities (flex, grid, alignment) are not Cedar's domain. Composite typography styles are accessed through Cedar components or the cedar-styles package, not through Tailwind utilities.

**Token spike scope:** Generate Tailwind theme object as a web deliverable. This is a required output — without it the Cedar Tailwind Preset cannot be built or maintained.

---

### 6. iOS (Swift / UIKit / SwiftUI)

**What they are:** REI iOS applications consuming Cedar design tokens for spacing, color, typography, and radius.

**What the token spike produces:**
A generated Swift constants file:

```swift
// CdrTokens.swift — generated
public enum CdrTokens {
  public enum FontSize {
    public static let heading900: CGFloat = 40.0 // 2.5rem at 16px base
  }
  public enum Color {
    public static let backgroundPrimary = UIColor(hex: "#ffffff")
    public static let textPrimary = UIColor(hex: "#1d1d1d")
  }
  public enum Spacing {
    // Fluid spacing: iOS receives the base value of the clamp range
    // The scale step and min/max are provided for teams implementing
    // container-responsive layout natively
    public static let scale5Base: CGFloat = 25.6  // 1.6rem
    public static let scale5Max: CGFloat = 32.0   // 2rem
  }
}
```

**A note on fluid spacing for iOS:** CSS `clamp()` with container query units (`cqi`) has no direct iOS equivalent. The token spike must define an explicit strategy for how fluid tokens are expressed on iOS — options include shipping the base value only, shipping min/max as separate constants, or shipping a scale multiplier. This decision must be made in the spike and documented as part of this ADR before iOS output is built.

**Integration layer:** Yes — a Cedar iOS library (Layer 2) provides composite expressions: `TextStyle` helpers, `AttributedString` factories, and spacing convenience methods that combine atomic token values. The token spike does not build this library, but its output must be sufficient for the library to be built on top of it.

**Cedar's boundary:** Cedar provides atomic Swift constants. Composite UIKit/SwiftUI helpers are the responsibility of the Cedar iOS library.

**Token spike scope:** Generate Swift constants file. Fluid spacing strategy must be defined and documented before iOS output is finalized.

---

### 7. Android (Kotlin / XML Resources)

**What they are:** REI Android applications consuming Cedar design tokens for spacing, color, typography, and radius.

**What the token spike produces:**
Generated Android resource files and/or Kotlin constants:

```xml
<!-- res/values/cdr_tokens.xml — generated -->
<resources>
  <dimen name="cdr_font_size_heading_900">40sp</dimen>
  <dimen name="cdr_space_scale_5_base">26dp</dimen>
  <color name="cdr_color_background_primary">#FFFFFF</color>
  <color name="cdr_color_text_primary">#1D1D1D</color>
</resources>
```

```kotlin
// CdrTokens.kt — generated (alternative or supplement)
object CdrTokens {
  object FontSize {
    val heading900 = 40.sp
  }
  object Color {
    val backgroundPrimary = Color(0xFFFFFFFF)
    val textPrimary = Color(0xFF1D1D1D)
  }
}
```

**A note on fluid spacing for Android:** Same constraint as iOS. `clamp()` with container query units has no direct Android equivalent. The same fluid spacing strategy defined for iOS applies here. The spike must resolve this before Android output is built.

**Integration layer:** Yes — a Cedar Android library (Layer 2) provides `TextAppearance` styles, dimension helpers, and composite style resources built on top of the token constants. The token spike does not build this library.

**Cedar's boundary:** Cedar provides atomic Android resource values and/or Kotlin constants. Composite `TextAppearance` and style definitions are the responsibility of the Cedar Android library.

**Token spike scope:** Generate Android XML resource file and/or Kotlin constants. Fluid spacing strategy shared with iOS must be defined first.

---

### 8. Flagship iOS (Legacy Consumer Model)

**What they are:** The REI flagship iOS application is a large-scale production app with legacy UIKit code, new SwiftUI code, and complex color management requirements. It has significantly different requirements from new iOS projects.

**Current Implementation (Flagship):**
- **Distribution:** CocoaPods via private REI Git repo
- **Version:** ~> 0.4.0
- **Color Space:** sRGB (not Display P3)
- **Color Access:** Enum-based pattern via CdrColor.color(CdrColorName.CdrColorTextPrimary)
- **Frameworks:** UIKit (legacy) + SwiftUI (new)
- **Color Surface:** 223 colors (CdrColor* + REIColor* legacy + generic names)
- **Naming Conventions:** Dual naming (CdrColor* + REIColor*)
- **Objective-C Support:** Required (@objc classes, header files)
- **Stylesheet Pattern:** CedarStylesheet for centralized color management
- **Module Structure:** Single CedarTokens pod (not modular like rei-cedar-ios)

**What the token spike produces for Flagship:**
Generated CocoaPods-compatible outputs:

```swift
// CdrColor.swift — generated for flagship
@objc public class CdrColor: NSObject {
    @objc public static func color(_ name: CdrColorName) -> UIColor {
        let colorName = colorNameString(for: name)
        let bundle = Bundle(for: CdrColor.self)
        guard let color = UIColor(named: colorName, in: bundle, compatibleWith: nil) else {
            return .clear
        }
        return color
    }
    
    @objc public static func values() -> [UIColor] {
        return (0...222).compactMap { rawValue in
            guard let colorName = CdrColorName(rawValue: rawValue) else { return nil }
            return color(colorName)
        }
    }
}
```

```objc
// CdrColor.h — generated for flagship Objective-C compatibility
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, CdrColorName) {
    CdrColorTextPrimary = 0,
    CdrColorTextSecondary = 1,
    // ... 223 color values
};

@interface CdrColor : NSObject

+ (UIColor *)color:(CdrColorName)name;

@end
```

**Integration layer:** Yes — the flagship app uses CedarStylesheet pattern for UIKit styling and direct XCAssets access for SwiftUI.

**Cedar's boundary:** Cedar provides enum-based color access for Objective-C compatibility and sRGB color values for flagship compatibility. Composite UIKit helpers are the responsibility of the flagship app.

**Token spike scope:** Generate CocoaPods-compatible outputs with enum-based access, sRGB color space, and Objective-C header files.

---

### 9. Flagship Android (Legacy Consumer Model)

**What they are:** The REI flagship Android application is a large-scale production app with legacy color management. It has significantly different requirements from new Android projects.

**Current Implementation (Flagship):**
- **Distribution:** Manual copying of legacy cedar-release.aar colors
- **Color Space:** sRGB (team not aware of high spectrum option)
- **Framework:** Jetpack Compose (primary) + XML Views (legacy)
- **Color Access:** XML resources via @color/ references
- **Color Surface:** Large number of Cedar color definitions in XML
- **Dark Mode:** Not implemented (no values-night directory)
- **Compose Color Schemes:** Not implemented (colors from XML)
- **Automated Distribution:** Not implemented (manual process)
- **Legacy Colors:** Using colors Cedar provided years ago

**What the token spike produces for Flagship:**
Generated XML resource files for manual integration:

```xml
<!-- res/values/colors.xml — generated for flagship manual integration -->
<resources>
  <color name="cdr_color_text_primary">#1A1A1A</color>
  <color name="cdr_color_text_secondary">#666666</color>
  <color name="cdr_color_background_primary">#FFFFFF</color>
  <!-- ... additional colors -->
</resources>
```

**Integration layer:** Limited — the flagship app uses manual copy-paste from dist to project. No automated integration layer.

**Cedar's boundary:** Cedar provides XML resource files with sRGB color values for flagship compatibility. Composite style definitions are the responsibility of the flagship app.

**Token spike scope:** Generate XML resource files with sRGB color space for manual integration. Note: This is a transitional approach — automated distribution and high spectrum support are planned for new projects.

---

### 10. Figma (Design — Source and Consumer)

**What they are:** Figma is both the **source** of tokens in the new pipeline and a **consumer** of the published token contract for design tooling, documentation, and design-development handoff.

**As a source:**
The Figma-pulled pipeline reads Figma variables and text styles, decomposes them into atomic token values, and produces the outputs described in this document. Figma is upstream of everything else.

**As a consumer:**
Designers expect to see Cedar tokens reflected back in Figma — so that token names used in code match the names visible in Figma variables and design documentation. This two-way relationship means the token naming convention must be agreed upon before the spike produces any output. A name that changes after iOS and Android have shipped against it is a breaking change.

**What the token spike produces for Figma:**
The spike does not generate Figma output directly. The two-way relationship is maintained by the Figma plugin / pipeline tooling. However, the spike must ensure that token names, groupings, and categories in all platform outputs exactly match the Figma variable structure. Any deviation is a handoff gap.

**Cedar's boundary:** Cedar owns the token naming convention as the shared language between design and engineering. The Figma plugin that reads and writes variables is a pipeline concern, not a token output concern.

**Token spike scope:** Validate that all generated output names match Figma variable names exactly. Naming convention must be locked before platform outputs are generated.

---

## Consumer Model Summary

| Consumer | Token spike output | Integration layer (Layer 2) | Composite styles |
|---|---|---|---|
| Cedar components (web) | CSS custom properties | None | Component library |
| CSS / vanilla web | CSS custom properties | None (cedar-styles as escape hatch) | Consumer or cedar-styles |
| Sass | Sass variable file | None (cedar-styles as escape hatch) | cedar-styles package |
| TypeScript / JS | ESM constants + TS types | None | Consumer |
| Tailwind CSS | Tailwind theme object | Cedar Tailwind Preset | Cedar components / cedar-styles |
| iOS | Swift constants | Cedar iOS library | Cedar iOS library |
| Android | XML resources / Kotlin constants | Cedar Android library | Cedar Android library |
| Figma | Naming validation only | Figma plugin (pipeline) | Design |

---

## What Is Out of Scope

The following consumer models are explicitly not supported by the token spike. If a consumer model not listed here is needed, this ADR must be updated before work begins.

- **React Native** — not a current Cedar platform. If REI products require it, a consumer model definition must be added here first.
- **CSS-in-JS libraries (Emotion, styled-components)** — covered by the TypeScript/JS consumer model. Raw ESM constants are sufficient; a dedicated output is not required.
- **Web Components / Shadow DOM** — CSS custom properties inherit through shadow boundaries. The CSS output is sufficient. No additional consumer model needed.
- **Design token format exports (W3C DTCG JSON, Style Dictionary config)** — these are pipeline format concerns, not consumer model concerns. The spike may use these formats internally but does not publish them as consumer deliverables.

---

## Open Questions for the Token Spike

These must be resolved before platform outputs are finalized:

1. **Fluid spacing on iOS and Android.** What is Cedar's strategy for expressing `clamp()` values on native platforms? Options: base value only, min/max as separate constants, a scale multiplier. Decision needed before iOS and Android output is built.

2. **Token naming convention lock.** Token names must match Figma variable names exactly across all outputs. When is the naming convention considered locked, and what is the process for a breaking name change?

3. **Rem-to-pt/dp conversion.** iOS and Android work in `sp`/`dp`, not `rem`. What is the authoritative base font size Cedar uses for conversion, and is it documented as an assumption in the generated output?

4. **Palette mode on native platforms.** Cedar's web palette mode works by reassigning CSS custom properties at runtime. What is the equivalent mechanism on iOS and Android, and does the token spike need to produce additional output to support it?

5. **Versioning and breaking changes.** When a token is renamed or removed, all consumer models are affected. What is Cedar's breaking change policy, and how is it communicated across web, iOS, and Android consumers simultaneously?
