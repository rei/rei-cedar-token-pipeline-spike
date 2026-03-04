import type { StorybookConfig } from "@storybook/html-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|ts)"],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  // Serve dist/normalized/ as /normalized/ so stories can fetch() the JSON
  // files at runtime (both in dev and in the static build).
  staticDirs: [
    {
      from: path.resolve(__dirname, "../dist/normalized"),
      to: "/normalized",
    },
  ],
};

export default config;
