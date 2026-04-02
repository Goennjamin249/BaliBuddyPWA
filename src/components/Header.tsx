import { ChevronLeft, Settings } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponents?: React.ReactNode[];
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export default function Header({
  title,
  showBackButton = true,
  onBackPress,
  rightComponents = [],
  style,
  titleStyle,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }, titleStyle]}>
          {title}
        </Text>

        <View style={styles.right}>
          {rightComponents.length > 0 ? (
            rightComponents.map((component, index) => (
              <React.Fragment key={index}>{component}</React.Fragment>
            ))
          ) : (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <Settings size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: {
    flex: 1,
    alignItems: "flex-start",
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    flex: 2,
    textAlign: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
