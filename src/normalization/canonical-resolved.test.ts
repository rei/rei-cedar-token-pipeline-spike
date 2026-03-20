import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type JsonRecord = Record<string, unknown>;

const canonicalPath = path.resolve(process.cwd(), "canonical/tokens.json");

function getAtPath(root: JsonRecord, dotPath: string): JsonRecord {
  const node = dotPath
    .split(".")
    .reduce<unknown>((acc, seg) => (acc as JsonRecord | undefined)?.[seg], root);

  if (!node || typeof node !== "object") {
    throw new Error(`Path not found in canonical tokens: ${dotPath}`);
  }

  return node as JsonRecord;
}

function walkSemanticLeaves(node: JsonRecord, cb: (leaf: JsonRecord) => void) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (value && typeof value === "object" && "$value" in (value as JsonRecord)) {
      cb(value as JsonRecord);
      continue;
    }
    if (value && typeof value === "object") {
      walkSemanticLeaves(value as JsonRecord, cb);
    }
  }
}

describe("canonical color alias hybrid model", () => {
  it("keeps alias refs and also emits cedar.resolved platform values", () => {
    const root = JSON.parse(fs.readFileSync(canonicalPath, "utf8")) as JsonRecord;
    const color = root.color as JsonRecord;
    const modes = color.modes as JsonRecord;

    expect(modes).toBeTruthy();

    let checked = 0;

    for (const modeTree of Object.values(modes)) {
      if (!modeTree || typeof modeTree !== "object") continue;

      walkSemanticLeaves(modeTree as JsonRecord, (leaf) => {
        const value = leaf.$value;
        if (typeof value !== "string" || !value.startsWith("{color.option.")) return;

        const cedar = (leaf.$extensions as JsonRecord | undefined)?.cedar as JsonRecord | undefined;
        expect(cedar).toBeTruthy();

        const resolved = cedar?.resolved as JsonRecord | undefined;
        expect(resolved).toBeTruthy();

        const web = resolved?.web as JsonRecord | undefined;
        const ios = resolved?.ios as JsonRecord | undefined;

        expect(typeof web?.light).toBe("string");
        expect(typeof web?.dark).toBe("string");
        expect(typeof ios?.light).toBe("string");
        expect(typeof ios?.dark).toBe("string");

        checked += 1;
      });
    }

    expect(checked).toBeGreaterThan(0);
  });

  it("applies resolution precedence (platform override > dark appearance > base)", () => {
    const root = JSON.parse(fs.readFileSync(canonicalPath, "utf8")) as JsonRecord;

    const neutralRaised = getAtPath(root, "color.modes.default.surface.raised");
    const neutralResolved = ((neutralRaised.$extensions as JsonRecord).cedar as JsonRecord)
      .resolved as JsonRecord;

    expect(((neutralResolved.ios as JsonRecord).light as string).toLowerCase()).toBe("#edeae3");
    expect(((neutralResolved.ios as JsonRecord).dark as string).toLowerCase()).toBe("#1c1c1c");
    expect(((neutralResolved.web as JsonRecord).light as string).toLowerCase()).toBe("#edeae3");
    expect(((neutralResolved.web as JsonRecord).dark as string).toLowerCase()).toBe("#2e2e2b");

    const linkHover = getAtPath(root, "color.modes.default.text.link-hover");
    const linkHoverResolved = ((linkHover.$extensions as JsonRecord).cedar as JsonRecord)
      .resolved as JsonRecord;

    expect(((linkHoverResolved.ios as JsonRecord).light as string).toLowerCase()).toBe("#0a84ff");
    expect(((linkHoverResolved.ios as JsonRecord).dark as string).toLowerCase()).toBe("#0040dd");
    expect(((linkHoverResolved.web as JsonRecord).light as string).toLowerCase()).toBe("#406eb5");
    expect(((linkHoverResolved.web as JsonRecord).dark as string).toLowerCase()).toBe("#0b2d60");
  });
});
