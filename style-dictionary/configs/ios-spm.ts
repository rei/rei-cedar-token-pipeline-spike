import type { Config, TransformedToken } from "style-dictionary";

import "../transforms/ios/ios-spacing-static-transform.js";
import "../formats/ios/ios-spacing-static-format.js";

import "../transforms/ios/ios-name-transform.js";
import "../formats/ios/ios-colorset.js";
import "../actions/ios/ios-color-action.js";
import "../formats/ios/ios-extension-swift.js";

export const iosSpmConfig: Config = {
  source: ["canonical/tokens.json"],
  log: { verbosity: "verbose" },
  platforms: {
    "ios-spm": {
      transforms: [
        "attribute/cti",
        "name/ios-camel",
        "value/ios/spacing-static-only",
      ],
      transformGroup: 'cedar/ios',
      buildPath: "dist/themes/rei-dot-com/ios-spm/",
      actions: ["ios-colorset"],
      files: [
        {
          destination: "CdrSpacing.swift",
          format: "swift/spacing-static-struct",
          filter: (token: TransformedToken) =>
            token.path[0] === "spacing" &&
            (token.path[1] === "component" || token.path[1] === "layout"),
        },
        {
          destination: "CdrColorExtensions.swift",
          format: "swift/extension-color",
          filter: (token: TransformedToken) =>
            token.path[0] === "color" &&
            token.path[1] === "modes" &&
            token.path[2] === "default" &&
            token.$type === "color",
        },
      ],
    },
  },
};
