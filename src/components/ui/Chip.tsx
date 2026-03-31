import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Chip({
  label,
  active = false,
  onPress,
  icon,
  style,
  textStyle,
}: ChipProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        {
          backgroundColor: active ? colors.primary : colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.chipText,
          { color: active ? "#FFFFFF" : colors.text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 6,
    alignSelf: "flex-start",
  },
  chipActive: {
    opacity: 1,
  },
  chipInactive: {
    opacity: 0.8,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
