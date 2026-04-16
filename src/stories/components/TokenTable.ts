import type { CedarToken } from "../../tokens/token.types";
import { TokenRow, type TokenCategory } from "./TokenRow";
import "./TokenTable.css";

function debounce<T extends unknown[]>(fn: (...args: T) => void, waitMs: number) {
  let handle: number | undefined;
  return (...args: T): void => {
    if (handle !== undefined) window.clearTimeout(handle);
    handle = window.setTimeout(() => fn(...args), waitMs);
  };
}

export interface TokenTableProps {
  tokens: CedarToken[];
  category: TokenCategory;
  showAlias?: boolean;
  showDescription?: boolean;
  showUsedBy?: boolean;
}

export function TokenTable({
  tokens,
  category,
  showAlias = true,
  showDescription = true,
  showUsedBy = false,
}: TokenTableProps): HTMLElement {
  const root = document.createElement("section");
  root.className = "cdr-token-table";

  const hint = document.createElement("p");
  hint.className = "cdr-token-table__hint";
  hint.textContent = "Switch platform in the toolbar above to see platform-specific code.";
  root.appendChild(hint);

  const controls = document.createElement("div");
  controls.className = "cdr-token-table__controls";

  const searchWrap = document.createElement("div");
  searchWrap.className = "cdr-token-table__search-wrap";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "cdr-token-table__search";
  search.placeholder = "Filter by token name or description";

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "cdr-token-table__clear";
  clear.textContent = "×";
  clear.hidden = true;
  clear.setAttribute("aria-label", "Clear search");

  searchWrap.appendChild(search);
  searchWrap.appendChild(clear);
  controls.appendChild(searchWrap);

  const chips = document.createElement("div");
  chips.className = "cdr-token-table__filters";
  const statuses = ["all", "stable", "experimental", "deprecated"] as const;
  let status: (typeof statuses)[number] = "all";

  statuses.forEach((s) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "cdr-token-table__chip";
    chip.dataset.active = String(s === status);
    chip.textContent = s[0].toUpperCase() + s.slice(1);
    chip.addEventListener("click", () => {
      status = s;
      chips.querySelectorAll("button").forEach((btn) => {
        btn.dataset.active = String(btn.textContent?.toLowerCase() === s);
      });
      renderRows();
    });
    chips.appendChild(chip);
  });

  const aliasLabel = document.createElement("label");
  aliasLabel.className = "cdr-token-table__chip";
  const aliasToggle = document.createElement("input");
  aliasToggle.type = "checkbox";
  aliasToggle.checked = showAlias;
  aliasLabel.appendChild(aliasToggle);
  aliasLabel.append(" Show aliases");
  chips.appendChild(aliasLabel);

  controls.appendChild(chips);
  root.appendChild(controls);

  const live = document.createElement("div");
  live.className = "cdr-token-table__live";
  live.setAttribute("aria-live", "polite");
  root.appendChild(live);

  const rows = document.createElement("div");
  rows.className = "cdr-token-table__rows";
  root.appendChild(rows);

  let searchValue = "";

  const renderRows = (): void => {
    rows.innerHTML = "";
    const normalized = searchValue.trim().toLowerCase();
    const filtered = tokens.filter((token) => {
      const matchesStatus = status === "all" || token.status === status;
      const matchesText =
        !normalized ||
        token.name.toLowerCase().includes(normalized) ||
        String(token.description || "")
          .toLowerCase()
          .includes(normalized);
      return matchesStatus && matchesText;
    });

    filtered.forEach((token) => {
      rows.appendChild(
        TokenRow({
          token,
          category,
          showAlias: aliasToggle.checked,
          showDescription,
          showUsedBy,
        }),
      );
    });

    live.textContent = `${filtered.length} token result${filtered.length === 1 ? "" : "s"}`;
  };

  const debouncedSearch = debounce((value: string) => {
    searchValue = value;
    renderRows();
  }, 150);

  search.addEventListener("input", () => {
    clear.hidden = search.value.length === 0;
    debouncedSearch(search.value);
  });

  clear.addEventListener("click", () => {
    search.value = "";
    clear.hidden = true;
    searchValue = "";
    renderRows();
  });

  aliasToggle.addEventListener("change", renderRows);

  renderRows();
  return root;
}
