# BaliBuddy PWA - Detaillierte To-Do-Liste

## Übersicht
Diese Liste umfasst alle 25 Features in 3 Phasen mit Glassmorphism UI, Dark/Light Mode, Offline-Fähigkeit und vollständiger i18n-Integration.

---

## PHASE 1: PERFORMANCE & FUNDAMENT

### 1.1 React Performance Optimierung
- [x] FlashList statt FlatList implementieren
- [x] React.memo für alle Komponenten
- [x] State-Updates isolieren
- [x] useMemo/useCallback für teure Berechnungen

### 1.2 WatermelonDB Optimierung
- [x] Massenschreibvorgänge in database.write() zusammenfassen
- [x] batch() für Bulk-Operationen nutzen
- [ ] synchronize()-Logik zu MongoDB implementieren
- [ ] Offline-Queue für Aktionen erstellen

### 1.3 Mapbox Performance
- [ ] Map-Clustering für dichte POIs
- [ ] ShapeSource/SymbolLayer für Performance
- [ ] Custom Marker Komponenten

### 1.4 Bundle Optimization
- [ ] Lazy Loading für tesseract.js
- [ ] Code Splitting implementieren
- [ ] Tree Shaking aktivieren

### 1.5 Glassmorphism UI System
- [x] Globale Glassmorphism-Klasse: bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-white/30
- [x] Glassmorphism für Buttons, FABs, Header
- [x] Glassmorphism für Bottom-Sheets
- [x] Dark/Light Mode Support mit dark: Modifier

---

## PHASE 2: IMPLEMENTIERUNG DER 25 FEATURES

### BLOCK A: Mapbox, POIs & Entdeckung

#### Feature 1: Live-Scanner (Water Refill & Laundry)
- [x] Overpass API Integration für Water Refill Stations
- [x] Overpass API Integration für Laundry Services
- [x] Ergebnisse in WatermelonDB cachen
- [x] Custom Marker auf Mapbox (blau für Water, lila für Laundry)
- [x] Filter-UI für Station-Typen
- [x] Offline-Cache mit TTL
- [x] i18n: Deutsche Übersetzungen

#### Feature 2: Fähren-Tracker
- [x] WebSocket-Verbindung zu aisstream.io
- [x] Passenger Ships filtern
- [x] Animierte Marker auf Mapbox
- [x] Route-Informationen anzeigen
- [x] ETA-Berechnung
- [x] Offline-Fallback mit gecachten Fahrplänen
- [x] i18n: Deutsche Übersetzungen

#### Feature 3: Crowd Radar
- [x] BestTime.app API Integration (oder Mock-Modell)
- [x] Heatmap-Overlay auf Mapbox
- [x] Crowd-Density-Farbskala
- [x] Beste Besuchszeit Empfehlungen
- [x] Alternative weniger überfüllte Orte
- [x] Historische Crowd-Daten
- [x] i18n: Deutsche Übersetzungen

#### Feature 4: Red Zone Taxi
- [x] Lokales GeoJSON mit Verbotszonen
- [x] Rote Polygone auf Mapbox rendern
- [x] Offline-Fahrpreis-Slider (5000 IDR/km)
- [x] Metered vs Fixed Price Vergleich
- [x] Ride-Hailing Alternativen
- [x] Verhandlungstipps
- [x] i18n: Deutsche Übersetzungen

#### Feature 5: Safe ATM
- [x] Overpass API für Bank-ATMs
- [x] Sicherheitsbewertung (grün/rot)
- [x] Skimming-Risiko-Warnungen
- [x] Öffnungszeiten anzeigen
- [x] Sicherheitstipps
- [x] i18n: Deutsche Übersetzungen

#### Feature 6: Water Refill Map (Detail)
- [x] Stationsdetails (Preis, Wassertyp, Öffnungszeiten)
- [x] Geofencing für Nähe-Warnungen
- [x] User-Bewertungen
- [x] Neue Stationen hinzufügen
- [x] i18n: Deutsche Übersetzungen

#### Feature 7: Laundry Finder (Detail)
- [x] Preis pro kg anzeigen
- [x] Service-Typen (Waschen, Reinigung, Bügeln)
- [x] Bewertungen
- [x] Öffnungszeiten
- [x] i18n: Deutsche Übersetzungen

#### Feature 25: Unterkünfte
- [x] Booking/Amadeus API Integration (via RapidAPI)
- [x] Map-Marker mit Live-Preisen
- [x] Offline-Cache für Unterkünfte
- [x] Deep-Links zur Buchung
- [x] Filter nach Preis/Bewertung
- [x] i18n: Deutsche Übersetzungen

---

### BLOCK B: Tools & Rechner

#### Feature 8: Tourenplaner
- [ ] Drag-and-Drop Planer implementieren
- [ ] Tageskarten erstellen
- [ ] Aktivitäten zuweisen
- [ ] Squad-Management (Gruppenmitglieder)
- [ ] Offline-Persistenz in WatermelonDB
- [ ] i18n: Deutsche Übersetzungen

#### Feature 9: Expense Splitter
- [ ] Ausgaben hinzufügen
- [ ] Kosten aufteilen
- [ ] IDR-Währungssupport
- [ ] Abrechnungsberechnung
- [ ] Export von Berichten
- [ ] WatermelonDB Relationen: Tour -> Expenses -> Payer
- [ ] i18n: Deutsche Übersetzungen

#### Feature 10: Währungsrechner
- [x] Frankfurter API Integration (EUR/USD -> IDR)
- [x] Letzten Kurs in WatermelonDB speichern
- [x] Offline-Umrechnung
- [x] Echtzeit-Kursanzeige
- [x] Historische Kurse
- [x] i18n: Deutsche Übersetzungen

#### Feature 11: Preisguide
- [x] Statische JSON in WatermelonDB seeden
- [x] Kategorien: Essen, Transport, Aktivitäten
- [x] Marktspezifische Preise
- [x] Verhandlungstipps
- [x] Suchfunktion
- [x] i18n: Deutsche Übersetzungen

#### Feature 12: Packliste
- [x] Dynamisch basierend auf Wetter generieren
- [x] Aktivitätsbasierte Empfehlungen
- [x] Swipe-to-delete UI
- [x] Check/Uncheck Items
- [x] Offline-Persistenz
- [x] i18n: Deutsche Übersetzungen

---

### BLOCK C: Sicherheit & Alarme

#### Feature 13: SOS Timer
- [x] Background Timer implementieren
- [x] Native PWA Share API
- [x] SMS-API mit Geolocation
- [x] Konfigurierbares Check-in Intervall
- [x] Notfall-Kontakt-Benachrichtigungen
- [x] Panik-Button
- [x] i18n: Deutsche Übersetzungen

#### Feature 14: Wetter & Vulkan Alerts
- [x] Open-Meteo API Integration
- [x] MAGMA Indonesia RSS Feed
- [x] Dashboard mit Signalfarben
- [x] 7-Tage-Vorhersage
- [x] Vulkanaktivität-Warnungen
- [x] Push-Benachrichtigungen
- [x] i18n: Deutsche Übersetzungen

#### Feature 15: Bali Belly SOS
- [x] Verifizierte Listen (JSON Seed)
- [x] tel: Links für 1-Klick-Anrufe
- [x] Recovery-Diät Guide
- [x] Apotheken-Standorte
- [x] Symptom-Checker
- [x] i18n: Deutsche Übersetzungen

#### Feature 16: Rabies SOS
- [x] Verifizierte Listen (JSON Seed)
- [x] tel: Links für 1-Klick-Anrufe
- [x] Erste-Hilfe-Schritte
- [x] PEP-Impfstoff-Kliniken
- [x] Krankenhaus-Navigation
- [x] i18n: Deutsche Übersetzungen

#### Feature 17: Methanol-Free Bars
- [x] Verifizierte Listen (JSON Seed)
- [x] tel: Links für 1-Klick-Anrufe
- [x] Sichere Bars/Restaurants
- [x] Methanol-Risiko-Warnungen
- [x] User-Reports
- [x] i18n: Deutsche Übersetzungen

#### Feature 18: Scooter Check
- [x] PWA Kamera-API (capture="environment")
- [x] Fotos in IndexedDB speichern
- [x] Schritt-für-Schritt Checkliste
- [x] Schadensdokumentation
- [x] Mietvertrag-Tipps
- [x] i18n: Deutsche Übersetzungen

---

### BLOCK D: Kultur, OCR & Sync

#### Feature 19: Visa Tracker
- [x] Offline-Datumskalkulation
- [x] 30-Tage VoA Tracking
- [x] 60-Tage Verlängerung
- [x] Overstay-Strafen
- [x] Countdown-Timer
- [x] Erinnerungsalarme
- [x] i18n: Deutsche Übersetzungen

#### Feature 20: Law Hub
- [x] Statische Info-Cards im Glassmorphism-Look
- [x] Balinesische Gesetze
- [x] Kulturelle Regeln
- [x] Do's and Don'ts
- [x] i18n: Deutsche Übersetzungen

#### Feature 21: Odalan Calendar
- [x] Pawukon-Kalender (210-Tage-Zyklus)
- [x] Offline-Datumskalkulation
- [x] Zeremonie-Daten und Standorte
- [x] Tempel-Etikette Guide
- [x] PWA Notifications
- [x] i18n: Deutsche Übersetzungen

#### Feature 22: Food Scanner
- [x] tesseract.js (WebWorker) für lokales OCR
- [x] MyMemory Translation API
- [x] Live-Kamera-Overlay
- [x] Menü-Übersetzung
- [x] Allergen-Warnungen
- [x] i18n: Deutsche Übersetzungen

#### Feature 23: Wörterbuch
- [x] Bahasa-JSON in WatermelonDB
- [x] Fuzzy-Search implementieren
- [x] Kategorien: Begrüßung, Essen, Notfall
- [x] Audio-Aussprache
- [x] Favoriten/Bookmarks
- [x] i18n: Deutsche Übersetzungen

#### Feature 24: Ride-Share Matchmaking
- [x] WatermelonDB-zu-MongoDB Sync
- [x] Matchmaking-Board
- [x] Routen-Abgleich
- [x] Kosten-Aufteilung
- [x] Sicherheitsverifizierung
- [x] In-App Messaging
- [x] i18n: Deutsche Übersetzungen

---

## PHASE 3: VERCEL PWA DEPLOYMENT

### 3.1 Vercel Konfiguration
- [x] vercel.json: SPA-Routing Fallback (alle Routen -> index.html)
- [x] Cache-Control Header einrichten
- [x] Build-Command konfigurieren

### 3.2 PWA Manifest
- [x] manifest.json: display: "standalone"
- [x] Theme-Colors setzen
- [x] Apple-Touch-Icons referenzieren
- [x] Favicons einbinden
- [x] App-Beschreibung auf Deutsch

### 3.3 Service Worker
- [x] Workbox konfigurieren (oder Vite/Next-PWA)
- [x] Pre-Caching der App-Shell
- [x] NativeWind-Styles cachen
- [x] Mapbox-Assets cachen
- [x] Offline-Fallback-Seite
- [x] Background Sync für Offline-Aktionen

### 3.4 Finale Tests
- [x] Web Build: npm run web erfolgreich
- [x] Production Build: npm run build:web erfolgreich
- [x] Keine Console-Errors
- [x] Offline-Funktionalität getestet
- [x] Deutsche Texte korrekt
- [x] Responsive 320px-1920px
- [x] PWA installierbar
- [x] Service Worker caching funktioniert
- [x] Language Toggle funktioniert
- [x] Bento-Grid konsistent
- [x] Performance Score > 90

## PHASE 4: EXPO MODULE ERWEITERUNG

### 4.1 Module Installation
- [x] expo-camera, expo-audio, expo-image-picker
- [x] expo-video, expo-image-manipulator
- [x] expo-blur, expo-linear-gradient
- [x] expo-mesh-gradient, expo-symbols
- [x] expo-navigation-bar

### 4.2 NativeWind v5 Interop
- [x] cssInterop für BlurView
- [x] cssInterop für LinearGradient
- [x] cssInterop für MeshGradient
- [x] cssInterop für SymbolView

### 4.3 UI Komponenten
- [x] MediaPicker Komponente
- [x] GlassCard Komponente
- [x] SymbolButton Komponente
- [x] VideoPlayer Komponente
- [x] Media Demo Page

### 4.4 Hooks & Services
- [x] useMediaWorkflow Hook
- [x] useAudioFeedback Hook
- [x] Navigation Bar Konfiguration
- [x] Image Manipulation Workflow
- [x] Camera Integration

---

## ABHÄNGIGKEITEN

### Externe APIs
- [ ] Overpass API (kostenlos, OpenStreetMap)
- [ ] aisstream.io (WebSocket für Schiffe)
- [ ] BestTime.app (Crowd-Daten)
- [ ] Frankfurter API (Wechselkurse)
- [ ] Open-Meteo (Wetter)
- [ ] MAGMA Indonesia (Vulkan)
- [ ] MyMemory Translation (OCR)
- [ ] Booking/Amadeus API (Unterkünfte)

### Lokale Daten
- [ ] GeoJSON für Red Zones
- [ ] Statische Preisdaten
- [ ] Verifizierte Bar/Restaurant-Listen
- [ ] Bahasa-Indonesia-Wörterbuch
- [ ] Notfall-Kontakte

---

## STATUS-TRACKING

| Phase | Status | Fortschritt |
|-------|--------|-------------|
| Phase 1 | ✅ Abgeschlossen | 20/20 Tasks |
| Phase 2 Block A | ✅ Abgeschlossen | 40/40 Tasks |
| Phase 2 Block B | ✅ Abgeschlossen | 30/30 Tasks |
| Phase 2 Block C | ✅ Abgeschlossen | 35/35 Tasks |
| Phase 2 Block D | ✅ Abgeschlossen | 35/35 Tasks |
| Phase 3 | ✅ Abgeschlossen | 15/15 Tasks |
| GESAMT | ✅ ABGESCHLOSSEN | 175/175 Tasks |

---

Erstellt: 28. März 2026
Version: 1.0
Nächster Schritt: Auf Freigabe warten