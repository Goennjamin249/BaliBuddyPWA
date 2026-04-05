const expoConfig = require('eslint-config-expo/flat');
const reactPlugin = require('eslint-plugin-react');

const disabledReactRules = Object.fromEntries(
  [
    ...Object.keys(reactPlugin.configs.recommended.rules || {}),
    'react/no-unknown-property',
    'react/no-this-in-sfc',
  ].map((ruleName) => [ruleName, 'off'])
);

module.exports = [
  ...expoConfig,
  {
    rules: disabledReactRules,
  },
];