import type { CedarToken } from "../../tokens/token.types";
import "./TokenMeta.css";

export interface TokenMetaProps {
  token: CedarToken;
  showSource?: boolean;
  showUsedBy?: boolean;
}

export function TokenMeta({
  token,
  showSource = true,
  showUsedBy = true,
}: TokenMetaProps): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "cdr-token-meta";

  const title = document.createElement("h3");
  title.className = "cdr-token-meta__title";
  title.textContent = "Token Metadata";
  panel.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "cdr-token-meta__grid";

  const addRow = (label: string, valueNode: string | HTMLElement): void => {
    const l = document.createElement("div");
    l.className = "cdr-token-meta__label";
    l.textContent = label;
    const v = document.createElement("div");
    v.className = "cdr-token-meta__value";
    if (typeof valueNode === "string") v.textContent = valueNode;
    else v.appendChild(valueNode);
    grid.appendChild(l);
    grid.appendChild(v);
  };

  if (showSource) addRow("Source", token.meta?.source ?? "figma-variables");
  addRow("Tier", token.alias ? `${token.tier} -> ${token.alias}` : token.tier);
  addRow("Status", token.status);

  if (token.meta?.badges && token.meta.badges.length > 0) {
    const badges = document.createElement("div");
    badges.className = "cdr-token-meta__pills";
    token.meta.badges.forEach((badge) => {
      const pill = document.createElement("span");
      pill.className = "cdr-token-meta__pill";
      pill.textContent = badge.label;
      badges.appendChild(pill);
    });
    addRow("Labels", badges);
  }

  const platforms = document.createElement("div");
  platforms.textContent = "✓ Web   ✓ iOS   ✓ Android";
  addRow("Platforms", platforms);

  if (token.meta?.figmaCollection) addRow("Figma collection", token.meta.figmaCollection);
  if (token.meta?.figmaVariable) addRow("Figma variable", token.meta.figmaVariable);
  if (token.meta?.usageSummary) addRow("Usage", token.meta.usageSummary);
  if (token.meta?.consumerNotes) addRow("Consumer notes", token.meta.consumerNotes);

  if (showUsedBy && Array.isArray(token.usedBy) && token.usedBy.length > 0) {
    const pills = document.createElement("div");
    pills.className = "cdr-token-meta__pills";
    token.usedBy.forEach((entry) => {
      const pill = document.createElement("span");
      pill.className = "cdr-token-meta__pill";
      pill.textContent = entry;
      pills.appendChild(pill);
    });
    addRow("Used by", pills);
  }

  addRow("Last changed", token.meta?.lastChanged ?? "not available");

  panel.appendChild(grid);
  return panel;
}
