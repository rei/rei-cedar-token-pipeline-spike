import * as culori from "culori";

export const FAMILY_PARAMETER_HEADERS = [
  "family",
  "hue",
  "cmax",
  "lo",
  "wlight",
  "clight_min",
  "wdark",
  "cdark_min",
  "lmin",
  "lmax",
  "source_node",
  "notes",
] as const;

export const COLOR_REFERENCE_HEADERS = [
  "family",
  "step",
  "appearance",
  "token_name",
  "design_hex",
  "design_oklch_l",
  "design_oklch_c",
  "design_oklch_h",
  "design_oklch_alpha",
  "ios_reference_status",
  "ios_p3_r",
  "ios_p3_g",
  "ios_p3_b",
  "ios_p3_alpha",
  "android_reference_status",
  "android_strategy",
  "android_color_space",
  "android_hex",
  "android_r",
  "android_g",
  "android_b",
  "android_alpha",
  "figma_node_or_variable",
  "notes",
] as const;

export type CsvRecord = Record<string, string>;

export type ColorFamilyParameter = {
  family: string;
  hue: string;
  cmax: string;
  lo: string;
  wlight: string;
  clight_min: string;
  wdark: string;
  cdark_min: string;
  lmin: string;
  lmax: string;
  source_node: string;
  notes: string;
};

export type ColorReference = {
  family: string;
  step: string;
  appearance: string;
  token_name: string;
  design_hex: string;
  design_oklch_l: string;
  design_oklch_c: string;
  design_oklch_h: string;
  design_oklch_alpha: string;
  ios_reference_status: string;
  ios_p3_r: string;
  ios_p3_g: string;
  ios_p3_b: string;
  ios_p3_alpha: string;
  android_reference_status: string;
  android_strategy: string;
  android_color_space: string;
  android_hex: string;
  android_r: string;
  android_g: string;
  android_b: string;
  android_alpha: string;
  figma_node_or_variable: string;
  notes: string;
};

export const FAMILY_ALIASES: Record<string, string> = {
  lichen: "highlight-lichen",
  "apex-moss": "appex-moss",
  "sale-red": "new-sale-red",
};

const NUMERIC_PARAMETER_FIELDS = [
  "hue",
  "cmax",
  "lo",
  "wlight",
  "clight_min",
  "wdark",
  "cdark_min",
  "lmin",
  "lmax",
] as const;

const NUMERIC_REFERENCE_FIELDS = [
  "design_oklch_l",
  "design_oklch_c",
  "design_oklch_h",
  "design_oklch_alpha",
  "ios_p3_r",
  "ios_p3_g",
  "ios_p3_b",
  "ios_p3_alpha",
  "android_r",
  "android_g",
  "android_b",
  "android_alpha",
] as const;

const HEX_RE = /^#[\da-f]{6}(?:[\da-f]{2})?$/i;
const STATUS_VALUES = new Set(["provided", "not-provided", "not-applicable"]);

export const COLOR_VALIDATION_TOLERANCES = {
  web: 1,
  ios: 0.5,
  android: 1,
} as const;
const ANDROID_STRATEGIES = new Set(["srgb", "p3"]);
const ANDROID_COLOR_SPACES = new Set(["srgb", "display-p3"]);

function normalizeNumber(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return trimmed;
  return Object.is(parsed, -0) ? "0" : String(parsed);
}

function normalizeStep(value: string): string {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) ? trimmed.padStart(3, "0") : trimmed;
}

export function canonicalFamilyName(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");
  return FAMILY_ALIASES[normalized] ?? normalized;
}

function normalizeHex(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeStatus(value: string, referenceFields: string[], row: CsvRecord): string {
  const normalized = value.trim().toLowerCase();
  if (normalized) return normalized;

  return referenceFields.some((field) => row[field]?.trim()) ? "provided" : "not-provided";
}

function normalizeNotes(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function createRecord(headers: readonly string[], values: string[]): CsvRecord {
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    field += character;
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted field.");

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  return rows;
}

export function parseCsvRecords(
  text: string,
  headers: readonly string[],
  sourceName: string,
): CsvRecord[] {
  const rows = parseCsv(text);
  const actualHeaders = rows.shift() ?? [];

  if (
    actualHeaders.length !== headers.length ||
    actualHeaders.some((value, index) => value !== headers[index])
  ) {
    throw new Error(
      `${sourceName} has an unexpected header. Expected ${headers.join(",")}; got ${actualHeaders.join(",")}.`,
    );
  }

  return rows.map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(
        `${sourceName} row ${index + 2} has ${values.length} columns; expected ${headers.length}.`,
      );
    }
    return createRecord(
      headers,
      values.map((value) => value.trim()),
    );
  });
}

export function normalizeFamilyParameters(records: CsvRecord[]): ColorFamilyParameter[] {
  return records.map((record) => {
    const normalized = { ...record } as ColorFamilyParameter;
    normalized.family = canonicalFamilyName(record.family);
    normalized.source_node = record.source_node.trim();
    normalized.notes = normalizeNotes(record.notes);

    for (const field of NUMERIC_PARAMETER_FIELDS) {
      normalized[field] = normalizeNumber(record[field]);
    }

    if (normalized.family === "greyscale") {
      normalized.lo = "";
      normalized.wlight = "";
      normalized.clight_min = "";
      normalized.wdark = "";
      normalized.cdark_min = "";
      normalized.lmin = "";
      normalized.lmax = "";
    }

    return normalized;
  });
}

export function normalizeColorReferences(records: CsvRecord[]): ColorReference[] {
  return records.map((record) => {
    const family = canonicalFamilyName(record.family);
    const step = normalizeStep(record.step);
    const tokenName = `${family}-${step}`;
    const normalized = { ...record } as ColorReference;

    normalized.family = family;
    normalized.step = step;
    normalized.appearance = record.appearance.trim().toLowerCase() || "default";
    normalized.token_name = tokenName;
    normalized.design_hex = normalizeHex(record.design_hex);
    normalized.ios_reference_status = normalizeStatus(
      record.ios_reference_status,
      ["ios_p3_r", "ios_p3_g", "ios_p3_b", "ios_p3_alpha"],
      record,
    );
    normalized.android_reference_status = normalizeStatus(
      record.android_reference_status,
      ["android_hex", "android_r", "android_g", "android_b", "android_alpha"],
      record,
    );
    normalized.android_strategy = record.android_strategy.trim().toLowerCase();
    normalized.android_color_space = record.android_color_space.trim().toLowerCase();
    normalized.android_hex = normalizeHex(record.android_hex);
    normalized.figma_node_or_variable = record.figma_node_or_variable.trim();
    normalized.notes = normalizeNotes(record.notes);

    for (const field of NUMERIC_REFERENCE_FIELDS) {
      normalized[field] = normalizeNumber(record[field]);
    }

    return normalized;
  });
}

function isNumber(value: string): boolean {
  return value !== "" && Number.isFinite(Number(value));
}

function checkRange(
  issues: string[],
  rowLabel: string,
  field: string,
  value: string,
  min: number,
  max: number,
): void {
  if (!isNumber(value)) {
    issues.push(`${rowLabel}: ${field} must be a finite number.`);
    return;
  }

  const numericValue = Number(value);
  if (numericValue < min || numericValue > max) {
    issues.push(`${rowLabel}: ${field}=${value} must be between ${min} and ${max}.`);
  }
}

function checkOptionalRange(
  issues: string[],
  rowLabel: string,
  field: string,
  value: string,
  min: number,
  max: number,
): void {
  if (value !== "") checkRange(issues, rowLabel, field, value, min, max);
}

function checkReferenceStatus(
  issues: string[],
  rowLabel: string,
  status: string,
  fields: string[],
): void {
  if (!STATUS_VALUES.has(status)) {
    issues.push(`${rowLabel}: unsupported reference status "${status}".`);
    return;
  }

  const provided = fields.filter((field) => field !== "").length;
  if (status === "provided" && provided !== fields.length) {
    issues.push(`${rowLabel}: provided reference must include all platform values.`);
  }
  if (status !== "provided" && provided > 0) {
    issues.push(`${rowLabel}: ${status} reference must not include platform values.`);
  }
}

export function validateColorReferenceData(
  parameters: ColorFamilyParameter[],
  references: ColorReference[],
): string[] {
  const issues: string[] = [];
  const parameterFamilies = new Set<string>();
  const referenceKeys = new Set<string>();

  for (const row of parameters) {
    const rowLabel = `parameters ${row.family}`;
    if (parameterFamilies.has(row.family)) {
      issues.push(`${rowLabel}: duplicate family.`);
    }
    parameterFamilies.add(row.family);

    checkRange(issues, rowLabel, "hue", row.hue, 0, 360);
    checkOptionalRange(issues, rowLabel, "cmax", row.cmax, 0, 1);
    checkOptionalRange(issues, rowLabel, "lo", row.lo, 0, 1);
    checkOptionalRange(issues, rowLabel, "wlight", row.wlight, 0, 10);
    checkOptionalRange(issues, rowLabel, "clight_min", row.clight_min, 0, 1);
    checkOptionalRange(issues, rowLabel, "wdark", row.wdark, 0, 10);
    checkOptionalRange(issues, rowLabel, "cdark_min", row.cdark_min, 0, 1);
    checkOptionalRange(issues, rowLabel, "lmin", row.lmin, 0, 1);
    checkOptionalRange(issues, rowLabel, "lmax", row.lmax, 0, 1);
  }

  for (const row of references) {
    const rowLabel = `${row.family}/${row.step}/${row.appearance}`;
    const key = `${row.family}/${row.step}/${row.appearance}`;
    if (referenceKeys.has(key)) issues.push(`${rowLabel}: duplicate reference row.`);
    referenceKeys.add(key);

    if (!row.family) issues.push(`${rowLabel}: family is required.`);
    if (!/^\d+$/.test(row.step)) issues.push(`${rowLabel}: step must be numeric.`);
    if (!row.token_name) issues.push(`${rowLabel}: token_name is required.`);
    if (row.token_name !== `${row.family}-${row.step}`) {
      issues.push(`${rowLabel}: token_name must be ${row.family}-${row.step}.`);
    }
    if (!HEX_RE.test(row.design_hex)) {
      issues.push(
        `${rowLabel}: design_hex=${row.design_hex || "<empty>"} is not #RRGGBB or #RRGGBBAA.`,
      );
    }

    checkRange(issues, rowLabel, "design_oklch_l", row.design_oklch_l, 0, 1);
    checkRange(issues, rowLabel, "design_oklch_c", row.design_oklch_c, 0, 1);
    checkRange(issues, rowLabel, "design_oklch_h", row.design_oklch_h, 0, 360);
    checkRange(issues, rowLabel, "design_oklch_alpha", row.design_oklch_alpha, 0, 1);

    checkReferenceStatus(issues, rowLabel, row.ios_reference_status, [
      row.ios_p3_r,
      row.ios_p3_g,
      row.ios_p3_b,
      row.ios_p3_alpha,
    ]);
    checkOptionalRange(issues, rowLabel, "ios_p3_r", row.ios_p3_r, 0, 1);
    checkOptionalRange(issues, rowLabel, "ios_p3_g", row.ios_p3_g, 0, 1);
    checkOptionalRange(issues, rowLabel, "ios_p3_b", row.ios_p3_b, 0, 1);
    checkOptionalRange(issues, rowLabel, "ios_p3_alpha", row.ios_p3_alpha, 0, 1);

    checkReferenceStatus(issues, rowLabel, row.android_reference_status, [
      row.android_hex,
      row.android_r,
      row.android_g,
      row.android_b,
      row.android_alpha,
    ]);
    if (row.android_reference_status === "provided") {
      if (!ANDROID_STRATEGIES.has(row.android_strategy)) {
        issues.push(`${rowLabel}: unsupported Android strategy "${row.android_strategy}".`);
      }
      if (!ANDROID_COLOR_SPACES.has(row.android_color_space)) {
        issues.push(`${rowLabel}: unsupported Android color space "${row.android_color_space}".`);
      }
      if (row.android_strategy === "srgb" && !HEX_RE.test(row.android_hex)) {
        issues.push(`${rowLabel}: Android sRGB reference requires a valid android_hex.`);
      }
      if (row.android_strategy === "p3") {
        for (const [field, value] of [
          ["android_r", row.android_r],
          ["android_g", row.android_g],
          ["android_b", row.android_b],
          ["android_alpha", row.android_alpha],
        ]) {
          checkRange(issues, rowLabel, field, value, 0, 1);
        }
      }
    }
  }

  return issues;
}

export function csvEscape(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function recordsToCsv<T extends Record<string, string>>(
  headers: readonly string[],
  records: T[],
): string {
  return [
    headers.join(","),
    ...records.map((record) => headers.map((header) => csvEscape(record[header] ?? "")).join(",")),
    "",
  ].join("\n");
}

type CuloriDeltaE = {
  differenceCiede2000: () => (left: unknown, right: unknown) => number;
};

export const deltaE = (culori as unknown as CuloriDeltaE).differenceCiede2000();

export type OklchColor = {
  mode: "oklch";
  l: number;
  c: number;
  h: number;
  alpha?: number;
};

export type RgbColor = {
  mode: "rgb" | "p3";
  r: number;
  g: number;
  b: number;
  alpha?: number;
};

export function referenceOklch(row: ColorReference): OklchColor {
  return {
    mode: "oklch",
    l: Number(row.design_oklch_l),
    c: Number(row.design_oklch_c),
    h: Number(row.design_oklch_h),
    alpha: Number(row.design_oklch_alpha),
  };
}

export function parseHexRgb(hex: string): RgbColor | undefined {
  if (!HEX_RE.test(hex)) return undefined;
  const value = hex.slice(1);
  const alpha = value.length === 8 ? Number.parseInt(value.slice(6, 8), 16) / 255 : 1;
  return {
    mode: "rgb",
    r: Number.parseInt(value.slice(0, 2), 16) / 255,
    g: Number.parseInt(value.slice(2, 4), 16) / 255,
    b: Number.parseInt(value.slice(4, 6), 16) / 255,
    alpha,
  };
}
