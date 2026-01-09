const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
// const exclusionList = require('metro-config/src/defaults/exclusionList');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');
const libraryRoot = path.resolve(monorepoRoot); // compass root

const config = getDefaultConfig(projectRoot);

// Watch the monorepo so changes in the library are picked up
config.watchFolders = [monorepoRoot];

// Resolve modules from demo first
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force a single React/React Native
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Prevent Metro from walking up and resolving from the library's node_modules
config.resolver.disableHierarchicalLookup = true;

// Block the library's node_modules if it exists
// config.resolver.blacklistRE = exclusionList([
//   new RegExp(`${libraryRoot.replace(/[/\\\\]/g, '[\\\\/]')}[\\\\/]node_modules[\\\\/].*`),
// ]);

// Enable package exports (helpful with ESM)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;