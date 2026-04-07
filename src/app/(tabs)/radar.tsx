<<<<<<< HEAD
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Banknote,
  Beer,
  List,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Navigation,
  Utensils,
  X,
  Home,
  Shield,
  HeartPulse,
  Droplets,
  Star,
  Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import { haversineDistance, formatDistance } from "../../lib/haversine";
import db from "../../db/index";
import { seedInitialPOIs } from "../../db/seeds";
import StandardChip from "../../components/ui/StandardChip";
import LeafletMap, {
  type LeafletPOI,
} from "../../components/LeafletMap";
import { useTheme } from "../../theme/ThemeContext";

// === V2 Design Tokens ===
const V2 = {
  colors: {
    primary: "#059669",
    secondary: "#0F766E",
    danger: "#e11d48",
    bg: "#F2F2F7",
    surface: "#FFFFFF",
    textMain: "#1F2937",
    textMuted: "#6B7280",
  },
  radii: { card: 24, sheet: 32, chip: 20 },
  shadow: Platform.select({
    web: {
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.80)",
    backdropFilter: "blur(20px)",
  },
  glassStrong: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(24px)",
  },
};

const EMERALD_600 = V2.colors.primary;
const TEAL_700 = V2.colors.secondary;
const BG = V2.colors.bg;
const WHITE = V2.colors.surface;
const GRAY_400 = "#9CA3AF";
const GRAY_500 = V2.colors.textMuted;
const GRAY_800 = V2.colors.textMain;
const DEFAULT_USER_LOCATION = { lat: -8.5069, lng: 115.2625 };

type Category =
  | "atm"
  | "warung"
  | "klinik"
  | "police"
  | "fuel"
  | "bar"
  | "hotel"
  | "restaurant"
  | "accommodation";

interface POI {
  id: string;
  name: string;
  category: Category;
  description: string;
  lat: number;
  lng: number;
  rating: number;
  phone: string;
  tags: string[];
  distance?: number;
  verified?: boolean;
}

const CAT_STYLE: Record<
  Category,
  { bg: string; color: string; label: string; Icon: any; emoji: string }
> = {
  atm: {
    bg: "#DBEAFE",
    color: "#2563EB",
    label: "ATM",
    Icon: Banknote,
    emoji: "💳",
  },
  warung: {
    bg: "#FFEDD5",
    color: "#EA580C",
    label: "Waschsalon",
    Icon: Utensils,
    emoji: "🧺",
  },
  klinik: {
    bg: "#FEE2E2",
    color: "#DC2626",
    label: "Klinik",
    Icon: HeartPulse,
    emoji: "🏥",
  },
  police: {
    bg: "#E0E7FF",
    color: "#4F46E5",
    label: "Polizei",
    Icon: Shield,
    emoji: "👮",
  },
  fuel: {
    bg: "#FEF3C7",
    color: "#D97706",
    label: "Wasser",
    Icon: Droplets,
    emoji: "💧",
  },
  bar: {
    bg: "#FCE7F3",
    color: "#BE185D",
    label: "Safe Bar",
    Icon: Beer,
    emoji: "🍺",
  },
  hotel: {
    bg: "#E0F2FE",
    color: "#0284C7",
    label: "Hotel",
    Icon: MapPin,
    emoji: "🏨",
  },
  accommodation: {
    bg: "#F3E8FF",
    color: "#7E22CE",
    label: "Villa",
    Icon: Home,
    emoji: "🏡",
  },
  restaurant: {
    bg: "#FFEDD5",
    color: "#EA580C",
    label: "Rest.",
    Icon: Utensils,
    emoji: "🍽️",
  },
};
=======
import { View, Text } from 'react-native'
>>>>>>> 0a14abbe21b23896b6404d339fce90b762ddbc31

export default function RadarScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold">Radar Screen</Text>
    </View>
  )
}