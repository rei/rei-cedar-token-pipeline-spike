import type { CedarToken } from "../../tokens/token.types";
import type { Platform } from "../../storybook/platform-mode-context";
import { toCamelCase, toCamelCaseNoPrefix } from "./tokenNameHelpers";

export function getPlatformSnippet(token: CedarToken, platform: Platform): string {
  switch (platform) {
    case "ios":
      return `Color(.${toCamelCase(token.name)})`;
    case "android":
      return `CdrTheme.colors.${toCamelCaseNoPrefix(token.name)}`;
    default:
      return `var(--${token.name})`;
  }
}

export function getPlatformLanguage(platform: Platform): string {
  return { web: "css", ios: "swift", android: "kotlin" }[platform] ?? "css";
}

export function getPlatformBadge(platform: Platform): string {
  return { web: "CSS", ios: "Swift", android: "Kotlin" }[platform] ?? "CSS";
}
