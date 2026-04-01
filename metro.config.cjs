const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'mjs' and 'cjs' to the list of supported extensions
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;