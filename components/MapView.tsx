import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Mapbox, {
  Camera,
  LineLayer,
  MapView as MapboxMap,
  ShapeSource,
} from '@rnmapbox/maps';
import { useFocusEffect } from 'expo-router';

import bikeways from '../data/bikeways.json';
import seedRoutes from '../data/routes.json';
import type { Route } from '../lib/types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const KITCHEN_CENTER: [number, number] = [-118.2871, 34.0928];
const KITCHEN_ZOOM = 13;

const LIVE_UPDATES = true;
const TICK_MS = 3000;

if (MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
}

type Props = {
  onRouteTap?: (route: Route) => void;
};

type ShapePressEvent = {
  features: Array<GeoJSON.Feature>;
  coordinates: { latitude: number; longitude: number };
  point: { x: number; y: number };
};

const colorExpr: any = [
  'interpolate',
  ['linear'],
  ['get', 'active_riders'],
  0, '#9ca3af',
  10, '#22c55e',
  25, '#f59e0b',
  45, '#ef4444',
];

const sharpWidthExpr: any = [
  'interpolate',
  ['linear'],
  ['get', 'active_riders'],
  0, 2,
  50, 6,
];

const glowWidthExpr: any = [
  'interpolate',
  ['linear'],
  ['get', 'active_riders'],
  0, 4,
  50, 12,
];

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

export default function MapView({ onRouteTap }: Props) {
  const [routes, setRoutes] = useState<GeoJSON.FeatureCollection>(
    seedRoutes as GeoJSON.FeatureCollection
  );

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
                ((f.properties as any)?.active_riders ?? 0) +
                  (Math.random() * 4 - 2),
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

  const handleRoutePress = (e: ShapePressEvent) => {
    const feat = e.features?.[0];
    if (!feat || !onRouteTap) return;
    onRouteTap(feat.properties as unknown as Route);
  };

  return (
    <MapboxMap style={styles.map} styleURL={Mapbox.StyleURL.Street}>
      <Camera
        centerCoordinate={KITCHEN_CENTER}
        zoomLevel={KITCHEN_ZOOM}
        animationMode="none"
        animationDuration={0}
      />

      <ShapeSource id="bikeways-src" shape={bikeways as GeoJSON.FeatureCollection}>
        <LineLayer
          id="bikeways-line"
          slot="middle"
          style={{
            lineColor: [
              'match',
              ['get', 'BIKEWAY_TYPE'],
              'Class 1', '#16a34a',
              'Class 2', '#3b82f6',
              'Class 3', '#f59e0b',
              'Class 4', '#22c55e',
              '#9ca3af',
            ],
            lineWidth: 3,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </ShapeSource>

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
            lineOpacity: 0.55,
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
    </MapboxMap>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fafaf9',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  fallbackBody: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
