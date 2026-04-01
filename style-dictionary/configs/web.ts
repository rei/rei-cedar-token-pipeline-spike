import type { Config } from 'style-dictionary';
import type { TransformedToken } from 'style-dictionary';

export const webConfig: Config = {
  source: ['canonical/tokens.json'],
  log: { verbosity: 'verbose' },
  platforms: {
    web: {
      transformGroup: 'cedar/web',
      buildPath: 'dist/themes/rei-dot-com/css/',
      actions: ['web-css'],
      files: [],
      filter: (token: TransformedToken) =>
        (token.path[0] === 'color' &&
          token.path[1] === 'modes' &&
          token.path[2] === 'default' &&
          token.$type === 'color') ||
        token.path[0] === 'spacing',
    },
  },
};
