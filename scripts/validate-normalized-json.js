// validate-normalized-json.js
// Validates that dist/normalized/current.json matches the expected Storybook token shape

import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('dist/normalized/current.json');

function isLeaf(node) {
  return (
    typeof node === 'object' &&
    node !== null &&
    '$value' in node &&
    '$type' in node
  );
}

function checkColorModes(color) {
  if (!color.modes) throw new Error('Missing color.modes');
  for (const [mode, modeTokens] of Object.entries(color.modes)) {
    for (const category of ['surface', 'text', 'border']) {
      if (!modeTokens[category]) throw new Error(`Missing color.modes.${mode}.${category}`);
      for (const [key, value] of Object.entries(modeTokens[category])) {
        if (!isLeaf(value)) throw new Error(`color.modes.${mode}.${category}.${key} is not a leaf`);
      }
    }
  }
}

function checkSpacing(spacing) {
  if (!spacing.scale) throw new Error('Missing spacing.scale');
  for (const [key, value] of Object.entries(spacing.scale)) {
    if (!isLeaf(value)) throw new Error(`spacing.scale.${key} is not a leaf`);
  }
  for (const group of ['component', 'layout']) {
    if (!spacing[group]) throw new Error(`Missing spacing.${group}`);
    for (const [key, value] of Object.entries(spacing[group])) {
      if (!isLeaf(value)) throw new Error(`spacing.${group}.${key} is not a leaf`);
    }
  }
}

function main() {
  if (!fs.existsSync(file)) throw new Error('File not found: ' + file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.color) throw new Error('Missing color root');
  if (!data.spacing) throw new Error('Missing spacing root');
  checkColorModes(data.color);
  checkSpacing(data.spacing);
  console.log('dist/normalized/current.json is valid and matches expected shape.');
}

main();
