/**
 * Seed database with initial Bali POI data
 * Called when database is empty to provide essential offline data
 */

import database from "../index";
import { BALI_INITIAL_POIS } from "./bali_initial";

export async function seedInitialPOIs(): Promise<boolean> {
  try {
    // Check if data already exists
    const atmCount = await database.get("atms").query().fetch();
    if (atmCount.length > 0) {

      return false;
    }



    await database.write(async () => {
      // Seed ATMs
      const atmCollection = database.get("atms");
      const atmOps = BALI_INITIAL_POIS.atms.map((poi) =>
        atmCollection.prepareCreate((record: any) => {
          record.bank_name = poi.bank_name;
          record.latitude = poi.latitude;
          record.longitude = poi.longitude;
          record.address = poi.address;
          record.is_safe = poi.is_safe;
          record.skimming_risk = poi.skimming_risk;
          record.operating_hours = poi.operating_hours;
          record.created_at = poi.created_at;
          record.updated_at = poi.updated_at;
        }),
      );

      // Seed Clinics
      const clinicCollection = database.get("clinics");
      const clinicOps = BALI_INITIAL_POIS.clinics.map((poi) =>
        clinicCollection.prepareCreate((record: any) => {
          record.name = poi.name;
          record.latitude = poi.latitude;
          record.longitude = poi.longitude;
          record.address = poi.address;
          record.phone = poi.phone;
          record.has_pep_vaccine = poi.has_pep_vaccine;
          record.operating_hours = poi.operating_hours;
          record.emergency_24h = poi.emergency_24h;
          record.created_at = poi.created_at;
          record.updated_at = poi.updated_at;
        }),
      );

      // Seed Safe Bars
      const barCollection = database.get("safe_bars");
      const barOps = BALI_INITIAL_POIS.safe_bars.map((poi) =>
        barCollection.prepareCreate((record: any) => {
          record.name = poi.name;
          record.latitude = poi.latitude;
          record.longitude = poi.longitude;
          record.address = poi.address;
          record.is_verified = poi.is_verified;
          record.verification_date = poi.verification_date;
          record.rating = poi.rating;
          record.notes = poi.notes;
          record.created_at = poi.created_at;
          record.updated_at = poi.updated_at;
        }),
      );

      // Seed Laundries
      const laundryCollection = database.get("laundries");
      const laundryOps = BALI_INITIAL_POIS.laundries.map((poi) =>
        laundryCollection.prepareCreate((record: any) => {
          record.name = poi.name;
          record.latitude = poi.latitude;
          record.longitude = poi.longitude;
          record.address = poi.address;
          record.price_per_kg = poi.price_per_kg;
          record.services = poi.services;
          record.operating_hours = poi.operating_hours;
          record.rating = poi.rating;
          record.created_at = poi.created_at;
          record.updated_at = poi.updated_at;
        }),
      );

      // Seed Water Stations
      const waterCollection = database.get("water_stations");
      const waterOps = BALI_INITIAL_POIS.water_stations.map((poi) =>
        waterCollection.prepareCreate((record: any) => {
          record.name = poi.name;
          record.latitude = poi.latitude;
          record.longitude = poi.longitude;
          record.address = poi.address;
          record.water_type = poi.water_type;
          record.price_per_liter = poi.price_per_liter;
          record.operating_hours = poi.operating_hours;
          record.rating = poi.rating;
          record.created_at = poi.created_at;
          record.updated_at = poi.updated_at;
        }),
      );

      // Batch insert all
      await database.batch(...atmOps, ...clinicOps, ...barOps, ...laundryOps, ...waterOps);
    });


    return true;
  } catch (error) {
    console.error("❌ Failed to seed POIs:", error);
    return false;
  }
}
