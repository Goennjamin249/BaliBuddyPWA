// Red Zone Taxi GeoJSON for Bali
// These polygons represent areas where taxi scams are common

export const taxiRedZones = {
  type: "FeatureCollection" as const,
  features: [
    // Kuta Beach Area
    {
      type: "Feature" as const,
      properties: {
        name: "Kuta Beach - Taxi Scam Zone",
        description: "High risk of taxi scams. Use ride-hailing apps instead.",
        riskLevel: "high",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [115.1685, -8.7185],
          [115.1725, -8.7185],
          [115.1725, -8.7225],
          [115.1685, -8.7225],
          [115.1685, -8.7185],
        ]],
      },
    },
    // Legian Area
    {
      type: "Feature" as const,
      properties: {
        name: "Legian - Taxi Scam Zone",
        description: "Aggressive taxi touts. Book transport through hotel.",
        riskLevel: "high",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [115.1685, -8.7050],
          [115.1725, -8.7050],
          [115.1725, -8.7120],
          [115.1685, -8.7120],
          [115.1685, -8.7050],
        ]],
      },
    },
    // Seminyak Square
    {
      type: "Feature" as const,
      properties: {
        name: "Seminyak Square - Taxi Scam Zone",
        description: "Fixed price taxis only. Meter often 'broken'.",
        riskLevel: "medium",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [115.1650, -8.6880],
          [115.1700, -8.6880],
          [115.1700, -8.6930],
          [115.1650, -8.6930],
          [115.1650, -8.6880],
        ]],
      },
    },
    // Ubud Monkey Forest
    {
      type: "Feature" as const,
      properties: {
        name: "Ubud Monkey Forest - Taxi Scam Zone",
        description: "Drivers claim attractions are closed. Verify independently.",
        riskLevel: "medium",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [115.2580, -8.5220],
          [115.2650, -8.5220],
          [115.2650, -8.5280],
          [115.2580, -8.5280],
          [115.2580, -8.5220],
        ]],
      },
    },
    // Tanah Lot Temple
    {
      type: "Feature" as const,
      properties: {
        name: "Tanah Lot - Taxi Scam Zone",
        description: "Drivers demand inflated return fares. Arrange round-trip in advance.",
        riskLevel: "high",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [115.0850, -8.6180],
          [115.0920, -8.6180],
          [115.0920, -8.6250],
          [115.0850, -8.6250],
          [115.0850, -8.6180],
        ]],
      },
    },
    // Uluwatu Temple
    {
      type: "Feature" as const,
      properties: {
        name: "Uluwatu - Taxi Scam Zone",
        description: "Drivers wait and charge premium. Use Gojek/Grab pickup point.",
        riskLevel: "high",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [115.0820, -8.8320],
          [115.0880, -8.8320],
          [115.0880, -8.8380],
          [115.0820, -8.8380],
          [115.0820, -8.8320],
        ]],
      },
    },
    // Ngurah Rai Airport
    {
      type: "Feature" as const,
      properties: {
        name: "Airport - Taxi Scam Zone",
        description: "Official airport taxis only. Avoid touts inside terminal.",
        riskLevel: "high",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [115.1620, -8.7450],
          [115.1720, -8.7450],
          [115.1720, -8.7520],
          [115.1620, -8.7520],
          [115.1620, -8.7450],
        ]],
      },
    },
  ],
};

// Taxi fare guidelines (IDR)
export const taxiFareGuidelines = {
  airportToKuta: { min: 50000, max: 80000, currency: "IDR" },
  airportToSeminyak: { min: 80000, max: 120000, currency: "IDR" },
  airportToSanur: { min: 100000, max: 150000, currency: "IDR" },
  airportToUbud: { min: 250000, max: 350000, currency: "IDR" },
  airportToNusaDua: { min: 100000, max: 150000, currency: "IDR" },
  kutaToSeminyak: { min: 50000, max: 80000, currency: "IDR" },
  seminyakToUbud: { min: 200000, max: 300000, currency: "IDR" },
  ubudToSanur: { min: 150000, max: 250000, currency: "IDR" },
};

// Tips for avoiding taxi scams
export const taxiTips = {
  de: [
    "Immer Taxameter verlangen ('Pakai meter')",
    "Gojek oder Grab App bevorzugen",
    "Fahrpreis vor Fahrtantritt vereinbaren",
    "Hotel-Transport bevorzugen",
    "Keine 'Pauschalpreise' akzeptieren",
    "Route auf Google Maps überprüfen",
  ],
  en: [
    "Always insist on meter ('Pakai meter')",
    "Prefer Gojek or Grab app",
    "Agree on fare before starting trip",
    "Use hotel transport when possible",
    "Avoid flat rate offers",
    "Check route on Google Maps",
  ],
};
