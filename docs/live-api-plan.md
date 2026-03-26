# Live API Integration & Offline-First Caching Plan

## Current State Analysis

The current implementation uses **simulated/mock data** for all API services. This needs to be upgraded to use real-time Live APIs with robust offline-first caching.

## Implementation Strategy

### Phase 1: Infrastructure Setup

#### 1.1 Network State Detection
- Create `src/services/network.ts` for online/offline detection
- Implement `useNetworkStatus()` hook
- Add network state to global context

#### 1.2 Enhanced Caching Layer
- Upgrade `APICache` class to use WatermelonDB (IndexedDB)
- Create cache tables for each data type
- Implement cache-first, network-second strategy

#### 1.3 Offline Mode UI Indicator
- Create `OfflineBanner` component
- Show "Offline Mode - Showing cached data" when network lost
- Add subtle indicator in header

### Phase 2: Live API Integration

#### 2.1 Currency Converter (Priority 1)
**Current:** Simulated rates
**Target:** Live ExchangeRate-API

```typescript
// API: https://api.exchangerate-api.com/v4/latest/IDR
// Fallback: Cached rates from IndexedDB
// Refresh: Every 60 minutes when online
```

**Implementation:**
- Fetch live rates from ExchangeRate-API
- Cache in WatermelonDB `currencies` table
- Show last update timestamp
- Offline fallback to cached rates

#### 2.2 Live POI Radar (Priority 1)
**Current:** Static sample data
**Target:** Overpass API (OpenStreetMap)

```typescript
// API: https://overpass-api.de/api/interpreter
// Query: Restaurants, warungs, hotels within 300m radius
// Fallback: Cached POIs from IndexedDB
```

**Implementation:**
- Use browser's `navigator.geolocation.watchPosition()`
- Query Overpass API for nearby amenities
- Cache POIs in WatermelonDB
- Offline fallback to cached locations

#### 2.3 Weather & Volcano Alerts
**Current:** Simulated BMKG data
**Target:** Real BMKG & MAGMA APIs

```typescript
// BMKG: https://data.bmkg.go.id/
// MAGMA: https://magma.esdm.go.id/
```

**Implementation:**
- Fetch real weather data from BMKG
- Get volcano alerts from MAGMA Indonesia
- Cache with 30-minute TTL
- Offline fallback to last cached data

#### 2.4 Ferry Tracker
**Current:** Simulated AIS data
**Target:** Live AIS API

```typescript
// Options: AISStream, SeaRates, or MarineTraffic API
// WebSocket for real-time updates
```

**Implementation:**
- Connect to AIS WebSocket for live positions
- Cache ferry schedules in IndexedDB
- Offline fallback to cached schedules

### Phase 3: Offline-First Implementation

#### 3.1 Cache Strategy
```
1. Check network status
2. If online:
   - Fetch from live API
   - Update cache in IndexedDB
   - Return fresh data
3. If offline:
   - Load from IndexedDB cache
   - Show offline indicator
   - Return cached data
```

#### 3.2 Cache Tables (WatermelonDB)
- `currencies` - Exchange rates with timestamps
- `weather_cache` - Weather data with TTL
- `volcano_cache` - Volcano alerts
- `poi_cache` - Points of interest
- `ferry_cache` - Ferry schedules & positions
- `earthquake_cache` - Seismic data

#### 3.3 Cache Invalidation
- Currency: 60 minutes
- Weather: 30 minutes
- Volcano: 15 minutes
- POI: 24 hours
- Ferry: 5 minutes (real-time)
- Earthquake: 10 minutes

### Phase 4: Group Expense & Real-Time Sync

#### 4.1 Real-Time Cost Estimation
- Fetch live ride-hailing fare estimates
- Get current scooter rental averages
- Sync restaurant price ranges

#### 4.2 Group Calculation Logic
- Auto-recalculate based on squad size
- Instant updates when members added/removed
- Currency conversion using live rates

## Implementation Order

### Step 1: Network Detection & Cache Infrastructure
- [ ] Create network status service
- [ ] Enhance APICache with IndexedDB persistence
- [ ] Add offline indicator component

### Step 2: Currency Converter with Live API
- [ ] Integrate ExchangeRate-API
- [ ] Implement cache-first strategy
- [ ] Add offline fallback
- [ ] Show last update time

### Step 3: Live POI Radar
- [ ] Implement geolocation tracking
- [ ] Integrate Overpass API
- [ ] Cache POIs locally
- [ ] Offline POI display

### Step 4: Weather & Volcano Live Data
- [ ] Connect to BMKG API
- [ ] Connect to MAGMA API
- [ ] Implement alert caching
- [ ] Offline weather display

### Step 5: Ferry Tracker Live Data
- [ ] Integrate AIS API/WebSocket
- [ ] Real-time position updates
- [ ] Offline schedule fallback

### Step 6: Group Features Enhancement
- [ ] Live fare estimation
- [ ] Real-time cost calculation
- [ ] Squad-based splitting

## Technical Requirements

### Dependencies to Add
```json
{
  "@nozbe/watermelondb": "^0.27.1",
  "@nozbe/with-observables": "^1.6.0",
  "expo-location": "^16.0.0",
  "expo-network": "^5.0.0"
}
```

### API Keys Required
- ExchangeRate-API (free tier available)
- Overpass API (free, no key needed)
- BMKG API (public)
- MAGMA API (public)
- AIS API (may require subscription)

## Success Criteria

1. ✅ All features work offline with cached data
2. ✅ Live data fetched when online
3. ✅ Seamless fallback without crashes
4. ✅ Offline indicator clearly visible
5. ✅ Cache updates automatically when online
6. ✅ Group calculations use real-time data

## Risk Mitigation

1. **API Rate Limits:** Implement request throttling
2. **Network Failures:** Graceful degradation to cache
3. **Large Data:** Implement pagination and lazy loading
4. **Battery Usage:** Optimize geolocation polling

---

**Status:** Awaiting user approval before implementation
**Estimated Time:** 2-3 days for complete implementation
**Priority:** Currency Converter & POI Radar first
