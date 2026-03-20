// build.ts
import StyleDictionary from 'style-dictionary';
import { iosConfig } from './configs/ios';
import { webConfig } from './configs/web';
import { iosNameTransform } from './transforms/ios/ios-name-transform';
import { iosColorsetAction } from './actions/ios/ios-color-action';
import { webCssAction } from './actions/web/web-css-transform';

StyleDictionary.registerTransform(iosNameTransform);
StyleDictionary.registerAction(iosColorsetAction);
StyleDictionary.registerAction(webCssAction);

// cedar/ios — name transform only; value resolution handled by the action
StyleDictionary.registerTransformGroup({
  name: 'cedar/ios',
  transforms: ['name/ios-camel'],
});

// cedar/web — name transform only; CSS generation handled by the action
StyleDictionary.registerTransformGroup({
  name: 'cedar/web',
  transforms: ['name/camel'],
});

async function buildAll() {
  console.log('\n==============================================');
  console.log('Building platforms…');

  const iosSd = new StyleDictionary(iosConfig);
  const webSd = new StyleDictionary(webConfig);

  try {
    await iosSd.buildAllPlatforms();
    console.log('  ✓ iOS build complete');
  } catch (err) {
    console.error(err);
    throw new Error('Error building iOS platform');
  }

  try {
    await webSd.buildAllPlatforms();
    console.log('  ✓ Web build complete');
  } catch (err) {
    console.error(err);
    throw new Error('Error building Web platform');
  }

  console.log('==============================================\n');
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
