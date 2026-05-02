import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Mapbox, {
  Camera,
  LineLayer,
  MapView as MapboxMap,
  ShapeSource,
} from '@rnmapbox/maps';

import bikeways from '../data/bikeways.json';
import routes from '../data/routes.json';
import type { Route } from '../lib/types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const KITCHEN_CENTER: [number, number] = [-118.2871, 34.0928];
const KITCHEN_ZOOM = 13;

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

export default function MapView({ onRouteTap }: Props) {
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
          style={{
            lineColor: [
              'match',
              ['get', 'BIKEWAY_TYPE'],
              'Class 2', '#3b82f6',
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
        shape={routes as GeoJSON.FeatureCollection}
        hitbox={{ width: 20, height: 20 }}
        onPress={handleRoutePress}
      >
        <LineLayer
          id="routes-line"
          style={{
            lineColor: '#f97316',
            lineWidth: 4,
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
