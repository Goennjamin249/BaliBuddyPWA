import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import BottomMenu from "../../components/BottomMenu";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomMenu {...(props as any)} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
