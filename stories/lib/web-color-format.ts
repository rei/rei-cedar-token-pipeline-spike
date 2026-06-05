/// <reference path="../../style-dictionary/types/culori.d.ts" />

import { hexToCustomOklch } from "../../style-dictionary/actions/web/oklch-formulas";

export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

export function toWebOklch(value: string): string {
  if (!isHexColor(value)) return value;
  return hexToCustomOklch(value);
}
