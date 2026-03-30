// WatermelonDB Models for BaliBuddy
// Export all models for database registration

import { Model } from "@nozbe/watermelondb";
import { date, field, readonly } from "@nozbe/watermelondb/decorators";

// ==================== CURRENCY ====================
export class Currency extends Model {
  static table = "currencies";

  @field("code") code!: string;
  @field("name") name!: string;
  @field("symbol") symbol!: string;
  @field("rate_to_idr") rateToIdr!: number;
  @field("last_updated") lastUpdated!: number;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== PHRASES ====================
export class Phrase extends Model {
  static table = "phrases";

  @field("category") category!: string;
  @field("indonesian") indonesian!: string;
  @field("german") german!: string;
  @field("english") english!: string;
  @field("pronunciation") pronunciation!: string;
  @field("is_favorite") isFavorite!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== PRICES ====================
export class Price extends Model {
  static table = "prices";

  @field("item_name") itemName!: string;
  @field("category") category!: string;
  @field("min_price_idr") minPriceIdr!: number;
  @field("max_price_idr") maxPriceIdr!: number;
  @field("market_type") marketType!: string;
  @field("bargaining_tips") bargainingTips!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== WATER STATIONS ====================
export class WaterStation extends Model {
  static table = "water_stations";

  @field("name") name!: string;
  @field("latitude") latitude!: number;
  @field("longitude") longitude!: number;
  @field("address") address!: string;
  @field("water_type") waterType!: string;
  @field("price_per_liter") pricePerLiter!: number;
  @field("operating_hours") operatingHours!: string;
  @field("rating") rating!: number;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== ATMS ====================
export class ATM extends Model {
  static table = "atms";

  @field("bank_name") bankName!: string;
  @field("latitude") latitude!: number;
  @field("longitude") longitude!: number;
  @field("address") address!: string;
  @field("is_safe") isSafe!: boolean;
  @field("skimming_risk") skimmingRisk!: string;
  @field("operating_hours") operatingHours!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== LAUNDRIES ====================
export class Laundry extends Model {
  static table = "laundries";

  @field("name") name!: string;
  @field("latitude") latitude!: number;
  @field("longitude") longitude!: number;
  @field("address") address!: string;
  @field("price_per_kg") pricePerKg!: number;
  @field("services") services!: string;
  @field("operating_hours") operatingHours!: string;
  @field("rating") rating!: number;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== SAFE BARS ====================
export class SafeBar extends Model {
  static table = "safe_bars";

  @field("name") name!: string;
  @field("latitude") latitude!: number;
  @field("longitude") longitude!: number;
  @field("address") address!: string;
  @field("is_verified") isVerified!: boolean;
  @field("verification_date") verificationDate!: number;
  @field("rating") rating!: number;
  @field("notes") notes!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== CLINICS ====================
export class Clinic extends Model {
  static table = "clinics";

  @field("name") name!: string;
  @field("latitude") latitude!: number;
  @field("longitude") longitude!: number;
  @field("address") address!: string;
  @field("phone") phone!: string;
  @field("has_pep_vaccine") hasPepVaccine!: boolean;
  @field("operating_hours") operatingHours!: string;
  @field("emergency_24h") emergency24h!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== ITINERARY ITEMS ====================
export class ItineraryItem extends Model {
  static table = "itinerary_items";

  @field("title") title!: string;
  @field("description") description!: string;
  @field("date") date!: number;
  @field("time") time!: string;
  @field("location") location!: string;
  @field("latitude") latitude!: number;
  @field("longitude") longitude!: number;
  @field("order") order!: number;
  @field("squad_id") squadId!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== SQUAD MEMBERS ====================
export class SquadMember extends Model {
  static table = "squad_members";

  @field("name") name!: string;
  @field("squad_id") squadId!: string;
  @field("email") email!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== EXPENSES ====================
export class Expense extends Model {
  static table = "expenses";

  @field("description") description!: string;
  @field("amount_idr") amountIdr!: number;
  @field("paid_by") paidBy!: string;
  @field("squad_id") squadId!: string;
  @field("date") date!: number;
  @field("category") category!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== EXPENSE SPLITS ====================
export class ExpenseSplit extends Model {
  static table = "expense_splits";

  @field("expense_id") expenseId!: string;
  @field("member_id") memberId!: string;
  @field("amount") amount!: number;
  @field("is_settled") isSettled!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== PACKING ITEMS ====================
export class PackingItem extends Model {
  static table = "packing_items";

  @field("item_name") itemName!: string;
  @field("category") category!: string;
  @field("is_packed") isPacked!: boolean;
  @field("is_custom") isCustom!: boolean;
  @field("weather_based") weatherBased!: boolean;
  @field("activity_based") activityBased!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== EMERGENCY CONTACTS ====================
export class EmergencyContact extends Model {
  static table = "emergency_contacts";

  @field("name") name!: string;
  @field("phone") phone!: string;
  @field("relationship") relationship!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== SAFETY CHECKINS ====================
export class SafetyCheckin extends Model {
  static table = "safety_checkins";

  @field("timer_duration") timerDuration!: number;
  @field("start_time") startTime!: number;
  @field("is_active") isActive!: boolean;
  @field("latitude") latitude!: number;
  @field("longitude") longitude!: number;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== SCOOTER INSPECTIONS ====================
export class ScooterInspection extends Model {
  static table = "scooter_inspections";

  @field("rental_company") rentalCompany!: string;
  @field("scooter_model") scooterModel!: string;
  @field("license_plate") licensePlate!: string;
  @field("checklist_data") checklistData!: string;
  @field("photo_evidence") photoEvidence!: string;
  @field("inspection_date") inspectionDate!: number;
  @field("notes") notes!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// ==================== SETTINGS ====================
export class Setting extends Model {
  static table = "settings";

  @field("key") key!: string;
  @field("value") value!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}

// Export all models for database registration
export const allModels = [
  Currency,
  Phrase,
  Price,
  WaterStation,
  ATM,
  Laundry,
  SafeBar,
  Clinic,
  ItineraryItem,
  SquadMember,
  Expense,
  ExpenseSplit,
  PackingItem,
  EmergencyContact,
  SafetyCheckin,
  ScooterInspection,
  Setting,
];
