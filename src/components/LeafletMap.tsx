/**
 * LeafletMap - Web Map Engine für BaliBuddy
 * Verwendet react-leaflet mit OpenStreetMap Tiles
 * Web-only Komponente - wird nur auf Browsern geladen
 */

"use client";

import React, { useEffect, useState } from "react";

// Komplett vermeiden dass Leaflet jemals Server-seitig geladen wird
const isBrowser = typeof window !== 'undefined';

let MapContainer: any = () => null;
let TileLayer: any = () => null;
let Marker: any = () => null;
let Popup: any = () => null;
let Circle: any = () => null;
let useMap: any = () => null;
let L: any = {};

// NUR wenn wir wirklich im Browser sind importieren wir Leaflet
if (isBrowser) {
  import('react-leaflet').then((ReactLeaflet) => {
    MapContainer = ReactLeaflet.MapContainer;
    TileLayer = ReactLeaflet.TileLayer;
    Marker = ReactLeaflet.Marker;
    Popup = ReactLeaflet.Popup;
    Circle = ReactLeaflet.Circle;
    useMap = ReactLeaflet.useMap;
  });
  
  import('leaflet').then((Leaflet) => {
    L = Leaflet.default || Leaflet;

    // ✅ KRITISCH: Leaflet CSS muss geladen werden!
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = '/leaflet.css';
      document.head.appendChild(link);
    }

    // Fix Leaflet Icon Bug
    if (L.Icon && L.Icon.Default) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }
  });
}

// === Typen ===
export interface LeafletPOI {
  id: string;
  name: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  distance?: number;
  rating?: number;
  phone?: string;
  verified?: boolean;
  emoji?: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  userLocation: { lat: number; lng: number };
  locationAccuracy: number;
  pois: LeafletPOI[];
  onPOIClick?: (poi: LeafletPOI) => void;
  style?: React.CSSProperties;
}

// Map Controller - bewegt die Karte bei center Änderung
function MapUpdater({ center }: { center: [number, number] }) {
  const leafletMap = useMap();

  useEffect(() => {
    if (leafletMap && center) {
      leafletMap.flyTo(center, leafletMap.getZoom(), { duration: 0.8 });
    }
  }, [center, leafletMap]);

  return null;
}

// Hauptkomponente
export default function LeafletMap({
  center,
  zoom = 15,
  userLocation,
  locationAccuracy,
  pois,
  onPOIClick,
  style = { height: "100%", width: "100%" },
}: LeafletMapProps) {
  // Custom Icon Factory
  const createIcon = (emoji: string, color: string) =>
    L.divIcon({
      html: `<div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">${emoji}</div>`,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

  // WICHTIG: Nur rendern wenn wir wirklich im Browser sind!
  if (!isBrowser) {
    return <div style={{ ...style, background: '#1f2937' }}></div>;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      zoomControl={true}
      attributionControl={false}
    >
      <MapUpdater center={center} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxNativeZoom={19}
        maxZoom={20}
      />

      {/* User Location Accuracy Circle */}
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={locationAccuracy}
        pathOptions={{
          fillColor: "#3B82F6",
          fillOpacity: 0.15,
          stroke: false,
        }}
      />

      {/* User Location Marker */}
      <Marker
        position={[userLocation.lat, userLocation.lng]}
        icon={
          L.divIcon({
            html: `<div style="
              width: 20px;
              height: 20px;
              background: #3B82F6;
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 0 0 2px #3B82F6, 0 2px 8px rgba(0,0,0,0.3);
            "></div>`,
            className: "",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })
        }
      >
        <Popup>
          <div style={{ padding: 4, minWidth: 120 }}>
            <strong>Dein Standort</strong>
            <br />
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              Genauigkeit: ±{Math.round(locationAccuracy)}m
            </span>
          </div>
        </Popup>
      </Marker>

      {/* POI Markers */}
      {pois.map((poi) => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lng]}
          icon={createIcon(poi.emoji || "📍", "#059669")}
          eventHandlers={{
            click: () => onPOIClick?.(poi),
          }}
        >
          <Popup>
            <div style={{ padding: 4, minWidth: 160 }}>
              <strong style={{ fontSize: 15 }}>{poi.name}</strong>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                {poi.description}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#059669",
                  fontWeight: "bold",
                  marginTop: 4,
                }}
              >
                {poi.distance ? `${(poi.distance / 1000).toFixed(1)} km` : ""}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
