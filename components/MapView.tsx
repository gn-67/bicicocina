import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mapbox, {
  Camera,
  CircleLayer,
  LineLayer,
  MapView as MapboxMap,
  MarkerView,
  PointAnnotation,
  ShapeSource,
} from '@rnmapbox/maps';
import { bbox } from '@turf/turf';
import { useFocusEffect } from 'expo-router';

// @rnmapbox/maps doesn't re-export OnPressEvent from its main index
type OnPressEvent = {
  features: GeoJSON.Feature[];
  coordinates: { latitude: number; longitude: number };
  point: { x: number; y: number };
};

import seedRoutesData from '../data/routes.json';
import curatedRoutes from '../data/curated-routes.json';
import { PARTNERS } from '../data/partners';
import type { Partner } from '../data/partners';
import { bikeways, potholes } from '../lib/data';
import type { Pothole, Route, RouteResult } from '../lib/types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const KITCHEN_CENTER: [number, number] = [-118.2871, 34.0928];
const KITCHEN_ZOOM = 13;
const LIVE_UPDATES = true;
const TICK_MS = 3000;

if (MAPBOX_TOKEN) Mapbox.setAccessToken(MAPBOX_TOKEN);

// ── Expression helpers ────────────────────────────────────────────────────────
const sharpWidthExpr: unknown[] = [
  'interpolate', ['linear'], ['get', 'active_riders'], 0, 2, 50, 6,
];
const glowWidthExpr: unknown[] = [
  'interpolate', ['linear'], ['get', 'active_riders'], 0, 4, 50, 12,
];
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function safeRouteColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#f97316';
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = {
  onRouteTap?: (route: Route) => void;
  onPartnerTap?: (partner: Partner) => void;
  safeRoute?: RouteResult | null;
};

type SelectedPothole = {
  coords: [number, number];
  props: Pothole;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MapView({ onRouteTap, onPartnerTap, safeRoute }: Props) {
  const [routes, setRoutes] = useState<GeoJSON.FeatureCollection>(() => {
    const fc = seedRoutesData as GeoJSON.FeatureCollection;
    return {
      ...fc,
      features: fc.features.filter(
        f => (f.properties as Record<string, unknown>)?.id === 'rt-kitchen-loop',
      ),
    };
  });
  const [selectedPothole, setSelectedPothole] = useState<SelectedPothole | null>(null);

  const cameraProps = useMemo(() => {
    if (!safeRoute) return null;
    const [minLng, minLat, maxLng, maxLat] = bbox({
      type: 'Feature',
      geometry: safeRoute.geometry,
      properties: {},
    });
    return {
      ne: [maxLng, maxLat] as [number, number],
      sw: [minLng, minLat] as [number, number],
      paddingTop: 100,
      paddingBottom: 320,
      paddingLeft: 40,
      paddingRight: 40,
    };
  }, [safeRoute]);

  const safeRouteFC = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!safeRoute) return null;
    return {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: safeRoute.geometry, properties: {} }],
    };
  }, [safeRoute]);

  // Start/end endpoints for all route lines — computed once, geometry never changes
  const routeEndpoints = useMemo(() => {
    const kitchenFc = seedRoutesData as GeoJSON.FeatureCollection;
    const curatedFc = curatedRoutes as GeoJSON.FeatureCollection;
    const allFeatures = [
      ...kitchenFc.features.filter(
        f => (f.properties as Record<string, unknown>)?.id === 'rt-kitchen-loop',
      ),
      ...curatedFc.features,
    ];
    return allFeatures.flatMap(feat => {
      if (feat.geometry?.type !== 'LineString') return [];
      const coords = (feat.geometry as GeoJSON.LineString).coordinates;
      if (coords.length < 2) return [];
      const id = (feat.properties as Record<string, unknown>)?.id as string ?? '';
      return [{
        id,
        start: coords[0] as [number, number],
        end: coords[coords.length - 1] as [number, number],
      }];
    });
  }, []);

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
                ((f.properties as Record<string, unknown>)?.active_riders as number ?? 0) +
                  (Math.random() * 4 - 2),
                0,
                50,
              ),
            },
          })),
        }));
      }, TICK_MS);
      return () => clearInterval(id);
    }, []),
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
    if (!feat || (feat.properties as Record<string, unknown>)?.casenumber) return;
    if (onRouteTap) onRouteTap(feat.properties as unknown as Route);
  };

  const handlePotholePress = (e: OnPressEvent) => {
    const feat = e.features?.[0];
    if (!feat || feat.geometry?.type !== 'Point') return;
    const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
    setSelectedPothole({ coords, props: feat.properties as Pothole });
  };

  const routeColor = safeRoute ? safeRouteColor(safeRoute.score.score) : '#22c55e';

  return (
    <MapboxMap
      style={styles.map}
      styleURL={Mapbox.StyleURL.Light}
      onPress={() => setSelectedPothole(null)}
    >
      <Camera
        {...(cameraProps
          ? { bounds: cameraProps, animationMode: 'flyTo', animationDuration: 1200 }
          : { centerCoordinate: KITCHEN_CENTER, zoomLevel: KITCHEN_ZOOM, animationMode: 'none', animationDuration: 0 }
        )}
      />

      {/* 1. Bike lane network */}
      <ShapeSource id="bikelanes-src" shape={bikeways}>
        <LineLayer
          id="bikelanes-line"
          slot="middle"
          style={{
            lineColor: [
              'match', ['get', 'class'],
              1, '#73EEE9', 2, '#73EEE9', 3, '#73EEE9', 4, '#73EEE9', '#73EEE9',
            ] as unknown as string,
            lineWidth: [
              'match', ['get', 'class'],
              1, 2.5, 2, 2, 3, 1.5, 4, 3, 2,
            ] as unknown as number,
            lineCap: 'round',
            lineJoin: 'round',
            lineOpacity: 0.85,
          }}
        />
      </ShapeSource>

      {/* 2. Community routes — Kitchen Loop only; lineMetrics required for lineGradient */}
      <ShapeSource
        id="routes-src"
        shape={routes}
        lineMetrics
        hitbox={{ width: 20, height: 20 }}
        onPress={handleRoutePress}
      >
        <LineLayer
          id="routes-glow"
          slot="top"
          style={{
            lineColor: '#73EEE9',
            lineWidth: glowWidthExpr as unknown as number,
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
            lineColor: '#2CAFAD',
            lineWidth: sharpWidthExpr as unknown as number,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </ShapeSource>

      {/* 3. Curated routes — same teal gradient as Kitchen Loop */}
      <ShapeSource
        id="curated-routes-src"
        shape={curatedRoutes as GeoJSON.FeatureCollection}
        lineMetrics
        hitbox={{ width: 20, height: 20 }}
        onPress={handleRoutePress}
      >
        <LineLayer
          id="curated-routes-glow"
          slot="top"
          style={{
            lineColor: '#73EEE9',
            lineWidth: 10,
            lineBlur: 8,
            lineOpacity: 0.4,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        <LineLayer
          id="curated-routes-sharp"
          slot="top"
          style={{
            lineColor: '#2CAFAD',
            lineWidth: 4,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </ShapeSource>

      {/* 4. Safe route — above community routes, below potholes */}
      {safeRouteFC && (
        <ShapeSource id="safe-route-src" shape={safeRouteFC}>
          <LineLayer
            id="safe-route-glow"
            slot="top"
            style={{
              lineColor: routeColor,
              lineWidth: 10,
              lineBlur: 6,
              lineOpacity: 0.45,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          <LineLayer
            id="safe-route-sharp"
            slot="top"
            style={{
              lineColor: routeColor,
              lineWidth: 6,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </ShapeSource>
      )}

      {/* 5. Pothole hazard layer — potholes from lib/data (sanitized potholes.json).
          minZoomLevel prevents thousands of dots blanketing the map at city scale.
          TODO: add clustering once real data confirms density. */}
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
            circleRadius: 3,
            circleColor: '#dc2626',
            circleOpacity: 0.5,
            circleStrokeWidth: 1,
            circleStrokeColor: '#ffffff',
            circleStrokeOpacity: 0.5,
          }}
        />
      </ShapeSource>

      {/* 6. Route start/end markers — community routes when no safe route active */}
      {!safeRoute && routeEndpoints.map(ep => (
        <React.Fragment key={ep.id}>
          <MarkerView coordinate={ep.start} anchor={{ x: 0.5, y: 0.5 }} allowOverlap>
            <View style={styles.startMarker} />
          </MarkerView>
          <MarkerView coordinate={ep.end} anchor={{ x: 0.5, y: 1.0 }} allowOverlap>
            <Ionicons name="location" size={30} color="#f85057" />
          </MarkerView>
        </React.Fragment>
      ))}

      {/* Safe route start/end markers — color matches safety score */}
      {safeRoute && (
        <>
          <MarkerView coordinate={KITCHEN_CENTER} anchor={{ x: 0.5, y: 0.5 }} allowOverlap>
            <View style={[styles.startMarker, { backgroundColor: routeColor }]} />
          </MarkerView>
          <MarkerView coordinate={safeRoute.destCoords} anchor={{ x: 0.5, y: 1.0 }} allowOverlap>
            <Ionicons name="location" size={30} color={routeColor} />
          </MarkerView>
        </>
      )}

      {/* 7. Partner location markers from main branch */}
      {PARTNERS.map(partner => (
        <MarkerView
          key={partner.id}
          coordinate={partner.coordinates}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <Pressable
            onPress={() => onPartnerTap?.(partner)}
            style={[styles.markerBubble, partner.logo && { backgroundColor: '#fff' }]}
          >
            {partner.logo ? (
              <Image source={{ uri: partner.logo }} style={styles.markerLogo} />
            ) : (
              <Text style={styles.markerEmoji}>🚲</Text>
            )}
          </Pressable>
        </MarkerView>
      ))}

      {/* 7. Pothole tap popup */}
      {selectedPothole && (
        <MarkerView
          coordinate={selectedPothole.coords}
          anchor={{ x: 0.5, y: 1.0 }}
          allowOverlap
        >
          <View style={styles.popup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>⚠ Pothole reported</Text>
              <Pressable onPress={() => setSelectedPothole(null)} hitSlop={8}>
                <Text style={styles.popupClose}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.popupDate}>{relativeDate(selectedPothole.props.createddate)}</Text>
            <Text style={styles.popupStatus}>{selectedPothole.props.status}</Text>
            {selectedPothole.props.address ? (
              <Text style={styles.popupAddress} numberOfLines={2}>
                {selectedPothole.props.address}
              </Text>
            ) : null}
            <View style={styles.popupCaret} />
          </View>
        </MarkerView>
      )}
    </MapboxMap>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  fallback: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fafaf9',
  },
  fallbackTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  fallbackBody: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  startMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f85057',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
  markerLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  markerEmoji: { fontSize: 20 },
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
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  popupTitle: { fontSize: 12, fontWeight: '700', color: '#dc2626', flex: 1 },
  popupClose: { fontSize: 18, color: '#9ca3af', lineHeight: 20 },
  popupDate: { fontSize: 11, color: '#6b7280', marginBottom: 2 },
  popupStatus: { fontSize: 11, fontWeight: '600', color: '#374151', marginBottom: 4 },
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
