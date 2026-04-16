export type Platform = "web" | "ios" | "android";
export type Mode = "light" | "dark";

export interface PlatformModeContextValue {
  platform: Platform;
  mode: Mode;
}

export const DEFAULT_PLATFORM: Platform = "web";
export const DEFAULT_MODE: Mode = "light";

const STORYBOOK_PLATFORM_MODE_PROPERTY = "__STORYBOOK_PLATFORM_MODE__";

const isPlatform = (value: string | null): value is Platform =>
  value === "web" || value === "ios" || value === "android";
const isMode = (value: string | null): value is Mode => value === "light" || value === "dark";

export function parsePlatformModeFromUrl(
  search = window.location.search,
): PlatformModeContextValue {
  const params = new URLSearchParams(search);
  const platformParam = params.get("platform");
  const modeParam = params.get("mode");

  return {
    platform: isPlatform(platformParam) ? platformParam : DEFAULT_PLATFORM,
    mode: isMode(modeParam) ? modeParam : DEFAULT_MODE,
  };
}

export function getPlatformModeContext(): PlatformModeContextValue {
  const globalValue = (window as unknown as Record<string, unknown>)[
    STORYBOOK_PLATFORM_MODE_PROPERTY
  ];

  if (
    typeof globalValue === "object" &&
    globalValue !== null &&
    isPlatform((globalValue as { platform?: unknown }).platform as string | null) &&
    isMode((globalValue as { mode?: unknown }).mode as string | null)
  ) {
    return globalValue as PlatformModeContextValue;
  }

  return syncPlatformModeFromUrl();
}

export function attachPlatformModeContext(value: PlatformModeContextValue): void {
  (window as unknown as Record<string, unknown>)[STORYBOOK_PLATFORM_MODE_PROPERTY] = value;
  document.documentElement.dataset.storybookPlatform = value.platform;
  document.documentElement.dataset.storybookMode = value.mode;
}

export function setPlatformModeInUrl(value: PlatformModeContextValue): void {
  const params = new URLSearchParams(window.location.search);
  params.set("platform", value.platform);
  params.set("mode", value.mode);
  const newSearch = params.toString();
  const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}${window.location.hash}`;

  window.history.replaceState({}, "", newUrl);
}

export function syncPlatformModeFromUrl(): PlatformModeContextValue {
  const context = parsePlatformModeFromUrl();
  attachPlatformModeContext(context);
  return context;
}

let listenerInstalled = false;
export function installPlatformModeUrlSync(): void {
  if (listenerInstalled) return;
  listenerInstalled = true;

  window.addEventListener("popstate", () => {
    syncPlatformModeFromUrl();
  });
}
