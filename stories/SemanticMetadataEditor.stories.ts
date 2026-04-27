import type { Meta, StoryObj } from "@storybook/html";
import {
  loadSemanticContract,
  type SemanticContract,
  type SemanticContractEntry,
} from "./lib/load-semantic-contract.js";

type Args = Record<string, never>;

const meta: Meta<Args> = {
  title: "Tokens/Consumer/Metadata editor",
};

export default meta;
type Story = StoryObj<Args>;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function asyncStory(fn: () => Promise<HTMLElement>): () => HTMLElement {
  return () => {
    const root = document.createElement("div");
    root.innerHTML = `<div style="padding:32px;font-family:'DM Mono',monospace;background:#f5f2eb;color:#736e65">Loading semantic metadata…</div>`;
    fn()
      .then((node) => {
        root.innerHTML = "";
        root.appendChild(node);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        root.innerHTML = `<div style="padding:32px;font-family:'DM Mono',monospace;background:#f5f2eb;color:#be342d">${escapeHtml(message)}</div>`;
      });
    return root;
  };
}

function buildEditor(contract: SemanticContract): HTMLElement {
  const entries = Object.entries(contract.tokens).sort(([left], [right]) => left.localeCompare(right));
  const [initialPath, initialEntry] = entries[0] ?? [];
  if (!initialPath || !initialEntry) {
    throw new Error("semantic-tokens.json does not contain any semantic token entries.");
  }

  const state = structuredClone(initialEntry);

  const root = document.createElement("section");
  root.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@500;700;800&display=swap');
      .meta-editor { display:grid; grid-template-columns: 280px 1fr 1fr; gap: 1rem; padding: 2rem; background:#f5f2eb; color:#1a1a18; }
      .meta-card { background:#fbfaf7; border:1px solid rgba(46,46,43,.14); border-radius:10px; overflow:hidden; }
      .meta-head { padding:.9rem 1rem; border-bottom:1px solid rgba(46,46,43,.14); }
      .meta-kicker { font-family:'Syne',sans-serif; font-size:.6rem; letter-spacing:.18em; text-transform:uppercase; color:#736e65; }
      .meta-title { margin-top:.25rem; font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; }
      .meta-list { max-height: 65vh; overflow:auto; }
      .meta-item { width:100%; border:0; border-bottom:1px solid rgba(46,46,43,.08); background:transparent; text-align:left; padding:.75rem 1rem; cursor:pointer; }
      .meta-item[data-active='true'] { background:#fff; }
      .meta-item-name { font-family:'DM Mono',monospace; font-size:.68rem; color:#1a1a18; }
      .meta-item-token { margin-top:.2rem; font-family:'Syne',sans-serif; font-size:.8rem; color:#736e65; }
      .meta-form { display:grid; gap:.85rem; padding:1rem; }
      .meta-field { display:grid; gap:.35rem; }
      .meta-label { font-family:'Syne',sans-serif; font-size:.65rem; letter-spacing:.14em; text-transform:uppercase; color:#736e65; }
      .meta-input, .meta-select, .meta-textarea { width:100%; border:1px solid rgba(46,46,43,.18); border-radius:6px; padding:.65rem .75rem; font: 400 .85rem/1.4 'DM Mono', monospace; background:#fff; color:#1a1a18; }
      .meta-textarea { min-height: 84px; resize: vertical; }
      .meta-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
      .meta-preview { margin:0; padding:1rem; min-height:65vh; overflow:auto; font: 400 .72rem/1.6 'DM Mono', monospace; }
      .meta-actions { display:flex; gap:.75rem; padding:0 1rem 1rem; }
      .meta-button { border:0; border-radius:999px; padding:.65rem .9rem; background:#1a1a18; color:#f5f2eb; font: 600 .72rem/1 'Syne', sans-serif; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; }
      .meta-note { padding:0 1rem 1rem; font: 400 .72rem/1.5 'DM Mono', monospace; color:#736e65; }
      @media (max-width: 1100px) { .meta-editor { grid-template-columns: 1fr; } .meta-list { max-height:none; } .meta-preview { min-height: 320px; } }
    </style>
    <div class="meta-editor">
      <article class="meta-card">
        <div class="meta-head"><div class="meta-kicker">Token set</div><div class="meta-title">Semantic contract entries</div></div>
        <div class="meta-list"></div>
      </article>
      <article class="meta-card">
        <div class="meta-head"><div class="meta-kicker">Editor</div><div class="meta-title">Storybook-owned metadata draft</div></div>
        <div class="meta-form"></div>
        <div class="meta-actions"><button class="meta-button" type="button">Download JSON draft</button></div>
        <div class="meta-note">This panel edits an in-memory draft only. Persist the exported JSON or YAML in metadata/tokens.json or metadata/tokens.yaml. Figma names and mappings remain authoritative.</div>
      </article>
      <article class="meta-card">
        <div class="meta-head"><div class="meta-kicker">Preview</div><div class="meta-title">Merged semantic metadata payload</div></div>
        <pre class="meta-preview"></pre>
      </article>
    </div>
  `;

  const list = root.querySelector<HTMLDivElement>(".meta-list");
  const form = root.querySelector<HTMLDivElement>(".meta-form");
  const preview = root.querySelector<HTMLPreElement>(".meta-preview");
  const download = root.querySelector<HTMLButtonElement>(".meta-button");
  if (!list || !form || !preview || !download) {
    throw new Error("Failed to initialize metadata editor panel.");
  }

  const renderPreview = () => {
    preview.textContent = JSON.stringify({ [state.canonicalPath]: state }, null, 2);
  };

  const buildField = (
    label: string,
    input: HTMLElement,
    helpText?: string,
  ) => {
    const wrap = document.createElement("label");
    wrap.className = "meta-field";
    const labelNode = document.createElement("span");
    labelNode.className = "meta-label";
    labelNode.textContent = label;
    wrap.appendChild(labelNode);
    wrap.appendChild(input);
    if (helpText) {
      const note = document.createElement("span");
      note.style.cssText = "font:400 .68rem/1.4 'DM Mono',monospace;color:#736e65;";
      note.textContent = helpText;
      wrap.appendChild(note);
    }
    return wrap;
  };

  const renderForm = () => {
    form.innerHTML = "";
    const pathInput = document.createElement("input");
    pathInput.className = "meta-input";
    pathInput.value = state.canonicalPath;
    pathInput.disabled = true;
    form.appendChild(buildField("Canonical path", pathInput));

    const grid = document.createElement("div");
    grid.className = "meta-grid2";

    const tokenInput = document.createElement("input");
    tokenInput.className = "meta-input";
    tokenInput.value = state.token ?? "";
    tokenInput.addEventListener("input", () => {
      state.token = tokenInput.value;
      renderPreview();
    });
    grid.appendChild(buildField("Token slug", tokenInput, "Kebab-case only. This is documentation metadata, not the Figma source name."));

    const stabilitySelect = document.createElement("select");
    stabilitySelect.className = "meta-select";
    ["stable", "beta", "experimental", "deprecated"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      option.selected = state.stability === value;
      stabilitySelect.appendChild(option);
    });
    stabilitySelect.addEventListener("change", () => {
      state.stability = stabilitySelect.value;
      renderPreview();
    });
    grid.appendChild(buildField("Stability", stabilitySelect));
    form.appendChild(grid);

    const intent = document.createElement("textarea");
    intent.className = "meta-textarea";
    intent.value = state.intent ?? "";
    intent.addEventListener("input", () => {
      state.intent = intent.value || undefined;
      renderPreview();
    });
    form.appendChild(buildField("Intent", intent));

    const roleInput = document.createElement("input");
    roleInput.className = "meta-input";
    roleInput.value = state.role ?? "";
    roleInput.addEventListener("input", () => {
      state.role = roleInput.value || undefined;
      renderPreview();
    });
    form.appendChild(buildField("Role", roleInput));

    const derivedInput = document.createElement("input");
    derivedInput.className = "meta-input";
    derivedInput.value = state.derivedFrom ?? "";
    derivedInput.addEventListener("input", () => {
      state.derivedFrom = derivedInput.value || undefined;
      renderPreview();
    });
    form.appendChild(buildField("Derived from", derivedInput));

    const versionGrid = document.createElement("div");
    versionGrid.className = "meta-grid2";

    const introduced = document.createElement("input");
    introduced.className = "meta-input";
    introduced.value = state.introducedIn ?? "";
    introduced.addEventListener("input", () => {
      state.introducedIn = introduced.value || undefined;
      renderPreview();
    });
    versionGrid.appendChild(buildField("Introduced in", introduced));

    const deprecated = document.createElement("input");
    deprecated.className = "meta-input";
    deprecated.value = state.deprecatedIn ?? "";
    deprecated.addEventListener("input", () => {
      state.deprecatedIn = deprecated.value || null;
      renderPreview();
    });
    versionGrid.appendChild(buildField("Deprecated in", deprecated));
    form.appendChild(versionGrid);

    const platformGrid = document.createElement("div");
    platformGrid.className = "meta-grid2";
    ["web", "ios", "android"].forEach((platform) => {
      const input = document.createElement("input");
      input.className = "meta-input";
      input.value = state.platformMap?.[platform] ?? "";
      input.addEventListener("input", () => {
        state.platformMap = {
          ...(state.platformMap ?? {}),
          [platform]: input.value,
        };
        renderPreview();
      });
      platformGrid.appendChild(buildField(`${platform} map`, input));
    });
    form.appendChild(platformGrid);

    const contrast = document.createElement("input");
    contrast.className = "meta-input";
    contrast.type = "number";
    contrast.step = "0.1";
    contrast.value = String(state.accessibility?.minContrast ?? "");
    contrast.addEventListener("input", () => {
      const next = contrast.value === "" ? undefined : Number(contrast.value);
      state.accessibility = next === undefined ? undefined : { minContrast: next };
      renderPreview();
    });
    form.appendChild(buildField("Minimum contrast", contrast));
  };

  const setActive = (pathKey: string, entry: SemanticContractEntry) => {
    Object.assign(state, structuredClone(entry));
    state.canonicalPath = pathKey;
    list.querySelectorAll<HTMLElement>(".meta-item").forEach((node) => {
      node.dataset.active = String(node.dataset.path === pathKey);
    });
    renderForm();
    renderPreview();
  };

  entries.forEach(([pathKey, entry]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "meta-item";
    button.dataset.path = pathKey;
    button.dataset.active = String(pathKey === initialPath);
    button.innerHTML = `<div class="meta-item-name">${escapeHtml(pathKey)}</div><div class="meta-item-token">${escapeHtml(entry.token)}</div>`;
    button.addEventListener("click", () => setActive(pathKey, entry));
    list.appendChild(button);
  });

  download.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ [state.canonicalPath]: state }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${state.token || "semantic-token"}.metadata.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  });

  renderForm();
  renderPreview();
  return root;
}

export const EditorPanel: Story = {
  render: asyncStory(async () => {
    const contract = await loadSemanticContract();
    return buildEditor(contract);
  }),
};
