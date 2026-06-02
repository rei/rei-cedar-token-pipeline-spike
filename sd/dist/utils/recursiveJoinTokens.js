export function recursiveJoinTokens(webTokensData, iosTokensData) {
    let recursiveObject = {};
    const currentKeys = Object.keys(webTokensData);
    for (const key of currentKeys) {
        const currentWebObject = webTokensData[key];
        const currentIOsObject = iosTokensData[key];
        if (currentWebObject &&
            typeof currentWebObject === "object" &&
            "$value" in currentWebObject) {
            const hexRegex = /^#([A-Fa-f0-9]{6,9})$/;
            const { $value: webValue, $type } = currentWebObject;
            const { $value: iOsValue } = currentIOsObject;
            if (!hexRegex.test(webValue.trim()) || !hexRegex.test(iOsValue.trim()))
                throw new Error(`Undefined or invalid hex code lenght. Web token value: ${webValue} - iOS token value: ${iOsValue}`);
            recursiveObject[key] = {
                $value: {
                    web: webValue,
                    ios: iOsValue ? iOsValue : webValue,
                },
                $type,
            };
        }
        else {
            recursiveObject[key] = {
                ...recursiveJoinTokens(currentWebObject, currentIOsObject),
            };
        }
    }
    return recursiveObject;
}
