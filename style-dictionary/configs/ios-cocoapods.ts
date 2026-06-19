import type { Config, TransformedToken } from "style-dictionary";

import "../transforms/ios/ios-spacing-static-transform.js";
import "../formats/ios/ios-spacing-static-format.js";

import "../transforms/ios/ios-name-transform.js";
import "../actions/ios/ios-srgb-color-action.js";
import "../formats/ios/ios-enum-swift.js";
import "../formats/ios/ios-objc-header.js";

export const iosCocoapodsConfig: Config = {
  source: ["canonical/tokens.json"],
  log: { verbosity: "verbose" },
  platforms: {
    "ios-cocoapods": {
      transforms: [
        "attribute/cti",
        "name/ios-camel",
        "value/ios/spacing-static-only",
      ],
      transformGroup: 'cedar/ios',
      buildPath: "dist/themes/rei-dot-com/ios-cocoapods/",
      actions: ["ios-srgb-colorset"],
      files: [
        {
          destination: "CdrSpacing.swift",
          format: "swift/spacing-static-struct",
          filter: (token: TransformedToken) =>
            token.path[0] === "spacing" &&
            (token.path[1] === "component" || token.path[1] === "layout"),
        },
        {
          destination: "CdrColor.swift",
          format: "swift/enum-color",
          filter: (token: TransformedToken) =>
            token.path[0] === "color" &&
            token.path[1] === "modes" &&
            token.path[2] === "default" &&
            token.$type === "color",
        },
        {
          destination: "CdrColor.h",
          format: "objc/header-color",
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
