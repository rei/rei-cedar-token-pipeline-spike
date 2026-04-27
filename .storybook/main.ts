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
    {
      from: path.resolve(__dirname, "../canonical"),
      to: "/canonical",
    },
      {
        from: path.resolve(__dirname, "../metadata"),
        to: "/metadata",
      },
      {
      from: path.resolve(__dirname, "../dist/themes/rei-dot-com/meta"),
      to: "/meta",
    },
    {
      from: path.resolve(__dirname, "../dist/types"),
      to: "/types",
    },
  ],
  // Allow overriding Vite's base path at build time via STORYBOOK_BASE_URL.
  // This is needed when deploying to a GH Pages sub-path, e.g.:
  //   STORYBOOK_BASE_URL=/rei-cedar-token-pipeline-spike/pr/update-tokens/
  viteFinal: async (config) => {
    if (process.env.STORYBOOK_BASE_URL) {
      config.base = process.env.STORYBOOK_BASE_URL;
    }
    return config;
  },
};

export default config;
