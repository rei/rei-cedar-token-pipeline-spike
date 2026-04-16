import { getPlatformModeContext } from "./platform-mode-context";
import { getPlatformBadge, getPlatformLanguage, getPlatformSnippet } from "../stories/utils/getPlatformSnippet";

const STYLE_ELEMENT_ID = "token-output-panel-styles";

const TOKEN_OUTPUT_PANEL_CSS = `
.token-output-panel {
  margin: 1.5rem 0 0;
  padding: var(--cdr-space-panel-padding, 1rem);
  border: 1px solid var(--cdr-border-subtle, rgba(46, 46, 43, 0.12));
  border-radius: var(--cdr-radius-lg, 0.75rem);
  background: var(--cdr-surface-base, #ffffff);
  color: var(--cdr-text-base, #1a1a18);
  font-family: var(--cdr-font-body, system-ui, sans-serif);
}

.token-output-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.token-output-panel__title {
  margin: 0;
  font-size: var(--cdr-font-size-md, 1rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.token-output-panel__subtitle {
  margin: 0.25rem 0 0;
  font-size: var(--cdr-font-size-sm, 0.8125rem);
  color: var(--cdr-text-subtle, #5c5c5d);
}

.token-output-panel__meta {
  font-size: var(--cdr-font-size-xs, 0.75rem);
  color: var(--cdr-text-subtle, #5c5c5d);
  margin-bottom: 0.75rem;
}

.token-output-panel__code-wrap {
  position: relative;
  margin: 0.75rem 0 1rem;
  border-radius: var(--cdr-radius-md, 0.5rem);
  border: 1px solid var(--cdr-code-border, rgba(255, 255, 255, 0.12));
  overflow: hidden;
  background: var(--cdr-code-surface, #1f2428);
}

.token-output-panel__code-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  background: var(--cdr-code-header-surface, #151a1e);
  padding: 0.5rem 0.625rem;
}

.token-output-panel__language-pill {
  font-size: var(--cdr-font-size-xs, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  color: var(--cdr-code-pill-text, #d1d8de);
  background: var(--cdr-code-pill-bg, rgba(255, 255, 255, 0.1));
}

.token-output-panel__copy {
  border: 1px solid var(--cdr-code-copy-border, rgba(255, 255, 255, 0.2));
  color: var(--cdr-code-copy-text, #e6edf3);
  background: transparent;
  border-radius: var(--cdr-radius-sm, 0.375rem);
  min-inline-size: 2rem;
  block-size: 1.75rem;
  cursor: pointer;
  position: relative;
}

.token-output-panel__copy-tooltip {
  position: absolute;
  right: 0;
  top: -1.75rem;
  font-size: var(--cdr-font-size-xs, 0.75rem);
  color: var(--cdr-code-tooltip-text, #d1d8de);
  background: var(--cdr-code-tooltip-bg, #0f1317);
  border-radius: var(--cdr-radius-sm, 0.375rem);
  padding: 0.125rem 0.375rem;
  white-space: nowrap;
}

.token-output-panel__code {
  margin: 0;
  padding: 0.875rem;
  color: var(--cdr-code-text, #e6edf3);
  font-family: var(--cdr-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: var(--cdr-font-size-sm, 0.8125rem);
  line-height: 1.4;
}

.token-output-panel__table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.25rem;
}

.token-output-panel__table th,
.token-output-panel__table td {
  padding: 0.75rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--cdr-rule-subtle, rgba(46, 46, 43, 0.08));
  font-size: var(--cdr-font-size-sm, 0.8125rem);
}

.token-output-panel__table th {
  font-weight: 700;
  color: var(--cdr-text-subtle, #5c5c5d);
}

.token-output-panel__table td {
  color: var(--cdr-text-base, #1a1a18);
}

.token-output-panel__table td:first-child {
  width: 35%;
}

.token-output-panel__table td:nth-child(2) {
  width: 35%;
}

.token-output-panel__table td:last-child {
  text-align: right;
}
`;

function ensureTokenOutputPanelStyles(): void {
  if (document.getElementById(STYLE_ELEMENT_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = TOKEN_OUTPUT_PANEL_CSS;
  document.head.appendChild(style);
}

export interface TokenOutputResolvedValue {
  platform: string;
  mode: string;
  hex: string;
  primitive: string;
  palette: string;
}

export interface TokenOutputPanelProps {
  canonicalName: string;
  outputTokenName: string;
  resolvedValues: TokenOutputResolvedValue[];
}

export function TokenOutputPanel({
  canonicalName,
  outputTokenName,
  resolvedValues,
}: TokenOutputPanelProps): HTMLElement {
  ensureTokenOutputPanelStyles();
  const { platform, mode } = getPlatformModeContext();
  const activeValues = resolvedValues.filter(
    (value) => value.platform === platform && value.mode === mode,
  );

  const root = document.createElement("section");
  root.className = "token-output-panel";

  const header = document.createElement("div");
  header.className = "token-output-panel__header";

  const title = document.createElement("h2");
  title.className = "token-output-panel__title";
  title.textContent = outputTokenName;

  const subtitle = document.createElement("p");
  subtitle.className = "token-output-panel__subtitle";
  subtitle.textContent = canonicalName;

  header.appendChild(title);
  header.appendChild(subtitle);
  root.appendChild(header);

  const meta = document.createElement("div");
  meta.className = "token-output-panel__meta";
  meta.textContent = `Platform: ${platform} · Mode: ${mode}`;
  root.appendChild(meta);

  const codeWrap = document.createElement("div");
  codeWrap.className = "token-output-panel__code-wrap";

  const codeHeader = document.createElement("div");
  codeHeader.className = "token-output-panel__code-header";

  const languagePill = document.createElement("span");
  languagePill.className = "token-output-panel__language-pill";
  languagePill.textContent = getPlatformBadge(platform);

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "token-output-panel__copy";
  copyButton.textContent = "⧉";
  const snippet = getPlatformSnippet({ name: outputTokenName }, platform);
  copyButton.setAttribute("aria-label", `Copy ${platform} code for ${outputTokenName}`);

  const showCopiedState = (success: boolean) => {
    copyButton.textContent = success ? "✓" : "!";
    const tooltip = document.createElement("span");
    tooltip.className = "token-output-panel__copy-tooltip";
    tooltip.textContent = success ? "Copied!" : "Copy unavailable";
    copyButton.appendChild(tooltip);
    window.setTimeout(() => {
      tooltip.remove();
      copyButton.textContent = "⧉";
    }, 1500);
  };

  copyButton.addEventListener("click", async () => {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(snippet);
      showCopiedState(true);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = snippet;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    showCopiedState(copied);
  });

  codeHeader.appendChild(languagePill);
  codeHeader.appendChild(copyButton);
  codeWrap.appendChild(codeHeader);

  const codePre = document.createElement("pre");
  codePre.className = "token-output-panel__code";
  const codeEl = document.createElement("code");
  codeEl.className = `language-${getPlatformLanguage(platform)}`;
  codeEl.textContent = snippet;
  codePre.appendChild(codeEl);
  codeWrap.appendChild(codePre);
  root.appendChild(codeWrap);

  const table = document.createElement("table");
  table.className = "token-output-panel__table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Resolved primitive", "Palette", "Hex"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  if (activeValues.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "No resolved values found for the active platform and mode.";
    row.appendChild(cell);
    tbody.appendChild(row);
  } else {
    activeValues.forEach((value) => {
      const row = document.createElement("tr");
      const primitiveCell = document.createElement("td");
      primitiveCell.textContent = value.primitive;
      const paletteCell = document.createElement("td");
      paletteCell.textContent = value.palette;
      const hexCell = document.createElement("td");
      hexCell.textContent = value.hex;
      row.appendChild(primitiveCell);
      row.appendChild(paletteCell);
      row.appendChild(hexCell);
      tbody.appendChild(row);
    });
  }

  table.appendChild(tbody);
  root.appendChild(table);

  return root;
}
