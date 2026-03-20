// build.ts
import fs from 'node:fs';
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

function toBuildError(message: string, err: unknown) {
  return err instanceof Error
    ? new Error(message, { cause: err })
    : new Error(`${message}: ${String(err)}`);
}

function removeLegacyOutputRoots() {
  const legacyOutputRoots = ['dist/css', 'dist/ios', 'dist/rei-dot-com/css', 'dist/rei-dot-com/ios'];
  legacyOutputRoots.forEach((legacyRoot) => {
    if (fs.existsSync(legacyRoot)) {
      fs.rmSync(legacyRoot, { recursive: true, force: true });
    }
  });
}

async function buildAll() {
  console.log('\n==============================================');
  console.log('Building platforms…');

  removeLegacyOutputRoots();

  const iosSd = new StyleDictionary(iosConfig);
  const webSd = new StyleDictionary(webConfig);

  try {
    await iosSd.buildAllPlatforms();
    console.log('  ✓ iOS build complete');
  } catch (err) {
    console.error(err);
    throw toBuildError('Error building iOS platform', err);
  }

  try {
    await webSd.buildAllPlatforms();
    console.log('  ✓ Web build complete');
  } catch (err) {
    console.error(err);
    throw toBuildError('Error building Web platform', err);
  }

  console.log('==============================================\n');
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
