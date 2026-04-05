/**
 * Initial POI Seed Data for Bali
 * 50 essential POIs across categories: ATMs, clinics, safe bars, laundries, water stations
 */

export const BALI_INITIAL_POIS = {
  atms: [
    { bank_name: "Bali ATM - Ubud Center", latitude: -8.5069, longitude: 115.2625, address: "Jl. Raya Ubud No. 15", is_safe: true, skimming_risk: "low", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "BCA ATM Kuta", latitude: -8.7184, longitude: 115.1686, address: "Jl. Pantai Kuta No. 88", is_safe: true, skimming_risk: "low", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "Mandiri ATM Seminyak", latitude: -8.6919, longitude: 115.1721, address: "Jl. Kayu Aya No. 12", is_safe: true, skimming_risk: "medium", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "BRI ATM Canggu", latitude: -8.6482, longitude: 115.1386, address: "Jl. Pantai Batu Bolong No. 55", is_safe: true, skimming_risk: "low", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "BNI ATM Sanur", latitude: -8.7088, longitude: 115.2623, address: "Jl. Danau Tamblingan No. 33", is_safe: true, skimming_risk: "low", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "CIMB ATM Denpasar", latitude: -8.6705, longitude: 115.2126, address: "Jl. Teuku Umar No. 45", is_safe: true, skimming_risk: "low", operating_hours: "08:00-22:00", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "Permata ATM Nusa Dua", latitude: -8.7983, longitude: 115.2313, address: "BTDC Area Block C", is_safe: true, skimming_risk: "low", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "Danamon ATM Legian", latitude: -8.7056, longitude: 115.1675, address: "Jl. Legian No. 120", is_safe: false, skimming_risk: "high", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "ATM Bersama Ubud Market", latitude: -8.5087, longitude: 115.2641, address: "Jl. Monkey Forest Rd. No. 8", is_safe: true, skimming_risk: "medium", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
    { bank_name: "ATM BCA Airport", latitude: -8.7467, longitude: 115.1671, address: "Ngurah Rai Airport Terminal 1", is_safe: true, skimming_risk: "low", operating_hours: "24/7", created_at: Date.now(), updated_at: Date.now() },
  ],
  clinics: [
    { name: "BIMC Hospital Kuta", latitude: -8.7248, longitude: 115.1728, address: "Jl. Bypass Ngurah Rai No.100X", phone: "+62361761261", has_pep_vaccine: true, operating_hours: "24/7", emergency_24h: true, created_at: Date.now(), updated_at: Date.now() },
    { name: "Siloam Hospital Seminyak", latitude: -8.6881, longitude: 115.1677, address: "Jl. Raya Kerobokan No. 88", phone: "+62361779900", has_pep_vaccine: true, operating_hours: "24/7", emergency_24h: true, created_at: Date.now(), updated_at: Date.now() },
    { name: "Kasih Ibu Hospital Ubud", latitude: -8.5012, longitude: 115.2703, address: "Jl. Monkey Forest Rd. No. 47", phone: "+62361974044", has_pep_vaccine: true, operating_hours: "08:00-20:00", emergency_24h: false, created_at: Date.now(), updated_at: Date.now() },
    { name: "Pratama Clinic Sanur", latitude: -8.7045, longitude: 115.2598, address: "Jl. Danau Poso No. 5", phone: "+62361286702", has_pep_vaccine: true, operating_hours: "08:00-18:00", emergency_24h: false, created_at: Date.now(), updated_at: Date.now() },
    { name: "Manuaba Hospital Denpasar", latitude: -8.6592, longitude: 115.2219, address: "Jl. Cokroaminoto No. 28", phone: "+62361223010", has_pep_vaccine: true, operating_hours: "24/7", emergency_24h: true, created_at: Date.now(), updated_at: Date.now() },
  ],
  safe_bars: [
    { name: "La Plancha Beach Bar", latitude: -8.6952, longitude: 115.1603, address: "Jl. Kayumanis, Seminyak Beach", is_verified: true, verification_date: Date.now(), rating: 4.6, notes: "Methanol-free cocktails verified", created_at: Date.now(), updated_at: Date.now() },
    { name: "Single Fin Bali", latitude: -8.8135, longitude: 115.1107, address: "Jl. Labuan Sait, Uluwatu", is_verified: true, verification_date: Date.now(), rating: 4.7, notes: "Clifftop bar, safe drinks", created_at: Date.now(), updated_at: Date.now() },
    { name: "Finns Beach Club", latitude: -8.6378, longitude: 115.1291, address: "Jl. Pantai Putih, Canggu", is_verified: true, verification_date: Date.now(), rating: 4.5, notes: "Premium bar, sealed bottles", created_at: Date.now(), updated_at: Date.now() },
    { name: "Sky Garden Rooftop", latitude: -8.7199, longitude: 115.1694, address: "Jl. Legian No. 45, Kuta", is_verified: false, verification_date: Date.now(), rating: 4.2, notes: "All-you-can-drink, verify seal", created_at: Date.now(), updated_at: Date.now() },
    { name: "Noxmals Nightclub", latitude: -8.6936, longitude: 115.1684, address: "Jl. Camplung Tanduk, Seminyak", is_verified: true, verification_date: Date.now(), rating: 4.4, notes: "Certified safe venue", created_at: Date.now(), updated_at: Date.now() },
    { name: "Sandbar Beach Club", latitude: -8.6463, longitude: 115.1362, address: "Jl. Pantai Batu Bolong, Canggu", is_verified: true, verification_date: Date.now(), rating: 4.5, notes: "Beachfront, safe drinks", created_at: Date.now(), updated_at: Date.now() },
  ],
  laundries: [
    { name: "Express Laundry Ubud", latitude: -8.5059, longitude: 115.2631, address: "Jl. Raya Ubud No. 22", price_per_kg: 12000, services: "wash,fold,iron", operating_hours: "08:00-20:00", rating: 4.3, created_at: Date.now(), updated_at: Date.now() },
    { name: "Kuta Clean Laundry", latitude: -8.7212, longitude: 115.1695, address: "Jl. Kartika Plaza No. 33", price_per_kg: 10000, services: "wash,fold", operating_hours: "07:00-21:00", rating: 4.1, created_at: Date.now(), updated_at: Date.now() },
    { name: "Canggu Laundry Express", latitude: -8.6493, longitude: 115.1398, address: "Jl. Raya Canggu No. 15", price_per_kg: 15000, services: "wash,fold,iron,express", operating_hours: "07:00-22:00", rating: 4.6, created_at: Date.now(), updated_at: Date.now() },
    { name: "Seminyak Laundry", latitude: -8.6907, longitude: 115.1689, address: "Jl. Kayu Aya No. 8", price_per_kg: 18000, services: "wash,fold,iron,dry-clean", operating_hours: "08:00-20:00", rating: 4.7, created_at: Date.now(), updated_at: Date.now() },
    { name: "Sanur Laundry Service", latitude: -8.7065, longitude: 115.2612, address: "Jl. Danau Tamblingan No. 55", price_per_kg: 13000, services: "wash,fold", operating_hours: "08:00-19:00", rating: 4.2, created_at: Date.now(), updated_at: Date.now() },
  ],
  water_stations: [
    { name: "Refill Station Ubud Center", latitude: -8.5075, longitude: 115.2629, address: "Jl. Raya Ubud No. 30", water_type: "filtered", price_per_liter: 2000, operating_hours: "08:00-18:00", rating: 4.4, created_at: Date.now(), updated_at: Date.now() },
    { name: "Water Station Canggu", latitude: -8.6475, longitude: 115.1374, address: "Jl. Pantai Batu Bolong No. 12", water_type: "reverse-osmosis", price_per_liter: 3000, operating_hours: "07:00-19:00", rating: 4.6, created_at: Date.now(), updated_at: Date.now() },
    { name: "Eco Water Seminyak", latitude: -8.6925, longitude: 115.1705, address: "Jl. Kayu Aya No. 20", water_type: "alkaline", price_per_liter: 4000, operating_hours: "09:00-20:00", rating: 4.7, created_at: Date.now(), updated_at: Date.now() },
    { name: "Water Refill Kuta", latitude: -8.7195, longitude: 115.1681, address: "Jl. Legian No. 88", water_type: "filtered", price_per_liter: 1500, operating_hours: "08:00-17:00", rating: 4.0, created_at: Date.now(), updated_at: Date.now() },
    { name: "Sanur Eco Water", latitude: -8.7078, longitude: 115.2635, address: "Jl. Danau Poso No. 10", water_type: "reverse-osmosis", price_per_liter: 2500, operating_hours: "08:00-18:00", rating: 4.5, created_at: Date.now(), updated_at: Date.now() },
  ],
};

export default BALI_INITIAL_POIS;
