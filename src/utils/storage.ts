import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage Keys
const KEYS = {
  TOURS: "@balibuddy:tours",
  SETTINGS: "@balibuddy:settings",
  WEATHER: "@balibuddy:weather",
  POIS: "@balibuddy:pois",
  LAST_UPDATE: "@balibuddy:last_update",
};

// Types
export interface Tour {
  id: string;
  name: string;
  stops: TourStop[];
  createdAt: number;
  updatedAt: number;
}

export interface TourStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  notes?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  paidBy: string;
  category: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
  fetchedAt: number;
}

export interface Settings {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: boolean;
  haptics: boolean;
}

// Tours
export async function saveTour(tour: Tour): Promise<void> {
  try {
    const existingTours = await getTours();
    const updatedTours = [...existingTours, tour];
    await AsyncStorage.setItem(KEYS.TOURS, JSON.stringify(updatedTours));
  } catch (error) {
    console.error("Error saving tour:", error);
  }
}

export async function getTours(): Promise<Tour[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.TOURS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting tours:", error);
    return [];
  }
}

export async function updateTour(tour: Tour): Promise<void> {
  try {
    const existingTours = await getTours();
    const updatedTours = existingTours.map((t) =>
      t.id === tour.id ? { ...tour, updatedAt: Date.now() } : t,
    );
    await AsyncStorage.setItem(KEYS.TOURS, JSON.stringify(updatedTours));
  } catch (error) {
    console.error("Error updating tour:", error);
  }
}

export async function deleteTour(tourId: string): Promise<void> {
  try {
    const existingTours = await getTours();
    const updatedTours = existingTours.filter((t) => t.id !== tourId);
    await AsyncStorage.setItem(KEYS.TOURS, JSON.stringify(updatedTours));
  } catch (error) {
    console.error("Error deleting tour:", error);
  }
}

// Settings
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          theme: "system",
          language: "de",
          notifications: true,
          haptics: true,
        };
  } catch (error) {
    console.error("Error getting settings:", error);
    return {
      theme: "system",
      language: "de",
      notifications: true,
      haptics: true,
    };
  }
}

// Weather
export async function saveWeather(weather: WeatherData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.WEATHER, JSON.stringify(weather));
    await AsyncStorage.setItem(KEYS.LAST_UPDATE, JSON.stringify(Date.now()));
  } catch (error) {
    console.error("Error saving weather:", error);
  }
}

export async function getWeather(): Promise<WeatherData | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WEATHER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting weather:", error);
    return null;
  }
}

export async function getCachedWeather(
  maxAgeMinutes = 30,
): Promise<WeatherData | null> {
  try {
    const [weatherData, lastUpdateData] = await Promise.all([
      AsyncStorage.getItem(KEYS.WEATHER),
      AsyncStorage.getItem(KEYS.LAST_UPDATE),
    ]);

    if (!weatherData || !lastUpdateData) return null;

    const weather = JSON.parse(weatherData);
    const lastUpdate = JSON.parse(lastUpdateData);
    const now = Date.now();
    const ageMinutes = (now - lastUpdate) / 1000 / 60;

    if (ageMinutes > maxAgeMinutes) {
      return null; // Cache expired
    }

    return weather;
  } catch (error) {
    console.error("Error getting cached weather:", error);
    return null;
  }
}

// POIs
export async function savePOIs(pois: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.POIS, JSON.stringify(pois));
  } catch (error) {
    console.error("Error saving POIs:", error);
  }
}

export async function getPOIs(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.POIS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting POIs:", error);
    return [];
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.TOURS);
    await AsyncStorage.removeItem(KEYS.SETTINGS);
    await AsyncStorage.removeItem(KEYS.WEATHER);
    await AsyncStorage.removeItem(KEYS.POIS);
    await AsyncStorage.removeItem(KEYS.LAST_UPDATE);
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}
