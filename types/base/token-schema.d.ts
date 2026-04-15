/* This file is auto-generated from src/schema/token-schema.json. Do not edit manually. */

/**
 * Supported Cedar token types.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "TokenType".
 */
export type TokenType = "color" | "number" | "string" | "boolean" | "fluid";
/**
 * Primitive token value.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "TokenValue".
 */
export type TokenValue = string | number | boolean;
/**
 * A leaf design token.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "Token".
 */
export type Token = TokenAttributes;
/**
 * A token leaf or recursive token group.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "TokenNode".
 */
export type TokenNode = Token | TokenGroup;

/**
 * Authoritative schema defining token structure, validation, and Figma Input Contract (ADR-0003). Single source of truth for design-to-engineering token governance.
 */
export interface CedarTokenSchema {
  [k: string]: TokenNode;
}
/**
 * Figma Input Contract (ADR-0003) — maps Figma collection paths to canonical token paths. Single source of truth for design-to-engineering boundary.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "InputsContract".
 */
export interface InputsContract {
  /**
   * Figma-to-canonical mapping for variable collections
   */
  figma: {
    collections: {
      [k: string]: {
        /**
         * Root canonical path prefix for all tokens in this collection (e.g., 'color.option.neutral')
         */
        canonicalPrefix: string;
        /**
         * Explicit map of Figma token path → canonical sub-path. Example: { 'warm-grey.100': 'warm.grey.100' }
         */
        tokens: {
          [k: string]: string;
        };
        [k: string]: unknown;
      };
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Optional Figma-specific token metadata.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "FigmaTokenExtension".
 */
export interface FigmaTokenExtension {
  hiddenFromPublishing?: boolean;
  scopes?: string[];
  codeSyntax?: {
    [k: string]: string;
  };
}
/**
 * Optional documentation metadata extracted from Figma or Cedar governance. Field names match the TokenDocumentation TypeScript interface.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "DocMetadata".
 */
export interface DocMetadata {
  /**
   * Brief description of the token's purpose. Extracted from Figma variable description.
   */
  summary?: string;
  /**
   * Design rationale for this token (future use).
   */
  design?: string;
  /**
   * Guidance on when and how to use this token (future use).
   */
  usage?: string;
  /**
   * Related token names (future use).
   */
  aliases?: string[];
  [k: string]: unknown;
}
/**
 * Cedar-specific token metadata including documentation, platform governance, and semantic mapping.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "CedarTokenExtension".
 */
export interface CedarTokenExtension {
  docs?: DocMetadata;
  /**
   * Appearance overrides (e.g., dark mode) for option tokens
   */
  appearances?: {
    [k: string]: string;
  };
  /**
   * Platform-specific value overrides for option tokens
   */
  platformOverrides?: {
    [k: string]: {
      [k: string]: unknown;
    };
  };
  [k: string]: unknown;
}
/**
 * Optional extension namespaces for a token.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "TokenExtensions".
 */
export interface TokenExtensions {
  "com.figma"?: FigmaTokenExtension;
  cedar?: CedarTokenExtension;
  [k: string]: unknown;
}
/**
 * Core properties shared by all tokens.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "TokenAttributes".
 */
export interface TokenAttributes {
  $type: TokenType;
  $value: TokenValue;
  $description?: string;
  $extensions?: TokenExtensions;
}
/**
 * A recursive token group containing child groups or leaf tokens.
 *
 * This interface was referenced by `CedarTokenSchema`'s JSON-Schema
 * via the `definition` "TokenGroup".
 */
export interface TokenGroup {
  [k: string]: TokenNode;
}
