module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
      // Fix: import.meta.vitest/env -> sichere Werte für Metro
      "./babel-plugin-import-meta-to-process-env.cjs",
      "react-native-reanimated/plugin",
    ],
  };
};
