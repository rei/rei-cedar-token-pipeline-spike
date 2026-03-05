import type {
  CanonicalTokenGroup,
  CanonicalColorToken,
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
      const { $value: webValue, $type } =
        currentWebObject as CanonicalColorToken;
      const { $value: iOsValue } = (currentIOsObject as CanonicalColorToken) || {};

      // AC: Required Field - Fail if web value is missing entirely
      if (webValue === undefined || webValue === null || webValue === "") {
        throw new Error(
          `Validation Failed: Token "${currentPath}" is missing required "web" value. Workflow halted.`
        );
      }

      // AC: Hex Validation - Must be 6-9 digit hex
      if (!hexRegex.test(webValue.trim())) {
        throw new Error(
          `Validation Failed: Token "${currentPath}" has invalid web value "${webValue}". Expected 6-9 digit hex (e.g., "#406EB5" or "#406EB5FF"). Workflow halted.`
        );
      }

      const finalIosValue = iOsValue && iOsValue !== "" ? iOsValue : webValue;

      // AC: Validate iOS value if provided (must be 6-9 digit hex)
      if (finalIosValue && !hexRegex.test(finalIosValue.trim())) {
        throw new Error(
          `Validation Failed: Token "${currentPath}" has invalid iOS value "${finalIosValue}". Expected 6-9 digit hex (e.g., "#406EB5" or "#406EB5FF"). Workflow halted.`
        );
      }

      recursiveObject[key] = {
        $value: {
          web: webValue,
          ios: finalIosValue,
        },
        $type,
      };
    } else {
      recursiveObject[key] = {
        ...recursiveJoinTokens(
          currentWebObject,
          currentIOsObject as CanonicalTokenGroup,
          currentPath
        ),
      } as CanonicalTokenGroup;
    }
  }

  return recursiveObject;
}
