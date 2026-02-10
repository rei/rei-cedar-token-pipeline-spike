import { RGB, RGBA } from "@figma/rest-api-spec";

/**
 * Formats a message with green ANSI color codes for terminal output.
 *
 * @param msg - The message to format
 * @returns The message wrapped in ANSI green color codes
 */
export function green(msg: string) {
  return `\x1b[32m${msg}\x1b[0m`;
}

/**
 * Converts RGB or RGBA color values to hexadecimal color string.
 *
 * @param color - RGB or RGBA color object with values between 0 and 1
 * @returns Hexadecimal color string (e.g., '#ff5500' or '#ff5500aa' with alpha)
 */
export function rgbToHex({ r, g, b, ...rest }: RGB | RGBA) {
  const a = "a" in rest ? rest.a : 1;

  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}` + (a !== 1 ? toHex(a) : "");
}
