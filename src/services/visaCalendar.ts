/**
 * Visa & Calendar Service for BaliBuddy
 * Tracks visa expiry and Indonesian holidays
 */

// Holiday interface
export interface Holiday {
  id: string;
  name: {
    de: string;
    en: string;
    id: string;
  };
  date: string; // ISO date string
  type: "national" | "hindu" | "islamic" | "buddhist" | "christian";
  description: {
    de: string;
    en: string;
  };
  isPublicHoliday: boolean;
  closures: {
    banks: boolean;
    government: boolean;
    shops: boolean;
    attractions: boolean;
  };
}

// Indonesian holidays 2025-2026
export const indonesianHolidays: Holiday[] = [
  // 2025 Holidays
  {
    id: "new-year-2025",
    name: { de: "Neujahr", en: "New Year", id: "Tahun Baru Masehi" },
    date: "2025-01-01",
    type: "national",
    description: {
      de: "Gesetzlicher Feiertag",
      en: "National public holiday",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: false,
      attractions: false,
    },
  },
  {
    id: "chinese-ny-2025",
    name: {
      de: "Chinesisches Neujahr",
      en: "Chinese New Year",
      id: "Tahun Baru Imlek",
    },
    date: "2025-01-29",
    type: "national",
    description: {
      de: "Chinesisches Neujahrsfest",
      en: "Chinese Lunar New Year",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: true,
      attractions: false,
    },
  },
  {
    id: "nyepi-2025",
    name: {
      de: "Nyepi - Tag der Stille",
      en: "Nyepi - Day of Silence",
      id: "Hari Raya Nyepi",
    },
    date: "2025-03-29",
    type: "hindu",
    description: {
      de: "Hinduistischer Feiertag - Alles geschlossen, auch Flughafen!",
      en: "Hindu New Year - Everything closed, including airport!",
    },
    isPublicHoliday: true,
    closures: { banks: true, government: true, shops: true, attractions: true },
  },
  {
    id: "good-friday-2025",
    name: { de: "Karfreitag", en: "Good Friday", id: "Wafat Isa Al Masih" },
    date: "2025-04-18",
    type: "christian",
    description: {
      de: "Christlicher Feiertag",
      en: "Christian holiday",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: false,
      attractions: false,
    },
  },
  {
    id: "labor-day-2025",
    name: { de: "Tag der Arbeit", en: "Labor Day", id: "Hari Buruh" },
    date: "2025-05-01",
    type: "national",
    description: {
      de: "Internationaler Tag der Arbeit",
      en: "International Workers Day",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: false,
      attractions: false,
    },
  },
  {
    id: "ascension-2025",
    name: {
      de: "Christi Himmelfahrt",
      en: "Ascension Day",
      id: "Kenaikan Isa Al Masih",
    },
    date: "2025-05-29",
    type: "christian",
    description: {
      de: "Christlicher Feiertag",
      en: "Christian holiday",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: false,
      attractions: false,
    },
  },
  {
    id: "pancasila-2025",
    name: {
      de: "Pancasila Tag",
      en: "Pancasila Day",
      id: "Hari Lahir Pancasila",
    },
    date: "2025-06-01",
    type: "national",
    description: {
      de: "Geburtstag der staatlichen Philosophie",
      en: "Birth of Pancasila philosophy",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: false,
      attractions: false,
    },
  },
  {
    id: "eid-al-adha-2025",
    name: { de: "Opferfest", en: "Eid al-Adha", id: "Hari Raya Idul Adha" },
    date: "2025-06-07",
    type: "islamic",
    description: {
      de: "Islamisches Opferfest",
      en: "Islamic Festival of Sacrifice",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: true,
      attractions: false,
    },
  },
  {
    id: "independence-2025",
    name: {
      de: "Unabhängigkeitstag",
      en: "Independence Day",
      id: "Hari Kemerdekaan RI",
    },
    date: "2025-08-17",
    type: "national",
    description: {
      de: "Indonesischer Unabhängigkeitstag",
      en: "Indonesian Independence Day",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: false,
      attractions: false,
    },
  },
  {
    id: "christmas-2025",
    name: { de: "Weihnachten", en: "Christmas", id: "Hari Raya Natal" },
    date: "2025-12-25",
    type: "christian",
    description: {
      de: "Christliches Weihnachtsfest",
      en: "Christian Christmas",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: true,
      attractions: false,
    },
  },

  // 2026 Holidays
  {
    id: "new-year-2026",
    name: { de: "Neujahr", en: "New Year", id: "Tahun Baru Masehi" },
    date: "2026-01-01",
    type: "national",
    description: {
      de: "Gesetzlicher Feiertag",
      en: "National public holiday",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: false,
      attractions: false,
    },
  },
  {
    id: "chinese-ny-2026",
    name: {
      de: "Chinesisches Neujahr",
      en: "Chinese New Year",
      id: "Tahun Baru Imlek",
    },
    date: "2026-02-17",
    type: "national",
    description: {
      de: "Chinesisches Neujahrsfest",
      en: "Chinese Lunar New Year",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: true,
      attractions: false,
    },
  },
  {
    id: "nyepi-2026",
    name: {
      de: "Nyepi - Tag der Stille",
      en: "Nyepi - Day of Silence",
      id: "Hari Raya Nyepi",
    },
    date: "2026-03-19",
    type: "hindu",
    description: {
      de: "Hinduistischer Feiertag - Alles geschlossen, auch Flughafen!",
      en: "Hindu New Year - Everything closed, including airport!",
    },
    isPublicHoliday: true,
    closures: { banks: true, government: true, shops: true, attractions: true },
  },
  {
    id: "good-friday-2026",
    name: { de: "Karfreitag", en: "Good Friday", id: "Wafat Isa Al Masih" },
    date: "2026-04-03",
    type: "christian",
    description: {
      de: "Christlicher Feiertag",
      en: "Christian holiday",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: false,
      attractions: false,
    },
  },
  {
    id: "eid-al-fitr-2026",
    name: { de: "Ramadan-Fest", en: "Eid al-Fitr", id: "Hari Raya Idul Fitri" },
    date: "2026-03-20",
    type: "islamic",
    description: {
      de: "Fest des Fastenbrechens (mehrere Tage)",
      en: "Festival of Breaking Fast (multiple days)",
    },
    isPublicHoliday: true,
    closures: {
      banks: true,
      government: true,
      shops: true,
      attractions: false,
    },
  },
];

// Visa types for Indonesia
export const visaTypes = {
  voa: {
    name: { de: "Visa on Arrival (VoA)", en: "Visa on Arrival (VoA)" },
    duration: 30,
    extendable: true,
    extensionDays: 30,
    price: 500000, // IDR
    description: {
      de: "Bei Ankunft erhältlich, 30 Tage, einmal um 30 Tage verlängerbar",
      en: "Available on arrival, 30 days, extendable once for 30 days",
    },
    eligibleCountries: [
      "DE",
      "AT",
      "CH",
      "US",
      "GB",
      "AU",
      "CA",
      "FR",
      "NL",
      "IT",
      "ES",
    ],
  },
  evoa: {
    name: { de: "e-Visa on Arrival", en: "e-Visa on Arrival" },
    duration: 30,
    extendable: true,
    extensionDays: 30,
    price: 500000,
    description: {
      de: "Online vor Reiseantritt beantragen, schneller am Flughafen",
      en: "Apply online before travel, faster at airport",
    },
    url: "https://molina.imigrasi.go.id/",
  },
  b211a: {
    name: { de: "Touristenvisum (B211A)", en: "Tourist Visa (B211A)" },
    duration: 60,
    extendable: true,
    extensionDays: 60,
    price: 1500000,
    description: {
      de: "Vorab beantragen, 60 Tage, mehrfach um 60 Tage verlängerbar (bis 180 Tage)",
      en: "Apply in advance, 60 days, extendable multiple times (up to 180 days)",
    },
  },
  fck: {
    name: { de: "Freizügigkeitsvisum (FKK)", en: "Second Home Visa" },
    duration: 365,
    extendable: true,
    extensionDays: 365,
    price: 2000000000, // Proof of funds required
    description: {
      de: "Für Langzeitaufenthalt, 5 Jahre, erfordert Nachweis von ~$130k USD",
      en: "For long-term stay, 5 years, requires ~$130k USD proof of funds",
    },
  },
};

// Calculate visa expiry
export function calculateVisaExpiry(
  entryDate: string,
  visaType: "voa" | "evoa" | "b211a",
): {
  expiryDate: Date;
  daysRemaining: number;
  isExpired: boolean;
  extensionDeadline: Date | null;
} {
  const entry = new Date(entryDate);
  const duration = visaType === "b211a" ? 60 : 30;
  const expiryDate = new Date(entry);
  expiryDate.setDate(expiryDate.getDate() + duration);

  const today = new Date();
  const daysRemaining = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isExpired = daysRemaining < 0;

  // Extension deadline (7 days before expiry)
  const extensionDeadline = new Date(expiryDate);
  extensionDeadline.setDate(extensionDeadline.getDate() - 7);

  return {
    expiryDate,
    daysRemaining,
    isExpired,
    extensionDeadline,
  };
}

// Get upcoming holidays
export function getUpcomingHolidays(daysAhead: number = 30): Holiday[] {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return indonesianHolidays.filter((holiday) => {
    const hDate = new Date(holiday.date);
    return hDate >= today && hDate <= cutoff;
  });
}

// Check if today is a holiday
export function isTodayHoliday(): Holiday | null {
  const today = new Date().toISOString().split("T")[0];
  return indonesianHolidays.find((h) => h.date === today) || null;
}

// Get Nyepi dates (calculated by Balinese Pawukon calendar)
export function getNyepiDates(): { year: number; date: string }[] {
  return [
    { year: 2025, date: "2025-03-29" },
    { year: 2026, date: "2026-03-19" },
    { year: 2027, date: "2027-03-08" },
    { year: 2028, date: "2028-02-26" },
  ];
}

// Visa tips
export const visaTips = {
  de: [
    "Reisepass muss mindestens 6 Monate gültig sein",
    "VoA kann nur einmal verlängert werden",
    "Verlängerung 7 Tage vor Ablauf beantragen",
    "Overstay: 1.000.000 IDR pro Tag Strafe",
    "Bei Overstay > 60 Tagen: Abschiebung und Einreisesperre",
    "e-VoA online beantragen: molina.imigrasi.go.id",
  ],
  en: [
    "Passport must be valid for at least 6 months",
    "VoA can only be extended once",
    "Apply for extension 7 days before expiry",
    "Overstay fine: 1,000,000 IDR per day",
    "Overstay > 60 days: Deportation and entry ban",
    "Apply e-VoA online: molina.imigrasi.go.id",
  ],
};
