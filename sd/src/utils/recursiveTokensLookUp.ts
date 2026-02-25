import type {
  CanonicalTokenGroup,
  CanonicalColorToken,
} from "../types/canonical-token.js";

export function recursiveTokensLookUp(
  tokensData: CanonicalTokenGroup,
  aliasTokens?: boolean
): CanonicalTokenGroup {
  let recursiveObject: CanonicalTokenGroup = {};
  const currentKeys = Object.keys(tokensData);

  for (const key of currentKeys) {
    const currentObject: CanonicalTokenGroup | CanonicalColorToken =
      tokensData[key];

    if (
      currentObject &&
      typeof currentObject === "object" &&
      "$value" in currentObject
    ) {
      const { $value, $type } = currentObject as CanonicalColorToken;

      recursiveObject[key] = aliasTokens
        ? {
            $value: $value.replace(/\{/g, "{color."),
            $type,
          }
        : {
            $value,
            $type,
          };
    } else {
      recursiveObject[key] = {
        ...recursiveTokensLookUp(currentObject, aliasTokens),
      } as CanonicalTokenGroup;
    }
  }

  return recursiveObject;
}
