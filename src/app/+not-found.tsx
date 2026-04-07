import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Nicht gefunden" }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.code}>404</Text>
          <Text style={styles.message}>
            Diese Seite wurde nicht gefunden.
          </Text>
          <Link href="/(tabs)/radar" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Zurück zur Karte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  code: {
    fontSize: 72,
    fontWeight: "900",
    color: "#059669",
  },
  message: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#059669",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#059669",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      web: {
        boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
      },
    }),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
