/// <reference path="../../style-dictionary/types/culori.d.ts" />

import { converter, parse } from "culori";

type OklchColor = {
  l?: number;
  c?: number;
  h?: number;
  alpha?: number;
};

const toOklch = converter("oklch");

function formatNumber(value: number, precision: number): string {
  const rounded = Number(value.toFixed(precision));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

export function toWebOklch(value: string): string {
  if (!isHexColor(value)) return value;

  const parsed = parse(value);
  const oklch = parsed ? (toOklch(parsed) as OklchColor | undefined) : undefined;

  if (!oklch || typeof oklch.l !== "number" || typeof oklch.c !== "number") {
    return value;
  }

  const lightness = formatNumber(Math.min(100, Math.max(0, oklch.l * 100)), 3);
  const chroma = formatNumber(Math.max(0, oklch.c), 4);
  const hue =
    typeof oklch.h === "number" && Number.isFinite(oklch.h)
      ? formatNumber(((oklch.h % 360) + 360) % 360, 2)
      : "0";
  const alpha =
    typeof oklch.alpha === "number" && oklch.alpha < 1
      ? ` / ${formatNumber(Math.min(1, Math.max(0, oklch.alpha)), 3)}`
      : "";

  return `oklch(${lightness}% ${chroma} ${hue}${alpha})`;
}
