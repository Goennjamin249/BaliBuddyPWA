import { Tabs } from "expo-router";
import BottomMenu from "../../components/BottomMenu";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomMenu {...(props as any)} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="smart-map" options={{ title: "Radar" }} />
      <Tabs.Screen name="survival" options={{ title: "Survival" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}