/**
 * Haversine Distance Calculation
 * Berechnet die Entfernung zwischen zwei GPS-Koordinaten
 */

/**
 * Berechnet die Distanz zwischen zwei Punkten auf der Erde
 * @param lat1 - Breite des ersten Punktes
 * @param lng1 - Länge des ersten Punktes
 * @param lat2 - Breite des zweiten Punktes
 * @param lng2 - Länge des zweiten Punktes
 * @returns Distanz in Kilometern
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // km - Erdradius
  const toRad = (deg: number): number => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Formatiert eine Distanz in lesbarer Form
 * @param km - Distanz in Kilometern
 * @returns Formatierte Distanz (m oder km)
 */
export const formatDistance = (km: number | null | undefined): string => {
  if (!km || km === 999) return "--";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

const haversine = {
  haversineDistance,
  formatDistance,
};

export default haversine;