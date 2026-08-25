// merge-legacy-dist.js
// Merges legacy-dist files into dist/themes/ after build
import fs from "fs";
import path from "path";

const rootDir = path.resolve(process.cwd());
const legacyDir = path.join(rootDir, "legacy-dist");
const distDir = path.join(rootDir, "dist/themes");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyDirectory(source, target) {
  ensureDir(target);
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function mergeDirectoryContents(source, target) {
  ensureDir(target);
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      if (fs.existsSync(destPath)) {
        mergeDirectoryContents(srcPath, destPath);
      } else {
        copyDirectory(srcPath, destPath);
      }
    } else {
      // If file exists in target, skip (prioritize existing)
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function handleTypesMerge(sourcePath, targetPath) {
  const sourceTypes = path.join(sourcePath, "types");
  const targetTypes = path.join(targetPath, "types");

  if (!fs.existsSync(sourceTypes)) return;

  // Copy legacy types as primary
  if (fs.existsSync(targetTypes)) {
    // Move existing types contents to types-new temporarily
    const tempTypes = path.join(targetPath, "types-new-temp");
    if (fs.existsSync(tempTypes)) {
      fs.rmSync(tempTypes, { recursive: true, force: true });
    }

    // Copy existing types contents to temp
    const entries = fs.readdirSync(targetTypes, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(targetTypes, entry.name);
      const destPath = path.join(tempTypes, entry.name);
      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Remove existing types directory
    fs.rmSync(targetTypes, { recursive: true, force: true });

    // Copy legacy types
    copyDirectory(sourceTypes, targetTypes);

    // Create types/new and copy new types there
    const newTypesDir = path.join(targetTypes, "latest");
    ensureDir(newTypesDir);

    // Copy temp contents to types/new
    const tempEntries = fs.readdirSync(tempTypes, { withFileTypes: true });
    for (const entry of tempEntries) {
      const srcPath = path.join(tempTypes, entry.name);
      const destPath = path.join(newTypesDir, entry.name);
      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Clean up temp
    fs.rmSync(tempTypes, { recursive: true, force: true });
  } else {
    // No existing types, just copy legacy
    copyDirectory(sourceTypes, targetTypes);
  }
}

function mergeTheme(sourceTheme, targetTheme) {
  const sourcePath = path.join(legacyDir, sourceTheme);
  const targetPath = path.join(distDir, targetTheme);

  console.log(`Merging ${sourceTheme} -> ${targetTheme}`);

  if (!fs.existsSync(sourcePath)) {
    console.log(`  Source ${sourcePath} does not exist, skipping`);
    return;
  }

  ensureDir(targetPath);

  // Folders that should be merged (coexist)
  const mergeFolders = ["css", "ios"];

  // Folders that should be copied directly if they don't exist
  const copyFolders = ["js", "scss", "json", "figma"];

  // Handle merge folders
  for (const folder of mergeFolders) {
    const sourceFolder = path.join(sourcePath, folder);
    const targetFolder = path.join(targetPath, folder);

    if (fs.existsSync(sourceFolder)) {
      if (fs.existsSync(targetFolder)) {
        console.log(`  Merging ${folder}/`);
        mergeDirectoryContents(sourceFolder, targetFolder);
      } else {
        console.log(`  Copying ${folder}/`);
        copyDirectory(sourceFolder, targetFolder);
      }
    }
  }

  // Handle copy folders
  for (const folder of copyFolders) {
    const sourceFolder = path.join(sourcePath, folder);
    const targetFolder = path.join(targetPath, folder);

    if (fs.existsSync(sourceFolder)) {
      if (fs.existsSync(targetFolder)) {
        console.log(`  ${folder}/ already exists, skipping`);
      } else {
        console.log(`  Copying ${folder}/`);
        copyDirectory(sourceFolder, targetFolder);
      }
    }
  }

  // Handle types specially
  handleTypesMerge(sourcePath, targetPath);
  console.log(`  Handled types/ merge`);
}

function main() {
  console.log("\n==============================================");
  console.log("Merging legacy-dist into dist/themes/");

  if (!fs.existsSync(legacyDir)) {
    console.error("Error: legacy-dist directory does not exist");
    process.exit(1);
  }

  if (!fs.existsSync(distDir)) {
    console.error(
      "Error: dist/themes directory does not exist. Run build first."
    );
    process.exit(1);
  }

  // Merge rei-dot-com theme
  mergeTheme("rei-dot-com", "rei-dot-com");

  // Merge docsite theme (create if doesn't exist)
  mergeTheme("docsite", "docsite");

  console.log("==============================================\n");
  console.log("Legacy merge complete");
}

try {
  main();
} catch (err) {
  console.error("Error during legacy merge:", err);
  process.exit(1);
}
