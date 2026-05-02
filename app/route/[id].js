import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  ActivityIndicator, Dimensions, TextInput, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, LineLayer, MapView as MapboxMap, ShapeSource } from '@rnmapbox/maps';

import RatingStars from '../../components/RatingStars';
import { useRoutes } from '../../hooks/useRoutes';
import { useRatings } from '../../hooks/useRatings';
import { useAuth } from '../../hooks/useAuth';
import routesGeoJSON from '../../data/routes.json';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (MAPBOX_TOKEN) Mapbox.setAccessToken(MAPBOX_TOKEN);

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 32; // 16px horizontal padding each side
const MAP_H = 260;

const RATING_CATEGORIES = ['safety', 'lighting', 'beginner', 'scenic', 'surface'];

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
  const { userRating, fetchUserRating, submitRating } = useRatings(id);
  const { user } = useAuth();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    safety: 0, lighting: 0, beginner: 0, scenic: 0, surface: 0, reviewText: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Match GeoJSON feature by id; fall back to first feature for demo
  const routeFeature =
    routesGeoJSON.features.find((f) => f.properties?.id === id) ??
    routesGeoJSON.features[0] ??
    null;
  const routeLineGeoJSON = routeFeature
    ? { type: 'FeatureCollection', features: [routeFeature] }
    : null;
  const bounds = routeFeature?.geometry?.coordinates?.length
    ? getRouteBounds(routeFeature.geometry.coordinates)
    : null;

  useEffect(() => {
    // Seed with local GeoJSON properties immediately so name is never blank
    if (routeFeature?.properties) {
      const p = routeFeature.properties;
      setRoute({
        name: p.name,
        distance: p.length_mi != null ? `${p.length_mi} mi` : null,
        elevation: p.elevation ?? null,
        rating: p.rating ?? 0,
        reviewCount: 0,
        tags: p.tags ?? [],
      });
    }
    setLoading(false);
    // Try to enrich with Supabase data (may fail if id is a local key, not a UUID)
    fetchRouteById(id)
      .then((data) => {
        if (data) setRoute(data);
      })
      .catch(() => {});
    fetchUserRating();
  }, [id]);

  function handleStartRide() {
    router.push('/ride/' + id);
  }

  async function handleSubmitRating() {
    if (RATING_CATEGORIES.some((c) => ratingForm[c] === 0)) {
      Alert.alert('Rate all categories', 'Please rate each category before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await submitRating(ratingForm);
      setShowReviewForm(false);
      setRatingForm({ safety: 0, lighting: 0, beginner: 0, scenic: 0, surface: 0, reviewText: '' });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2D6A4F" style={styles.loader} />
      </View>
    );
  }

  const tags = (route?.tags ?? []).map(
    (t) => t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ')
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Back button ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={26} color="#111" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Map preview card ── */}
        <View style={styles.mapCard}>
          {MAPBOX_TOKEN ? (
            <MapboxMap
              style={{ width: CARD_W, height: MAP_H }}
              styleURL={Mapbox.StyleURL.Street}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              {bounds ? (
                <Camera
                  bounds={{ ne: bounds.ne, sw: bounds.sw, paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28 }}
                  animationMode="none"
                  animationDuration={0}
                />
              ) : (
                <Camera centerCoordinate={[-118.2871, 34.0928]} zoomLevel={13} animationMode="none" animationDuration={0} />
              )}
              {routeLineGeoJSON && (
                <ShapeSource id="detail-route-src" shape={routeLineGeoJSON}>
                  <LineLayer
                    id="detail-route-line"
                    style={{ lineColor: '#f97316', lineWidth: 5, lineCap: 'round', lineJoin: 'round' }}
                  />
                </ShapeSource>
              )}
            </MapboxMap>
          ) : (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackText}>Map unavailable</Text>
            </View>
          )}

          {/* Expand icon (top-right) */}
          <View style={styles.expandBadge} pointerEvents="none">
            <Ionicons name="expand-outline" size={16} color="#fff" />
          </View>

          {/* Start Route pill (bottom of card) */}
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnActive]}
            onPress={handleStartRide}
          >
            <Text style={styles.startBtnText}>Start Route</Text>
          </Pressable>
        </View>

        {/* ── Route name ── */}
        <Text style={styles.routeName}>{route?.name ?? id}</Text>

        {/* ── Tags ── */}
        {tags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsWrap} contentContainerStyle={styles.tagsRow}>
            {tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ── Rating + distance row ── */}
        <View style={styles.ratingRow}>
          <RatingStars rating={route?.rating ?? 0} />
          <Text style={styles.ratingMeta}>
            {(route?.rating ?? 0).toFixed(1)} ({route?.reviewCount ?? 0}+ reviews)
          </Text>
          {route?.distance != null && (
            <Text style={styles.distanceText}>{route.distance}</Text>
          )}
        </View>

        {/* ── Action buttons ── */}
        <View style={styles.actionsRow}>
          {user && !userRating && (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnActive]}
              onPress={() => setShowReviewForm((v) => !v)}
            >
              <Text style={styles.actionBtnText}>Add Review</Text>
            </Pressable>
          )}
          <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnActive]}>
            <Text style={styles.actionBtnText}>Add Photos</Text>
          </Pressable>
          <Pressable style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={24} color="#111" />
          </Pressable>
        </View>

        {/* ── Inline review form ── */}
        {showReviewForm && (
          <View style={styles.reviewForm}>
            <Text style={styles.reviewFormTitle}>Your Review</Text>
            {RATING_CATEGORIES.map((cat) => (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catLabel}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
                <View style={styles.catStars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable
                      key={n}
                      onPress={() => setRatingForm((prev) => ({ ...prev, [cat]: n }))}
                    >
                      <Ionicons
                        name={n <= ratingForm[cat] ? 'star' : 'star-outline'}
                        size={22}
                        color={n <= ratingForm[cat] ? '#F4A261' : '#ccc'}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            <TextInput
              style={styles.textInput}
              placeholder="Write a review (optional)"
              placeholderTextColor="#aaa"
              multiline
              value={ratingForm.reviewText}
              onChangeText={(t) => setRatingForm((prev) => ({ ...prev, reviewText: t }))}
            />
            <Pressable
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmitRating}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Review'}</Text>
            </Pressable>
          </View>
        )}

        {/* ── Photos section ── */}
        <Text style={styles.photosLabel}>See all Photos</Text>
        <View style={styles.photosGrid}>
          <View style={styles.photoBox} />
          <View style={styles.photoBox} />
        </View>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  loader: { marginTop: 80 },

  header: { paddingHorizontal: 16, paddingVertical: 10 },

  scroll: { paddingHorizontal: 16 },

  // ── Map card ──
  mapCard: {
    width: CARD_W,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#e5e7eb',
  },
  mapFallback: {
    width: CARD_W,
    height: MAP_H,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  mapFallbackText: { color: '#6b7280', fontSize: 14 },

  expandBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtn: {
    position: 'absolute',
    bottom: 14,
    left: 18,
    right: 18,
    backgroundColor: 'rgba(60,60,60,0.88)',
    borderRadius: 32,
    paddingVertical: 13,
    alignItems: 'center',
  },
  startBtnActive: { backgroundColor: 'rgba(40,40,40,0.95)' },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },

  // ── Route info ──
  routeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    lineHeight: 30,
    marginBottom: 12,
  },

  // ── Tags ──
  tagsWrap: { marginBottom: 14 },
  tagsRow: { gap: 8, paddingRight: 4 },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: { fontSize: 13, color: '#333', fontWeight: '500' },

  // ── Rating row ──
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  ratingMeta: { fontSize: 13, color: '#666', flex: 1 },
  distanceText: { fontSize: 14, fontWeight: '700', color: '#111' },

  // ── Actions ──
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  actionBtnActive: { backgroundColor: '#e8e8e8' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },
  bookmarkBtn: { marginLeft: 'auto', padding: 4 },

  // ── Review form ──
  reviewForm: {
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewFormTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 14 },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
  catStars: { flexDirection: 'row', gap: 4 },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginVertical: 10,
    color: '#111',
  },
  submitBtn: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // ── Photos ──
  photosLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 10,
  },
  photosGrid: { flexDirection: 'row', gap: 10 },
  photoBox: {
    flex: 1,
    height: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
});
