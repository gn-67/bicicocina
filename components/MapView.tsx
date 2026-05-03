import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Mapbox, {
  Camera,
  CircleLayer,
  LineLayer,
  MapView as MapboxMap,
  MarkerView,
  ShapeSource,
} from '@rnmapbox/maps';
import { useFocusEffect } from 'expo-router';

// Inline the press event type — @rnmapbox/maps doesn't re-export it from its main index
type OnPressEvent = {
  features: GeoJSON.Feature[];
  coordinates: { latitude: number; longitude: number };
  point: { x: number; y: number };
};

import rawPotholes from '../data/potholes.json';
import seedRoutes from '../data/routes.json';
import bikelanes from '../data/bikelanes-la.json';
import type { Pothole, Route } from '../lib/types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const KITCHEN_CENTER: [number, number] = [-118.2871, 34.0928];
const KITCHEN_ZOOM = 13;

const LIVE_UPDATES = true;
const TICK_MS = 3000;

if (MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
}

// ─── Sanitize raw LA311 potholes ────────────────────────────────────────────
// geometry is null in the source; real coords are string props.
function sanitizePotholes(raw: any): GeoJSON.FeatureCollection {
  let dropped = 0;
  const features: GeoJSON.Feature[] = [];

  for (const f of raw?.features ?? []) {
    const p = f.properties ?? {};

    if (p.type !== 'Street Pavement Issues') { dropped++; continue; }

    const lat = parseFloat(p.geolocation__latitude__s);
    const lng = parseFloat(p.geolocation__longitude__s);
    if (!isFinite(lat) || !isFinite(lng)) { dropped++; continue; }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) { dropped++; continue; }
    if (!p.createddate || isNaN(Date.parse(p.createddate))) { dropped++; continue; }

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        casenumber: p.casenumber ?? '',
        status: p.status ?? '',
        createddate: p.createddate,
        address: p.locator_gis_returned_address ?? null,
      } satisfies Pothole,
    });
  }

  console.log(`[potholes] ${features.length} valid, ${dropped} dropped`);
  return { type: 'FeatureCollection', features };
}

// ─── Relative date helper ────────────────────────────────────────────────────
function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

// ─── Expression helpers ──────────────────────────────────────────────────────
const colorExpr: any = [
  'interpolate', ['linear'], ['get', 'active_riders'],
  0, '#9ca3af', 10, '#22c55e', 25, '#f59e0b', 45, '#ef4444',
];
const sharpWidthExpr: any = [
  'interpolate', ['linear'], ['get', 'active_riders'], 0, 2, 50, 6,
];
const glowWidthExpr: any = [
  'interpolate', ['linear'], ['get', 'active_riders'], 0, 4, 50, 12,
];
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ─── Types ───────────────────────────────────────────────────────────────────
type Props = {
  onRouteTap?: (route: Route) => void;
};

type SelectedPothole = {
  coords: [number, number]; // [lng, lat]
  props: Pothole;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function MapView({ onRouteTap }: Props) {
  const [routes, setRoutes] = useState<GeoJSON.FeatureCollection>(
    seedRoutes as GeoJSON.FeatureCollection
  );
  const [selectedPothole, setSelectedPothole] = useState<SelectedPothole | null>(null);

  // Sanitize once at mount — not on every render
  const potholes = useMemo(() => sanitizePotholes(rawPotholes), []);

  useFocusEffect(
    useCallback(() => {
      if (!LIVE_UPDATES) return;
      const id = setInterval(() => {
        setRoutes(prev => ({
          ...prev,
          features: prev.features.map(f => ({
            ...f,
            properties: {
              ...f.properties,
              active_riders: clamp(
                ((f.properties as any)?.active_riders ?? 0) + (Math.random() * 4 - 2),
                0,
                50
              ),
            },
          })),
        }));
      }, TICK_MS);
      return () => clearInterval(id);
    }, [])
  );

  if (!MAPBOX_TOKEN) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>Map unavailable</Text>
        <Text style={styles.fallbackBody}>
          Add EXPO_PUBLIC_MAPBOX_TOKEN to .env, then restart the dev server.
        </Text>
      </View>
    );
  }

  const handleRoutePress = (e: OnPressEvent) => {
    const feat = e.features?.[0];
    // Guard: routes have an 'active_riders' property; potholes have 'casenumber'
    if (!feat || (feat.properties as any)?.casenumber) return;
    if (onRouteTap) onRouteTap(feat.properties as unknown as Route);
  };

  const handlePotholePress = (e: OnPressEvent) => {
    const feat = e.features?.[0];
    if (!feat || feat.geometry?.type !== 'Point') return;
    const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
    setSelectedPothole({ coords, props: feat.properties as Pothole });
  };

  return (
    <MapboxMap
      style={styles.map}
      styleURL={Mapbox.StyleURL.Light}
      onPress={() => setSelectedPothole(null)}
    >
      <Camera
        centerCoordinate={KITCHEN_CENTER}
        zoomLevel={KITCHEN_ZOOM}
        animationMode="none"
        animationDuration={0}
      />

      {/* 1. Bike lane network */}
      <ShapeSource id="bikelanes-src" shape={bikelanes as GeoJSON.FeatureCollection}>
        <LineLayer
          id="bikelanes-line"
          slot="middle"
          style={{
            lineColor: [
              'match', ['get', 'class'],
              1, '#f97316', 2, '#f97316', 3, '#fb923c', 4, '#ea580c',
              '#f97316',
            ],
            lineWidth: [
              'match', ['get', 'class'],
              1, 2.5, 2, 2, 3, 1.5, 4, 3, 2,
            ],
            lineCap: 'round',
            lineJoin: 'round',
            lineOpacity: 0.85,
          }}
        />
      </ShapeSource>

      {/* 2. Community routes */}
      <ShapeSource
        id="routes-src"
        shape={routes}
        hitbox={{ width: 20, height: 20 }}
        onPress={handleRoutePress}
      >
        <LineLayer
          id="routes-glow"
          slot="top"
          style={{
            lineColor: colorExpr,
            lineWidth: glowWidthExpr,
            lineBlur: 6,
            lineOpacity: 0.45,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        <LineLayer
          id="routes-sharp"
          slot="top"
          style={{
            lineColor: colorExpr,
            lineWidth: sharpWidthExpr,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </ShapeSource>

      {/* 3. Pothole hazard layer — sits above routes so riders see them clearly.
          minZoomLevel keeps thousands of dots from blanketing the map at city scale.
          TODO: add clustering once real dataset is loaded. */}
      <ShapeSource
        id="potholes-src"
        shape={potholes}
        hitbox={{ width: 20, height: 20 }}
        onPress={handlePotholePress}
      >
        <CircleLayer
          id="potholes-circle"
          slot="top"
          minZoomLevel={12}
          style={{
            circleRadius: 5,
            circleColor: '#dc2626',
            circleStrokeWidth: 1,
            circleStrokeColor: '#ffffff',
          }}
        />
      </ShapeSource>

      {/* 4. Pothole popup — MarkerView renders a native RN view pinned to map coords */}
      {selectedPothole && (
        <MarkerView
          coordinate={selectedPothole.coords}
          anchor={{ x: 0.5, y: 1 }}
          allowOverlap
        >
         <View style={styles.popupWrapper}>
          <View style={styles.popup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>⚠ Pothole reported</Text>
              <Pressable onPress={() => setSelectedPothole(null)} hitSlop={8}>
                <Text style={styles.popupClose}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.popupDate}>
              {relativeDate(selectedPothole.props.createddate)}
            </Text>
            <Text style={styles.popupStatus}>{selectedPothole.props.status}</Text>
            {selectedPothole.props.address ? (
              <Text style={styles.popupAddress} numberOfLines={2}>
                {selectedPothole.props.address}
              </Text>
            ) : null}
            {/* Downward caret */}
            <View style={styles.popupCaret} />
          </View>
         </View>
        </MarkerView>
      )}
    </MapboxMap>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  map: { flex: 1 },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fafaf9',
  },
  fallbackTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  fallbackBody: { fontSize: 14, color: '#6b7280', textAlign: 'center' },

  popupWrapper: {
    paddingBottom: 14,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  popupTitle: { fontSize: 12, fontWeight: '700', color: '#dc2626', flex: 1 },
  popupClose: { fontSize: 18, color: '#9ca3af', lineHeight: 20 },
  popupDate: { fontSize: 11, color: '#6b7280', marginBottom: 2 },
  popupStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  popupAddress: { fontSize: 10, color: '#9ca3af', lineHeight: 14 },
  popupCaret: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
});
