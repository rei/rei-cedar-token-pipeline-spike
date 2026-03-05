/**
 * story-helpers.ts
 *
 * Shared utilities for Cedar token Storybook stories.
 * Extracted from ColorPrimitives.stories.ts and ColorSemantic.stories.ts to
 * eliminate duplication of asyncStory, breadcrumb, sectionHeader, and the
 * common CSS design-system baseline.
 */

// ─── asyncStory ───────────────────────────────────────────────────────────────

/**
 * Wraps an async render function in a synchronous Storybook render function.
 * Displays a loading state while the async work runs, and an error message if
 * it rejects.
 */
export function asyncStory(fn: () => Promise<string>): () => HTMLElement {
  return () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px;background:#f5f2eb;";

    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token data…
      </div>`;

    fn()
      .then((html) => {
        container.innerHTML = html;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = `
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading tokens: ${msg}
          </div>`;
      });

    return container;
  };
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

export function breadcrumb(...parts: string[]): string {
  return `
    <nav class="breadcrumb">
      ${parts.map((p, i) => {
        const last = i === parts.length - 1;
        return `<span class="bc-segment${last ? " bc-current" : ""}">${p}</span>${last ? "" : '<span class="bc-sep">/</span>'}`;
      }).join("")}
    </nav>
  `;
}

export function sectionHeader(category: string, title: string, count: number): string {
  return `
    <div class="section-header">
      <span class="section-label">${category}</span>
      <span class="section-title">${title}</span>
      <span class="section-count">${count} tokens</span>
    </div>
  `;
}

// ─── Common CSS baseline ──────────────────────────────────────────────────────

/**
 * Shared CSS custom properties, reset, typography, and component classes used
 * by all Cedar token stories. Individual stories may append additional rules.
 */
export const BASE_STYLES_COMMON = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper:      #f5f2eb;
    --ink:        #1a1a18;
    --ink-mid:    #2e2e2b;
    --ink-muted:  #736e65;
    --ink-faint:  #b2ab9f;
    --rule:       rgba(46, 46, 43, 0.12);
    --rule-heavy: rgba(46, 46, 43, 0.28);
    --accent:     #0b2d60;
    --accent-mid: #406eb5;
    --font-mono:  'DM Mono', 'Courier New', monospace;
    --font-sans:  'Syne', system-ui, sans-serif;
  }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-mono);
    -webkit-font-smoothing: antialiased;
  }

  .page { padding: 3rem 3.5rem 4rem; max-width: 980px; }

  /* ── Breadcrumb ── */
  .breadcrumb { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 2.5rem; }
  .bc-segment { font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
  .bc-sep { color: var(--rule-heavy); font-size: 0.625rem; }
  .bc-current { color: var(--ink-muted); }

  /* ── Section header ── */
  .section-header { display: flex; align-items: baseline; gap: 1.5rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid var(--rule-heavy); }
  .section-label  { font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); }
  .section-title  { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
  .section-count  { font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-faint); margin-left: auto; }

  /* ── Group header ── */
  .group-header { display: flex; align-items: center; gap: 0.625rem; margin: 2rem 0 1rem; }
  .group-pip    { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-muted); }
  .group-name   { font-family: var(--font-sans); font-size: 0.5625rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-muted); }
  .group-rule   { flex: 1; height: 1px; background: var(--rule); }

  /* ── Decorative index number ── */
  .deco-index {
    font-family: var(--font-sans);
    font-size: 5rem;
    font-weight: 800;
    color: rgba(46,46,43,0.045);
    line-height: 1;
    position: absolute;
    right: 0;
    top: -0.5rem;
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.04em;
  }

  @media (max-width: 700px) {
    .page { padding: 2rem 1.5rem 3rem; }
  }
`;
