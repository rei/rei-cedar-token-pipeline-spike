import type {
  CanonicalToken,
  CanonicalTokenGroup,
} from "../types/canonical-token.js";

export function recursiveJoinTokens(
  webTokensData: CanonicalTokenGroup,
  iosTokensData: CanonicalTokenGroup,
  path = ""
) {
  let recursiveObject: CanonicalTokenGroup = {};
  const currentKeys = Object.keys(webTokensData);

  for (const key of currentKeys) {
    const currentWebObject = webTokensData[key];
    const currentIOsObject = iosTokensData[key];
    const currentPath = path ? `${path}.${key}` : key;

    if (
      currentWebObject &&
      typeof currentWebObject === "object" &&
      "$value" in currentWebObject
    ) {
      const hexRegex = /^#([A-Fa-f0-9]{6,9})$/;
      const { $value: webValue, $type } = currentWebObject as CanonicalToken;
      const { $value: iOsValue } = (currentIOsObject as CanonicalToken) || {};

      const webStr = String(webValue);
      const iosStr = iOsValue !== undefined && iOsValue !== null && String(iOsValue) !== ""
        ? String(iOsValue)
        : webStr;

      // AC: Required Field - Fail if web value is missing entirely
      if (webValue === undefined || webValue === null || webStr === "") {
        throw new Error(
          `Validation Failed: Token "${currentPath}" is missing required "web" value. Workflow halted.`
        );
      }

      // AC: Hex Validation - Must be 6-9 digit hex
      if (!hexRegex.test(webStr.trim())) {
        throw new Error(
          `Validation Failed: Token "${currentPath}" has invalid web value "${webStr}". Expected 6-9 digit hex (e.g., "#406EB5" or "#406EB5FF"). Workflow halted.`
        );
      }

      // AC: Validate iOS value if provided (must be 6-9 digit hex)
      if (iosStr && !hexRegex.test(iosStr.trim())) {
        throw new Error(
          `Validation Failed: Token "${currentPath}" has invalid iOS value "${iosStr}". Expected 6-9 digit hex (e.g., "#406EB5" or "#406EB5FF"). Workflow halted.`
        );
      }

      recursiveObject[key] = {
        $value: {
          web: webStr,
          ios: iosStr,
        },
        $type,
      };
    } else {
      recursiveObject[key] = {
        ...recursiveJoinTokens(
          currentWebObject as CanonicalTokenGroup,
          currentIOsObject as CanonicalTokenGroup,
          currentPath
        ),
      } as CanonicalTokenGroup;
    }
  }

  return recursiveObject;
}
