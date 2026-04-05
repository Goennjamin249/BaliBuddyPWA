// WatermelonDB Hooks for BaliBuddy
// Custom hooks for data access and manipulation

import { Q } from "@nozbe/watermelondb";
import { useCallback, useEffect, useState } from "react";
import database from "../db";

// ==================== GENERIC HOOKS ====================

// Hook to fetch all records from a collection
export function useCollection<T>(tableName: string, dependencies: any[] = []) {
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const collection = database.get(tableName);
    const subscription = collection
      .query()
      .observe()
      .subscribe({
        next: (result) => {
          setRecords(result as unknown as T[]);
          setLoading(false);
        },
        error: (err) => {
          setError(err);
          setLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [tableName, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return { records, loading, error };
}

// ==================== CURRENCY HOOKS ====================

export interface CurrencyRecord {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rateToIdr: number;
  lastUpdated: number;
}

export function useCurrencies() {
  const [currencies, setCurrencies] = useState<CurrencyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get("currencies");
    const subscription = collection
      .query()
      .observe()
      .subscribe({
        next: (result) => {
          setCurrencies(result as unknown as CurrencyRecord[]);
          setLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, []);

  const addCurrency = useCallback(
    async (currency: Omit<CurrencyRecord, "id" | "lastUpdated">) => {
      const collection = database.get("currencies");
      await database.write(async () => {
        await collection.create((record: any) => {
          record.code = currency.code;
          record.name = currency.name;
          record.symbol = currency.symbol;
          record.rate_to_idr = currency.rateToIdr;
          record.last_updated = Date.now();
        });
      });
    },
    [],
  );

  return { currencies, loading, addCurrency };
}

// ==================== EXPENSE HOOKS ====================

export interface ExpenseRecord {
  id: string;
  description: string;
  amountIdr: number;
  paidBy: string;
  squadId: string;
  date: number;
  category: string;
}

export function useExpenses(squadId?: string) {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get("expenses");
    let query = collection.query();

    if (squadId) {
      query = collection.query(Q.where("squad_id", squadId));
    }

    const subscription = query.observe().subscribe({
      next: (result) => {
        setExpenses(result as unknown as ExpenseRecord[]);
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [squadId]);

  const addExpense = useCallback(async (expense: Omit<ExpenseRecord, "id">) => {
    const collection = database.get("expenses");
    await database.write(async () => {
      await collection.create((record: any) => {
        record.description = expense.description;
        record.amount_idr = expense.amountIdr;
        record.paid_by = expense.paidBy;
        record.squad_id = expense.squadId;
        record.date = expense.date;
        record.category = expense.category;
      });
    });
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    const collection = database.get("expenses");
    const record = await collection.find(id);
    await database.write(async () => {
      await record.destroyPermanently();
    });
  }, []);

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce(
      (sum, expense) => sum + (expense as any).amount_idr,
      0,
    );
  }, [expenses]);

  return { expenses, loading, addExpense, deleteExpense, getTotalExpenses };
}

// ==================== ITINERARY HOOKS ====================

export interface ItineraryItemRecord {
  id: string;
  title: string;
  description: string;
  date: number;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  order: number;
  squadId: string;
}

export function useItinerary(squadId?: string) {
  const [items, setItems] = useState<ItineraryItemRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get("itinerary_items");
    let query = collection.query(Q.sortBy("order"));

    if (squadId) {
      query = collection.query(Q.where("squad_id", squadId), Q.sortBy("order"));
    }

    const subscription = query.observe().subscribe({
      next: (result) => {
        setItems(result as unknown as ItineraryItemRecord[]);
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [squadId]);

  const addItem = useCallback(async (item: Omit<ItineraryItemRecord, "id">) => {
    const collection = database.get("itinerary_items");
    await database.write(async () => {
      await collection.create((record: any) => {
        record.title = item.title;
        record.description = item.description;
        record.date = item.date;
        record.time = item.time;
        record.location = item.location;
        record.latitude = item.latitude;
        record.longitude = item.longitude;
        record.order = item.order;
        record.squad_id = item.squadId;
      });
    });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const collection = database.get("itinerary_items");
    const record = await collection.find(id);
    await database.write(async () => {
      await record.destroyPermanently();
    });
  }, []);

  return { items, loading, addItem, deleteItem };
}

// ==================== PACKING LIST HOOKS ====================

export interface PackingItemRecord {
  id: string;
  itemName: string;
  category: string;
  isPacked: boolean;
  isCustom: boolean;
  weatherBased: boolean;
  activityBased: string;
}

export function usePackingList() {
  const [items, setItems] = useState<PackingItemRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get("packing_items");
    const subscription = collection
      .query()
      .observe()
      .subscribe({
        next: (result) => {
          setItems(result as unknown as PackingItemRecord[]);
          setLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, []);

  const toggleItem = useCallback(async (id: string) => {
    const collection = database.get("packing_items");
    const record = await collection.find(id);
    await database.write(async () => {
      await record.update((r: any) => {
        r.is_packed = !r.is_packed;
      });
    });
  }, []);

  const addItem = useCallback(async (item: Omit<PackingItemRecord, "id">) => {
    const collection = database.get("packing_items");
    await database.write(async () => {
      await collection.create((record: any) => {
        record.item_name = item.itemName;
        record.category = item.category;
        record.is_packed = item.isPacked;
        record.is_custom = item.isCustom;
        record.weather_based = item.weatherBased;
        record.activity_based = item.activityBased;
      });
    });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const collection = database.get("packing_items");
    const record = await collection.find(id);
    await database.write(async () => {
      await record.destroyPermanently();
    });
  }, []);

  const progress =
    items.length > 0
      ? (items.filter((i) => i.isPacked).length / items.length) * 100
      : 0;

  return { items, loading, toggleItem, addItem, deleteItem, progress };
}

// ==================== SCOOTER INSPECTION HOOKS ====================

export interface ScooterInspectionRecord {
  id: string;
  rentalCompany: string;
  scooterModel: string;
  licensePlate: string;
  checklistData: string;
  photoEvidence: string;
  inspectionDate: number;
  notes: string;
}

export function useScooterInspections() {
  const [inspections, setInspections] = useState<ScooterInspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get("scooter_inspections");
    const subscription = collection
      .query(Q.sortBy("inspection_date"))
      .observe()
      .subscribe({
        next: (result) => {
          setInspections(result as unknown as ScooterInspectionRecord[]);
          setLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, []);

  const addInspection = useCallback(
    async (inspection: Omit<ScooterInspectionRecord, "id">) => {
      const collection = database.get("scooter_inspections");
      await database.write(async () => {
        await collection.create((record: any) => {
          record.rental_company = inspection.rentalCompany;
          record.scooter_model = inspection.scooterModel;
          record.license_plate = inspection.licensePlate;
          record.checklist_data = inspection.checklistData;
          record.photo_evidence = inspection.photoEvidence;
          record.inspection_date = inspection.inspectionDate;
          record.notes = inspection.notes;
        });
      });
    },
    [],
  );

  return { inspections, loading, addInspection };
}

// ==================== SETTINGS HOOKS ====================

export function useSetting(key: string, defaultValue: string = "") {
  const [value, setValue] = useState<string>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collection = database.get("settings");
    const subscription = collection
      .query(Q.where("key", key))
      .observe()
      .subscribe({
        next: (result) => {
          if (result.length > 0) {
            setValue((result[0] as any).value);
          }
          setLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [key]);

  const setSetting = useCallback(
    async (newValue: string) => {
      const collection = database.get("settings");
      await database.write(async () => {
        const existing = await collection.query(Q.where("key", key)).fetch();
        if (existing.length > 0) {
          await existing[0].update((r: any) => {
            r.value = newValue;
          });
        } else {
          await collection.create((record: any) => {
            record.key = key;
            record.value = newValue;
          });
        }
      });
    },
    [key],
  );

  return { value, loading, setSetting };
}
