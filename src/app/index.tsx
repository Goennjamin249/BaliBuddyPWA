import { Redirect } from "expo-router";

/**
 * Main entry point - redirects to tabs layout
 */
export default function Index() {
  return <Redirect href="/(tabs)/smart-map" />;
}
