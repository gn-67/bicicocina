import { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Location from 'expo-location';
import Mapbox, {
  Camera,
  LineLayer,
  MapView as MapboxMap,
  ShapeSource,
  UserLocation,
} from '@rnmapbox/maps';

import routes from '../../data/routes.json';
import bikelanes from '../../data/bikelanes-la.json';
import { useRideTracking } from '../../hooks/useRideTracking';
import { useVoiceNav } from '../../hooks/useVoiceNav';
import { useBikeLaneNav } from '../../hooks/useBikeLaneNav';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
}

function formatElapsed(startTime) {
  if (!startTime) return '0:00';
  const totalSec = Math.floor((Date.now() - startTime) / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function LiveRideScreen() {
  const { id } = useLocalSearchParams();
  const { startRide, endRide, liveDistanceMi, liveCoords, rideStartTime } = useRideTracking();
  const { speak } = useVoiceNav();
  const { checkPosition, getStartMessage, bannerText, laneStatus } = useBikeLaneNav({ speak });
  const [elapsed, setElapsed] = useState('0:00');
  const timerRef = useRef(null);

  // Find the matching route feature for the route line
  const routeFeature = routes.features.find((f) => f.properties?.id === id) ?? null;
  const routeGeoJSON = routeFeature
    ? { type: 'FeatureCollection', features: [routeFeature] }
    : null;

  useEffect(() => {
    startRide(id).catch((e) => {
      Alert.alert('Error', e.message);
      router.back();
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start elapsed timer once rideStartTime is set
  useEffect(() => {
    if (!rideStartTime) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(formatElapsed(rideStartTime));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [rideStartTime]);

  // Play starting announcement once ride begins
  useEffect(() => {
    if (!rideStartTime) return;
    Location.getCurrentPositionAsync({}).then((loc) => {
      const msg = getStartMessage({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      speak(msg);
    }).catch(() => {});
  }, [rideStartTime]);

  // Check proximity to bike lanes on each GPS update
  useEffect(() => {
    if (liveCoords) checkPosition(liveCoords);
  }, [liveCoords]);

  async function handleEndRide() {
    if (timerRef.current) clearInterval(timerRef.current);
    const summary = await endRide();
    if (summary) {
      Alert.alert(
        'Ride Complete',
        `Distance: ${summary.distance} mi\nDuration: ${summary.durationMin} min\nCalories: ${summary.calories}\nElevation: ${summary.elevation} ft`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      router.back();
    }
  }

  if (!MAPBOX_TOKEN) {
    return (
      <View style={styles.fallback}>
        <Text>Map unavailable — add EXPO_PUBLIC_MAPBOX_TOKEN</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxMap style={styles.map} styleURL={Mapbox.StyleURL.Light} minZoomLevel={9}>
        <Camera
          followUserLocation={true}
          followZoomLevel={16}
          followUserMode="normal"
        />
        <UserLocation visible={true} />

        {/* Bike lane network */}
        <ShapeSource id="live-bikelanes-src" shape={bikelanes}>
          <LineLayer
            id="live-bikelanes-line"
            style={{
              lineColor: ['match', ['get', 'class'], 1, '#f97316', 2, '#f97316', 3, '#fb923c', 4, '#ea580c', '#f97316'],
              lineWidth: ['match', ['get', 'class'], 1, 2.5, 2, 2, 3, 1.5, 4, 3, 2],
              lineCap: 'round',
              lineJoin: 'round',
              lineOpacity: 0.85,
            }}
          />
        </ShapeSource>

        {/* Active route — light blue on top */}
        {routeGeoJSON && (
          <ShapeSource id="live-route-src" shape={routeGeoJSON}>
            <LineLayer
              id="live-route-line"
              style={{
                lineColor: '#60a5fa',
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}
      </MapboxMap>

      {/* Bike lane navigation banner */}
      {bannerText ? (
        <View style={[styles.banner, laneStatus === 'on_lane' && styles.bannerGreen]}>
          <Text style={styles.bannerText}>{bannerText}</Text>
        </View>
      ) : null}

      {/* Stats HUD */}
      <View style={styles.hud}>
        <Text style={styles.hudLabel}>Time</Text>
        <Text style={styles.hudValue}>{elapsed}</Text>
        <Text style={styles.hudLabel}>Distance</Text>
        <Text style={styles.hudValue}>{liveDistanceMi.toFixed(2)} mi</Text>
      </View>

      {/* End Ride button */}
      <Pressable style={styles.endButton} onPress={handleEndRide}>
        <Text style={styles.endButtonText}>End Ride</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: SCREEN_W, height: SCREEN_H },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hud: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  hudLabel: { color: '#ccc', fontSize: 11 },
  hudValue: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  endButton: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: '#c0392b',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
  },
  endButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
  },
  bannerGreen: {
    backgroundColor: '#16a34a',
  },
  bannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
