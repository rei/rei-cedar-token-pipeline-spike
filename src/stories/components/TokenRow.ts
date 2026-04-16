import type { CedarToken } from "../../tokens/token.types";
import { getPlatformModeContext, type Platform } from "../../storybook/platform-mode-context";
import {
  getPlatformBadge,
  getPlatformLanguage,
  getPlatformSnippet,
} from "../utils/getPlatformSnippet";
import "./TokenRow.css";

export type TokenCategory = "color" | "space" | "typography" | "elevation" | "motion";

export interface TokenRowProps {
  token: CedarToken;
  category: TokenCategory;
  showAlias?: boolean;
  showDescription?: boolean;
  showUsedBy?: boolean;
  compact?: boolean;
}

function getBadgeToneClass(tone: string): string {
  if (tone === "experimental") return "cdr-token-row__badge--experimental";
  if (tone === "deprecated") return "cdr-token-row__badge--deprecated";
  if (tone === "info") return "cdr-token-row__tier";
  return "cdr-token-row__badge--stable";
}

function buildSwatch(token: CedarToken, category: TokenCategory): HTMLElement {
  const swatch = document.createElement("div");
  swatch.className = "cdr-token-row__swatch";
  swatch.setAttribute("role", "img");
  swatch.setAttribute("aria-label", token.value);

  if (category === "space") {
    const bar = document.createElement("div");
    bar.className = "cdr-token-row__swatch-space-bar";
    const numeric = Number.parseFloat(String(token.value).replace("px", ""));
    const width = Number.isFinite(numeric) ? Math.min(numeric, 200) : 96;
    bar.style.setProperty("--space-bar-width", `${width / 16}rem`);
    swatch.appendChild(bar);
    return swatch;
  }

  if (category === "typography") {
    const text = document.createElement("div");
    text.className = "cdr-token-row__swatch-typo";
    text.textContent = "Aa";
    text.style.font = token.value;
    swatch.appendChild(text);
    return swatch;
  }

  if (category === "elevation") {
    const card = document.createElement("div");
    card.className = "cdr-token-row__swatch-elevation";
    card.style.boxShadow = token.value;
    swatch.appendChild(card);
    return swatch;
  }

  if (category === "motion") {
    const dot = document.createElement("div");
    dot.className = "cdr-token-row__swatch-motion";
    dot.style.setProperty("--motion-duration", token.value);
    dot.style.setProperty("--motion-easing", "cubic-bezier(0.2, 0, 0, 1)");
    swatch.appendChild(dot);
    return swatch;
  }

  swatch.style.background = token.platforms?.web || token.value;
  return swatch;
}

function createCopyButton(
  snippet: string,
  platform: Platform,
  tokenName: string,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cdr-token-row__copy";
  button.textContent = "⧉";
  button.setAttribute("aria-label", `Copy ${platform} code for ${tokenName}`);

  const setFeedback = (ok: boolean): void => {
    button.textContent = ok ? "✓" : "!";
    const tip = document.createElement("span");
    tip.className = "cdr-token-row__copy-tooltip";
    tip.textContent = ok ? "Copied!" : "Copy unavailable";
    button.appendChild(tip);
    window.setTimeout(() => {
      tip.remove();
      button.textContent = "⧉";
    }, 1500);
  };

  button.addEventListener("click", async () => {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(snippet);
      setFeedback(true);
      return;
    }

    const ta = document.createElement("textarea");
    ta.value = snippet;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(ta);
    setFeedback(copied);
  });

  return button;
}

export function TokenRow({
  token,
  category,
  showAlias = true,
  showDescription = true,
  showUsedBy = false,
  compact = false,
}: TokenRowProps): HTMLElement {
  const { platform } = getPlatformModeContext();
  const lang = getPlatformLanguage(platform);
  const langBadge = getPlatformBadge(platform);
  const snippet = getPlatformSnippet(token, platform);
  const badges =
    token.meta?.badges && token.meta.badges.length > 0
      ? token.meta.badges
      : [
          { label: token.status, tone: token.status },
          { label: token.tier, tone: "info" as const },
        ];

  const row = document.createElement("article");
  row.className = `cdr-token-row${token.status === "deprecated" ? " cdr-token-row--deprecated" : ""}${compact ? " cdr-token-row--compact" : ""}`;

  row.appendChild(buildSwatch(token, category));

  const body = document.createElement("div");
  const title = document.createElement("div");
  title.className = "cdr-token-row__titlebar";

  const name = document.createElement("span");
  name.className = `cdr-token-row__name${token.status === "deprecated" ? " cdr-token-row__name--deprecated" : ""}`;
  name.textContent = token.name;

  title.appendChild(name);
  badges.forEach((badge) => {
    const badgeEl = document.createElement("span");
    badgeEl.className = `cdr-token-row__badge ${getBadgeToneClass(badge.tone ?? "stable")}`;
    badgeEl.textContent = badge.label;
    badgeEl.setAttribute("role", "status");
    title.appendChild(badgeEl);
  });
  body.appendChild(title);

  if (!compact) {
    const meta = document.createElement("div");
    meta.className = "cdr-token-row__meta";
    meta.textContent = `${token.value}${showAlias && token.alias ? `  →  ${token.alias}` : ""}`;
    body.appendChild(meta);

    if (showDescription && token.description) {
      const desc = document.createElement("div");
      desc.className = "cdr-token-row__description";
      desc.textContent = token.description;
      body.appendChild(desc);
    }
  }

  if (token.status === "deprecated") {
    const deprecated = document.createElement("div");
    deprecated.className = "cdr-token-row__deprecated-note";
    deprecated.textContent = "Deprecated token: code examples are intentionally disabled.";
    body.appendChild(deprecated);
  } else {
    const code = document.createElement("div");
    code.className = "cdr-token-row__code";

    const codeHead = document.createElement("div");
    codeHead.className = "cdr-token-row__code-head";

    const pill = document.createElement("span");
    pill.className = "cdr-token-row__language";
    pill.textContent = langBadge;

    codeHead.appendChild(pill);
    codeHead.appendChild(createCopyButton(snippet, platform, token.name));
    code.appendChild(codeHead);

    const pre = document.createElement("pre");
    const codeEl = document.createElement("code");
    codeEl.className = `language-${lang}`;
    codeEl.textContent = snippet;
    pre.appendChild(codeEl);
    code.appendChild(pre);

    body.appendChild(code);
  }

  if (showUsedBy && Array.isArray(token.usedBy) && token.usedBy.length > 0) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = `Used by (${token.usedBy.length})`;
    details.appendChild(summary);

    const pills = document.createElement("div");
    pills.className = "cdr-token-row__usedby";
    token.usedBy.forEach((entry) => {
      const chip = document.createElement("span");
      chip.className = "cdr-token-row__usedby-pill";
      chip.textContent = entry;
      pills.appendChild(chip);
    });

    details.appendChild(pills);
    body.appendChild(details);
  }

  row.appendChild(body);
  return row;
}
