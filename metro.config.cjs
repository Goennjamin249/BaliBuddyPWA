/* global __dirname */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...(config.resolver ?? {}),
  sourceExts: [...(config.resolver?.sourceExts ?? []), "mjs", "cjs"],
};

config.transformer = {
  ...(config.transformer ?? {}),
  unstable_allowRequireContext: true,
};

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
