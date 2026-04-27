import type { Meta, StoryObj } from "@storybook/html";

type Args = Record<string, never>;

type Layer = "foundation" | "semantic" | "stateFamily" | "component";
type ViewTab = "author" | "taxonomy" | "connections" | "export";

type TaxonomyKey =
  | "foundation"
  | "intent"
  | "role"
  | "variant"
  | "stateFamily"
  | "state"
  | "tier"
  | "breakpoint";

type TaxonomyMap = Record<TaxonomyKey, string[]>;

type TokenRecord = {
  id: string;
  name: string;
  value: string;
  description: string;
  layer: Layer;
  taxonomy: Partial<Record<TaxonomyKey, string>>;
  links: string[];
};

type ImportPreview = { tokens: TokenRecord[]; sourceName: string };

type StudioState = {
  tab: ViewTab;
  search: string;
  layerFilter: Layer | "all";
  selectedTokenId: string | null;
  taxonomyFocus: TaxonomyKey;
  deriveFamily: "ghost" | "nudge";
  deriveState: "hover" | "pressed" | "disabled" | "selected" | "focus";
  deriveDarkMode: boolean;
  tokens: TokenRecord[];
  taxonomy: TaxonomyMap;
  exportPreview: string;
  lastMessage: string;
  importPreview: ImportPreview | null;
  categoryFilter: string;
};

const STORAGE_KEY = "cedar-token-authoring-studio-vnext";

const meta: Meta<Args> = {
  title: "Spikes/Token authoring studio vNext",
};

export default meta;
type Story = StoryObj<Args>;

const DEFAULT_TAXONOMY: TaxonomyMap = {
  foundation: ["color", "type", "radius", "prominence", "spacing", "motion"],
  intent: [
    "brand",
    "primary",
    "secondary",
    "tertiary",
    "surface",
    "action",
    "navigation",
    "error",
    "success",
    "warning",
    "info",
    "outline",
    "overlay",
  ],
  role: ["fill", "on-fill", "border", "text", "icon"],
  variant: ["highlight", "subtle", "muted", "base", "accent", "shade", "strong", "vibrant"],
  stateFamily: ["ghost", "nudge"],
  state: ["default", "hover", "pressed", "disabled", "selected", "focus"],
  tier: ["AA", "AAA"],
  breakpoint: ["mobile", "tablet", "desktop", "wide"],
};

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
  {
    id: "tok-state-family-ghost",
    name: "color.action.fill.accent.ghost.hover",
    value: "oklch(+0.50L C->0)",
    description: "Ghost family hover transform.",
    layer: "stateFamily",
    taxonomy: { stateFamily: "ghost", state: "hover", intent: "action", role: "fill", variant: "accent" },
    links: ["tok-component-button-primary-hover"],
  },
  {
    id: "tok-component-button-primary-hover",
    name: "cdr.button.primary.bg.hover",
    value: "{color.action.fill.accent.ghost.hover}",
    description: "Primary button hover color.",
    layer: "component",
    taxonomy: { intent: "action", role: "fill", variant: "accent", state: "hover" },
    links: [],
  },
];

function cloneTaxonomy(taxonomy: TaxonomyMap): TaxonomyMap {
  return {
    foundation: [...taxonomy.foundation],
    intent: [...taxonomy.intent],
    role: [...taxonomy.role],
    variant: [...taxonomy.variant],
    stateFamily: [...taxonomy.stateFamily],
    state: [...taxonomy.state],
    tier: [...taxonomy.tier],
    breakpoint: [...taxonomy.breakpoint],
  };
}

function createDefaultState(): StudioState {
  const tokens = structuredClone(SEED_TOKENS);
  return {
    tab: "author",
    search: "",
    layerFilter: "all",
    selectedTokenId: tokens[0]?.id ?? null,
    taxonomyFocus: "variant",
    deriveFamily: "ghost",
    deriveState: "hover",
    deriveDarkMode: false,
    tokens,
    taxonomy: cloneTaxonomy(DEFAULT_TAXONOMY),
    exportPreview: "",
    lastMessage: "Ready",
    importPreview: null,
    categoryFilter: "all",
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function layerLabel(layer: Layer): string {
  if (layer === "foundation") return "Foundations";
  if (layer === "semantic") return "Semantic ancestors";
  if (layer === "stateFamily") return "State families";
  return "Components";
}

function guessLayer(name: string): Layer {
  const lower = name.toLowerCase();
  if (lower.startsWith("cdr.") || lower.includes("component")) return "component";
  if (lower.includes(".ghost.") || lower.includes(".nudge.") || lower.includes(".selected") || lower.includes(".hover")) {
    return "stateFamily";
  }
  if (lower.startsWith("color.") || lower.startsWith("type.") || lower.startsWith("space.") || lower.startsWith("radius.")) {
    return "semantic";
  }
  return "foundation";
}

function getField(record: Record<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    if (record[alias] !== undefined && record[alias].trim().length > 0) {
      return record[alias].trim();
    }
  }
  return "";
}

function toTokenFromRecord(record: Record<string, string>): TokenRecord | null {
  const name = getField(record, [
    "name",
    "token",
    "token name",
    "token_name",
    "tokenname",
    "variable",
    "field name",
  ]);
  if (name.length === 0) return null;

  const value = getField(record, ["value", "$value", "token value", "token_value", "hex", "oklch"]);
  const description = getField(record, [
    "description",
    "$description",
    "notes",
    "note",
    "intent",
    "usage",
  ]);
  const layerRaw = getField(record, ["layer", "tier", "token layer"]);

  const layer =
    layerRaw === "foundation" ||
    layerRaw === "semantic" ||
    layerRaw === "stateFamily" ||
    layerRaw === "component"
      ? (layerRaw as Layer)
      : guessLayer(name);

  return {
    id: createId("tok"),
    name,
    value,
    description,
    layer,
    taxonomy: {},
    links: [],
  };
}

function parseOklch(value: string): { l: number; c: number; h: number } | null {
  const match = value
    .trim()
    .match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+)?\s*\)$/i);
  if (!match) return null;

  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: Number(match[3]),
  };
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

function formatOklch(value: { l: number; c: number; h: number }): string {
  const l = Math.round(value.l * 100) / 100;
  const c = Math.round(value.c * 1000) / 1000;
  const h = Math.round(value.h * 100) / 100;
  return `oklch(${l}% ${c} ${h})`;
}

function deriveStateValue(
  base: { l: number; c: number; h: number },
  family: "ghost" | "nudge",
  state: "hover" | "pressed" | "disabled" | "selected" | "focus",
  darkMode: boolean,
): { l: number; c: number; h: number } {
  const signedL = (delta: number) => (darkMode ? -delta : delta);

  if (state === "focus") {
    return { ...base };
  }

  if (state === "hover") {
    if (family === "ghost") {
      return {
        l: clamp(base.l + signedL(50), 0, 100),
        c: 0,
        h: base.h,
      };
    }
    return {
      l: clamp(base.l + signedL(-4), 0, 100),
      c: base.c,
      h: base.h,
    };
  }

  if (state === "pressed") {
    return {
      l: clamp(base.l + signedL(-5), 0, 100),
      c: clamp(base.c + 0.01, 0, 0.4),
      h: base.h,
    };
  }

  if (state === "disabled") {
    return {
      l: clamp(base.l + signedL(45), 0, 100),
      c: clamp(base.c - 0.09, 0, 0.4),
      h: base.h,
    };
  }

  return {
    l: clamp(base.l + signedL(-10), 0, 100),
    c: clamp(base.c + 0.02, 0, 0.4),
    h: base.h,
  };
}

function parseCsvRecords(raw: string): Array<Record<string, string>> {
  const rows = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\r/g, ""))
    .filter((line) => line.trim().length > 0);

  if (rows.length < 2) return [];

  const delimiter = rows[0].includes("\t") ? "\t" : ",";

  const parseDelimitedLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          index += 1;
          continue;
        }
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && char === delimiter) {
        values.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    values.push(current.trim());
    return values;
  };

  const headers = parseDelimitedLine(rows[0]).map((part) => part.trim().toLowerCase());

  return rows.slice(1).map((row) => {
    const cols = parseDelimitedLine(row);
    const record: Record<string, string> = {};
    headers.forEach((key, index) => {
      record[key] = cols[index] ?? "";
    });
    return record;
  });
}

function mergeImportedTokens(
  existingTokens: TokenRecord[],
  importedTokens: TokenRecord[],
): { tokens: TokenRecord[]; addedCount: number; updatedCount: number } {
  const tokensByName = new Map(existingTokens.map((token) => [token.name, token]));
  let addedCount = 0;
  let updatedCount = 0;

  importedTokens.forEach((importedToken) => {
    const existingToken = tokensByName.get(importedToken.name);
    if (!existingToken) {
      tokensByName.set(importedToken.name, importedToken);
      addedCount += 1;
      return;
    }

    tokensByName.set(importedToken.name, {
      ...existingToken,
      value: importedToken.value || existingToken.value,
      description: importedToken.description || existingToken.description,
      layer: importedToken.layer,
      taxonomy:
        Object.keys(importedToken.taxonomy).length > 0 ? importedToken.taxonomy : existingToken.taxonomy,
      links: existingToken.links,
    });
    updatedCount += 1;
  });

  return {
    tokens: Array.from(tokensByName.values()),
    addedCount,
    updatedCount,
  };
}

function flattenDtcg(
  node: unknown,
  path: string[] = [],
  result: Array<{ name: string; value: string; description: string }> = [],
): Array<{ name: string; value: string; description: string }> {
  if (!node || typeof node !== "object") return result;

  const maybeToken = node as { $value?: unknown; $description?: unknown };
  if (Object.prototype.hasOwnProperty.call(maybeToken, "$value")) {
    result.push({
      name: path.join("."),
      value: String(maybeToken.$value ?? ""),
      description: String(maybeToken.$description ?? ""),
    });
    return result;
  }

  Object.entries(node as Record<string, unknown>).forEach(([key, value]) => {
    flattenDtcg(value, [...path, key], result);
  });

  return result;
}

function buildDtcg(tokens: TokenRecord[]): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  tokens
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((token) => {
      const parts = token.name.split(".").filter(Boolean);
      if (parts.length === 0) return;

      let cursor: Record<string, unknown> = root;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          cursor[part] = {
            $value: token.value,
            $description: token.description,
            $extensions: {
              cedar: {
                layer: token.layer,
                taxonomy: token.taxonomy,
                links: token.links,
              },
            },
          };
          return;
        }

        if (!cursor[part] || typeof cursor[part] !== "object") {
          cursor[part] = {};
        }
        cursor = cursor[part] as Record<string, unknown>;
      });
    });

  return root;
}

function buildStory(): HTMLElement {
  const root = document.createElement("section");
  const state = createDefaultState();

  const setMessage = (message: string) => {
    state.lastMessage = message;
    render();
  };

  const getSelectedToken = (): TokenRecord | null => {
    const found = state.tokens.find((token) => token.id === state.selectedTokenId);
    return found ?? null;
  };

  const ensureSelection = () => {
    if (!state.selectedTokenId || !state.tokens.some((token) => token.id === state.selectedTokenId)) {
      state.selectedTokenId = state.tokens[0]?.id ?? null;
    }
  };

  const saveLocalDraft = () => {
    const payload = {
      tokens: state.tokens,
      taxonomy: state.taxonomy,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setMessage("Draft saved to local storage");
  };

  const loadLocalDraft = () => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setMessage("No saved draft found in local storage");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { tokens?: TokenRecord[]; taxonomy?: TaxonomyMap };
      if (Array.isArray(parsed.tokens) && parsed.tokens.length > 0) {
        state.tokens = parsed.tokens.map((token) => ({
          ...token,
          taxonomy: token.taxonomy ?? {},
          links: Array.isArray(token.links) ? token.links : [],
        }));
      }
      if (parsed.taxonomy) {
        state.taxonomy = cloneTaxonomy(parsed.taxonomy);
      }
      ensureSelection();
      setMessage("Draft loaded from local storage");
    } catch {
      setMessage("Saved draft could not be parsed");
    }
  };

  const downloadDraftBundle = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            schema: "cedar-token-authoring-studio-vnext-draft",
            exportedAt: new Date().toISOString(),
            tokens: state.tokens,
            taxonomy: state.taxonomy,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cedar-token-authoring-draft.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Draft bundle downloaded");
  };

  const downloadDtcg = () => {
    const dtcg = buildDtcg(state.tokens);
    const serialized = JSON.stringify(dtcg, null, 2);
    const blob = new Blob([serialized], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cedar-tokens.dtcg.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("DTCG export downloaded");
  };

    // ─── Project pull / push ────────────────────────────────────────────────────

    const buildMetadataJson = (): Record<string, unknown> => {
      const meta: Record<string, unknown> = {};
      state.tokens.forEach((token) => {
        const entry: Record<string, unknown> = {};
        if (token.description) entry["usage"] = token.description;
        const taxEntries = Object.entries(token.taxonomy).filter(([, v]) => v);
        if (taxEntries.length > 0) entry["taxonomy"] = Object.fromEntries(taxEntries);
        if (token.links.length > 0) {
          entry["linkedTokens"] = token.links
            .map((id) => state.tokens.find((t) => t.id === id)?.name)
            .filter(Boolean);
        }
        entry["layer"] = token.layer;
        entry["lastChanged"] = new Date().toISOString();
        entry["authority"] = "Cedar Token Studio vNext";
        meta[token.name] = entry;
      });
      return meta;
    };

    const pullFromProject = async () => {
      state.lastMessage = "Pulling from project…";
      render();
      try {
        const [canonicalRes, metaRes] = await Promise.all([
          fetch("/canonical/tokens.json"),
          fetch("/metadata/tokens.json").catch(() => null),
        ]);
        if (!canonicalRes.ok) throw new Error(`canonical/tokens.json: ${canonicalRes.status}`);
        const canonical = (await canonicalRes.json()) as unknown;
        let metaMap: Record<string, Record<string, unknown>> = {};
        if (metaRes?.ok) {
          metaMap = (await metaRes.json()) as Record<string, Record<string, unknown>>;
        }
        const flattened = flattenDtcg(canonical);
        const pulled: TokenRecord[] = flattened.map((entry) => {
          const meta = metaMap[entry.name] ?? {};
          const layer = (meta["layer"] as string) ?? guessLayer(entry.name);
          const taxonomy: Partial<Record<TaxonomyKey, string>> = {};
          const metaTax = meta["taxonomy"] as Record<string, string> | undefined;
          if (metaTax) {
            (Object.keys(metaTax) as TaxonomyKey[]).forEach((k) => {
              if (state.taxonomy[k]) taxonomy[k] = metaTax[k];
            });
          }
          return {
            id: createId("tok"),
            name: entry.name,
            value: entry.value,
            description: (meta["usage"] as string) ?? entry.description ?? "",
            layer: layer as Layer,
            taxonomy,
            links: [],
          };
        });
        if (pulled.length === 0) {
          setMessage("No tokens found in canonical/tokens.json");
          return;
        }
        state.tokens = pulled;
        state.selectedTokenId = pulled[0]?.id ?? null;
        state.categoryFilter = "all";
        state.search = "";
        setMessage(
          `Pulled ${pulled.length} tokens from canonical/tokens.json (${Object.keys(metaMap).length} metadata entries merged)`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessage(`Pull failed: ${msg}`);
      }
    };

    const pushToCanonical = () => {
      const dtcgJson = JSON.stringify(buildDtcg(state.tokens), null, 2);
      const metaJson = JSON.stringify(buildMetadataJson(), null, 2);
      const dl = (content: string, filename: string) => {
        const blob = new Blob([content], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      };
      dl(dtcgJson, "tokens.json");
      setTimeout(() => dl(metaJson, "tokens.metadata.json"), 200);
      setMessage(
        `Downloaded tokens.json + tokens.metadata.json — replace canonical/tokens.json and metadata/tokens.json in the project root, then run pnpm build.`,
      );
    };

  const parseImportText = (raw: string, sourceName: string): TokenRecord[] => {
    let imported: TokenRecord[] = [];

    if (sourceName.toLowerCase().endsWith(".csv") || sourceName.toLowerCase().endsWith(".tsv")) {
      const records = parseCsvRecords(raw);
      imported = records
        .map((record) => toTokenFromRecord(record))
        .filter((record): record is TokenRecord => Boolean(record));
    } else {
      const parsed = JSON.parse(raw) as unknown;

      if (Array.isArray(parsed)) {
        imported = parsed
          .filter((item) => {
            if (!item || typeof item !== "object") return false;
            return true;
          })
          .map((item) => {
            const record = item as Record<string, unknown>;
            const normalized: Record<string, string> = {};
            Object.entries(record).forEach(([key, value]) => {
              normalized[String(key).toLowerCase()] = String(value ?? "");
            });
            return toTokenFromRecord(normalized);
          })
          .filter((record): record is TokenRecord => Boolean(record));
      } else {
        imported = flattenDtcg(parsed).map((entry) => ({
          id: createId("tok"),
          name: entry.name,
          value: entry.value,
          description: entry.description,
          layer: guessLayer(entry.name),
          taxonomy: {},
          links: [],
        }));
      }
    }

    return imported;
  };

  const commitImportPreview = () => {
    if (!state.importPreview) return;
    const { tokens: imported, sourceName } = state.importPreview;
    if (imported.length === 0) {
      state.importPreview = null;
      setMessage("Nothing to import — all tokens were removed from the preview");
      return;
    }
    const merged = mergeImportedTokens(state.tokens, imported);
    state.tokens = merged.tokens;
    state.importPreview = null;
    ensureSelection();
    setMessage(
      `Imported ${imported.length} tokens from ${sourceName} (${merged.addedCount} added, ${merged.updatedCount} updated)`,
    );
  };

  const renderImportPreview = (): string => {
    const preview = state.importPreview;
    if (!preview) return "";
    const rows = preview.tokens
      .map(
        (t) => `
          <tr>
            <td class="preview-name">${escapeHtml(t.name)}</td>
            <td>${escapeHtml(layerLabel(t.layer))}</td>
            <td class="preview-value">${escapeHtml(t.value)}</td>
            <td>${escapeHtml(t.description)}</td>
            <td><button class="btn danger small" data-action="preview-delete" data-id="${escapeHtml(t.id)}" type="button">Remove</button></td>
          </tr>`,
      )
      .join("");
    return `
      <div class="import-overlay">
        <div class="import-preview-panel">
          <div class="preview-header">
            <strong>Import preview</strong>
            <span class="preview-source">${escapeHtml(preview.sourceName)}</span>
            <span class="preview-count">${preview.tokens.length} token${preview.tokens.length !== 1 ? "s" : ""}</span>
          </div>
          <div class="preview-table-wrap">
            <table class="preview-table">
              <thead><tr><th>Name</th><th>Layer</th><th>Value</th><th>Description</th><th></th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="preview-actions">
            <button class="btn strong" data-action="confirm-import" type="button">Import ${preview.tokens.length} token${preview.tokens.length !== 1 ? "s" : ""}</button>
            <button class="btn" data-action="cancel-import" type="button">Cancel</button>
          </div>
        </div>
      </div>`;
  };

  const renderTaxonomySelect = (token: TokenRecord, key: TaxonomyKey): string => {
    const selected = token.taxonomy[key] ?? "";
    const options = state.taxonomy[key]
      .map(
        (option) =>
          `<option value="${escapeHtml(option)}"${selected === option ? " selected" : ""}>${escapeHtml(option)}</option>`,
      )
      .join("");

    return `
      <label class="field">
        <span>${escapeHtml(key)}</span>
        <select data-action="token-taxonomy" data-key="${escapeHtml(key)}">
          <option value="">None</option>
          ${options}
        </select>
      </label>
    `;
  };

  // ─── helpers ────────────────────────────────────────────────────────────
  const CATEGORIES: { id: string; label: string; layer: Layer | "all"; group: string; dot: string }[] = [
    { id: "all",             label: "All tokens",   layer: "all",        group: "Overview",                dot: "dot-n" },
    { id: "foundation",      label: "All foundation",layer: "foundation", group: "Tier 1 · Foundations",    dot: "dot-1" },
    { id: "semantic",        label: "All semantic",  layer: "semantic",   group: "Tier 2 · Semantic",       dot: "dot-2" },
    { id: "stateFamily",     label: "State families",layer: "stateFamily",group: "Tier 3 · State Families", dot: "dot-3" },
    { id: "component",       label: "Component",     layer: "component",  group: "Tier 4 · Component",      dot: "dot-4" },
  ];

  function isColorValue(v: string): boolean {
    return /^#[0-9a-f]{3,8}$/i.test(v.trim()) || /^oklch/i.test(v.trim()) || /^rgb/i.test(v.trim()) || /^hsl/i.test(v.trim());
  }

  function resolveColor(value: string, tokens: TokenRecord[]): string {
    // Follow one level of alias: {some.token.name}
    const alias = value.trim().match(/^\{(.+)\}$/);
    if (alias) {
      const target = tokens.find((t) => t.name === alias[1]);
      if (target && isColorValue(target.value)) return target.value;
      return "";
    }
    return isColorValue(value) ? value : "";
  }

  const renderCategorySidebar = (): string => {
    const groups: Record<string, typeof CATEGORIES> = {};
    CATEGORIES.forEach((cat) => {
      if (!groups[cat.group]) groups[cat.group] = [];
      groups[cat.group].push(cat);
    });
    const sections = Object.entries(groups)
      .map(([groupLabel, cats]) => {
        const items = cats
          .map((cat) => {
            const count = cat.layer === "all"
              ? state.tokens.length
              : state.tokens.filter((t) => t.layer === cat.layer).length;
            const isActive = state.categoryFilter === cat.id;
            return `<button class="cat-item${isActive ? " active" : ""}" data-action="cat-filter" data-cat="${escapeHtml(cat.id)}" type="button">
              <span class="cat-dot ${escapeHtml(cat.dot)}"></span>
              <span class="cat-label">${escapeHtml(cat.label)}</span>
              <span class="cat-count">${count}</span>
            </button>`;
          })
          .join("");
        return `<div class="cat-group">
          <div class="cat-group-label">${escapeHtml(groupLabel)}</div>
          ${items}
        </div>`;
      })
      .join("");
    return `<nav class="cat-sidebar">${sections}</nav>`;
  };

  const renderAuthorTab = (): string => {
    // Determine active layer from categoryFilter
    const activeCat = CATEGORIES.find((c) => c.id === state.categoryFilter) ?? CATEGORIES[0];
    const filtered = state.tokens.filter((token) => {
      const matchesLayer = activeCat.layer === "all" || token.layer === activeCat.layer;
      const lowerSearch = state.search.trim().toLowerCase();
      const matchesSearch =
        lowerSearch.length === 0 ||
        token.name.toLowerCase().includes(lowerSearch) ||
        token.description.toLowerCase().includes(lowerSearch) ||
        token.value.toLowerCase().includes(lowerSearch);
      return matchesLayer && matchesSearch;
    });

    const selected = getSelectedToken();

    const tokenList = filtered
      .map((token) => {
        const isSelected = token.id === state.selectedTokenId;
        const colorVal = resolveColor(token.value, state.tokens);
        const swatch = colorVal
          ? `<span class="tcard-swatch" style="background:${escapeHtml(colorVal)}"></span>`
          : `<span class="tcard-swatch tcard-swatch--empty"></span>`;
        const layerDot = { foundation: "dot-1", semantic: "dot-2", stateFamily: "dot-3", component: "dot-4" }[token.layer] ?? "dot-n";
        return `
          <button class="tcard${isSelected ? " tcard--sel" : ""}" data-action="select-token" data-id="${escapeHtml(token.id)}" type="button">
            <div class="tcard-row">
              ${swatch}
              <div class="tcard-body">
                <div class="tcard-name">${escapeHtml(token.name)}</div>
                <div class="tcard-value">${escapeHtml(token.value)}</div>
                ${token.description ? `<div class="tcard-desc">${escapeHtml(token.description)}</div>` : ""}
              </div>
            </div>
            <div class="tcard-pills">
              <span class="cat-pill ${escapeHtml(layerDot)}">${escapeHtml(layerLabel(token.layer))}</span>
              ${Object.entries(token.taxonomy)
                .filter(([, v]) => v)
                .slice(0, 3)
                .map(([k, v]) => `<span class="tax-pill">${escapeHtml(k)}: ${escapeHtml(v)}</span>`)
                .join("")}
            </div>
          </button>
        `;
      })
      .join("");

    const listTitle = activeCat.layer === "all" ? `All tokens` : layerLabel(activeCat.layer as Layer);

    if (!selected) {
      return `
        <div class="author-grid">
          ${renderCategorySidebar()}
          <section class="panel list-panel">
            <div class="list-heading">
              <strong>${escapeHtml(listTitle)}</strong>
              <span class="count-pill">${filtered.length}</span>
            </div>
            <div class="toolbar-row">
              <button class="btn strong" data-action="add-token" type="button">+ Add token</button>
              <button class="btn" data-action="open-import" type="button">Import</button>
              <button class="btn" data-action="save-local" type="button">Save</button>
              <button class="btn" data-action="load-local" type="button">Load</button>
            </div>
            <input class="text-input" placeholder="Search tokens…" data-action="search" value="${escapeHtml(state.search)}" style="margin-bottom:8px" />
            <div class="token-list">${tokenList || '<div class="empty-state">No tokens in this category.</div>'}</div>
          </section>
          <section class="panel editor-panel">
            <div class="empty-state">Select or create a token to edit details.</div>
          </section>
        </div>
      `;
    }

    const semanticTargets = state.tokens.filter((token) => token.layer === "semantic");
    const linkTargets = state.tokens.filter((token) => token.id !== selected.id);

    const linkOptions = (selected.layer === "foundation" ? semanticTargets : linkTargets)
      .map((token) => {
        const selectedFlag = selected.links.includes(token.id) ? " selected" : "";
        return `<option value="${escapeHtml(token.id)}"${selectedFlag}>${escapeHtml(token.name)}</option>`;
      })
      .join("");

    return `
      <div class="author-grid">
        ${renderCategorySidebar()}
        <section class="panel list-panel">
          <div class="list-heading">
            <strong>${escapeHtml(listTitle)}</strong>
            <span class="count-pill">${filtered.length}</span>
          </div>
          <div class="toolbar-row">
            <button class="btn strong" data-action="add-token" type="button">+ Add token</button>
            <button class="btn" data-action="duplicate-token" type="button">Duplicate</button>
            <button class="btn danger" data-action="delete-token" type="button">Delete</button>
          </div>
          <div class="toolbar-row">
            <button class="btn" data-action="open-import" type="button">Import</button>
            <button class="btn" data-action="save-local" type="button">Save</button>
            <button class="btn" data-action="load-local" type="button">Load</button>
            <button class="btn" data-action="download-draft" type="button">Share</button>
          </div>
          <input class="text-input" placeholder="Search tokens…" data-action="search" value="${escapeHtml(state.search)}" style="margin-bottom:8px" />
          <div class="token-list">${tokenList}</div>
        </section>
        <section class="panel editor-panel">
          <h3>Token authoring</h3>
          <div class="field-grid two">
            <label class="field"><span>Name</span><input class="text-input" data-action="token-name" value="${escapeHtml(selected.name)}" /></label>
            <label class="field"><span>Layer</span>
              <select data-action="token-layer">
                <option value="foundation"${selected.layer === "foundation" ? " selected" : ""}>Foundations</option>
                <option value="semantic"${selected.layer === "semantic" ? " selected" : ""}>Semantic ancestors</option>
                <option value="stateFamily"${selected.layer === "stateFamily" ? " selected" : ""}>State families</option>
                <option value="component"${selected.layer === "component" ? " selected" : ""}>Components</option>
              </select>
            </label>
          </div>
          <label class="field"><span>Value</span><textarea class="text-input" rows="2" data-action="token-value">${escapeHtml(selected.value)}</textarea></label>
          <label class="field"><span>Description</span><textarea class="text-input" rows="2" data-action="token-description">${escapeHtml(selected.description)}</textarea></label>

          <h4>Taxonomy fields</h4>
          <div class="field-grid three">
            ${renderTaxonomySelect(selected, "foundation")}
            ${renderTaxonomySelect(selected, "intent")}
            ${renderTaxonomySelect(selected, "role")}
            ${renderTaxonomySelect(selected, "variant")}
            ${renderTaxonomySelect(selected, "stateFamily")}
            ${renderTaxonomySelect(selected, "state")}
            ${renderTaxonomySelect(selected, "tier")}
            ${renderTaxonomySelect(selected, "breakpoint")}
          </div>

          <h4>Token connections</h4>
          <label class="field">
            <span>${selected.layer === "foundation" ? "Assign semantic ancestors" : "Assign linked tokens"}</span>
            <select multiple size="8" data-action="token-links">${linkOptions}</select>
          </label>
          <p class="hint">Foundations can map to one or many semantic ancestors. Other layers can link to downstream tokens for traceability.</p>

          <h4>State family generator (OKLCH)</h4>
          <div class="field-grid two">
            <label class="field">
              <span>State family</span>
              <select data-action="derive-family">
                <option value="ghost"${state.deriveFamily === "ghost" ? " selected" : ""}>ghost</option>
                <option value="nudge"${state.deriveFamily === "nudge" ? " selected" : ""}>nudge</option>
              </select>
            </label>
            <label class="field">
              <span>State</span>
              <select data-action="derive-state">
                <option value="hover"${state.deriveState === "hover" ? " selected" : ""}>hover</option>
                <option value="pressed"${state.deriveState === "pressed" ? " selected" : ""}>pressed</option>
                <option value="disabled"${state.deriveState === "disabled" ? " selected" : ""}>disabled</option>
                <option value="selected"${state.deriveState === "selected" ? " selected" : ""}>selected</option>
                <option value="focus"${state.deriveState === "focus" ? " selected" : ""}>focus</option>
              </select>
            </label>
          </div>
          <label class="field" style="display:flex;gap:8px;align-items:center;grid-template-columns:none;">
            <input type="checkbox" data-action="derive-dark"${state.deriveDarkMode ? " checked" : ""}>
            <span>Dark mode delta inversion</span>
          </label>
          <div class="toolbar-row">
            <button class="btn strong" data-action="derive-create" type="button">Create derived state token</button>
          </div>
          <p class="hint">Uses your spike rules: ghost hover +50L and C->0, nudge hover -4L, shared pressed/disabled/selected deltas, and focus with no color shift.</p>
        </section>
      </div>
    `;
  };

  const renderTaxonomyTab = (): string => {
    const key = state.taxonomyFocus;
    const options = state.taxonomy[key]
      .map(
        (option, index) => `
          <div class="taxonomy-row">
            <input class="text-input" data-action="taxonomy-edit" data-index="${index}" value="${escapeHtml(option)}" />
            <button class="btn danger" data-action="taxonomy-remove" data-index="${index}" type="button">Remove</button>
          </div>
        `,
      )
      .join("");

    return `
      <section class="panel taxonomy-panel">
        <h3>Taxonomy option authoring</h3>
        <p class="hint">Add, edit, or remove options in every taxonomy layer. Authoring forms use these options to keep naming consistent.</p>
        <div class="field-grid two">
          <label class="field">
            <span>Taxonomy layer</span>
            <select data-action="taxonomy-focus">
              <option value="foundation"${key === "foundation" ? " selected" : ""}>foundation</option>
              <option value="intent"${key === "intent" ? " selected" : ""}>intent</option>
              <option value="role"${key === "role" ? " selected" : ""}>role</option>
              <option value="variant"${key === "variant" ? " selected" : ""}>variant</option>
              <option value="stateFamily"${key === "stateFamily" ? " selected" : ""}>stateFamily</option>
              <option value="state"${key === "state" ? " selected" : ""}>state</option>
              <option value="tier"${key === "tier" ? " selected" : ""}>tier</option>
              <option value="breakpoint"${key === "breakpoint" ? " selected" : ""}>breakpoint</option>
            </select>
          </label>
          <label class="field">
            <span>Add option</span>
            <div class="inline-row">
              <input class="text-input" data-action="taxonomy-new-value" placeholder="new option" />
              <button class="btn strong" data-action="taxonomy-add" type="button">Add</button>
            </div>
          </label>
        </div>
        <div class="taxonomy-list">${options || '<div class="empty-state">No options yet for this taxonomy layer.</div>'}</div>
      </section>
    `;
  };

  const renderConnectionsTab = (): string => {
    const foundationTokens = state.tokens.filter((token) => token.layer === "foundation");

    const rows = foundationTokens
      .map((token) => {
        const linkedSemantics = token.links
          .map((id) => state.tokens.find((candidate) => candidate.id === id))
          .filter((entry): entry is TokenRecord => Boolean(entry));

        return `
          <tr>
            <td>${escapeHtml(token.name)}</td>
            <td>${escapeHtml(token.value)}</td>
            <td>${linkedSemantics.length === 0 ? "-" : linkedSemantics.map((item) => escapeHtml(item.name)).join("<br>")}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <section class="panel">
        <h3>Foundation to semantic mapping</h3>
        <p class="hint">Each foundation token can connect to one or many semantic ancestors when creating or editing token mappings.</p>
        <table class="mapping-table">
          <thead>
            <tr><th>Foundation token</th><th>Value</th><th>Mapped semantic ancestors</th></tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="3">No foundation tokens available.</td></tr>'}</tbody>
        </table>
      </section>
    `;
  };

  const renderExportTab = (): string => {
    const dtcg = buildDtcg(state.tokens);
    state.exportPreview = JSON.stringify(dtcg, null, 2);

    return `
      <section class="panel">
        <h3>DTCG export</h3>
        <p class="hint">Token export always uses DTCG JSON. Taxonomy and links are preserved in $extensions.cedar.</p>
        <div class="toolbar-row">
          <button class="btn strong" data-action="download-dtcg" type="button">Download DTCG JSON</button>
        </div>
        <pre class="export-preview">${escapeHtml(state.exportPreview)}</pre>
      </section>
    `;
  };

  const render = () => {
    ensureSelection();

    root.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@500;700;800&display=swap');

        * { box-sizing: border-box; }
        .studio {
          background: radial-gradient(circle at 0% 0%, #dceee5 0%, #f5f2eb 45%, #f0ece4 100%);
          color: #2e2e2b;
          min-height: 92vh;
          padding: 24px;
          font-family: 'DM Mono', monospace;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #1f513f;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
        }
        h1 {
          margin: 0;
          font-family: 'Syne', sans-serif;
          font-size: 1.35rem;
          letter-spacing: -0.02em;
        }
        .subtitle {
          margin-left: auto;
          color: #736e65;
          font-size: 0.72rem;
        }
        .tabs {
          display: flex;
          border-bottom: 1px solid rgba(46, 46, 43, 0.2);
          margin-bottom: 14px;
          gap: 2px;
          flex-wrap: wrap;
        }
        .tab {
          border: 0;
          background: transparent;
          padding: 8px 12px;
          font-family: 'Syne', sans-serif;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #736e65;
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .tab.active {
          color: #2e2e2b;
          border-bottom-color: #1f513f;
          font-weight: 700;
        }
        .panel {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(149, 142, 131, 0.35);
          border-radius: 12px;
          padding: 14px;
        }
        .author-grid {
          display: grid;
          grid-template-columns: 180px minmax(260px, 1fr) minmax(320px, 460px);
          gap: 12px;
          align-items: start;
        }
        .list-panel { min-height: 70vh; }
        .editor-panel { min-height: 70vh; }
        .toolbar-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .btn {
          border: 1px solid rgba(149, 142, 131, 0.5);
          background: #fff;
          border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          padding: 7px 10px;
          cursor: pointer;
        }
        .btn.strong { background: #1f513f; color: #fff; border-color: #1f513f; }
        .btn.danger { background: #fcefe4; border-color: #bb4045; color: #811823; }
        .filters {
          display: grid;
          gap: 8px;
          margin-bottom: 8px;
        }
        .text-input, select, textarea {
          width: 100%;
          border: 1px solid rgba(149, 142, 131, 0.48);
          border-radius: 8px;
          padding: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 0.74rem;
          background: #fff;
          color: #2e2e2b;
        }
        .token-list {
          max-height: 60vh;
          overflow: auto;
          display: grid;
          gap: 5px;
        }
        /* ── Category sidebar ── */
        .cat-sidebar {
          background: #fff;
          border: 1px solid rgba(149,142,131,0.35);
          border-radius: 12px;
          overflow: hidden;
          min-height: 70vh;
        }
        .cat-group {
          padding-bottom: 4px;
        }
        .cat-group + .cat-group {
          border-top: 1px solid rgba(149,142,131,0.2);
          padding-top: 4px;
        }
        .cat-group-label {
          padding: 6px 10px 3px;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #958e83;
        }
        .cat-item {
          display: flex;
          align-items: center;
          gap: 7px;
          width: 100%;
          text-align: left;
          padding: 5px 10px 5px 12px;
          font-family: inherit;
          font-size: 0.72rem;
          cursor: pointer;
          background: none;
          border: none;
          border-left: 3px solid transparent;
          color: #4b4a48;
          line-height: 1.3;
        }
        .cat-item:hover { background: #f7f5f3; }
        .cat-item.active {
          border-left-color: #1f513f;
          background: #ecf9e6;
          color: #1f513f;
          font-weight: 600;
        }
        .cat-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-n { background: #b2ab9f; }
        .dot-1 { background: #1f513f; }
        .dot-2 { background: #406eb5; }
        .dot-3 { background: #b68b37; }
        .dot-4 { background: #736e65; }
        .cat-label { flex: 1; }
        .cat-count {
          font-size: 0.6rem;
          color: #958e83;
          background: rgba(149,142,131,0.12);
          border-radius: 8px;
          padding: 1px 5px;
        }
        .list-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem;
        }
        .count-pill {
          font-size: 0.65rem;
          background: rgba(149,142,131,0.15);
          border-radius: 8px;
          padding: 2px 7px;
          color: #736e65;
        }
        /* ── Token cards ── */
        .tcard {
          text-align: left;
          border: 1px solid rgba(149,142,131,0.4);
          border-radius: 10px;
          background: #fff;
          padding: 9px 10px;
          cursor: pointer;
          font-family: inherit;
          width: 100%;
          transition: border-color 0.1s, box-shadow 0.1s;
        }
        .tcard:hover { border-color: #958e83; box-shadow: 0 1px 4px rgba(46,46,43,0.08); }
        .tcard--sel {
          border-color: #1f513f;
          box-shadow: 0 0 0 2px rgba(31,81,63,0.15);
        }
        .tcard-row { display: flex; align-items: flex-start; gap: 9px; }
        .tcard-swatch {
          width: 22px; height: 22px;
          border-radius: 4px;
          border: 1px solid rgba(0,0,0,0.1);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .tcard-swatch--empty { background: #edeae3; }
        .tcard-body { flex: 1; min-width: 0; }
        .tcard-name {
          font-size: 0.72rem;
          font-weight: 600;
          color: #1f513f;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tcard-value {
          font-size: 0.67rem;
          color: #736e65;
          font-family: 'DM Mono', monospace;
          margin-top: 1px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tcard-desc {
          font-size: 0.67rem;
          color: #958e83;
          margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tcard-pills { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 5px; }
        .cat-pill {
          font-size: 0.58rem;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 9px;
          border: 1px solid;
        }
        .cat-pill.dot-1 { background: #ecf9e6; color: #1f513f; border-color: #c7dfd1; }
        .cat-pill.dot-2 { background: #e2f4fe; color: #406eb5; border-color: #b7d4f5; }
        .cat-pill.dot-3 { background: #fdf6e2; color: #b68b37; border-color: #f5e9b7; }
        .cat-pill.dot-4 { background: #f4f2ed; color: #736e65; border-color: #d5cfc3; }
        .tax-pill {
          font-size: 0.58rem;
          padding: 1px 6px;
          border-radius: 9px;
          background: #f4f2ed;
          border: 1px solid #d5cfc3;
          color: #736e65;
        }
        h3 {
          margin: 0 0 10px;
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
        }
        h4 {
          margin: 12px 0 8px;
          font-family: 'Syne', sans-serif;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #4b4a48;
        }
        .field {
          display: grid;
          gap: 4px;
          font-size: 0.68rem;
          color: #4b4a48;
        }
        .field-grid {
          display: grid;
          gap: 8px;
        }
        .field-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .field-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .hint {
          margin-top: 8px;
          font-size: 0.68rem;
          line-height: 1.5;
          color: #736e65;
        }
        .inline-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .taxonomy-panel { max-width: 920px; }
        .taxonomy-list {
          margin-top: 10px;
          display: grid;
          gap: 8px;
        }
        .taxonomy-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
        }
        .mapping-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.72rem;
        }
        .mapping-table th, .mapping-table td {
          text-align: left;
          border-bottom: 1px solid rgba(149, 142, 131, 0.36);
          padding: 9px 8px;
          vertical-align: top;
        }
        .mapping-table th {
          font-family: 'Syne', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.66rem;
          color: #736e65;
        }
        .export-preview {
          margin-top: 10px;
          background: #1f2523;
          color: #dff4e9;
          border-radius: 8px;
          padding: 12px;
          max-height: 62vh;
          overflow: auto;
          font-size: 0.68rem;
          line-height: 1.55;
        }
        .status {
          margin-top: 10px;
          color: #4b4a48;
          font-size: 0.68rem;
          border-top: 1px solid rgba(149, 142, 131, 0.28);
          padding-top: 8px;
        }
          .project-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            background: #113731;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 10px;
          }
          .project-bar-label {
            font-size: 0.66rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #c7dfd1;
          }
          .project-btn {
            background: #1f513f;
            color: #c7dfd1;
            border-color: #2a6b52;
            font-size: 0.68rem;
          }
          .project-btn:hover { background: #2a6b52; }
          .project-bar-hint {
            margin-left: auto;
            font-size: 0.62rem;
            color: #7aaa90;
            font-family: 'DM Mono', monospace;
          }
          .project-bar-hint code {
            background: rgba(255,255,255,0.08);
            border-radius: 3px;
            padding: 1px 4px;
            color: #a8d5b8;
          }
        .empty-state {
          border: 1px dashed rgba(149, 142, 131, 0.45);
          border-radius: 8px;
          padding: 16px;
          color: #736e65;
          text-align: center;
          font-size: 0.75rem;
        }
        .import-overlay {
          position: fixed;
          inset: 0;
          background: rgba(30, 28, 24, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .import-preview-panel {
          background: #f5f2eb;
          border: 1px solid rgba(149, 142, 131, 0.4);
          border-radius: 12px;
          padding: 20px;
          width: min(90vw, 860px);
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        }
        .preview-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .preview-source {
          color: #736e65;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          font-weight: 400;
        }
        .preview-count {
          margin-left: auto;
          color: #4b4a48;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          font-weight: 400;
        }
        .preview-table-wrap {
          overflow-y: auto;
          max-height: 50vh;
          border: 1px solid rgba(149, 142, 131, 0.3);
          border-radius: 6px;
        }
        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.72rem;
        }
        .preview-table th {
          background: rgba(149, 142, 131, 0.15);
          text-align: left;
          padding: 6px 8px;
          font-weight: 500;
          position: sticky;
          top: 0;
        }
        .preview-table td {
          padding: 5px 8px;
          border-top: 1px solid rgba(149, 142, 131, 0.18);
          vertical-align: top;
        }
        .preview-name { font-weight: 500; }
        .preview-value { color: #1f513f; font-family: 'DM Mono', monospace; }
        .preview-actions {
          display: flex;
          gap: 8px;
        }
        .btn.small {
          padding: 3px 8px;
          font-size: 0.68rem;
        }
        @media (max-width: 1080px) {
          .author-grid { grid-template-columns: 1fr; }
          .cat-sidebar { min-height: auto; }
          .field-grid.two, .field-grid.three { grid-template-columns: 1fr; }
          .subtitle { width: 100%; margin-left: 0; }
        }
      </style>

      <div class="studio">
        <header class="header">
          <div class="logo">C</div>
          <h1>Cedar token authoring studio vNext</h1>
          <div class="subtitle">Foundations -> Semantic ancestors -> State families -> Components</div>
        </header>

          <div class="project-bar">
            <span class="project-bar-label">Project data</span>
            <button class="btn project-btn" data-action="pull-project" type="button">⬇ Pull from project</button>
            <button class="btn project-btn" data-action="push-canonical" type="button">⬆ Push to canonical</button>
            <span class="project-bar-hint">Pull loads <code>canonical/tokens.json</code> + <code>metadata/tokens.json</code>. Push downloads updated files to replace in the repo.</span>
          </div>

          <nav class="tabs">
          <button class="tab${state.tab === "author" ? " active" : ""}" data-action="tab" data-tab="author" type="button">Author</button>
          <button class="tab${state.tab === "taxonomy" ? " active" : ""}" data-action="tab" data-tab="taxonomy" type="button">Taxonomy</button>
          <button class="tab${state.tab === "connections" ? " active" : ""}" data-action="tab" data-tab="connections" type="button">Connections</button>
          <button class="tab${state.tab === "export" ? " active" : ""}" data-action="tab" data-tab="export" type="button">Export DTCG</button>
        </nav>

        ${
          state.tab === "author"
            ? renderAuthorTab()
            : state.tab === "taxonomy"
              ? renderTaxonomyTab()
              : state.tab === "connections"
                ? renderConnectionsTab()
                : renderExportTab()
        }

        <input type="file" data-action="file-input" style="display:none" accept=".json,.csv,.tsv,application/json,text/csv,text/tab-separated-values" />
        <div class="status">Status: ${escapeHtml(state.lastMessage)} | Tokens: ${state.tokens.length}</div>
      </div>
      ${renderImportPreview()}
    `;

    const selected = getSelectedToken();

    root.querySelectorAll<HTMLButtonElement>("[data-action='tab']").forEach((button) => {
      button.addEventListener("click", () => {
        state.tab = (button.dataset.tab as ViewTab) ?? "author";
        render();
      });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='cat-filter']").forEach((button) => {
      button.addEventListener("click", () => {
        state.categoryFilter = button.dataset.cat ?? "all";
        state.search = "";
        render();
      });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='add-token']").forEach((button) => {
      button.addEventListener("click", () => {
        const token: TokenRecord = {
          id: createId("tok"),
          name: "color.action.fill.accent",
          value: "",
          description: "",
          layer: "semantic",
          taxonomy: {},
          links: [],
        };
        state.tokens = [token, ...state.tokens];
        state.selectedTokenId = token.id;
        state.tab = "author";
        setMessage("New token added");
      });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='duplicate-token']").forEach((button) => {
      button.addEventListener("click", () => {
        const token = getSelectedToken();
        if (!token) return;
        const copy: TokenRecord = {
          ...structuredClone(token),
          id: createId("tok"),
          name: `${token.name}.copy`,
        };
        state.tokens = [copy, ...state.tokens];
        state.selectedTokenId = copy.id;
        setMessage("Token duplicated");
      });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='delete-token']").forEach((button) => {
      button.addEventListener("click", () => {
        const token = getSelectedToken();
        if (!token) return;
        if (!window.confirm("Delete selected token?")) return;
        state.tokens = state.tokens
          .filter((entry) => entry.id !== token.id)
          .map((entry) => ({ ...entry, links: entry.links.filter((link) => link !== token.id) }));
        ensureSelection();
        setMessage("Token deleted");
      });
    });

    root.querySelectorAll<HTMLInputElement>("[data-action='search']").forEach((input) => {
      input.addEventListener("input", () => {
        state.search = input.value;
        render();
      });
    });

    root.querySelectorAll<HTMLSelectElement>("[data-action='layer-filter']").forEach((select) => {
      select.addEventListener("change", () => {
        state.layerFilter = (select.value as Layer | "all") ?? "all";
        render();
      });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='select-token']").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedTokenId = button.dataset.id ?? null;
        render();
      });
    });

    const fileInput = root.querySelector<HTMLInputElement>("[data-action='file-input']");
    root.querySelectorAll<HTMLButtonElement>("[data-action='open-import']").forEach((button) => {
      button.addEventListener("click", () => {
        fileInput?.click();
      });
    });

    fileInput?.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = parseImportText(text, file.name);
        if (parsed.length === 0) {
          setMessage("No valid tokens found in import file");
        } else {
          state.importPreview = { tokens: parsed, sourceName: file.name };
          render();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setMessage(`Import failed: ${message}`);
      }
      fileInput.value = "";
    });

    root.querySelector<HTMLButtonElement>("[data-action='confirm-import']")?.addEventListener("click", () => {
      commitImportPreview();
      render();
    });

    root.querySelector<HTMLButtonElement>("[data-action='cancel-import']")?.addEventListener("click", () => {
      state.importPreview = null;
      setMessage("Import cancelled");
      render();
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='preview-delete']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!state.importPreview) return;
        const id = btn.dataset.id;
        state.importPreview = {
          ...state.importPreview,
          tokens: state.importPreview.tokens.filter((t) => t.id !== id),
        };
        render();
      });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='save-local']").forEach((button) => {
      button.addEventListener("click", saveLocalDraft);
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='load-local']").forEach((button) => {
      button.addEventListener("click", loadLocalDraft);
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='download-draft']").forEach((button) => {
      button.addEventListener("click", downloadDraftBundle);
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='download-dtcg']").forEach((button) => {
      button.addEventListener("click", downloadDtcg);
    });

      root.querySelector<HTMLButtonElement>("[data-action='pull-project']")?.addEventListener("click", () => {
        void pullFromProject();
      });

      root.querySelector<HTMLButtonElement>("[data-action='push-canonical']")?.addEventListener("click", pushToCanonical);

    const deriveFamilySelect = root.querySelector<HTMLSelectElement>("[data-action='derive-family']");
    deriveFamilySelect?.addEventListener("change", () => {
      state.deriveFamily = deriveFamilySelect.value as "ghost" | "nudge";
      render();
    });

    const deriveStateSelect = root.querySelector<HTMLSelectElement>("[data-action='derive-state']");
    deriveStateSelect?.addEventListener("change", () => {
      state.deriveState = deriveStateSelect.value as
        | "hover"
        | "pressed"
        | "disabled"
        | "selected"
        | "focus";
      render();
    });

    const deriveDarkCheckbox = root.querySelector<HTMLInputElement>("[data-action='derive-dark']");
    deriveDarkCheckbox?.addEventListener("change", () => {
      state.deriveDarkMode = deriveDarkCheckbox.checked;
      render();
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='derive-create']").forEach((button) => {
      button.addEventListener("click", () => {
        const selectedToken = getSelectedToken();
        if (!selectedToken) {
          setMessage("Select a token to generate from");
          return;
        }

        const parsed = parseOklch(selectedToken.value);
        if (!parsed) {
          setMessage("Selected token value is not parseable OKLCH");
          return;
        }

        const derived = deriveStateValue(
          parsed,
          state.deriveFamily,
          state.deriveState,
          state.deriveDarkMode,
        );
        const nextName = `${selectedToken.name}.${state.deriveFamily}.${state.deriveState}`;

        const created: TokenRecord = {
          id: createId("tok"),
          name: nextName,
          value: formatOklch(derived),
          description: `${state.deriveFamily} ${state.deriveState} derived from ${selectedToken.name}`,
          layer: "stateFamily",
          taxonomy: {
            ...selectedToken.taxonomy,
            stateFamily: state.deriveFamily,
            state: state.deriveState,
          },
          links: [],
        };

        state.tokens = state.tokens.map((token) => {
          if (token.id !== selectedToken.id) return token;
          if (token.links.includes(created.id)) return token;
          return { ...token, links: [...token.links, created.id] };
        });
        state.tokens = [created, ...state.tokens];
        state.selectedTokenId = created.id;
        setMessage(`Derived ${state.deriveFamily}.${state.deriveState} token created`);
      });
    });

    if (selected) {
      const patchSelected = (mutator: (token: TokenRecord) => void, message: string) => {
        state.tokens = state.tokens.map((token) => {
          if (token.id !== selected.id) return token;
          const clone = structuredClone(token);
          mutator(clone);
          return clone;
        });
        setMessage(message);
      };

      const tokenNameInput = root.querySelector<HTMLInputElement>("[data-action='token-name']");
      tokenNameInput?.addEventListener("input", () => {
        patchSelected((token) => {
          token.name = tokenNameInput.value;
        }, "Token updated");
      });

      const tokenValueInput = root.querySelector<HTMLTextAreaElement>("[data-action='token-value']");
      tokenValueInput?.addEventListener("input", () => {
        patchSelected((token) => {
          token.value = tokenValueInput.value;
        }, "Token updated");
      });

      const tokenDescriptionInput = root.querySelector<HTMLTextAreaElement>("[data-action='token-description']");
      tokenDescriptionInput?.addEventListener("input", () => {
        patchSelected((token) => {
          token.description = tokenDescriptionInput.value;
        }, "Token updated");
      });

      const tokenLayerSelect = root.querySelector<HTMLSelectElement>("[data-action='token-layer']");
      tokenLayerSelect?.addEventListener("change", () => {
        patchSelected((token) => {
          token.layer = tokenLayerSelect.value as Layer;
          token.links = [];
        }, "Token layer updated");
      });

      root.querySelectorAll<HTMLSelectElement>("[data-action='token-taxonomy']").forEach((select) => {
        select.addEventListener("change", () => {
          const key = select.dataset.key as TaxonomyKey;
          patchSelected((token) => {
            if (select.value.trim().length === 0) {
              delete token.taxonomy[key];
            } else {
              token.taxonomy[key] = select.value;
            }
          }, "Token taxonomy updated");
        });
      });

      const linksSelect = root.querySelector<HTMLSelectElement>("[data-action='token-links']");
      linksSelect?.addEventListener("change", () => {
        const nextLinks = Array.from(linksSelect.selectedOptions).map((option) => option.value);
        patchSelected((token) => {
          token.links = nextLinks;
        }, "Token links updated");
      });
    }

    const taxonomyFocus = root.querySelector<HTMLSelectElement>("[data-action='taxonomy-focus']");
    taxonomyFocus?.addEventListener("change", () => {
      state.taxonomyFocus = taxonomyFocus.value as TaxonomyKey;
      render();
    });

    root.querySelectorAll<HTMLInputElement>("[data-action='taxonomy-edit']").forEach((input) => {
      input.addEventListener("input", () => {
        const index = Number(input.dataset.index ?? "-1");
        if (index < 0) return;
        const key = state.taxonomyFocus;
        const next = [...state.taxonomy[key]];
        next[index] = input.value;
        state.taxonomy = { ...state.taxonomy, [key]: next };
      });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-action='taxonomy-remove']").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index ?? "-1");
        if (index < 0) return;
        const key = state.taxonomyFocus;
        state.taxonomy = {
          ...state.taxonomy,
          [key]: state.taxonomy[key].filter((_, optionIndex) => optionIndex !== index),
        };
        render();
      });
    });

    const taxonomyAdd = root.querySelector<HTMLButtonElement>("[data-action='taxonomy-add']");
    const taxonomyNewValue = root.querySelector<HTMLInputElement>("[data-action='taxonomy-new-value']");
    taxonomyAdd?.addEventListener("click", () => {
      const nextValue = taxonomyNewValue?.value.trim() ?? "";
      if (nextValue.length === 0) {
        setMessage("Enter a taxonomy option before adding");
        return;
      }
      const key = state.taxonomyFocus;
      if (state.taxonomy[key].includes(nextValue)) {
        setMessage("Taxonomy option already exists");
        return;
      }
      state.taxonomy = {
        ...state.taxonomy,
        [key]: [...state.taxonomy[key], nextValue],
      };
      if (taxonomyNewValue) taxonomyNewValue.value = "";
      render();
    });
  };

  render();
  return root;
}

export const Workbench: Story = {
  render: () => buildStory(),
};
