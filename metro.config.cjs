/* global __dirname */
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...(config.resolver ?? {}),
  sourceExts: [...(config.resolver?.sourceExts ?? []), "mjs", "cjs"],
};

config.transformer = {
  ...(config.transformer ?? {}),
  unstable_allowRequireContext: true,
};

module.exports = config;
