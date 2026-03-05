/**
 * platform-value-transform.ts
 *
 * Style Dictionary v5 custom transform that extracts the web value from a
 * platform-aware token whose $value is { web: string; ios: string }.
 *
 * For tokens whose $value is already a plain string (alias tokens, spacing,
 * typography, etc.) the value is passed through unchanged.
 *
 * Registration is handled by the caller (sd.config.ts) so that this module
 * stays pure and can be tested in isolation if needed.
 */
export const PLATFORM_VALUE_TRANSFORM_NAME = "platformValue";
export const platformValueTransform = {
    name: PLATFORM_VALUE_TRANSFORM_NAME,
    type: "value",
    filter: () => true,
    transform(token) {
        const value = token["$value"] ?? token.value;
        if (typeof value === "object" && value !== null && "web" in value) {
            return value.web;
        }
        if (typeof value === "string") {
            return value;
        }
        return String(value);
    },
};
