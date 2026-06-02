export function recursiveAliasTokensLookUp(tokensData) {
    let recursiveObject = {};
    const currentKeys = Object.keys(tokensData);
    for (const key of currentKeys) {
        const currentObject = tokensData[key];
        if (currentObject &&
            typeof currentObject === "object" &&
            "$value" in currentObject) {
            const { $value, $type } = currentObject;
            recursiveObject[key] = {
                $value: $value.replace(/\{/g, "{color."),
                $type,
            };
        }
        else {
            recursiveObject[key] = {
                ...recursiveAliasTokensLookUp(currentObject),
            };
        }
    }
    return recursiveObject;
}
