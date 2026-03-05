/**
 * diff-engine.ts
 *
 * Pure semantic diff logic for normalized Cedar token trees.
 * No DOM, no Storybook, no side effects.
 *
 * Diff kinds:
 *   changed-value   — primitive $value changed (hex → hex)
 *   changed-alias   — alias $value changed ({x} → {y})
 *   alias-to-value  — was alias, now raw value (or vice versa)
 *   added           — token exists in current but not baseline
 *   removed         — token exists in baseline but not current
 *   group-added     — a whole group path is new in current
 *   group-removed   — a whole group path was removed in current
 */

export type DiffKind =
  | "changed-value"
  | "changed-alias"
  | "alias-to-value"
  | "value-to-alias"
  | "added"
  | "removed"
  | "group-added"
  | "group-removed";

export interface TokenLeaf {
  $value: string | { web: string; ios: string };
  $type: string;
}

export interface DiffEntry {
  path: string; // dot-separated path, e.g. "color.text.link"
  kind: DiffKind;
  baseline: TokenLeaf | null;
  current: TokenLeaf | null;
}

// A flat map from path → leaf token
type FlatMap = Map<string, TokenLeaf>;

export function isLeaf(node: unknown): node is TokenLeaf {
  return (
    typeof node === "object" &&
    node !== null &&
    "$value" in node &&
    "$type" in node
  );
}

function isAlias(value: string | { web: string; ios: string }): boolean {
  if (typeof value !== 'string') return false;
  return value.trimStart().startsWith("{") && value.trimEnd().endsWith("}");
}

function getStringValue(value: string | { web: string; ios: string }): string {
  return typeof value === 'string' ? value : value.web;
}

/**
 * Recursively flatten a nested token tree into a path→leaf map.
 * Group nodes are visited; leaf nodes are recorded.
 */
function flatten(
  node: Record<string, unknown>,
  prefix: string,
  out: FlatMap,
): void {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isLeaf(value)) {
      out.set(path, value);
    } else if (typeof value === "object" && value !== null) {
      flatten(value as Record<string, unknown>, path, out);
    }
  }
}

/**
 * Collect the set of all immediate group paths present in the tree
 * (i.e. paths that have children, not leaves). Used for structural diff.
 */
function collectGroups(
  node: Record<string, unknown>,
  prefix: string,
  out: Set<string>,
): void {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isLeaf(value)) {
      // leaf — not a group
    } else if (typeof value === "object" && value !== null) {
      out.add(path);
      collectGroups(value as Record<string, unknown>, path, out);
    }
  }
}

/**
 * Compute the semantic diff between two normalized token trees.
 * Returns an array of DiffEntry objects sorted by path.
 */
export function computeDiff(
  baseline: Record<string, unknown>,
  current: Record<string, unknown>,
): DiffEntry[] {
  const baseFlat: FlatMap = new Map();
  const currFlat: FlatMap = new Map();
  flatten(baseline, "", baseFlat);
  flatten(current, "", currFlat);

  const baseGroups = new Set<string>();
  const currGroups = new Set<string>();
  collectGroups(baseline, "", baseGroups);
  collectGroups(current, "", currGroups);

  const entries: DiffEntry[] = [];

  // Token-level diffs
  const allPaths = new Set([...baseFlat.keys(), ...currFlat.keys()]);
  for (const path of allPaths) {
    const b = baseFlat.get(path) ?? null;
    const c = currFlat.get(path) ?? null;

    if (b === null && c !== null) {
      entries.push({ path, kind: "added", baseline: null, current: c });
    } else if (b !== null && c === null) {
      entries.push({ path, kind: "removed", baseline: b, current: null });
    } else if (b !== null && c !== null) {
      const bStrValue = getStringValue(b.$value);
      const cStrValue = getStringValue(c.$value);
      
      if (bStrValue === cStrValue) continue; // unchanged

      const bIsAlias = isAlias(b.$value);
      const cIsAlias = isAlias(c.$value);

      if (bIsAlias && cIsAlias) {
        entries.push({ path, kind: "changed-alias", baseline: b, current: c });
      } else if (!bIsAlias && !cIsAlias) {
        entries.push({
          path,
          kind: "changed-value",
          baseline: b,
          current: c,
        });
      } else if (bIsAlias && !cIsAlias) {
        entries.push({
          path,
          kind: "alias-to-value",
          baseline: b,
          current: c,
        });
      } else {
        entries.push({
          path,
          kind: "value-to-alias",
          baseline: b,
          current: c,
        });
      }
    }
  }

  // Group-level structural diffs — only report top-level groups that are
  // entirely new or entirely removed (not just paths with individual token
  // changes already captured above).
  const addedGroups = new Set([...currGroups].filter((g) => !baseGroups.has(g)));
  const removedGroups = new Set(
    [...baseGroups].filter((g) => !currGroups.has(g)),
  );

  // Suppress child group paths whose parent group is already reported
  function isRedundant(path: string, groupSet: Set<string>): boolean {
    const parts = path.split(".");
    for (let i = 1; i < parts.length; i++) {
      const ancestor = parts.slice(0, i).join(".");
      if (groupSet.has(ancestor)) return true;
    }
    return false;
  }

  for (const g of addedGroups) {
    if (isRedundant(g, addedGroups)) continue;
    entries.push({ path: g, kind: "group-added", baseline: null, current: null });
  }
  for (const g of removedGroups) {
    if (isRedundant(g, removedGroups)) continue;
    entries.push({
      path: g,
      kind: "group-removed",
      baseline: null,
      current: null,
    });
  }

  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Group diff entries by their top-level section path (e.g. "color.text").
 * Returns an ordered map: section → entries.
 */
export function groupBySectionPath(
  entries: DiffEntry[],
  depth = 2,
): Map<string, DiffEntry[]> {
  const map = new Map<string, DiffEntry[]>();
  for (const entry of entries) {
    const parts = entry.path.split(".");
    const section = parts.slice(0, depth).join(".");
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(entry);
  }
  return map;
}
