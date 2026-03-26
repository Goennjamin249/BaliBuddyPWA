# BaliBuddy PWA - Requirements Documentation

## Project Overview
BaliBuddy is an offline-capable, highly contextual, and hyper-minimalist PWA travel companion for backpackers in Bali. The app is built as a Progressive Web App (PWA) with German as the primary language.

## Technology Stack (Web-Only)
- **Framework:** Expo SDK 55 with react-native-web
- **Routing:** Expo Router (src/app directory)
- **Styling:** NativeWind v5 (Tailwind CSS)
- **Database:** WatermelonDB with LokiJS (IndexedDB) adapter
- **Maps:** maplibre-gl or react-map-gl (Web compatible)
- **OCR:** react-webcam + tesseract.js
- **Localization:** i18next-react (German primary)
- **Icons:** lucide-react-native
- **Offline:** Service Workers with aggressive caching

---

## Feature Requirements (22 Total Features)

### 1. Smart Group & Solo Itinerary Planner
**Description:** Drag-and-drop planner for creating travel itineraries
**Requirements:**
- Drag-and-drop functionality for reordering activities
- Create "Squads" by adding group members by name
- Support for solo and group planning modes
- Date/time scheduling capabilities
- Offline persistence of itinerary data
- Share itineraries with group members

### 2. Smart Packing List
**Description:** Weather and activity-based packing list generator
**Requirements:**
- Weather-based suggestions (tropical climate considerations)
- Activity-based recommendations (temple visits, beach, hiking)
- Customizable item categories
- Check/uncheck items as packed
- Offline persistence
- Export/share functionality

### 3. Offline Currency Converter
**Description:** Currency conversion with live data caching
**Requirements:**
- Fetches LIVE data from ExchangeRate-API
- Offline caching of exchange rates
- Support for IDR (Indonesian Rupiah) and major currencies
- Quick conversion interface
- Historical rate tracking
- Display last update timestamp

### 4. Water Refill Map
**Description:** Geofenced POIs for eco-friendly drinking water refill stations
**Requirements:**
- Map-based visualization of refill stations
- Geofencing for nearby alerts
- Station details (hours, price, water type)
- Offline map support
- User reviews/ratings
- Add new stations functionality

### 5. Odalan Calendar & Temple Etiquette Guide
**Description:** Calendar tracking the 210-day Balinese Pawukon cycle
**Requirements:**
- 210-day Pawukon calendar integration
- Odalan ceremony dates and locations
- Temple etiquette guide (dress code, behavior)
- Offline calendar access
- Reminder notifications for upcoming ceremonies
- Detailed ceremony descriptions

### 6. Offline Bahasa Indonesia Phrasebook
**Description:** Translated phrasebook in German/English
**Requirements:**
- Essential travel phrases with audio pronunciation
- German and English translations
- Categories: greetings, directions, food, emergency, bargaining
- Offline access to all phrases
- Search functionality
- Favorites/bookmarks

### 7. Bargaining & Price Guide
**Description:** Database for typical market items to prevent scams
**Requirements:**
- Common items with fair price ranges (IDR)
- Market-specific pricing
- Bargaining tips and strategies
- Photo examples of items
- Offline database
- User-contributed prices

### 8. Weather & Volcano Alerts
**Description:** LIVE data integration with local BMKG / MAGMA APIs
**Requirements:**
- Real-time weather data for Bali regions
- Volcanic activity alerts from MAGMA API
- Severe weather warnings
- 7-day forecast
- Offline cached weather data
- Push notification alerts

### 9. Laundry Finder
**Description:** Map-based tool to find local laundries with price per kg
**Requirements:**
- Map visualization of laundry locations
- Price per kg information
- Service types (wash, dry clean, iron)
- Operating hours
- User ratings
- Offline access to saved laundries

### 10. Ferry & Fast Boat Tracker
**Description:** LIVE AIS data integration for real-time ferry locations
**Requirements:**
- Real-time ferry locations on map
- AIS data integration
- Route information and schedules
- Estimated arrival times
- Offline cached schedules
- Booking links

### 11. Visual Food Scanner (Web)
**Description:** Scan Warung menus and translate using OCR
**Requirements:**
- Camera integration via react-webcam
- OCR text extraction via tesseract.js
- Menu translation to German/English
- Allergen warnings
- Dish descriptions
- Price information

### 12. Safe ATM Finder & Skimming Radar
**Description:** Guides users to secure ATMs inside bank branches
**Requirements:**
- Map of secure ATM locations
- Bank branch ATMs prioritized
- Skimming risk alerts
- ATM security tips
- Operating hours
- Offline saved locations

### 13. Visa & Overstay Tracker
**Description:** Calculates 30-day (VoA) and 60-day limits
**Requirements:**
- Visa on Arrival (VoA) 30-day tracking
- 60-day extension calculations
- Overstay penalty information
- Entry date input
- Countdown timer
- Extension reminder alerts

### 14. Methanol-Free Verified Bars
**Description:** Database to prevent methanol poisoning
**Requirements:**
- Verified safe bars and restaurants
- Methanol risk warnings
- Safe drinking guidelines
- Emergency contact if poisoned
- User reports of unsafe venues
- Regular verification updates

### 15. Bali Belly SOS & On-Demand Doctor
**Description:** Emergency dashboard with 1-tap call buttons
**Requirements:**
- 1-tap emergency call buttons
- Doctor consultation booking
- Recovery diet guide (Bubur Ayam, etc.)
- Pharmacy locator
- Symptom checker
- Medical phrase translations

### 16. Ride-Share Matchmaking
**Description:** Social feature for solo-travelers
**Requirements:**
- Connect solo travelers for shared rides
- Route matching (origin/destination)
- Cost splitting
- Safety verification
- In-app messaging
- Review system

### 17. Crowd-Radar
**Description:** Real-time tracker showing how crowded tourist spots are
**Requirements:**
- Real-time crowd density visualization
- Popular attraction ratings
- Best time to visit suggestions
- Alternative less-crowded options
- Historical crowd data
- Offline cached information

### 18. Solo-Traveler Safety Check-in
**Description:** Timer-based system that alerts emergency contacts
**Requirements:**
- Configurable check-in timer
- Emergency contact alerts
- GPS location sharing
- Panic button
- Automatic alerts if timer expires
- Contact management

### 19. Group Expense Splitter
**Description:** Track shared costs in IDR
**Requirements:**
- Add expenses with descriptions
- Split costs among group members
- IDR currency support
- Settlement calculations
- Export expense reports
- Offline persistence

### 20. Scooter Anti-Scam & Safety Checklist
**Description:** Guided pre-rental inspection tool requiring photo evidence
**Requirements:**
- Step-by-step inspection checklist
- Photo evidence capture
- Damage documentation
- Rental agreement tips
- Insurance information
- Safety gear recommendations

### 21. "Red Zone" Taxi-Radar & Fare Estimator
**Description:** Map visualizing transport restricted zones with offline fare calculator
**Requirements:**
- Red zone visualization on map
- Offline fare calculator
- Metered vs fixed price comparison
- Ride-hailing app alternatives
- Negotiation tips
- Route suggestions

### 22. Rabies (Tollwut) SOS & Vaccine Radar
**Description:** Emergency first-aid for monkey/dog bites and clinic navigation
**Requirements:**
- Emergency first-aid steps for animal bites
- PEP (Post-Exposure Prophylaxis) vaccine clinic locations
- Rabies symptom information
- 1-tap emergency contacts
- Hospital navigation
- Prevention tips

---

## UI/UX Requirements

### Visual Design
- Light Mode ONLY (no dark mode)
- Tropical teal (#00B4D8) - primary accent
- Rice-paddy green (#90BE6D) - success/nature
- Coral sunset (#FF6B6B) - alerts/warnings
- Clean white backgrounds with subtle shadows
- Rounded corners (16px-24px border radius)

### Layout System
- Bento-Grid card-based design
- 4-column grid on desktop, 2-column on mobile
- Consistent 16px spacing between cards
- Cards: white background, subtle shadow, hover effects
- Maximum 6-8 cards visible per screen

### Typography
- System font stack (SF Pro, Inter, sans-serif)
- Headlines: Bold, 24-32px
- Body: Regular, 16px
- Captions: 14px, muted color

### Internationalization
- Default language: German (de)
- Secondary language: English (en) for proof of concept
- Infinitely scalable JSON structure for additional languages
- All UI text must use i18n keys

### PWA Requirements
- "display": "standalone" in manifest.json
- Service Worker for offline caching
- "Add to Home Screen" (A2HS) prompt
- Works fully offline
- IndexedDB for all persistent data

---

## Database Schema Requirements

### Common Fields (All Models)
- `id`: Primary key (UUID)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update
- `isDeleted`: Soft delete flag

### Indexed Fields
- Frequently queried fields must be indexed
- Foreign keys for relationships
- Search-optimized text fields

### Pre-seed Data
- Static data (phrases, prices, etc.) pre-loaded
- Regular updates for dynamic data
- Version tracking for data updates

---

## Security Requirements
- Input validation on all forms
- XSS protection
- CSRF protection
- Secure API key storage
- No sensitive data in localStorage
- HTTPS-only in production

---

## Performance Requirements
- Initial load time: < 3 seconds
- Time to interactive: < 5 seconds
- Offline functionality: 100%
- Smooth animations: 60fps
- Responsive on 320px to 1920px screens

---

## Testing Requirements
- Web builds must pass: `npm run web`
- No console errors in production build
- Offline functionality verified
- German text displaying correctly
- Responsive on all screen sizes
- Accessibility compliance (WCAG 2.1)

---

**Document Version:** 1.0
**Last Updated:** Phase 1 - Project Init
**Maintained by:** BaliBuddy PWA Team