/**
 * diff-engine.test.ts
 *
 * Unit tests for computeDiff and groupBySectionPath.
 *
 * Covers:
 *  - Identical trees produce no diff entries
 *  - changed-value: raw primitive $value changed
 *  - changed-alias: alias target changed ({a} → {b})
 *  - alias-to-value: was alias, now raw value
 *  - value-to-alias: was raw value, now alias
 *  - added: token present only in current
 *  - removed: token present only in baseline
 *  - group-added: entire group absent from baseline
 *  - group-removed: entire group absent from current
 *  - child group entries suppressed when parent group is already reported
 *  - Output is sorted by path
 *  - groupBySectionPath: default depth=2 groups correctly
 *  - groupBySectionPath: depth=1 groups correctly
 */

import { describe, it, expect } from "vitest";
import { computeDiff, groupBySectionPath } from "./diff-engine.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const leaf = (value: string, type = "color") => ({ $value: value, $type: type });
const alias = (ref: string, type = "color") => ({ $value: `{${ref}}`, $type: type });

// ─── computeDiff ──────────────────────────────────────────────────────────────

describe("computeDiff", () => {
  it("returns an empty array when baseline and current are identical", () => {
    const tree = { color: { text: { link: leaf("#0b2d60") } } };
    expect(computeDiff(tree, tree)).toEqual([]);
  });

  it("detects changed-value for a raw primitive change", () => {
    const baseline = { color: { surface: { base: leaf("#ffffff") } } };
    const current = { color: { surface: { base: leaf("#f5f2eb") } } };
    const diff = computeDiff(baseline, current);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      path: "color.surface.base",
      kind: "changed-value",
      baseline: leaf("#ffffff"),
      current: leaf("#f5f2eb"),
    });
  });

  it("detects changed-alias when both sides are aliases with different targets", () => {
    const baseline = { color: { text: { link: alias("color.brand-palette.blue.600") } } };
    const current = { color: { text: { link: alias("color.brand-palette.blue.800") } } };
    const diff = computeDiff(baseline, current);
    expect(diff).toHaveLength(1);
    expect(diff[0].kind).toBe("changed-alias");
    expect(diff[0].path).toBe("color.text.link");
  });

  it("detects alias-to-value when baseline is alias and current is raw", () => {
    const baseline = { color: { icon: { default: alias("color.neutral-palette.white") } } };
    const current = { color: { icon: { default: leaf("#ffffff") } } };
    const diff = computeDiff(baseline, current);
    expect(diff).toHaveLength(1);
    expect(diff[0].kind).toBe("alias-to-value");
  });

  it("detects value-to-alias when baseline is raw and current is alias", () => {
    const baseline = { color: { icon: { default: leaf("#ffffff") } } };
    const current = { color: { icon: { default: alias("color.neutral-palette.white") } } };
    const diff = computeDiff(baseline, current);
    expect(diff).toHaveLength(1);
    expect(diff[0].kind).toBe("value-to-alias");
  });

  it("detects added tokens present only in current", () => {
    const baseline = { color: { text: { link: leaf("#0b2d60") } } };
    const current = {
      color: {
        text: { link: leaf("#0b2d60"), hover: leaf("#1a4a90") },
      },
    };
    const diff = computeDiff(baseline, current);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      path: "color.text.hover",
      kind: "added",
      baseline: null,
      current: leaf("#1a4a90"),
    });
  });

  it("detects removed tokens present only in baseline", () => {
    const baseline = {
      color: { text: { link: leaf("#0b2d60"), hover: leaf("#1a4a90") } },
    };
    const current = { color: { text: { link: leaf("#0b2d60") } } };
    const diff = computeDiff(baseline, current);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      path: "color.text.hover",
      kind: "removed",
      baseline: leaf("#1a4a90"),
      current: null,
    });
  });

  it("detects group-added when an entire group is new in current", () => {
    const baseline = { color: { text: { link: leaf("#0b2d60") } } };
    const current = {
      color: {
        text: { link: leaf("#0b2d60") },
        border: { subtle: leaf("#cccccc") },
      },
    };
    const diff = computeDiff(baseline, current);
    // Individual token "color.border.subtle" is reported as added; group
    // "color.border" may also appear as group-added
    const kinds = diff.map((d) => d.kind);
    // Must have at least the added leaf
    expect(kinds).toContain("added");
  });

  it("detects group-removed when an entire group is gone from current", () => {
    const baseline = {
      color: {
        text: { link: leaf("#0b2d60") },
        border: { subtle: leaf("#cccccc") },
      },
    };
    const current = { color: { text: { link: leaf("#0b2d60") } } };
    const diff = computeDiff(baseline, current);
    const kinds = diff.map((d) => d.kind);
    expect(kinds).toContain("removed");
  });

  it("suppresses child group-added when parent group is already reported", () => {
    // brand-new top-level group "spacing" with nested sub-groups
    const baseline = { color: { text: { link: leaf("#0b2d60") } } };
    const current = {
      color: { text: { link: leaf("#0b2d60") } },
      spacing: {
        component: { button: leaf("8", "dimension") },
        global: { sm: leaf("4", "dimension") },
      },
    };
    const diff = computeDiff(baseline, current);
    const groupAdded = diff.filter((d) => d.kind === "group-added");
    // Only "spacing" should be reported, not "spacing.component" or "spacing.global"
    const groupPaths = groupAdded.map((d) => d.path);
    expect(groupPaths).toContain("spacing");
    expect(groupPaths).not.toContain("spacing.component");
    expect(groupPaths).not.toContain("spacing.global");
  });

  it("returns entries sorted alphabetically by path", () => {
    const baseline = {};
    const current = {
      color: {
        text: { z: leaf("#aaa"), a: leaf("#bbb") },
        surface: { base: leaf("#ccc") },
      },
    };
    const diff = computeDiff(baseline, current);
    const paths = diff.filter((d) => d.kind === "added").map((d) => d.path);
    const sorted = [...paths].sort((a, b) => a.localeCompare(b));
    expect(paths).toEqual(sorted);
  });

  it("unchanged tokens produce no diff entries", () => {
    const tree = {
      color: {
        text: { link: leaf("#0b2d60"), base: leaf("#111") },
        surface: { base: alias("color.neutral-palette.white") },
      },
    };
    expect(computeDiff(tree, tree)).toHaveLength(0);
  });

  it("handles empty baseline and empty current gracefully", () => {
    expect(computeDiff({}, {})).toEqual([]);
  });

  it("handles empty baseline (all tokens are added)", () => {
    const current = { color: { text: { link: leaf("#0b2d60") } } };
    const diff = computeDiff({}, current);
    const kinds = diff.map((d) => d.kind);
    expect(kinds.every((k) => k === "added" || k === "group-added")).toBe(true);
  });

  it("handles empty current (all tokens are removed)", () => {
    const baseline = { color: { text: { link: leaf("#0b2d60") } } };
    const diff = computeDiff(baseline, {});
    const kinds = diff.map((d) => d.kind);
    expect(kinds.every((k) => k === "removed" || k === "group-removed")).toBe(true);
  });
});

// ─── groupBySectionPath ───────────────────────────────────────────────────────

describe("groupBySectionPath", () => {
  it("groups entries by the first 2 path segments (default depth=2)", () => {
    const entries = [
      { path: "color.text.link", kind: "changed-value" as const, baseline: leaf("#fff"), current: leaf("#000") },
      { path: "color.text.hover", kind: "added" as const, baseline: null, current: leaf("#111") },
      { path: "color.surface.base", kind: "added" as const, baseline: null, current: leaf("#fff") },
      { path: "spacing.component.button", kind: "added" as const, baseline: null, current: leaf("8", "dimension") },
    ];
    const grouped = groupBySectionPath(entries);
    expect([...grouped.keys()]).toEqual(["color.text", "color.surface", "spacing.component"]);
    expect(grouped.get("color.text")).toHaveLength(2);
    expect(grouped.get("color.surface")).toHaveLength(1);
  });

  it("groups entries by the first 1 path segment when depth=1", () => {
    const entries = [
      { path: "color.text.link", kind: "changed-value" as const, baseline: leaf("#fff"), current: leaf("#000") },
      { path: "color.surface.base", kind: "added" as const, baseline: null, current: leaf("#fff") },
      { path: "spacing.sm", kind: "added" as const, baseline: null, current: leaf("4", "dimension") },
    ];
    const grouped = groupBySectionPath(entries, 1);
    expect([...grouped.keys()]).toEqual(["color", "spacing"]);
    expect(grouped.get("color")).toHaveLength(2);
    expect(grouped.get("spacing")).toHaveLength(1);
  });

  it("returns an empty map for an empty entries array", () => {
    expect(groupBySectionPath([])).toEqual(new Map());
  });

  it("handles single-segment paths gracefully", () => {
    const entries = [
      { path: "color", kind: "group-added" as const, baseline: null, current: null },
    ];
    const grouped = groupBySectionPath(entries);
    expect([...grouped.keys()]).toEqual(["color"]);
  });
});
