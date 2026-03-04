/**
 * SemanticDiff.stories.ts
 *
 * Storybook stories for the Cedar token semantic diff feature.
 * Fetches dist/normalized/baseline.json and dist/normalized/current.json,
 * runs the diff engine, and renders the result using diff-render.
 *
 * Stories:
 *   FullDiff     — inline fixture; always works, no server required
 *   NoChanges    — demonstrates the empty-state UI
 *   LiveDiff     — fetches both JSON files at runtime; requires the files to
 *                  exist in dist/normalized/. Run `pnpm tokens:snapshot` to
 *                  generate them, then restart Storybook.
 */

import type { StoryObj } from "@storybook/html";
import { computeDiff } from "./lib/diff-engine.js";
import { renderDiffPage } from "./lib/diff-render.js";

// ─── Type shim ───────────────────────────────────────────────────────────────

type Meta = {
  title: string;
  render: () => string | Promise<string> | HTMLElement;
};

const meta: Meta = {
  title: "Cedar Tokens / Semantic Diff",
  render: () => "",
};

export default meta;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Wrap a promise-based render so Storybook receives an HTMLElement. */
function asyncStory(
  fn: () => Promise<string>,
): () => HTMLElement {
  return () => {
    const container = document.createElement("div");
    container.style.cssText = "min-height:200px";

    // Loading placeholder
    container.innerHTML = `
      <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#736e65">
        Loading token diff…
      </div>`;

    fn()
      .then((html) => {
        container.innerHTML = html;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        container.innerHTML = `
          <div style="padding:40px 32px;font-family:'DM Mono',monospace;font-size:.85rem;color:#be342d">
            Error loading diff: ${msg}
          </div>`;
      });

    return container;
  };
}

// ─── Story: FullDiff (inline fixtures) ───────────────────────────────────────

// Inline copies of the fixture data so this story works without a server.
const BASELINE = {
  color: {
    "Neutral Colors": {
      "warm-grey": {
        "100": { $value: "#edeae3", $type: "color" },
        "300": { $value: "#b2ab9f", $type: "color" },
        "600": { $value: "#736e65", $type: "color" },
        "900": { $value: "#2e2e2b", $type: "color" },
      },
      "base-neutrals": {
        black: { $value: "#000000", $type: "color" },
        white: { $value: "#ffffff", $type: "color" },
        "white-85": { $value: "#ffffffd9", $type: "color" },
        "white-75": { $value: "#ffffffbf", $type: "color" },
      },
    },
    "Brand Colors": {
      blue: {
        "400": { $value: "#406eb5", $type: "color" },
        "600": { $value: "#0b2d60", $type: "color" },
      },
      red: {
        "400": { $value: "#be342d", $type: "color" },
        "600": { $value: "#610a0a", $type: "color" },
      },
      green: {
        "400": { $value: "#3b8349", $type: "color" },
        "600": { $value: "#1f513f", $type: "color" },
      },
      yellow: {
        "400": { $value: "#ffbf59", $type: "color" },
        "600": { $value: "#ffe7b3", $type: "color" },
        "800": { $value: "#ede285", $type: "color" },
      },
    },
    surface: {
      base: { $value: "{color.Neutral Colors.base-neutrals.white}", $type: "color" },
      raised: { $value: "{color.Neutral Colors.warm-grey.100}", $type: "color" },
    },
    text: {
      base: { $value: "{color.Neutral Colors.warm-grey.900}", $type: "color" },
      subtle: { $value: "{color.Neutral Colors.warm-grey.600}", $type: "color" },
      link: { $value: "{color.Brand Colors.blue.600}", $type: "color" },
      "link-hover": { $value: "{color.Brand Colors.blue.400}", $type: "color" },
    },
    border: {
      base: { $value: "{color.Neutral Colors.warm-grey.300}", $type: "color" },
      subtle: { $value: "{color.Neutral Colors.warm-grey.100}", $type: "color" },
    },
  },
};

const CURRENT = {
  color: {
    "Neutral Colors": {
      "warm-grey": {
        "100": { $value: "#edeae3", $type: "color" },
        "300": { $value: "#b2ab9f", $type: "color" },
        "600": { $value: "#736e65", $type: "color" },
        "900": { $value: "#1a1a18", $type: "color" }, // changed value
      },
      "base-neutrals": {
        black: { $value: "#000000", $type: "color" },
        white: { $value: "#ffffff", $type: "color" },
        "white-85": { $value: "#ffffffd9", $type: "color" },
        // white-75 removed
      },
    },
    "Brand Colors": {
      blue: {
        "400": { $value: "#4a7ec8", $type: "color" }, // changed value
        "600": { $value: "#0b2d60", $type: "color" },
      },
      red: {
        "400": { $value: "#be342d", $type: "color" },
        "600": { $value: "#610a0a", $type: "color" },
      },
      green: {
        "400": { $value: "#3b8349", $type: "color" },
        "600": { $value: "#1f513f", $type: "color" },
      },
      yellow: {
        "400": { $value: "#ffbf59", $type: "color" },
        "600": { $value: "#ffe7b3", $type: "color" },
        "800": { $value: "#ede285", $type: "color" },
      },
      teal: { // new group
        "400": { $value: "#2a8a8a", $type: "color" },
        "600": { $value: "#1a5555", $type: "color" },
      },
    },
    surface: {
      base: { $value: "{color.Neutral Colors.base-neutrals.white}", $type: "color" },
      raised: { $value: "{color.Neutral Colors.warm-grey.100}", $type: "color" },
      overlay: { $value: "{color.Neutral Colors.base-neutrals.black}", $type: "color" }, // added token
    },
    text: {
      base: { $value: "{color.Neutral Colors.warm-grey.900}", $type: "color" },
      subtle: { $value: "{color.Neutral Colors.warm-grey.600}", $type: "color" },
      link: { $value: "{color.Brand Colors.blue.400}", $type: "color" }, // alias retargeted
      "link-hover": { $value: "{color.Brand Colors.blue.400}", $type: "color" },
    },
    border: {
      base: { $value: "{color.Neutral Colors.warm-grey.300}", $type: "color" },
      subtle: { $value: "{color.Neutral Colors.warm-grey.100}", $type: "color" },
    },
    feedback: { // new group
      success: { $value: "{color.Brand Colors.green.400}", $type: "color" },
      warning: { $value: "{color.Brand Colors.yellow.400}", $type: "color" },
      error: { $value: "{color.Brand Colors.red.400}", $type: "color" },
    },
  },
};

export const FullDiff: StoryObj = {
  name: "Full Diff (inline fixtures)",
  render: () => {
    const entries = computeDiff(
      BASELINE as Record<string, unknown>,
      CURRENT as Record<string, unknown>,
    );
    return renderDiffPage(entries, {
      baselineLabel: "baseline (inline)",
      currentLabel: "current (inline)",
    });
  },
};

// ─── Story: NoChanges ─────────────────────────────────────────────────────────

export const NoChanges: StoryObj = {
  name: "No Changes",
  render: () => {
    const entries = computeDiff(
      BASELINE as Record<string, unknown>,
      BASELINE as Record<string, unknown>,
    );
    return renderDiffPage(entries, {
      baselineLabel: "v1.0.0",
      currentLabel: "v1.0.0",
    });
  },
};

// ─── Story: LiveDiff ──────────────────────────────────────────────────────────

const NOT_FOUND_HTML = `
<div style="
  background:#f5f2eb;color:#2e2e2b;font-family:'DM Mono',monospace;
  min-height:100vh;padding:40px 32px;box-sizing:border-box
">
  <div style="max-width:560px">
    <div style="font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      color:#736e65;margin-bottom:6px;font-family:'Syne',sans-serif">
      Cedar Design Tokens — Semantic Diff
    </div>
    <h1 style="margin:0 0 24px;font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;
      letter-spacing:-.02em;border-bottom:2px solid #2e2e2b;padding-bottom:12px">
      Snapshot files not found
    </h1>
    <p style="line-height:1.6;margin:0 0 16px">
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/baseline.json</code>
      and/or
      <code style="background:#be342d22;padding:1px 5px;border-radius:3px">dist/normalized/current.json</code>
      could not be fetched. The files must exist before starting Storybook.
    </p>
    <p style="font-size:.8rem;color:#736e65;margin:0 0 20px;line-height:1.6">
      The <strong>Live Diff</strong> story reads real snapshot files written by the token
      normalization pipeline. Use the <strong>Full Diff (inline fixtures)</strong> story
      to see a working example with hardcoded data.
    </p>
    <div style="background:#2e2e2b;color:#edeae3;border-radius:6px;padding:16px 20px;
      font-size:.82rem;line-height:1.8">
      <div style="color:#736e65;margin-bottom:4px;font-size:.7rem;
        letter-spacing:.08em;text-transform:uppercase">To generate the files</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:snapshot baseline</div>
      <div style="color:#736e65;margin:4px 0"># edit tokens, re-run Figma sync, then:</div>
      <div><span style="color:#3b8349">$</span> pnpm tokens:snapshot current</div>
      <div style="color:#736e65;margin:4px 0"># restart Storybook to pick up the new files:</div>
      <div><span style="color:#3b8349">$</span> pnpm storybook</div>
    </div>
  </div>
</div>`;

/**
 * Fetches both JSON fixtures from the static server at runtime.
 * Requires `dist/normalized/baseline.json` and `dist/normalized/current.json`
 * to exist. Generate them with `pnpm tokens:snapshot baseline` /
 * `pnpm tokens:snapshot current`, then restart Storybook.
 */
export const LiveDiff: StoryObj = {
  name: "Live Diff (fetched)",
  render: asyncStory(async () => {
    const [baseRes, currRes] = await Promise.all([
      fetch("/normalized/baseline.json"),
      fetch("/normalized/current.json"),
    ]);

    if (baseRes.status === 404 || currRes.status === 404) {
      return NOT_FOUND_HTML;
    }

    if (!baseRes.ok) throw new Error(`baseline.json: ${baseRes.status} ${baseRes.statusText}`);
    if (!currRes.ok) throw new Error(`current.json: ${currRes.status} ${currRes.statusText}`);

    const baseline = (await baseRes.json()) as Record<string, unknown>;
    const current = (await currRes.json()) as Record<string, unknown>;

    const entries = computeDiff(baseline, current);
    return renderDiffPage(entries, {
      baselineLabel: "baseline.json",
      currentLabel: "current.json",
    });
  }),
};
