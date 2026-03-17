import type { Config } from 'style-dictionary';
import type { TransformedToken } from 'style-dictionary';

export const iosConfig: Config = {
  source: ['tokens/canonical.json'],
  log: { verbosity: 'verbose' },
  platforms: {
    ios: {
      transformGroup: 'cedar/ios',
      buildPath: 'dist/ios/',
      actions: ['ios-colorset'],
      files: [],
      filter: (token: TransformedToken) =>
        token.path[0] === 'color' &&
        token.path[1] === 'modes' &&
        token.path[2] === 'default' &&
        token.$type === 'color',
    },
  },
};
