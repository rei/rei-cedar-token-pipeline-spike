import type { Preview } from "@storybook/html";

const preview: Preview = {
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
