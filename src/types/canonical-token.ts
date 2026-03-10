export interface CanonicalToken {
  $value: string | number | boolean;
  $type: string;
}

export interface CanonicalTokenGroup {
  [tokenName: string]: CanonicalToken | CanonicalTokenGroup;
}

/** The canonical token root — any number of top-level sections (color, spacing, typography, …) */
export interface CanonicalRoot {
  [section: string]: CanonicalTokenGroup;
}
