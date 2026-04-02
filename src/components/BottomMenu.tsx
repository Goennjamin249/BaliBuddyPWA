import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Map, Wallet, BookOpen, Settings } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

const TABS = [
  { key: "smart-map", titleKey: "tabs.radar", icon: Map },
  { key: "survival", titleKey: "tabs.survival", icon: BookOpen },
  { key: "wallet", titleKey: "tabs.wallet", icon: Wallet },
  { key: "settings", titleKey: "tabs.settings", icon: Settings },
];

export default function BottomMenu({ state, navigation }: { state: { index: number; routes: { key: string; title: string }[] }; navigation: { navigate: (route: string) => void } }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const activeIndex = state.index;
  const isSmall = width < 375;
  const containerH = isSmall ? 72 : 80;
  const iconSize = isSmall ? 22 : 24;
  const fontSize = isSmall ? 10 : 11;
  const bottomPad = Platform.OS === "ios" ? Math.max(insets.bottom, 8) : 8;

  const handlePress = async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  return (
    <View style={[styles.container, { bottom: bottomPad, height: containerH }]}>
      <BlurView tint="systemChromeMaterial" intensity={80} style={styles.blurView}>
        <View style={styles.menuBar}>
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={async () => { await handlePress(); navigation.navigate(tab.key); }}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(tab.titleKey)}
            >
              {isActive && <LinearGradient colors={["#059669", "#0F766E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bg, { width: isSmall ? 48 : 52, height: isSmall ? 48 : 52, borderRadius: isSmall ? 24 : 26 }]} />}
              <View style={[styles.iconC, { width: isSmall ? 40 : 44, height: isSmall ? 40 : 44, borderRadius: isSmall ? 20 : 22 }]}>
                <Icon size={iconSize} color={isActive ? "#FFF" : "#64748B"} strokeWidth={isActive ? 2.5 : 2} />
              </View>
              <Text style={[styles.label, isActive && styles.labelA, { fontSize }]}>{t(tab.titleKey)}</Text>
            </TouchableOpacity>
          );
        })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 16, right: 16, zIndex: 100, ...Platform.select({ ios: { boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }, android: { elevation: 8 }, web: { boxShadow: "0 8px 32px rgba(0,0,0,0.12)" } }) },
  blurView: { flex: 1, borderRadius: 28, overflow: "hidden" },
  menuBar: { flex: 1, flexDirection: "row", overflow: "hidden", alignItems: "center", justifyContent: "space-around", borderRadius: 28, borderWidth: 1, backgroundColor: "rgba(255, 255, 255, 0.72)", borderColor: "rgba(255, 255, 255, 0.5)" },
  tabButton: { flex: 1, alignItems: "center", justifyContent: "center", height: "100%", position: "relative" },
  bg: { position: "absolute", zIndex: 0 },
  iconC: { alignItems: "center", justifyContent: "center", zIndex: 10 },
  label: { marginTop: 2, zIndex: 10, color: "#64748B" },
  labelA: { fontWeight: "800", color: "#FFF" },
});