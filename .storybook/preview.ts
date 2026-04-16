import type { DecoratorFunction, Preview } from "@storybook/html";
import {
  DEFAULT_MODE,
  DEFAULT_PLATFORM,
  attachPlatformModeContext,
  installPlatformModeUrlSync,
  parsePlatformModeFromUrl,
  setPlatformModeInUrl,
} from "../src/storybook/platform-mode-context.ts";

const defaultPlatformMode = parsePlatformModeFromUrl();

const platformModeDecorator: DecoratorFunction = (Story, context) => {
  const platform = (context.globals?.platform as string) ?? defaultPlatformMode.platform;
  const mode = (context.globals?.mode as string) ?? defaultPlatformMode.mode;

  const current = {
    platform: platform === "ios" ? "ios" : DEFAULT_PLATFORM,
    mode: mode === "dark" ? "dark" : DEFAULT_MODE,
  };

  attachPlatformModeContext(current);
  setPlatformModeInUrl(current);
  installPlatformModeUrlSync();

  const story = Story();
  if (story instanceof HTMLElement) {
    story.dataset.platform = current.platform;
    story.dataset.mode = current.mode;
  }

  return story;
};

const preview: Preview = {
  globals: {
    platform: defaultPlatformMode.platform,
    mode: defaultPlatformMode.mode,
  },
  globalTypes: {
    platform: {
      name: "Platform",
      description: "Select the target platform for Storybook token previews",
      defaultValue: defaultPlatformMode.platform,
      toolbar: {
        icon: "box",
        items: [
          { value: "web", title: "Web" },
          { value: "ios", title: "iOS" },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      name: "Mode",
      description: "Select the display mode for Storybook previews",
      defaultValue: defaultPlatformMode.mode,
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [platformModeDecorator],
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#2e2e2b" },
      ],
    },
  },
};

export default preview;
