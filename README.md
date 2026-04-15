# Cedar Token Pipeline — V0 Spike

This repository contains the **V0 spike** for Cedar’s proposed design token pipeline exploration.  
The goal of this spike is to **manually validate** a one‑directional workflow from **Figma Variables → ingestion → normalization → canonical tokens → Style Dictionary outputs**, while documenting clear V1 extension points.

This spike is **exploratory**, **manual**, and **documentation‑first**.  
It is not intended to be production code.

---

## Purpose of This Spike

This V0 spike supports:

- Establish a **mock Figma token ecosystem**
- Build an **automated ingestion layer** using Figma Variables API
- Validate **Design Token (W3C) formatting**
- Establish **automated workflows** via GitHub Actions

---

## Scope of V0

### In Scope

- One‑directional flow: **Figma → Style Dictionary**
- Automation via **GitHub Actions**
- Ingestion of Figma variables using REST API
- Normalization into W3C design token contract
- Validation and error handling
- Documentation of assumptions, risks, and learnings
- Documented V1 extension points (deferred capabilities)

### Out of Scope

- Real token publishing
- Real Figma plugin development
- Full bidirectional sync (placeholder implemented)

---

## V0 Architecture (Implemented)

```text
Figma (proposal environment)
        ↓
Raw Variables JSON (ingestion)
        ↓
Normalized Token Contract
        ↓
Style Dictionary (canonical)
        ↓
Outputs:
  • CSS variables
  • iOS colorsets

V1 deferred capabilities:
  • Diff + impact detection
  • Reverse-sync payloads for Figma
```

## Architecture Docs

- Pipeline docs index: [architecture/README.md](architecture/README.md)
- ADRs: [architecture/ADR](architecture/ADR)
- Diagrams: [architecture/diagrams](architecture/diagrams)
- Notes: [architecture/notes](architecture/notes)

## Storybook and GitHub Pages

This repo builds Storybook separately from the published package so documentation is deployed to GitHub Pages instead of being bundled in `dist/`.

- `pnpm storybook:build` now emits to `storybook-static/`
- GitHub Pages deployment is configured in `.github/workflows/deploy-storybook.yml`
- Published token outputs remain in `dist/themes/` and `dist/types/`
- `dist/normalized/` is used only at build time for Storybook compatibility and is excluded from package publishing
- After merge to `main`, Storybook should be available at:
  `https://rei.github.io/rei-cedar-token-pipeline-spike/`

### PR Previews

For pull requests, a Storybook preview is automatically built and deployed to:
`https://rei.github.io/rei-cedar-token-pipeline-spike/pr/<branch-name>/`

The workflow posts a comment on the PR with the preview URL. This allows reviewers to see live Storybook changes before merging.

The Figma sync workflow also creates PR previews for token updates, deployed to `pr/update-tokens/`.

## Build and release

This project keeps documentation deployment separate from package output and release.

- `pnpm build:package` generates the published token outputs in `dist/`
- `pnpm release` runs the package build and publishes to npm when credentials are configured
- Storybook deploy workflow: `.github/workflows/deploy-storybook.yml`
- Package release workflow: `.github/workflows/release.yml`
- PR Storybook preview workflow: `.github/workflows/pr-storybook-preview.yml`
- The `release` workflow builds artifacts in CI before publishing, so `dist/` remains generated output rather than a source tree

## Consumer Contract (Types + Metadata)

This repo now generates a consumer-facing TypeScript contract and docs metadata artifacts.

- Type entrypoint: `@rei/cdr-tokens/types`
- Metadata entrypoint: `@rei/cdr-tokens/meta/*`

Example usage:

```ts
import type {
        CdrColorTextTokenName,
        CdrColorTextTokens,
        CdrColorTextTokenDocs,
        TokenDictionary,
        Theme,
        Platform,
        Responsibility,
} from "@rei/cdr-tokens/types";

type ColorTextDictionary = TokenDictionary<
        Theme,
        Platform,
        Responsibility,
        "cdr-color-text",
        CdrColorTextTokens,
        CdrColorTextTokenName
>;

const docs: CdrColorTextTokenDocs = {
        "color-text-link": {
                summary: "Text color for interactive links and inline navigation.",
        },
};
```

Generated docs metadata JSON is available per module, for example:

- `dist/themes/rei-dot-com/meta/foundations/cdr-color-text.docs.json`
