import type { Config } from "style-dictionary";
import StyleDictionary from "style-dictionary";
import {
  platformValueTransform,
  PLATFORM_VALUE_TRANSFORM_NAME,
} from "./platform-value-transform.js";

StyleDictionary.registerTransform(platformValueTransform);

const config: Config = {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      transforms: [PLATFORM_VALUE_TRANSFORM_NAME],
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
