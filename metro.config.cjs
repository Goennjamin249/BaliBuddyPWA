const { getDefaultConfig } = require("expo/metro-config");

/**
 * Metro configuration for BaliBuddy PWA
 * @see https://facebook.github.io/metro/docs/configuration
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Export the Metro configuration
module.exports = config;
