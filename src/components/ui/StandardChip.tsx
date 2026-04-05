import { TouchableOpacity, Text, Platform } from "react-native";

interface StandardChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  emoji?: string;
}

const GRAY_200 = "#E5E7EB";
const GRAY_600 = "#4B5563";
const ROSE_600 = "#e11d48";

export default function StandardChip({
  label,
  active = false,
  onPress,
  emoji,
}: StandardChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        {
          flexDirection: "row",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: active ? "transparent" : GRAY_200,
          backgroundColor: active ? ROSE_600 : "#FFFFFF",
          gap: 6,
          minWidth: 0,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
          elevation: 2,
        },
        Platform.OS === "web" && {
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        } as any,
      ]}
    >
      {emoji && <Text style={{ fontSize: 16 }}>{emoji}</Text>}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: active ? "#FFFFFF" : GRAY_600,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
