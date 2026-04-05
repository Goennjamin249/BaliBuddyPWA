/**
 * OverpassSeeder – Importiert POIs aus OpenStreetMap in WatermelonDB
 * Schreibt in die spezialisierten Tabellen: atms, clinics, safe_bars, laundries, water_stations
 */
import db from "../db/index";

const BALI_BBOX = "-8.85,114.90,-8.00,115.75";

// Mapping: Kategorie → WatermelonDB Tabelle + Overpass Query
const CATEGORY_MAP = [
  {
    table: "atms",
    category: "atm",
    query: `node["amenity"="atm"](${BALI_BBOX});`,
    transform: (el: any) => ({
      bank_name: el.tags?.name || `ATM #${el.id}`,
      latitude: el.lat || 0,
      longitude: el.lon || 0,
      address: el.tags?.addr_street || el.tags?.address || "",
      is_safe: true,
      skimming_risk: "low",
      operating_hours: el.tags?.opening_hours || "",
      created_at: Date.now(),
      updated_at: Date.now(),
    }),
  },
  {
    table: "clinics",
    category: "clinic",
    query: `[out:json][timeout:30];
      (
        node["amenity"="clinic"](${BALI_BBOX});
        node["amenity"="hospital"](${BALI_BBOX});
        node["amenity"="pharmacy"](${BALI_BBOX});
      );`,
    transform: (el: any) => ({
      name: el.tags?.name || `Klinik #${el.id}`,
      latitude: el.lat || 0,
      longitude: el.lon || 0,
      address: el.tags?.addr_street || el.tags?.address || "",
      phone: el.tags?.phone || el.tags?.["contact:phone"] || "",
      has_pep_vaccine: el.tags?.healthcare === "hospital" || false,
      operating_hours: el.tags?.opening_hours || "",
      emergency_24h: el.tags?.opening_hours?.includes("24/7") || false,
      created_at: Date.now(),
      updated_at: Date.now(),
    }),
  },
  {
    table: "safe_bars",
    category: "bar",
    query: `[out:json][timeout:30];
      (
        node["amenity"="bar"](${BALI_BBOX});
        node["amenity"="pub"](${BALI_BBOX});
        node["amenity"="nightclub"](${BALI_BBOX});
      );`,
    transform: (el: any) => ({
      name: el.tags?.name || `Bar #${el.id}`,
      latitude: el.lat || 0,
      longitude: el.lon || 0,
      address: el.tags?.addr_street || el.tags?.address || "",
      is_verified: false,
      verification_date: 0,
      rating: parseFloat(el.tags?.rating || "4.0"),
      notes: el.tags?.description || "",
      created_at: Date.now(),
      updated_at: Date.now(),
    }),
  },
  {
    table: "laundries",
    category: "laundry",
    query: `node["shop"="laundry"](${BALI_BBOX});`,
    transform: (el: any) => ({
      name: el.tags?.name || `Wäscherei #${el.id}`,
      latitude: el.lat || 0,
      longitude: el.lon || 0,
      address: el.tags?.addr_street || el.tags?.address || "",
      price_per_kg: parseFloat(el.tags?.price || "0"),
      services: el.tags?.service || "standard",
      operating_hours: el.tags?.opening_hours || "",
      rating: parseFloat(el.tags?.rating || "4.0"),
      created_at: Date.now(),
      updated_at: Date.now(),
    }),
  },
  {
    table: "water_stations",
    category: "water",
    query: `[out:json][timeout:30];
      (
        node["amenity"="drinking_water"](${BALI_BBOX});
        node["natural"="spring"](${BALI_BBOX});
      );`,
    transform: (el: any) => ({
      name: el.tags?.name || `Wasserstation #${el.id}`,
      latitude: el.lat || 0,
      longitude: el.lon || 0,
      address: el.tags?.addr_street || el.tags?.address || "",
      water_type: el.tags?.drinking_water === "yes" ? "drinking" : "refill",
      price_per_liter: 0,
      operating_hours: el.tags?.opening_hours || "",
      rating: parseFloat(el.tags?.rating || "4.0"),
      created_at: Date.now(),
      updated_at: Date.now(),
    }),
  },
];

export async function seedAllPOIs() {


  let totalCount = 0;

  for (const config of CATEGORY_MAP) {
    try {


      const response = await fetch("/api/overpass", {
        method: "POST",
        body: `[out:json][timeout:30];(${config.query})out body;`,
      });

      if (!response.ok) {
        console.warn(`⚠️ ${config.category}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const elements = data.elements || [];

      if (elements.length === 0) {

        continue;
      }

      // Sammle alle Records für Batch-Insert
      const records = elements.map(config.transform);

      // Batch-Insert in WatermelonDB
      await db.write(async (writer) => {
        const collection = db.collections.get(config.table);
        for (const recordData of records) {
          try {
            await collection.create((record: any) => {
              Object.assign(record, recordData);
            });
          } catch {
            // Skip duplicate/invalid records silently
          }
        }
      });

      totalCount += records.length;

    } catch (e) {
      console.warn(`❌ Fehler bei ${config.category}:`, e);
    }
  }


  return totalCount;
}

/**
 * Seed nur eine bestimmte Kategorie
 */
export async function seedCategory(category: string) {
  const config = CATEGORY_MAP.find((c) => c.category === category);
  if (!config) {
    throw new Error(`Unbekannte Kategorie: ${category}`);
  }



  const response = await fetch("/api/overpass", {
    method: "POST",
    body: `[out:json][timeout:30];(${config.query})out body;`,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const records = data.elements.map(config.transform);

  await db.write(async (writer) => {
    const collection = db.collections.get(config.table);
    for (const recordData of records) {
      try {
        await collection.create((record: any) => {
          Object.assign(record, recordData);
        });
      } catch {
        // Skip duplicates
      }
    }
  });


  return records.length;
}
