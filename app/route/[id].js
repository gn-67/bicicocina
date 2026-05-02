import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mapbox, {
  Camera,
  LineLayer,
  MapView as MapboxMap,
  ShapeSource,
} from '@rnmapbox/maps';

import routes from '../../data/routes.json';
import { useRoutes } from '../../hooks/useRoutes';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (MAPBOX_TOKEN) Mapbox.setAccessToken(MAPBOX_TOKEN);

const FALLBACK_CENTER = [-118.2871, 34.0928];

function getRouteBounds(coordinates) {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of coordinates) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { ne: [maxLng, maxLat], sw: [minLng, minLat] };
}

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { fetchRouteById } = useRoutes();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  const routeFeature = routes.features.find((f) => f.properties?.id === id) ?? null;
  const routeGeoJSON = routeFeature
    ? { type: 'FeatureCollection', features: [routeFeature] }
    : null;
  const bounds = routeFeature?.geometry?.coordinates
    ? getRouteBounds(routeFeature.geometry.coordinates)
    : null;

  useEffect(() => {
    fetchRouteById(id)
      .then(setRoute)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function handleStartRide() {
    router.push('/ride/' + id);
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Full-screen map ── */}
      {MAPBOX_TOKEN ? (
        <MapboxMap style={styles.map} styleURL={Mapbox.StyleURL.Street}>
          {bounds ? (
            <Camera
              bounds={{
                ne: bounds.ne,
                sw: bounds.sw,
                paddingTop: 100,
                paddingBottom: 260,
                paddingLeft: 32,
                paddingRight: 32,
              }}
              animationMode="none"
              animationDuration={0}
            />
          ) : (
            <Camera
              centerCoordinate={FALLBACK_CENTER}
              zoomLevel={13}
              animationMode="none"
              animationDuration={0}
            />
          )}

          {routeGeoJSON && (
            <ShapeSource id="route-preview-src" shape={routeGeoJSON}>
              <LineLayer
                id="route-preview-line"
                style={{
                  lineColor: '#f97316',
                  lineWidth: 5,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </ShapeSource>
          )}
        </MapboxMap>
      ) : (
        <View style={styles.mapFallback}>
          <Text style={styles.mapFallbackText}>Map unavailable</Text>
        </View>
      )}

      {/* ── Top-left: back button ── */}
      <View style={[styles.topLeft, { top: insets.top + 12 }]}>
        <Pressable style={styles.darkCircleBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* ── Top-right: utility buttons ── */}
      <View style={[styles.topRight, { top: insets.top + 12 }]}>
        <Pressable style={styles.lightCircleBtn}>
          <Ionicons name="volume-medium-outline" size={20} color="#333" />
        </Pressable>
        <Pressable style={[styles.lightCircleBtn, { marginTop: 10 }]}>
          <Ionicons name="navigate" size={18} color="#333" />
        </Pressable>
      </View>

      {/* ── Bottom overlay ── */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.bottomContent}>
          <Text style={styles.routeName} numberOfLines={2}>
            {route?.name ?? id}
          </Text>

          {(route?.distance != null || route?.elevation != null) && (
            <View style={styles.metaRow}>
              {route?.distance != null && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{route.distance} mi</Text>
                </View>
              )}
              {route?.elevation != null && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{route.elevation} ft gain</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
          onPress={handleStartRide}
        >
          <Text style={styles.startButtonText}>Start Route</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

  map: { width: SCREEN_W, height: SCREEN_H },
  mapFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb' },
  mapFallbackText: { color: '#6b7280', fontSize: 14 },

  // Top buttons
  topLeft: {
    position: 'absolute',
    left: 16,
  },
  topRight: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
  },
  darkCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(40, 40, 40, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom overlay
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(28, 28, 30, 0.92)',
    paddingTop: 28,
    paddingHorizontal: 20,
  },
  bottomContent: {
    marginBottom: 20,
  },
  routeName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  metaPillText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '500',
  },

  // Start button
  startButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonPressed: {
    backgroundColor: '#d1d5db',
  },
  startButtonText: {
    color: '#111',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
