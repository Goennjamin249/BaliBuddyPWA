// Bali 2026 Real Prices - Dynamic Pricing System
export const BALI_PRICES_2026 = {
  // Transport
  scooter: {
    min: 80000,
    max: 150000,
    unit: 'IDR/Tag',
    description: 'Scooter Miete',
    category: 'transport',
  },
  driver: {
    min: 500000,
    max: 800000,
    unit: 'IDR/Tag',
    description: 'Privater Fahrer',
    category: 'transport',
  },
  taxi: {
    min: 10000,
    max: 15000,
    unit: 'IDR/km',
    description: 'Taxi',
    category: 'transport',
  },
  grab: {
    min: 8000,
    max: 12000,
    unit: 'IDR/km',
    description: 'Grab',
    category: 'transport',
  },

  // Accommodation
  hotel: {
    budget: { min: 300000, max: 600000, unit: 'IDR/Nacht' },
    mid: { min: 600000, max: 1500000, unit: 'IDR/Nacht' },
    luxury: { min: 1500000, max: 5000000, unit: 'IDR/Nacht' },
    description: 'Hotel',
    category: 'accommodation',
  },
  hostel: {
    min: 150000,
    max: 300000,
    unit: 'IDR/Nacht',
    description: 'Hostel',
    category: 'accommodation',
  },

  // Food & Drinks
  water: {
    min: 4000,
    max: 6000,
    unit: 'IDR/Liter',
    description: 'Wasser',
    category: 'food',
  },
  coffee: {
    min: 25000,
    max: 50000,
    unit: 'IDR',
    description: 'Kaffee',
    category: 'food',
  },
  breakfast: {
    min: 25000,
    max: 60000,
    unit: 'IDR',
    description: 'Frühstück',
    category: 'food',
  },
  lunch: {
    min: 50000,
    max: 100000,
    unit: 'IDR',
    description: 'Mittagessen',
    category: 'food',
  },
  dinner: {
    min: 75000,
    max: 200000,
    unit: 'IDR',
    description: 'Abendessen',
    category: 'food',
  },
  beer: {
    min: 35000,
    max: 60000,
    unit: 'IDR',
    description: 'Bier',
    category: 'food',
  },

  // Activities
  temple: {
    min: 30000,
    max: 50000,
    unit: 'IDR',
    description: 'Tempel Eintritt',
    category: 'activities',
  },
  massage: {
    min: 100000,
    max: 200000,
    unit: 'IDR',
    description: 'Massage',
    category: 'activities',
  },
  surf: {
    min: 350000,
    max: 500000,
    unit: 'IDR/Person',
    description: 'Surfen',
    category: 'activities',
  },
  yoga: {
    min: 150000,
    max: 300000,
    unit: 'IDR',
    description: 'Yoga',
    category: 'activities',
  },
  tour: {
    min: 300000,
    max: 600000,
    unit: 'IDR/Gruppe',
    description: 'Tour',
    category: 'activities',
  },

  // Services
  laundry: {
    min: 35000,
    max: 50000,
    unit: 'IDR/kg',
    description: 'Wäscherei',
    category: 'services',
  },
  sim: {
    min: 50000,
    max: 100000,
    unit: 'IDR',
    description: 'SIM-Karte',
    category: 'services',
  },

  // Emergency
  overstay: {
    min: 1000000,
    max: 1000000,
    unit: 'IDR/Tag',
    description: 'Overstay Strafe',
    category: 'emergency',
  },
  consultation: {
    min: 400000,
    max: 600000,
    unit: 'IDR',
    description: 'Arzt Konsultation',
    category: 'emergency',
  },
};

// Dynamic Pricing Calculator
export const calculateDynamicPrice = (
  basePrice: number,
  priceType: 'per_person' | 'per_group' | 'fixed',
  memberCount: number,
  season: 'low' | 'high' = 'high'
): number => {
  let price = basePrice;

  // Apply group discount
  if (priceType === 'per_person') {
    const discount = memberCount >= 5 ? 0.15 : memberCount >= 3 ? 0.10 : 0;
    price = basePrice * memberCount * (1 - discount);
  } else if (priceType === 'per_group') {
    price = basePrice;
  }

  // Apply season multiplier
  if (season === 'high') {
    price *= 1.2; // 20% higher in high season
  }

  return Math.round(price);
};

// Get price range for display
export const getPriceRange = (category: string, item: string): string => {
  const priceData = BALI_PRICES_2026[item as keyof typeof BALI_PRICES_2026];
  if (!priceData) return 'Preis auf Anfrage';

  if ('min' in priceData && 'max' in priceData) {
    return `${priceData.min.toLocaleString('de-DE')} - ${priceData.max.toLocaleString('de-DE')} ${priceData.unit}`;
  }

  return 'Preis auf Anfrage';
};

// Get average price for quick calculations
export const getAveragePrice = (item: string): number => {
  const priceData = BALI_PRICES_2026[item as keyof typeof BALI_PRICES_2026];
  if (!priceData) return 0;

  if ('min' in priceData && 'max' in priceData) {
    return (priceData.min + priceData.max) / 2;
  }

  return 0;
};

// Categories for UI
export const PRICE_CATEGORIES = {
  transport: { icon: '🛵', label: 'Transport', color: '#00B4D8' },
  accommodation: { icon: '🏨', label: 'Unterkunft', color: '#90BE6D' },
  food: { icon: '🍽️', label: 'Essen & Trinken', color: '#F59E0B' },
  activities: { icon: '🏄', label: 'Aktivitäten', color: '#FF6B6B' },
  services: { icon: '🛎️', label: 'Services', color: '#8B5CF6' },
  emergency: { icon: '🚨', label: 'Notfall', color: '#DC2626' },
};