import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Map, AlertTriangle, Wallet, Navigation, BookOpen } from 'lucide-react-native';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00B4D8',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="smart-map"
        options={{
          title: t('tabs.smartMap', 'Smart Map'),
          tabBarIcon: ({ color, size }) => (
            <Map size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos-hub"
        options={{
          title: t('tabs.sosHub', 'SOS Hub'),
          tabBarIcon: ({ color, size }) => (
            <AlertTriangle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: t('tabs.wallet', 'Wallet'),
          tabBarIcon: ({ color, size }) => (
            <Wallet size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transport"
        options={{
          title: t('tabs.transport', 'Transport'),
          tabBarIcon: ({ color, size }) => (
            <Navigation size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="survival"
        options={{
          title: t('tabs.survival', 'Survival'),
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}