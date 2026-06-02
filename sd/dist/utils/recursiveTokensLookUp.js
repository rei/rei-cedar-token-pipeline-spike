export function recursiveTokensLookUp(tokensData, colorTokens) {
    let recursiveObject = {};
    const currentKeys = Object.keys(tokensData);
    for (const key of currentKeys) {
        const currentObject = tokensData[key];
        if (currentObject &&
            typeof currentObject === "object" &&
            "$value" in currentObject) {
            if (colorTokens) {
                const hexRegex = /^#([A-Fa-f0-9]{6})$/;
                const { $value, $type } = currentObject;
                // if (!hexRegex.test($value.trim()))
                //   throw new Error(
                //     `Undefined or invalid hex code lenght. Token value: ${$value}`
                //   );
                recursiveObject[key] = {
                    $value: {
                        ...{
                            web: $value,
                            ios: $value,
                        },
                    },
                    $type,
                };
            }
            else {
                const { $value, $type } = currentObject;
                recursiveObject[key] = {
                    $value: $value.replace(/\{/g, "{color."),
                    $type,
                };
            }
        }
        else {
            recursiveObject[key] = {
                ...recursiveTokensLookUp(currentObject, colorTokens),
            };
        }
    }
    return recursiveObject;
}
