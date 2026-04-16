import { getPlatformModeContext } from "./platform-mode-context";

const STYLE_ELEMENT_ID = "token-output-panel-styles";

const TOKEN_OUTPUT_PANEL_CSS = `
.token-output-panel {
  margin: 1.5rem 0 0;
  padding: 1rem 1rem 0.75rem;
  border: 1px solid rgba(46, 46, 43, 0.12);
  border-radius: 0.75rem;
  background: #ffffff;
  color: #1a1a18;
  font-family: Inter, system-ui, sans-serif;
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
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.token-output-panel__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: #5c5c5d;
}

.token-output-panel__meta {
  font-size: 0.75rem;
  color: #5c5c5d;
  margin-bottom: 0.75rem;
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
  border-bottom: 1px solid rgba(46, 46, 43, 0.08);
  font-size: 0.8125rem;
}

.token-output-panel__table th {
  font-weight: 700;
  color: #5c5c5d;
}

.token-output-panel__table td {
  color: #1a1a18;
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
