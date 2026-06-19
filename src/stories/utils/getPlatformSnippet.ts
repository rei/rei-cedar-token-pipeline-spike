import type { CedarToken } from "../../tokens/token.types.js";
import type { Platform } from "../../storybook/platform-mode-context.js";
import { toCamelCase, toCamelCaseNoPrefix } from "./tokenNameHelpers.js";

export function getPlatformSnippet(token: CedarToken, platform: Platform): string {
  switch (platform) {
    case "ios":
      // iOS SPM: Swift extension-based access (modern approach)
      const iosCamel = token.name.charAt(0).toUpperCase() + token.name.slice(1);
      return `Color.cdr${iosCamel}`;
    case "android":
      // Android Compose: Object-based access (modern approach)
      const androidCamel = token.name
        .split('_')
        .map((part: string, i: number) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      return `CedarColors.${androidCamel}`;
    default:
      return `var(--${token.name})`;
  }
}

export function getPlatformLanguage(platform: Platform): string {
  const languages: Record<Platform, string> = { web: "css", ios: "swift", android: "kotlin" };
  return languages[platform] ?? "css";
}

export function getPlatformBadge(platform: Platform): string {
  const badges: Record<Platform, string> = { web: "CSS", ios: "Swift", android: "Kotlin" };
  return badges[platform] ?? "CSS";
}
