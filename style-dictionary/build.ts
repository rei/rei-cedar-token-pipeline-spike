// build.ts
import fs from 'node:fs';
import StyleDictionary from 'style-dictionary';
import { iosConfig } from './configs/ios.js';
import { iosSpmConfig } from './configs/ios-spm.js';
import { iosCocoapodsConfig } from './configs/ios-cocoapods.js';
import { androidConfig } from './configs/android.js';
import { webConfig } from './configs/web.js';
import { iosNameTransform } from './transforms/ios/ios-name-transform.js';
import { iosColorsetAction } from './actions/ios/ios-color-action.js';
import { iosSrgbColorsetAction } from './actions/ios/ios-srgb-color-action.js';
import { androidNameTransform } from './transforms/android/android-name-transform.js';
import { androidColorTransform } from './transforms/android/android-color-transform.js';
// import { androidColorAction } from './actions/android/android-color-action.js';
import { webCssAction } from './actions/web/web-css-transform.js';

// Register iOS transforms
StyleDictionary.registerTransform(iosNameTransform);
StyleDictionary.registerAction(iosColorsetAction);
StyleDictionary.registerAction(iosSrgbColorsetAction);

// Register Android transforms
StyleDictionary.registerTransform(androidNameTransform);
StyleDictionary.registerTransform(androidColorTransform);
// Note: Android action disabled until normalization layer generates android extensions
// StyleDictionary.registerAction(androidColorAction);

// Register web action
StyleDictionary.registerAction(webCssAction);

// cedar/ios — name transform only; value resolution handled by the action
StyleDictionary.registerTransformGroup({
  name: 'cedar/ios',
  transforms: ['name/ios-camel'],
});

// cedar/android — name and color transforms
StyleDictionary.registerTransformGroup({
  name: 'cedar/android',
  transforms: ['name/android-snake', 'value/android-color'],
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

  const iosSpmSd = new StyleDictionary(iosSpmConfig);
  const iosCocoapodsSd = new StyleDictionary(iosCocoapodsConfig);
  const androidSd = new StyleDictionary(androidConfig);
  const webSd = new StyleDictionary(webConfig);

  try {
    await iosSpmSd.buildAllPlatforms();
    console.log('  ✓ iOS SPM build complete (Display P3, Swift extensions)');
  } catch (err) {
    console.error(err);
    throw toBuildError('Error building iOS SPM platform', err);
  }

  try {
    await iosCocoapodsSd.buildAllPlatforms();
    console.log('  ✓ iOS CocoaPods build complete (sRGB, enum-based, Objective-C headers)');
  } catch (err) {
    console.error(err);
    throw toBuildError('Error building iOS CocoaPods platform', err);
  }

  try {
    await androidSd.buildAllPlatforms();
    console.log('  ✓ Android build complete (XML resources, Compose color schemes)');
  } catch (err) {
    console.error(err);
    throw toBuildError('Error building Android platform', err);
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
