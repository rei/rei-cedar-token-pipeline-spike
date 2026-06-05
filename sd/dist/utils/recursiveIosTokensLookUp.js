export function recursiveIosTokensLookUp(currentData, currentCanonicalValues, tokensGroup) {
    let recursiveObject = {};
    const currentKeys = Object.keys(currentData);
    for (const key of currentKeys) {
        const currentObject = currentData[key];
        const currentValues = currentCanonicalValues[tokensGroup ?? key];
        console.log("currentKeys: ", currentKeys, currentValues);
        console.log("currentObject: ", currentObject, "; currentCanonicalValues: ", currentValues, "; tokensGroup: ", tokensGroup);
        if (currentObject &&
            typeof currentObject === "object" &&
            "$value" in currentObject) {
            const hexRegex = /^#([A-Fa-f0-9]{6})$/;
            const { $value, $type } = currentObject;
            // if (hexRegex.test($value.trim()))
            //   throw new Error(`Invalid hex code lenght. Token value: ${$value}`);
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
            recursiveObject[key] = {
                ...recursiveIosTokensLookUp(currentObject, currentCanonicalValues, key),
            };
        }
    }
    return recursiveObject;
}
