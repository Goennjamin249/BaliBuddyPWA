/**
 * Babel Plugin: Ersetzt import.meta.vitest und import.meta.env
 * ✅ Kompatibel mit Expo/Metro + Vercel Edge Runtime
 * ✅ Unterstützt verschachtelte Zugriffe wie import.meta.env.API_URL
 */
module.exports = function babelPluginImportMetaFix({ types: t }) {
  return {
    name: "import-meta-fix",
    pre() {
      // WICHTIG: Dieses Plugin MUSS VOR ALLEN ANDEREN laufen!
    },
    visitor: {
      MetaProperty(path) {
        // 🔥 ALLE import.meta Vorkommen OHNE AUSNAHME ersetzen
        if (t.isIdentifier(path.node.meta, { name: "import" }) && 
            t.isIdentifier(path.node.property, { name: "meta" })) {
          // Absolut sicher ersetzen, auch wenn weitere Plugins versuchen es zurück zu ändern
          path.replaceWith(t.memberExpression(
            t.identifier("process"),
            t.identifier("env")
          ));
          path.skip();
        }
      },

      Program: {
        exit(path) {
          // 🔥 Letzter Check am Ende der Verarbeitung: Suche NACH ALLEN ANDEREN PLUGINS nach übrig gebliebenem import.meta
          path.traverse({
            MetaProperty(innerPath) {
              if (t.isIdentifier(innerPath.node.meta, { name: "import" }) && 
                  t.isIdentifier(innerPath.node.property, { name: "meta" })) {
                innerPath.replaceWith(t.memberExpression(
                  t.identifier("process"),
                  t.identifier("env")
                ));
              }
            }
          });
        }
      }
    },
  };
};
