# BaliBuddy - Offline-First Reise-Companion für Backpacker in Bali 🌴

## Über das Projekt

BaliBuddy ist eine Progressive Web App (PWA) für Backpacker in Bali. Die App funktioniert vollständig offline und synchronisiert Daten mit MongoDB, wenn eine Internetverbindung verfügbar ist.

## Tech Stack

- **Frontend:** Expo SDK 55 mit React Native Web
- **Styling:** NativeWind v5 (Tailwind CSS)
- **Offline-First:** WatermelonDB mit LokiJS (IndexedDB)
- **Backend:** MongoDB Atlas
- **Deployment:** Vercel
- **Maps:** MapLibre GL

## Architektur

### Offline-First Strategie

- **Client:** WatermelonDB (LokiJS) für lokale Datenspeicherung
- **Server:** MongoDB Atlas für persistente Datenspeicherung
- **Sync:** Bidirektionale Synchronisation über REST API

### Datenbank-Setup

- **Lokale DB:** WatermelonDB mit IndexedDB-Adapter
- **Cloud DB:** MongoDB Atlas (kostenlos für Entwicklung)
- **Sync-Strategie:** Pull/Push mit Change-Tracking

## MongoDB Integration

### Konfiguration

Die MongoDB-Verbindung wird über Umgebungsvariablen konfiguriert:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
```

### Datenbank-Initialisierung

Führen Sie folgenden API-Call aus, um die MongoDB-Collections zu erstellen:

```bash
curl -X POST https://your-domain.vercel.app/api/init-db \
  -H "Authorization: Bearer YOUR_INIT_DB_SECRET" \
  -H "Content-Type: application/json"
```

### Collections

Die App verwendet folgende MongoDB-Collections:

- `currencies` - Währungskurse
- `phrases` - Übersetzungen und Sprachphrasen
- `prices` - Preisinformationen
- `water_stations` - Wasserauffüllstationen
- `atms` - Geldautomaten
- `laundries` - Waschsalons
- `safe_bars` - Sichere Bars
- `clinics` - Kliniken und Ärzte
- `itinerary_items` - Reiseplan-Elemente
- `squad_members` - Reisegruppen-Mitglieder
- `expenses` - Ausgaben
- `expense_splits` - Ausgabenaufteilung
- `packing_items` - Packliste
- `emergency_contacts` - Notfallkontakte
- `safety_checkins` - Sicherheits-Check-ins
- `scooter_inspections` - Roller-Inspektionen
- `settings` - App-Einstellungen
- `users` - Benutzer
- `devices` - Geräte

## API Endpunkte

### Sync API (`/api/sync`)

- `POST /api/sync` - Daten synchronisieren
  - `action: "pull"` - Änderungen vom Server laden
  - `action: "push"` - Änderungen zum Server senden
- `GET /api/sync` - Health Check

### Init DB API (`/api/init-db`)

- `POST /api/init-db` - Datenbank initialisieren (erfordert Auth)

## Get Started

1. **Dependencies installieren:**

   ```bash
   npm install
   ```

2. **Umgebungsvariablen konfigurieren:**

   ```bash
   cp .env.example .env.local
   # Füge deine MongoDB Connection String hinzu
   ```

3. **Entwicklungsserver starten:**

   ```bash
   npm run web
   ```

4. **Für Vercel Deployment:**

   ```bash
   npm run build
   ```

## Deployment

### Vercel Deployment

1. **Repository mit Vercel verbinden**
2. **Umgebungsvariable setzen:**
   - `MONGODB_URI` - MongoDB Atlas Connection String
   - `INIT_DB_SECRET` - Secret für DB-Initialisierung

3. **Deploy:**

   ```bash
   vercel --prod
   ```

## Features

- ✅ Offline-First Funktionalität
- ✅ Deutsche Sprache (Standard)
- ✅ Bidirektionale Datensynchronisation
- ✅ PWA-fähig (installierbar)
- ✅ Responsive Design (Bento-Grid)
- ✅ Interactive Karten
- ✅ OCR für Dokumente
- ✅ Sicherheitsfeatures

## Entwicklung

### Projektstruktur

```
├── api/                    # Vercel Serverless Functions
│   ├── sync.js            # Sync API
│   └── init-db.js         # DB Initialisierung
├── lib/
│   └── mongodb.ts         # MongoDB Client
├── src/
│   ├── app/               # Expo Router Seiten
│   ├── components/        # UI Komponenten
│   ├── db/                # WatermelonDB Setup
│   ├── hooks/             # Custom Hooks
│   ├── services/          # API Services
│   └── utils/             # Hilfsfunktionen
└── public/                # Statische Assets
```

### Verfügbare Skripte

- `npm run web` - Web Development Server
- `npm run build` - Production Build
- `npm run lint` - Code Linting
- `npm run reset-project` - Projekt zurücksetzen

## License

Privat - Nicht für die Verbreitung bestimmt
