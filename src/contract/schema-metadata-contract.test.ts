import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return (value ?? {}) as JsonRecord;
}

describe("schema metadata contract invariants", () => {
  it("defines governance and semantic metadata under $extensions.cedar", () => {
    const schemaPath = path.resolve(process.cwd(), "src/schema/token-schema.json");
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8")) as JsonRecord;
    const defs = asRecord(schema["$defs"]);

    const cedarExt = asRecord(defs["CedarTokenExtension"]);
    const cedarProps = asRecord(cedarExt["properties"]);

    expect(cedarProps["docs"]).toBeDefined();
    expect(cedarProps["governance"]).toEqual({ $ref: "#/$defs/GovernanceMetadata" });
    expect(cedarProps["semantic"]).toEqual({ $ref: "#/$defs/SemanticMetadata" });

    const governance = asRecord(defs["GovernanceMetadata"]);
    const governanceProps = asRecord(governance["properties"]);

    expect(governanceProps["status"]).toEqual({ $ref: "#/$defs/TokenStatus" });
    expect(governanceProps["usage"]).toBeDefined();
    expect(governanceProps["platformMap"]).toBeDefined();
    expect(governanceProps["accessibility"]).toBeDefined();

    const semantic = asRecord(defs["SemanticMetadata"]);
    const semanticAllOf = (semantic["allOf"] as unknown[]) ?? [];
    expect(semanticAllOf.length).toBeGreaterThanOrEqual(2);

    const semanticBody = asRecord(semanticAllOf[1]);
    const semanticRequired = (semanticBody["required"] as string[]) ?? [];

    expect(semanticRequired).toEqual(
      expect.arrayContaining(["token", "canonicalPath", "value", "type", "status", "stability"]),
    );
  });

  it("keeps token status and stability enums aligned with metadata types", () => {
    const schemaPath = path.resolve(process.cwd(), "src/schema/token-schema.json");
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8")) as JsonRecord;
    const defs = asRecord(schema["$defs"]);

    const tokenStatus = asRecord(defs["TokenStatus"]);
    const tokenStability = asRecord(defs["TokenStability"]);

    expect(tokenStatus["enum"]).toEqual(["stable", "experimental", "deprecated", "unreviewed"]);

    expect(tokenStability["enum"]).toEqual(["stable", "beta", "experimental", "deprecated"]);
  });
});
