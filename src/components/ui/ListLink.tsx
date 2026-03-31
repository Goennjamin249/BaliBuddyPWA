import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

interface ListLinkProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ListLink({
  title,
  subtitle,
  icon,
  rightIcon,
  onPress,
  style,
}: ListLinkProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.listLink,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listLinkContent}>
        {icon && <View style={styles.listLinkIcon}>{icon}</View>}
        <View style={styles.listLinkText}>
          <Text style={[styles.listLinkTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.listLinkSubtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightIcon || (
        <View style={styles.listLinkChevron}>
          <View style={[styles.chevron, { borderColor: colors.textMuted }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  listLinkContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  listLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  listLinkText: {
    flex: 1,
  },
  listLinkTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  listLinkSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listLinkChevron: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "-45deg" }],
  },
});
