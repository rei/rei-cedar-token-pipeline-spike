function splitTokenName(name: string): string[] {
  return String(name || "")
    .trim()
    .replace(/^--/, "")
    .split("-")
    .filter(Boolean);
}

function toCamel(parts: string[]): string {
  if (parts.length === 0) return "";
  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

export function toCamelCase(tokenName: string): string {
  return toCamel(splitTokenName(tokenName));
}

export function toCamelCaseNoPrefix(tokenName: string): string {
  const parts = splitTokenName(tokenName);
  const trimmed = parts.length > 2 && parts[0] === "cdr" ? parts.slice(2) : parts;
  return toCamel(trimmed);
}
