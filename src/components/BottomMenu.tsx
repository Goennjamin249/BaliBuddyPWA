import { useEffect } from "react";
import { BlurView } from "expo-blur";
import { Map, Wallet, BookOpen, Settings } from "lucide-react-native";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

const TABS = [
  { key: "radar" as const, titleKey: "tabs.radar" as const, icon: Map },
  { key: "survival" as const, titleKey: "tabs.survival" as const, icon: BookOpen },
  { key: "wallet" as const, titleKey: "tabs.wallet" as const, icon: Wallet },
  { key: "settings" as const, titleKey: "tabs.settings" as const, icon: Settings },
];

const GLOW = "#059669";
const OFF = "#64748B";

export default function BottomMenu({
  state,
  navigation,
}: {
  state: { index: number; routes: { key: string; title: string }[] };
  navigation: { navigate: (route: string) => void };
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;

  const barW = Math.min(width - 32, 500);
  const tabW = barW / TABS.length;

  // Animated glow pill
  const x = useSharedValue(activeIndex * tabW + 6);

  useEffect(() => {
    x.value = withSpring(activeIndex * tabW + 6, {
      damping: 18,
      stiffness: 160,
      mass: 0.7,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- x is a Reanimated shared value
  }, [activeIndex, tabW]);

  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const pad = Platform.OS === "ios" ? Math.max(insets.bottom, 8) : 8;

  return (
    <View style={[styles.root, { bottom: pad }]}>
      <BlurView intensity={80} tint="systemChromeMaterial" style={styles.shell}>
        <View style={[styles.bar, { width: barW }]}>
          {/* Tabs First */}
          {TABS.map((tab, i) => {
            const on = i === activeIndex;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.btn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate(tab.key);
                }}
                activeOpacity={0.9}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t(tab.titleKey)}
              >
                <View style={styles.row}>
                  <tab.icon
                    size={18}
                    color={on ? "#fff" : OFF}
                    strokeWidth={on ? 2.5 : 1.8}
                  />
                  <Text
                    style={[styles.lbl, { color: on ? "#fff" : OFF, fontWeight: on ? "700" : "500" }]}
                    numberOfLines={1}
                  >
                    {t(tab.titleKey)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Glow Pill LAST = on top */}
          <Animated.View
            pointerEvents="none"
            style={[
              pill,
              {
                position: "absolute",
                top: 6,
                left: 0,
                width: tabW - 12,
                height: 48,
                borderRadius: 24,
                zIndex: 10,
              },
            ]}
          >
            <View style={styles.glow} />
          </Animated.View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  shell: {
    borderRadius: 32,
    overflow: "hidden",
    alignSelf: "center",
    ...Platform.select({
      ios: {
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
      },
      android: { elevation: 8 },
      web: {
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
      },
    }),
  },
  bar: {
    flexDirection: "row",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.65)",
    overflow: "hidden",
    position: "relative",
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    zIndex: 20,
    position: "relative",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lbl: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GLOW,
    borderRadius: 24,
    shadowColor: GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    ...Platform.select({
      ios: {},
      web: {
        boxShadow: `0 0 20px ${GLOW}80, 0 0 40px ${GLOW}40`,
      },
    }),
  },
});