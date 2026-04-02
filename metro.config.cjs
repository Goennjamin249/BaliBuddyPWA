const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'mjs' and 'cjs' to the list of supported extensions
config.resolver.sourceExts.push('mjs', 'cjs');

// Enable require.context for Expo Router file-based routing
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = config;
