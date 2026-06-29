import type { Transform } from 'style-dictionary/types';
import { parse } from 'culori';

export const androidColorTransform: Transform = {
  name: 'value/android-color',
  type: 'value',
  transform: (token) => {
    if (token.$type !== 'color') {
      return token.$value;
    }

    const value = token.$value as string;
    
    // If already a hex value, just return it
    if (value.startsWith('#')) {
      return value;
    }

    // Otherwise try to parse and convert to hex
    const parsed = parse(value);
    if (!parsed) {
      throw new Error(`[android-color] Could not parse color value "${value}"`);
    }

    // Convert to hex using culori's format function
    const hex = (parsed as { format: (space: string) => string }).format('hex');
    return hex;
  },
};
