const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NativeWind v5 configuration
module.exports = withNativeWind(config, { 
  input: './src/global.css',
  // Enable CSS modules support
  cssModules: true,
});