export interface CanonicalColorToken {
  $value: string;
  $type: string;
}

export interface CanonicalTokenGroup {
  [tokenName: string]: CanonicalColorToken | CanonicalTokenGroup;
}

/** The canonical token root — any number of top-level sections (color, spacing, typography, …) */
export interface CanonicalRoot {
  [section: string]: CanonicalTokenGroup;
}
