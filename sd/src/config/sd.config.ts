import type { Config } from "style-dictionary";
import StyleDictionary from "style-dictionary";

StyleDictionary.registerTransform({
  name: "platformValue",
  type: "value",
  filter: () => true,
  transform: function (token: { $value?: unknown; value?: unknown }): string {
    const value = (token as Record<string, unknown>)["$value"] ?? token.value;
    if (typeof value === "object" && value !== null && "web" in value) {
      return (value as { web: string }).web;
    }
    if (typeof value === "string") {
      return value;
    }
    return String(value);
  },
});

const config: Config = {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      transforms: ["platformValue"],
      buildPath: "dist/css/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },
  },
};

export default config;
