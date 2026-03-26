import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    // Currencies for offline conversion
    tableSchema({
      name: 'currencies',
      columns: [
        { name: 'code', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'rate_to_idr', type: 'number' },
        { name: 'last_updated', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Phrases for offline phrasebook
    tableSchema({
      name: 'phrases',
      columns: [
        { name: 'category', type: 'string' },
        { name: 'indonesian', type: 'string' },
        { name: 'german', type: 'string' },
        { name: 'english', type: 'string' },
        { name: 'pronunciation', type: 'string' },
        { name: 'is_favorite', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Price guide items
    tableSchema({
      name: 'prices',
      columns: [
        { name: 'item_name', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'min_price_idr', type: 'number' },
        { name: 'max_price_idr', type: 'number' },
        { name: 'market_type', type: 'string' },
        { name: 'bargaining_tips', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Water refill stations
    tableSchema({
      name: 'water_stations',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'address', type: 'string' },
        { name: 'water_type', type: 'string' },
        { name: 'price_per_liter', type: 'number' },
        { name: 'operating_hours', type: 'string' },
        { name: 'rating', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // ATMs
    tableSchema({
      name: 'atms',
      columns: [
        { name: 'bank_name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'address', type: 'string' },
        { name: 'is_safe', type: 'boolean' },
        { name: 'skimming_risk', type: 'string' },
        { name: 'operating_hours', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Laundries
    tableSchema({
      name: 'laundries',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'address', type: 'string' },
        { name: 'price_per_kg', type: 'number' },
        { name: 'services', type: 'string' },
        { name: 'operating_hours', type: 'string' },
        { name: 'rating', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Safe bars (methanol-free)
    tableSchema({
      name: 'safe_bars',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'address', type: 'string' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'verification_date', type: 'number' },
        { name: 'rating', type: 'number' },
        { name: 'notes', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Clinics (for rabies/vaccines)
    tableSchema({
      name: 'clinics',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'address', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'has_pep_vaccine', type: 'boolean' },
        { name: 'operating_hours', type: 'string' },
        { name: 'emergency_24h', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Itinerary items
    tableSchema({
      name: 'itinerary_items',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'time', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'order', type: 'number' },
        { name: 'squad_id', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Squad members
    tableSchema({
      name: 'squad_members',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'squad_id', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Expenses
    tableSchema({
      name: 'expenses',
      columns: [
        { name: 'description', type: 'string' },
        { name: 'amount_idr', type: 'number' },
        { name: 'paid_by', type: 'string' },
        { name: 'squad_id', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Expense splits
    tableSchema({
      name: 'expense_splits',
      columns: [
        { name: 'expense_id', type: 'string' },
        { name: 'member_id', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'is_settled', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Packing list items
    tableSchema({
      name: 'packing_items',
      columns: [
        { name: 'item_name', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'is_packed', type: 'boolean' },
        { name: 'is_custom', type: 'boolean' },
        { name: 'weather_based', type: 'boolean' },
        { name: 'activity_based', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Emergency contacts
    tableSchema({
      name: 'emergency_contacts',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'relationship', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Safety check-ins
    tableSchema({
      name: 'safety_checkins',
      columns: [
        { name: 'timer_duration', type: 'number' },
        { name: 'start_time', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Scooter inspections
    tableSchema({
      name: 'scooter_inspections',
      columns: [
        { name: 'rental_company', type: 'string' },
        { name: 'scooter_model', type: 'string' },
        { name: 'license_plate', type: 'string' },
        { name: 'checklist_data', type: 'string' },
        { name: 'photo_evidence', type: 'string' },
        { name: 'inspection_date', type: 'number' },
        { name: 'notes', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    
    // Settings
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});