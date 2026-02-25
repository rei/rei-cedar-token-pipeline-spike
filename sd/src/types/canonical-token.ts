export interface CanonicalColorToken {
  $value: string;
  $type: "color";
}

export interface CanonicalTokenGroup {
  [tokenName: string]: CanonicalColorToken | CanonicalTokenGroup;
}

export interface CanonicalRoot {
  color: CanonicalTokenGroup;
}
