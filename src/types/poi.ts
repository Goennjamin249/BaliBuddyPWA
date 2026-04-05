/**
 * Gemeinsamer POI-Typ für die gesamte Anwendung
 * Synchronisiert mit OverpassSeeder.ts
 */
export type Category =
  | "atm"
  | "bank"
  | "pharmacy"
  | "hospital"
  | "clinic"
  | "laundry"
  | "restaurant"
  | "cafe"
  | "bar"
  | "warung"
  | "guesthouse"
  | "hotel"
  | "hostel"
  | "resort"
  | "waterfall"
  | "temple"
  | "beach"
  | "viewpoint"
  | "surf"
  | "police"
  | "fuel";

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
  verified: boolean;
  updated_at: number;
  distance?: number;
}
