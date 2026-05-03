import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Mapbox, {
  Camera,
  LineLayer,
  MapView as MapboxMap,
  PointAnnotation,
  ShapeSource,
} from '@rnmapbox/maps';
import { useFocusEffect } from 'expo-router';

import bikelanes from '../data/bikelanes-la.json';
import seedRoutes from '../data/routes.json';
import { PARTNERS } from '../data/partners';
import type { Partner } from '../data/partners';
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
  onPartnerTap?: (partner: Partner) => void;
};

type ShapePressEvent = {
  features: Array<GeoJSON.Feature>;
  coordinates: { latitude: number; longitude: number };
  point: { x: number; y: number };
};

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

export default function MapView({ onRouteTap, onPartnerTap }: Props) {
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
    <MapboxMap style={styles.map} styleURL={Mapbox.StyleURL.Light} minZoomLevel={9}>
      <Camera
        centerCoordinate={KITCHEN_CENTER}
        zoomLevel={KITCHEN_ZOOM}
        animationMode="none"
        animationDuration={0}
      />

      {/* Bike lane network — orange, width + shade by class */}
      <ShapeSource id="bikelanes-src" shape={bikelanes as GeoJSON.FeatureCollection}>
        <LineLayer
          id="bikelanes-line"
          slot="middle"
          style={{
            lineColor: [
              'match', ['get', 'class'],
              1, '#f97316',
              2, '#f97316',
              3, '#fb923c',
              4, '#ea580c',
              '#f97316',
            ],
            lineWidth: [
              'match', ['get', 'class'],
              1, 2.5,
              2, 2,
              3, 1.5,
              4, 3,
              2,
            ],
            lineCap: 'round',
            lineJoin: 'round',
            lineOpacity: 0.85,
          }}
        />
      </ShapeSource>

      {/* Routes — light blue with glow, tappable */}
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
            lineColor: '#60a5fa',
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
            lineColor: '#60a5fa',
            lineWidth: sharpWidthExpr,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </ShapeSource>

      {/* Partner location markers — single child required by PointAnnotation */}
      {PARTNERS.map(partner => (
        <PointAnnotation
          key={partner.id}
          id={partner.id}
          coordinate={partner.coordinates}
          onSelected={() => onPartnerTap?.(partner)}
        >
          <View style={styles.markerBubble}>
            <Text style={styles.markerEmoji}>🚲</Text>
          </View>
        </PointAnnotation>
      ))}
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
  markerBubble: {
    backgroundColor: '#1d1933',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerEmoji: {
    fontSize: 20,
  },
});
