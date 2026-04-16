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
    platform: platform === "ios" || platform === "android" ? platform : DEFAULT_PLATFORM,
    mode: mode === "dark" ? "dark" : DEFAULT_MODE,
  };

  attachPlatformModeContext(current);
  setPlatformModeInUrl(current);
  installPlatformModeUrlSync();

  const story = Story();
  const wrapper = document.createElement("div");
  wrapper.className = "cdr-token-story-root";
  wrapper.dataset.platform = current.platform;
  wrapper.dataset.mode = current.mode;

  if (story instanceof HTMLElement) {
    wrapper.appendChild(story);
  } else if (typeof story === "string") {
    wrapper.innerHTML = story;
  }

  return wrapper;
};

const preview: Preview = {
  globals: {
    platform: defaultPlatformMode.platform,
    mode: defaultPlatformMode.mode,
  },
  globalTypes: {
    platform: {
      name: "Platform",
      description: "Target platform for token code examples",
      defaultValue: defaultPlatformMode.platform,
      toolbar: {
        icon: "browser",
        items: [
          { value: "web", title: "Web", icon: "browser" },
          { value: "ios", title: "iOS", icon: "apple" },
          { value: "android", title: "Android", icon: "mobile" },
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
    options: {
      storySort: {
        order: [
          "Introduction",
          "Foundations",
          "Tokens",
          ["Color", "Space", "Typography", "Elevation", "Motion"],
          "Components",
        ],
      },
    },
    controls: { expanded: true },
    backgrounds: { disable: true },
  },
};

export default preview;
