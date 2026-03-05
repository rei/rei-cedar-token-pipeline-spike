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
import type StyleDictionary from "style-dictionary";
export declare const PLATFORM_VALUE_TRANSFORM_NAME: "platformValue";
export declare const platformValueTransform: Parameters<typeof StyleDictionary.registerTransform>[0];
