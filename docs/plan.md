# BaliBuddy PWA - Detailed Functional Implementation Plan

## Executive Summary
This document outlines the complete implementation strategy for BaliBuddy, a Progressive Web App (PWA) travel companion for backpackers in Bali. The plan covers all 22 features with a focus on offline-first architecture, German language support, and modern UI/UX.

## Technology Stack Summary
- **Framework:** Expo SDK 55 with react-native-web
- **Routing:** Expo Router (src/app directory structure)
- **Styling:** NativeWind v5 (Tailwind CSS)
- **Database:** WatermelonDB with LokiJS (IndexedDB) adapter
- **Maps:** maplibre-gl or react-map-gl
- **OCR:** react-webcam + tesseract.js
- **Localization:** i18next-react
- **Icons:** lucide-react-native
- **Offline:** Service Workers with aggressive caching

---

## Phase 1: Project Initialization ✅ COMPLETED

### Completed Actions
- [x] Initialize Expo project with SDK 55 template
- [x] Create .clinerules with project standards
- [x] Document all 22 feature requirements in docs/requirements.md

---

## Phase 2: Hyper-Scalable Localization, Navigation & PWA Setup

### Action 2.1: Install Core Dependencies
**Command Sequence:**
```bash
npm install expo-router react-native-safe-area-context react-native-web
npm install i18next react-i18next
npm install lucide-react-native
npm install nativewind@^5.0.0 tailwindcss@^3.4.0
```

**Verification:**
- [ ] All packages installed without errors
- [ ] package.json updated with new dependencies
- [ ] No native-only modules installed

### Action 2.2: Setup i18next Localization System
**File Structure:**
```
src/
├── i18n/
│   ├── index.ts              # i18next configuration
│   ├── de.json               # German (PRIMARY)
│   ├── en.json               # English (secondary)
│   ├── es.json               # Spanish (placeholder)
│   ├── fr.json               # French (placeholder)
│   └── ja.json               # Japanese (placeholder)
└── components/
    └── LanguageToggle.tsx    # Language switcher component
```

**Implementation Steps:**
1. Create `src/i18n/index.ts`:
   - Configure i18next with German as default
   - Setup language detection
   - Configure fallback language (en)
   - Enable interpolation

2. Create `src/i18n/de.json` (COMPLETE GERMAN TRANSLATIONS):
   - All UI text in German
   - Nested structure by feature:
     ```json
     {
       "common": { "loading": "Laden...", "error": "Fehler" },
       "navigation": { "home": "Startseite", "map": "Karte" },
       "currency": { "title": "Währungsrechner", "convert": "Umrechnen" },
       "phrasebook": { "title": "Sprachführer", "search": "Suchen" }
     }
     ```

3. Create `src/i18n/en.json` (MIRROR STRUCTURE):
   - Same keys, English translations
   - Proof of concept for scalability

4. Create `src/components/LanguageToggle.tsx`:
   - Dropdown or button toggle
   - Persists selection in AsyncStorage
   - Smooth language switching

**Verification:**
- [ ] i18next configured with German default
- [ ] Language toggle component functional
- [ ] All UI text uses i18n keys
- [ ] Language persists across sessions

### Action 2.3: PWA Manifest & Service Worker
**File Structure:**
```
public/
├── manifest.json           # PWA manifest
├── sw.js                  # Service Worker
├── icons/                 # App icons (192x192, 512x512)
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
└── index.html             # Entry point
```

**Implementation Steps:**
1. Create `public/manifest.json`:
   ```json
   {
     "name": "BaliBuddy",
     "short_name": "BaliBuddy",
     "description": "Offline-Reise-Companion für Backpacker in Bali",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#FFFFFF",
     "theme_color": "#00B4D8",
     "icons": [...]
   }
   ```

2. Create `public/sw.js`:
   - Cache all static assets
   - Cache API responses with TTL
   - Offline fallback pages
   - Background sync for pending data

3. Create App Icons:
   - Generate 192x192 and 512x512 PNG icons
   - Use tropical teal color (#00B4D8)
   - Simple, recognizable design

**Verification:**
- [ ] manifest.json valid
- [ ] Service Worker registers successfully
- [ ] Icons display correctly
- [ ] App installable on mobile

### Action 2.4: Add to Home Screen (A2HS) Prompt
**File Structure:**
```
src/components/
└── InstallPrompt.tsx       # A2HS UI component
```

**Implementation Steps:**
1. Create `src/components/InstallPrompt.tsx`:
   - Detect if app is installed
   - Show install banner for iOS Safari
   - Show install button for Android/Desktop
   - Dismiss and remember preference
   - German text: "App zum Startbildschirm hinzufügen"

2. Integration:
   - Add to main layout
   - Show only if not installed
   - Respect user dismissal

**Verification:**
- [ ] A2HS prompt shows on iOS Safari
- [ ] Install button works on Android/Desktop
- [ ] Dismissal remembered
- [ ] All text in German

### Action 2.5: NativeWind & Tailwind Configuration
**File Structure:**
```
├── tailwind.config.js      # Tailwind configuration
├── babel.config.js         # Babel configuration
└── src/
    ├── global.css          # Global styles
    └── app/_layout.tsx     # Root layout with providers
```

**Implementation Steps:**
1. Create `tailwind.config.js`:
   - Custom colors (tropical teal, rice-paddy green, coral sunset)
   - Custom spacing for Bento-Grid
   - Font family configuration

2. Update `babel.config.js`:
   - Add NativeWind plugin
   - Configure for Expo

3. Create `src/global.css`:
   - Import Tailwind directives
   - Define CSS variables for colors
   - Bento-Grid base styles

4. Update `src/app/_layout.tsx`:
   - Wrap with NativeWind provider
   - Add i18n provider
   - Add SafeAreaProvider

**Verification:**
- [ ] Tailwind classes work
- [ ] Custom colors accessible
- [ ] Bento-Grid responsive
- [ ] No styling errors

---

## Phase 3: Web-Compatible Offline Database

### Action 3.1: Install WatermelonDB with LokiJS
**Command Sequence:**
```bash
npm install @nozbe/watermelondb
npm install @nozbe/with-observables
npm install --save-dev @babel/plugin-proposal-decorators
```

**Configuration:**
1. Update `babel.config.js`:
   ```javascript
   plugins: [
     ['@babel/plugin-proposal-decorators', { 'legacy': true }]
   ]
   ```

2. Create `src/db/index.ts`:
   - Initialize WatermelonDB with LokiJS adapter
   - Configure for web (IndexedDB)
   - Setup database schema

**Verification:**
- [ ] WatermelonDB installed
- [ ] LokiJS adapter configured
- [ ] Database initializes without errors

### Action 3.2: Create Database Schema
**File Structure:**
```
src/db/
├── index.ts                # Database initialization
├── schema.ts               # Database schema
├── models/                 # Data models
│   ├── Currency.ts
│   ├── Phrase.ts
│   ├── Price.ts
│   ├── Station.ts
│   ├── ATM.ts
│   ├── Laundry.ts
│   ├── Bar.ts
│   ├── Clinic.ts
│   ├── Itinerary.ts
│   ├── Expense.ts
│   ├── Contact.ts
│   └── Settings.ts
└── migrations/             # Database migrations
```

**Schema Design:**
```typescript
// Common fields for all models
const commonFields = {
  id: { type: 'string' },
  created_at: { type: 'number' },
  updated_at: { type: 'number' },
  isDeleted: { type: 'boolean' }
};

// Example: Currency model
const Currency = tableSchema({
  name: 'currencies',
  columns: [
    ...commonFields,
    { name: 'code', type: 'string', isIndexed: true },
    { name: 'name', type: 'string' },
    { name: 'symbol', type: 'string' },
    { name: 'rate_to_idr', type: 'number' },
    { name: 'last_updated', type: 'number' }
  ]
});
```

**Verification:**
- [ ] All 22 feature models created
- [ ] Schema validates without errors
- [ ] Models can be queried

### Action 3.3: Environment Variables & Pre-seed Data
**File Structure:**
```
├── .env                    # Environment variables (not in git)
├── .env.example           # Template for .env
└── src/
    └── db/
        └── seed.ts        # Pre-seed data script
```

**Implementation Steps:**
1. Create `.env.example`:
   ```
   EXPO_PUBLIC_API_KEY_EXCHANGE_RATE=your_key_here
   EXPO_PUBLIC_API_KEY_WEATHER=your_key_here
   EXPO_PUBLIC_API_KEY_MAPS=your_key_here
   ```

2. Create `src/db/seed.ts`:
   - Pre-populate currencies (IDR, EUR, USD, etc.)
   - Pre-populate common phrases
   - Pre-populate typical prices
   - Pre-populate emergency contacts

3. Integrate seeding:
   - Run on first app launch
   - Version tracking for updates
   - Incremental updates

**Verification:**
- [ ] .env template created
- [ ] Seed data loads correctly
- [ ] Database populated with static data

---

## Phase 4: Core Toolkit Development (Iterative UI)

### Action 4.1: Offline Currency Converter & Bargaining Guide
**Components:**
```
src/app/
├── currency.tsx            # Currency converter screen
├── bargaining.tsx          # Bargaining guide screen
└── (tabs)/
    └── tools.tsx           # Tools tab
```

**Currency Converter Implementation:**
1. UI Components:
   - Amount input (IDR)
   - Currency selector dropdown
   - Real-time conversion display
   - Last update timestamp
   - Offline indicator

2. Functionality:
   - Fetch rates from ExchangeRate-API
   - Cache rates in WatermelonDB
   - Offline conversion using cached rates
   - Rate refresh button

**Bargaining Guide Implementation:**
1. UI Components:
   - Category filters
   - Price range display
   - Bargaining tips cards
   - Photo examples

2. Functionality:
   - Load prices from database
   - Search/filter items
   - User-contributed prices

**Verification:**
- [ ] Currency converter works online/offline
- [ ] Bargaining guide displays prices
- [ ] UI matches Bento-Grid design
- [ ] German text throughout

### Action 4.2: Emergency Dashboards (Bali Belly, Rabies, Methanol, Scooter)
**Components:**
```
src/app/
├── emergency.tsx           # Emergency dashboard
├── bali-belly.tsx          # Bali Belly SOS
├── rabies.tsx              # Rabies SOS
├── methanol.tsx            # Methanol-free bars
└── scooter.tsx             # Scooter checklist
```

**Emergency Dashboard Implementation:**
1. UI Components:
   - Emergency call buttons (1-tap)
   - Quick access cards
   - Emergency contacts list
   - Location sharing

2. Features:
   - Bali Belly: Recovery diet, doctor booking
   - Rabies: First-aid steps, clinic navigation
   - Methanol: Verified bars database
   - Scooter: Photo checklist, damage docs

**Verification:**
- [ ] Emergency calls work
- [ ] All dashboards accessible
- [ ] Photo capture works
- [ ] German text throughout

### Action 4.3: Calendar & Visa Tracker
**Components:**
```
src/app/
├── calendar.tsx            # Odalan calendar
├── visa.tsx                # Visa tracker
└── etiquette.tsx           # Temple etiquette
```

**Odalan Calendar Implementation:**
1. UI Components:
   - 210-day Pawukon calendar view
   - Ceremony list with dates
   - Temple locations
   - Etiquette guide cards

2. Features:
   - Calculate Pawukon dates
   - Show upcoming ceremonies
   - Temple etiquette tips
   - Offline calendar access

**Visa Tracker Implementation:**
1. UI Components:
   - Entry date picker
   - Countdown timer
   - Extension calculator
   - Penalty information

2. Features:
   - 30-day VoA tracking
   - 60-day extension calculation
   - Overstay warnings
   - Reminder alerts

**Verification:**
- [ ] Calendar calculates correctly
- [ ] Visa countdown works
- [ ] German text throughout

### Action 4.4: Phrasebook & Fare Estimator
**Components:**
```
src/app/
├── phrasebook.tsx          # Phrasebook screen
├── fare.tsx                # Fare estimator
└── (tabs)/
    └── learn.tsx           # Learn tab
```

**Phrasebook Implementation:**
1. UI Components:
   - Category tabs
   - Search bar
   - Phrase cards with audio
   - Favorites list

2. Features:
   - Categories: greetings, directions, food, emergency
   - Audio pronunciation
   - German/English translations
   - Offline access

**Fare Estimator Implementation:**
1. UI Components:
   - Map with red zones
   - Fare calculator form
   - Price comparison
   - Negotiation tips

2. Features:
   - Red zone visualization
   - Offline fare calculation
   - Metered vs fixed comparison
   - Ride-hailing alternatives

**Verification:**
- [ ] Phrasebook searchable
- [ ] Fare calculator accurate
- [ ] German text throughout

---

## Phase 5: Advanced Web Toolkit Integration

### Action 5.1: Visual Food Scanner
**Components:**
```
src/app/
├── scanner.tsx             # Food scanner screen
└── components/
    ├── CameraView.tsx      # Webcam component
    └── MenuCard.tsx        # Translated menu item
```

**Implementation Steps:**
1. UI Components:
   - Camera viewfinder
   - Capture button
   - Processing indicator
   - Translated menu display

2. Functionality:
   - Camera access via react-webcam
   - OCR text extraction via tesseract.js
   - Menu text translation
   - Allergen detection
   - Price extraction

**Verification:**
- [ ] Camera captures images
- [ ] OCR extracts text
- [ ] Translation works
- [ ] Allergens flagged

### Action 5.2: Weather & Volcano Alerts API
**File Structure:**
```
src/services/
├── weather.ts              # Weather API service
├── volcano.ts              # Volcano API service
└── api.ts                  # Base API client
```

**Implementation Steps:**
1. Create API Services:
   - BMKG weather API integration
   - MAGMA volcano API integration
   - Error handling
   - Retry logic

2. Data Caching:
   - Cache responses in WatermelonDB
   - TTL-based cache invalidation
   - Offline fallback to cached data

3. UI Integration:
   - Weather cards
   - Volcano alert badges
   - Push notifications (if supported)

**Verification:**
- [ ] Weather data fetches
- [ ] Volcano alerts work
- [ ] Caching functions
- [ ] Offline fallback works

---

## Phase 6: Interactive Web Maps & Contextual UX

### Action 6.1: Install Map Libraries
**Command Sequence:**
```bash
npm install maplibre-gl react-map-gl
npm install @types/maplibre-gl
```

**Configuration:**
1. Update `src/global.css`:
   - Import maplibre-gl CSS
   - Custom map styles

2. Create Map Component:
   - Initialize maplibre-gl
   - Configure map style
   - Add controls

**Verification:**
- [ ] Map renders
- [ ] Controls work
- [ ] Performance acceptable

### Action 6.2: Map Screen with POIs
**Components:**
```
src/app/
├── map.tsx                 # Main map screen
└── components/
    ├── MapView.tsx         # Map container
    ├── POIMarker.tsx       # POI marker component
    └── BottomSheet.tsx     # Animated bottom sheet
```

**POI Layers:**
1. Water Refill Stations:
   - Blue markers
   - Station details on tap
   - Filter by type

2. Laundries:
   - Purple markers
   - Price per kg
   - Service types

3. Safe ATMs:
   - Green markers (safe)
   - Red markers (risky)
   - Security tips

**Verification:**
- [ ] All POI types display
- [ ] Markers are tappable
- [ ] Bottom sheet animates
- [ ] Filters work

### Action 6.3: Ferry Tracker & Crowd-Radar
**Components:**
```
src/app/
├── ferries.tsx             # Ferry tracker screen
└── crowd.tsx               # Crowd-radar screen
```

**Ferry Tracker Implementation:**
1. API Integration:
   - AIS data API
   - Real-time positions
   - Route information

2. UI Components:
   - Ferry markers on map
   - Route lines
   - ETA display
   - Booking links

**Crowd-Radar Implementation:**
1. Data Sources:
   - Historical data
   - Real-time estimates
   - User reports

2. UI Components:
   - Heatmap overlay
   - Crowd density colors
   - Best time suggestions
   - Alternative attractions

**Verification:**
- [ ] Ferry positions update
- [ ] Crowd data displays
- [ ] Historical data available
- [ ] German text throughout

---

## Phase 7: Smart Group Planning & Community

### Action 7.1: Drag-and-Drop Itinerary Planner
**Components:**
```
src/app/
├── itinerary.tsx           # Itinerary screen
└── components/
    ├── DayCard.tsx         # Day container
    ├── ActivityCard.tsx    # Activity item
    └── SquadManager.tsx    # Group member manager
```

**Implementation Steps:**
1. Drag-and-Drop:
   - Use react-beautiful-dnd or similar
   - Reorder activities within days
   - Move activities between days
   - Smooth animations

2. Squad Management:
   - Add group members by name
   - Assign activities to members
   - Shared itinerary view

3. Offline Persistence:
   - Save to WatermelonDB
   - Sync when online
   - Conflict resolution

**Verification:**
- [ ] Drag-and-drop works
- [ ] Squad features function
- [ ] Data persists offline
- [ ] German text throughout

### Action 7.2: Group Expense Splitter
**Components:**
```
src/app/
├── expenses.tsx            # Expense tracker screen
└── components/
    ├── ExpenseForm.tsx     # Add expense form
    ├── ExpenseList.tsx     # Expense list
    └── Settlement.tsx      # Settlement calculator
```

**Implementation Steps:**
1. Expense Management:
   - Add expenses with description
   - Assign to payer
   - Split among members
   - IDR currency support

2. Settlement Calculation:
   - Calculate who owes whom
   - Optimize settlements
   - Export reports

3. Offline Persistence:
   - Save to WatermelonDB
   - Offline calculations
   - Sync when online

**Verification:**
- [ ] Expenses add correctly
- [ ] Splits calculate right
- [ ] Settlements accurate
- [ ] German text throughout

### Action 7.3: Smart Packing List
**Components:**
```
src/app/
├── packing.tsx             # Packing list screen
└── components/
    ├── PackingCategory.tsx # Category section
    ├── PackingItem.tsx     # Individual item
    └── PackingSuggestions.tsx # Smart suggestions
```

**Implementation Steps:**
1. Smart Suggestions:
   - Weather-based items
   - Activity-based items
   - Duration-based items

2. Customization:
   - Add custom items
   - Remove suggestions
   - Reorder items

3. Offline Persistence:
   - Save to WatermelonDB
   - Check/uncheck items
   - Export/share list

**Verification:**
- [ ] Suggestions are relevant
- [ ] Customization works
- [ ] Data persists
- [ ] German text throughout

### Action 7.4: Ride-Share & Safety Check-in
**Components:**
```
src/app/
├── rideshare.tsx           # Ride-share screen
└── safety.tsx              # Safety check-in screen
```

**Ride-Share Implementation:**
1. Matching System:
   - Input origin/destination
   - Match similar routes
   - Contact travelers

2. Safety Features:
   - Profile verification
   - In-app messaging
   - Review system

**Safety Check-in Implementation:**
1. Timer System:
   - Set check-in interval
   - Countdown timer
   - Emergency alerts

2. Emergency Features:
   - GPS location sharing
   - Emergency contact alerts
   - Panic button

**Verification:**
- [ ] Matching works
- [ ] Safety features function
- [ ] Alerts trigger correctly
- [ ] German text throughout

---

## Post-Implementation Verification

### Final Testing Checklist
- [ ] All 22 features implemented
- [ ] Web build succeeds: `npm run web`
- [ ] No console errors
- [ ] Offline functionality verified
- [ ] German text throughout
- [ ] Responsive on 320px-1920px
- [ ] PWA installable
- [ ] Service Worker caching works
- [ ] Language toggle functions
- [ ] Bento-Grid consistent
- [ ] Performance acceptable

### Deployment Checklist
- [ ] Production build: `npm run build:web`
- [ ] Service Worker deployed
- [ ] manifest.json valid
- [ ] Icons included
- [ ] HTTPS configured
- [ ] Analytics added (optional)

---

## Risk Mitigation

### Technical Risks
1. **Native Module Compatibility:**
   - Mitigation: Strict .clinerules enforcement
   - Verification: Regular web builds

2. **Offline Data Sync:**
   - Mitigation: WatermelonDB with LokiJS
   - Verification: Offline testing

3. **Performance:**
   - Mitigation: Code splitting, lazy loading
   - Verification: Lighthouse audits

### UX Risks
1. **Language Support:**
   - Mitigation: i18next with scalable JSON
   - Verification: Native speaker review

2. **Accessibility:**
   - Mitigation: WCAG 2.1 compliance
   - Verification: Accessibility audits

---

## Timeline Estimates

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 2 | 2-3 days | Phase 1 |
| Phase 3 | 1-2 days | Phase 2 |
| Phase 4 | 5-7 days | Phase 3 |
| Phase 5 | 2-3 days | Phase 4 |
| Phase 6 | 3-4 days | Phase 5 |
| Phase 7 | 4-5 days | Phase 6 |
| **Total** | **17-24 days** | Sequential |

---

## Success Criteria
1. All 22 features functional
2. 100% offline capability
3. German language throughout
4. Clean, modern UI (Bento-Grid)
5. PWA installable
6. No console errors
7. Responsive design
8. Performance score > 90

---

**Document Version:** 1.0
**Last Updated:** Phase 1 Complete
**Maintained by:** BaliBuddy PWA Team