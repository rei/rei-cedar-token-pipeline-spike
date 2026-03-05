export interface CanonicalColorPlatformToken {
  $value: {
    web: string;
    ios: string;
  };
  $type: "color";
}

export interface CanonicalToken {
  $value: string | number | boolean;
  $type: string;
}

export interface CanonicalColorToken {
  $value: string;
  $type: "color";
}

export interface CanonicalTokenGroup {
  [tokenName: string]: CanonicalToken | CanonicalColorPlatformToken | CanonicalColorToken | CanonicalTokenGroup;
}

/** The canonical token root — any number of top-level sections (color, spacing, typography, …) */
export interface CanonicalRoot {
  [section: string]: CanonicalTokenGroup;
}
