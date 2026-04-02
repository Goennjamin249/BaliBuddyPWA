/**
 * Deep Links Utility
 * Kommunikation & Routing für Phone, WhatsApp, Maps
 */
import { Platform, Linking } from "react-native";

/**
 * Öffnet das Telefon-App mit der angegebenen Nummer
 * @param phone - Telefonnummer
 */
export function openPhone(phone: string | undefined | null): void {
  if (!phone) return;
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const url = `tel:${cleaned}`;
  Linking.openURL(url).catch((err) => console.warn("Phone call failed:", err));
}

/**
 * Öffnet WhatsApp mit einer optionalen Nachricht
 * @param phone - Telefonnummer
 * @param message - Nachrichtentext (optional)
 */
export function openWhatsApp(
  phone: string | undefined | null,
  message: string = ""
): void {
  if (!phone) return;
  const cleaned = phone.replace(/\D/g, "").replace(/^\+/, "");
  const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : "";

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${cleaned}${encodedMsg}`, "_blank");
    }
  } else {
    const url = `https://wa.me/${cleaned}${encodedMsg}`;
    Linking.openURL(url).catch((err) => console.warn("WhatsApp failed:", err));
  }
}

/**
 * Öffnet Karten-App mit Route zum Zielort
 * Unterstützt iOS (Apple Maps) und Android (Google Maps)
 * @param lat - Breite des Ziels
 * @param lng - Länge des Ziels
 * @param label - Bezeichnung des Ziels
 */
export function openRoute(
  lat: number,
  lng: number,
  label: string = ""
): void {
  const isIOS = Platform.OS === "ios";

  if (isIOS) {
    const url = `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(label)}`;
    Linking.openURL(url).catch((err) => console.warn("Apple Maps failed:", err));
  } else if (Platform.OS === "android") {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url).catch((err) => console.warn("Google Maps failed:", err));
  } else {
    // Web-Fallback
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  }
}

const deeplinks = {
  openPhone,
  openWhatsApp,
  openRoute,
};

export default deeplinks;