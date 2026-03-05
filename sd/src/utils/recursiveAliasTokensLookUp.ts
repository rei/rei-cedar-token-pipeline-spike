import type {
  CanonicalColorToken,
  CanonicalTokenGroup,
} from "../types/canonical-token.js";

export function recursiveAliasTokensLookUp(
  tokensData: CanonicalTokenGroup
): CanonicalTokenGroup {
  let recursiveObject: CanonicalTokenGroup = {};
  const currentKeys = Object.keys(tokensData);

  for (const key of currentKeys) {
    const currentObject = tokensData[key];

    if (
      currentObject &&
      typeof currentObject === "object" &&
      "$value" in currentObject
    ) {
      const { $value, $type } = currentObject as CanonicalColorToken;

      recursiveObject[key] = {
        $value: $value.replace(/\{/g, "{color."),
        $type,
      };
    } else {
      recursiveObject[key] = {
        ...recursiveAliasTokensLookUp(currentObject),
      } as CanonicalTokenGroup;
    }
  }

  return recursiveObject;
}
