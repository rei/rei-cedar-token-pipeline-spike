# ADR-0015: Cedar Tailwind Preset — Multi-Platform Token Alignment Strategy

**Status:** Proposed  
**Date:** 2026-06-08  
**Context:** Cedar 17 / cdr-tokens 14 — Consumer team alignment (DXP and beyond)  
**Stakeholders:** Design system team, DXP platform engineering, design

---

## The Problem We Are Solving Together

Cedar's design token roadmap is moving toward fluid spacing (clamp-based, container-aware) and runtime-resolved color (oklch, palette modes). This is the right direction — it gives designers real fluid control across breakpoints and surfaces, and gives us multi-platform alignment between web, iOS, and Android.

Consumer teams like DXP are building on Tailwind CSS. Tailwind resolves spacing and color at **build time** into static values. Cedar delivers token values at **runtime** via CSS custom properties. These two models are structurally at odds for any token that carries design intent — and the gap will widen as Cedar's token sophistication grows.

The goal of this document is not to block consumer teams or force an architectural pivot. It is to define a **Cedar-owned, maintained solution** that lets teams like DXP stay on Tailwind while remaining inside the Cedar design contract — including fluid spacing.

This is a collaborative path forward, not a mandate.

---

## Why This Matters for Designers

When a designer moves a spacing value to a fluid clamp token in Figma, they expect that decision to propagate everywhere — web, iOS, Android, and every product built on Cedar. When a consumer app uses `pt-28` (a hardcoded Tailwind value), that propagation silently breaks. The spacing becomes frozen at the old static value. There is no error, no warning — the design intent just doesn't arrive.

This is not a developer problem. It is a design system infrastructure problem, and Cedar owns fixing it.

The same applies to palette modes. When a designer applies a brand palette override in Figma expecting downstream color to shift, any hardcoded Tailwind color class (`bg-stone-100`, `text-white`) opts that element out permanently. At scale this creates visual inconsistency that is expensive to diagnose.

Cedar's job is to make the correct path easy and the incorrect path visible.

---

## Proposed Solution: The Cedar Tailwind Preset

Cedar will publish and maintain an official Tailwind preset: `@rei/cedar-tailwind-preset`.

This preset is Cedar's bridge for any consumer team using Tailwind. It replaces the need for each team to maintain their own `tailwind.config.ts` token bridge, and it ensures that as Cedar's token system evolves — fluid spacing, oklch, palette modes — consumer teams get those updates through a package upgrade, not a codebase migration.

### What the Preset Provides

**Spacing** — Cedar's fluid scale, expressed as Tailwind utility classes that emit CSS custom properties at runtime:

```js
// Consumer tailwind.config.ts
import { cedarPreset } from '@rei/cedar-tailwind-preset'

export default {
  presets: [cedarPreset],
  // Team-specific layout extends live here — columns, breakpoints, etc.
}
```

```html
<!-- Tailwind class in template → resolves to Cedar fluid token at runtime -->
<div class="pt-cdr-scale-5">
```

```css
/* What Cedar emits — fluid, runtime-resolved, palette-aware */
.pt-cdr-scale-5 { padding-top: var(--cdr-space-scale-5); }
/* --cdr-space-scale-5: clamp(1.6rem, 1.5rem + 0.44cqi, 2rem) */
```

The spacing value is fluid. It responds to container size. It updates when Cedar updates the token. The Tailwind class is just the authoring convenience — the Cedar token does the actual work.

**Color** — Cedar semantic tokens as Tailwind color classes:

```html
<div class="bg-cdr-background-primary text-cdr-text-primary">
```

These resolve to CSS custom properties, which means palette mode switching works. When a palette class is applied to an ancestor element, every element using `bg-cdr-background-primary` responds correctly — including elements styled with Tailwind utility classes.

**Border radius** — Cedar radius tokens as Tailwind utilities:

```html
<div class="rounded-cdr-softest">
```

**What the preset does NOT provide** — Tailwind layout primitives (flex, grid, alignment, display, z-index, overflow). These carry no design value and are not Cedar's domain. Teams retain full Tailwind layout DX without restriction.

### Naming Convention

All Cedar-sourced classes use a `cdr-` prefix to make the boundary between Cedar design values and Tailwind layout unambiguous in templates:

```html
<!-- Readable at a glance: layout is Tailwind, design values are Cedar -->
<div class="flex flex-col md:flex-row items-center gap-cdr-scale-5 bg-cdr-background-primary rounded-cdr-softest pt-cdr-scale-3">
```

This eliminates the need for team-by-team enforcement. The class names themselves document the system.

---

## How This Solves the DXP Blocker

DXP's current situation: they have built spacing and color on Tailwind's numeric scale (`pt-28`, `gap-12`, `bg-stone-100`). The migration path has felt like Cedar's architectural direction being imposed on their team's roadmap.

With the preset:

**Phase 1 — Adopt the preset (low effort)**  
DXP adds `@rei/cedar-tailwind-preset` and sets it as their base preset. Their existing numeric Tailwind classes continue to work during transition — the preset extends, not replaces, until they're ready.

**Phase 2 — Migrate spacing and color to Cedar classes (incremental)**  
DXP replaces Tailwind numeric classes with Cedar-prefixed equivalents file by file, at their own pace. The side-by-side mapping Cedar provides tells them exactly which class to use. Gaps (values with no Cedar equivalent) are surfaced to the Cedar team as token requests, not resolved with arbitrary pixel values.

**Phase 3 — Enforce the hard contract (when DXP is ready)**  
DXP removes `theme.extend` for spacing/color from their own config. At that point only Cedar-sanctioned values are available. Build errors catch any remaining violations automatically.

Cedar ships a codemod to automate Phase 2 for the common cases.

---

## Multi-Platform Alignment

The Tailwind preset solves the web surface. But the same Cedar tokens are the contract for iOS and Android. The alignment goal is:

A designer changes a spacing token → all platforms receive the update through their Cedar token package.

| Platform | How Cedar tokens arrive | What breaks when bypassed |
|---|---|---|
| Web (Cedar components) | CSS custom properties, direct | Nothing — components consume tokens directly |
| Web (Tailwind consumers) | Via Cedar preset → CSS custom properties | Fluid spacing, palette mode, token updates |
| iOS | Swift token package | Spacing, typography, color don't update |
| Android | Kotlin/resource token package | Spacing, typography, color don't update |

The Cedar preset is the web-specific adapter for this contract. It does not change what the tokens are — it changes how Tailwind-based teams author against them.

---

## What Cedar Commits To

For this to work, Cedar owns the following:

**Maintain the preset alongside token releases.** When Cedar ships new spacing tokens, fluid values, or palette modes, the preset is updated in the same release. Consumer teams should not need to manually update their config bridges.

**Publish a migration codemod.** A script that replaces Tailwind numeric spacing/color classes with Cedar-prefixed equivalents across a codebase. This makes Phase 2 something DXP can run, review, and ship — not a multi-sprint manual effort.

**Document gaps, don't just reject them.** When a consumer team hits a value that has no Cedar equivalent (e.g. `pt-28` → no exact Cedar token), Cedar treats that as a design system gap to evaluate, not a consumer error to fix themselves. A clear gap-reporting path is part of the preset documentation.

**Provide an ESLint/Stylelint rule.** A rule that flags Tailwind spacing/color classes that bypass the Cedar contract, with a fixer that suggests the correct Cedar equivalent. Opt-in for teams that want automated enforcement.

---

## What This Is Not

This is not a requirement for consumer teams to remove Tailwind. Tailwind's layout utilities (flex, grid, alignment, responsive variants) are not in conflict with Cedar and are not Cedar's domain.

This is not a requirement for consumer teams to migrate immediately. The preset is designed for incremental adoption. Phase 1 has no breaking changes.

This is not Cedar dictating DXP's architecture. It is Cedar taking responsibility for the integration layer that makes Tailwind and Cedar composable — which is Cedar's job, not the consumer team's.

---

## Immediate Next Steps

| Action | Owner | When |
|---|---|---|
| Publish `@rei/cedar-tailwind-preset` v0.1 with spacing and color | Cedar team | Next sprint |
| Test preset against DXP demo project as the first consumer | Cedar + DXP | Alongside v0.1 |
| Document gap reporting process | Cedar team | With v0.1 |
| Build migration codemod for numeric spacing classes | Cedar team | Follow-on sprint |
| Evaluate ESLint rule | Cedar team | After codemod validates well |
| Raise `$tertiary-green` and spacing gaps as token requests | DXP + Cedar design | Active now |

---

## Future: Option C Revisited

If Cedar's component story matures to cover the layout primitives that Tailwind currently provides (responsive column utilities, flex layout helpers), the preset becomes a bridge to a world where Cedar is the complete system on web. At that point, Tailwind can be removed entirely with confidence — because the preset migration path will have already moved all design-value classes to Cedar tokens.

That is the destination. The preset is the path to get there without blocking anyone along the way.
