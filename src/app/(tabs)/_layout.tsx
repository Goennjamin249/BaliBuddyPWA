import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { BlurView } from "expo-blur";
import BottomMenu from "../../components/BottomMenu";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomMenu {...(props as any)} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={80}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            }}
          />
        ),
      }}
    >
      <Tabs.Screen name="smart-map" options={{ title: "Map" }} />
      <Tabs.Screen name="sos-hub" options={{ title: "SOS" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="transport" options={{ title: "Transport" }} />
      <Tabs.Screen name="survival" options={{ title: "Guide" }} />
    </Tabs>
  );
}
