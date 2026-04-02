/**
 * Gemeinsamer POI-Typ für die gesamte Anwendung
 */
export type Category =
  | "atm"
  | "warung"
  | "klinik"
  | "police"
  | "fuel"
  | "bar"
  | "hotel"
  | "restaurant"
  | "accommodation";

export interface POI {
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
}