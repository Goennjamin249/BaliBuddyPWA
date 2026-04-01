import { LinearGradient } from "expo-linear-gradient";
import {
  Map,
  AlertTriangle,
  Wallet,
  Navigation,
  BookOpen,
} from "lucide-react-native";
import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

interface BottomMenuProps {
  state: {
    index: number;
    routes: { key: string; title: string }[];
  };
  navigation: {
    navigate: (route: string) => void;
  };
  descriptors: Record<
    string,
    {
      options: {
        tabBarIcon?: (props: {
          color: string;
          size: number;
        }) => React.ReactNode;
      };
    }
  >;
}

const TABS = [
  { key: "smart-map", title: "Map", icon: Map },
  { key: "sos-hub", title: "SOS", icon: AlertTriangle },
  { key: "wallet", title: "Wallet", icon: Wallet },
  { key: "transport", title: "Transport", icon: Navigation },
  { key: "survival", title: "Guide", icon: BookOpen },
];

export default function BottomMenu({
  state,
  navigation,
  descriptors,
}: BottomMenuProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const activeIndex = state.index;

  // Responsive sizing
  const isSmallScreen = width < 375;
  const containerHeight = isSmallScreen ? 72 : 80;
  const iconSize = isSmallScreen ? 22 : 24;
  const fontSize = isSmallScreen ? 10 : 11;
  const bottomPadding = Platform.OS === "ios" ? insets.bottom + 8 : 8;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomPadding,
          height: containerHeight,
        },
      ]}
    >
      <View style={styles.menuBar}>
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={async () => {
                await handlePress();
                navigation.navigate(tab.key);
              }}
              activeOpacity={0.7}
            >
              {isActive && (
                <LinearGradient
                  colors={["#FF9D6C", "#BB4E75"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.gradientBackground,
                    {
                      width: isSmallScreen ? 48 : 52,
                      height: isSmallScreen ? 48 : 52,
                      borderRadius: isSmallScreen ? 24 : 26,
                    },
                  ]}
                />
              )}
              <View
                style={[
                  styles.iconContainer,
                  {
                    width: isSmallScreen ? 40 : 44,
                    height: isSmallScreen ? 40 : 44,
                    borderRadius: isSmallScreen ? 20 : 22,
                  },
                ]}
              >
                <Icon
                  size={iconSize}
                  color={isActive ? "#FFFFFF" : "#64748B"}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  { fontSize },
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 24,
    right: 24,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
      },
      android: {
        elevation: 24,
      },
      web: {
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      },
    }),
  },
  menuBar: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 40,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    ...Platform.select({
      ios: {
        backdropFilter: "blur(20px)",
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    position: "relative",
  },
  gradientBackground: {
    position: "absolute",
    zIndex: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  tabLabel: {
    marginTop: 2,
    zIndex: 10,
    fontSize: 11,
  },
  tabLabelActive: {
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tabLabelInactive: {
    fontWeight: "600",
    color: "#64748B",
  },
});
