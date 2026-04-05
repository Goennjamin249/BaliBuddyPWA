/**
 * Babel Plugin: Ersetzt import.meta.vitest und import.meta.env durch sichere Werte
 * Kompatibel mit Expo/Metro Bundler
 */
module.exports = function babelPluginImportMetaFix({ types: t }) {
  return {
    name: "import-meta-fix",
    visitor: {
      // Ersetze import.meta.vitest -> undefined
      MemberExpression(path) {
        const node = path.node;

        // import.meta.vitest erkennen
        if (
          t.isMetaProperty(node.object) &&
          t.isIdentifier(node.object.meta, { name: "import" }) &&
          t.isIdentifier(node.object.property, { name: "meta" }) &&
          t.isIdentifier(node.property, { name: "vitest" })
        ) {
          path.replaceWith(t.identifier("undefined"));
          return;
        }

        // import.meta.env -> {}
        if (
          t.isMetaProperty(node.object) &&
          t.isIdentifier(node.object.meta, { name: "import" }) &&
          t.isIdentifier(node.object.property, { name: "meta" }) &&
          t.isIdentifier(node.property, { name: "env" })
        ) {
          path.replaceWith(t.objectExpression([]));
          return;
        }
      },
    },
  };
};
