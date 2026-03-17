/**
 * ios-color-transform.ts
 *
 * NOTE: This transform is not registered or used in the current pipeline.
 * Resolution of option token references → P3 color components is handled
 * entirely by ios-color-action.ts, which has access to dictionary.tokens
 * and can resolve the full platform override + appearance chain.
 *
 * Value transforms in SD v5 don't have reliable dictionary access and
 * don't run before actions when files: [] is set, making them unsuitable
 * for this resolution pattern.
 *
 * This file is retained as a reference for if/when a file-based Swift
 * output (e.g. ColorTokens.swift) is added that requires a value transform.
 */

export {};
