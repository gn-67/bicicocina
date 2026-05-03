import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  ActivityIndicator, Dimensions, TextInput, Alert, Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Mapbox, { Camera, LineLayer, MapView as MapboxMap, ShapeSource } from '@rnmapbox/maps';

import RatingStars from '../../components/RatingStars';
import { useRoutes } from '../../hooks/useRoutes';
import { useRatings } from '../../hooks/useRatings';
import { useAuth } from '../../hooks/useAuth';
import routesGeoJSON from '../../data/routes.json';
import bikelanes from '../../data/bikelanes-la.json';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (MAPBOX_TOKEN) Mapbox.setAccessToken(MAPBOX_TOKEN);

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 32;
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
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Bike Routes</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Map Preview ── */}
        <View style={styles.mapCard}>
          {MAPBOX_TOKEN ? (
            <MapboxMap
              style={{ width: SCREEN_W, height: 320 }}
              styleURL={Mapbox.StyleURL.Light}
              minZoomLevel={9}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              logoEnabled={false}
              attributionEnabled={false}
            >
              {bounds ? (
                <Camera
                  bounds={{ ne: bounds.ne, sw: bounds.sw, paddingTop: 40, paddingBottom: 100, paddingLeft: 40, paddingRight: 40 }}
                  animationMode="none"
                  animationDuration={0}
                />
              ) : (
                <Camera centerCoordinate={[-118.2871, 34.0928]} zoomLevel={13} animationMode="none" animationDuration={0} />
              )}
              <ShapeSource id="detail-bikelanes-src" shape={bikelanes}>
                <LineLayer
                  id="detail-bikelanes-line"
                  style={{
                    lineColor: ['match', ['get', 'class'], 1, '#40c9c4', 2, '#40c9c4', 3, '#40c9c4', 4, '#40c9c4', '#40c9c4'],
                    lineWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                    lineOpacity: 0.5,
                  }}
                />
              </ShapeSource>

              {routeLineGeoJSON && (
                <ShapeSource id="detail-route-src" shape={routeLineGeoJSON}>
                  <LineLayer
                    id="detail-route-line"
                    style={{ lineColor: '#43CAC6', lineWidth: 5, lineCap: 'round', lineJoin: 'round' }}
                  />
                </ShapeSource>
              )}
            </MapboxMap>
          ) : (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackText}>Map unavailable</Text>
            </View>
          )}

          <View style={styles.expandBadge}>
            <Ionicons name="scan-outline" size={20} color="#333" />
          </View>

          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnActive]}
            onPress={handleStartRide}
          >
            <Text style={styles.startBtnText}>Start Route</Text>
          </Pressable>
        </View>

        <View style={styles.contentPadding}>
          {/* ── Route Name ── */}
          <Text style={styles.routeName}>{route?.name ?? id}</Text>

          {/* ── Tags ── */}
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.slice(0, 3).map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Rating + Distance ── */}
          <View style={styles.ratingRow}>
            <RatingStars rating={route?.rating ?? 0} />
            <Text style={styles.ratingMeta}>
              {(route?.rating ?? 0).toFixed(0)} ({route?.reviewCount ?? 100}+ reviews)
            </Text>
            {route?.distance != null && (
              <Text style={styles.distanceText}>{route.distance}</Text>
            )}
          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.addReviewBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setShowReviewForm((v) => !v)}
            >
              <Ionicons name="star" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.addReviewText}>Add Review</Text>
            </Pressable>
            
            <Pressable style={({ pressed }) => [styles.addPhotoBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="camera" size={18} color="#787985" style={{ marginRight: 6 }} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </Pressable>

            <Pressable style={styles.bookmarkBtn}>
              <Ionicons name="bookmark-outline" size={20} color="#787985" />
            </Pressable>
          </View>

          {/* ── Review Form ── */}
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
                          color={n <= ratingForm[cat] ? '#43CAC6' : '#ccc'}
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

          {/* ── Photos Section ── */}
          <View style={styles.photosSection}>
            <View style={styles.photosGrid}>
              <View style={styles.photoLarge}>
                <View style={[styles.photoPlaceholder, { height: 160 }]} />
              </View>
              <View style={styles.photoSmallCol}>
                <View style={[styles.photoPlaceholder, { height: 78 }]} />
                <View style={[styles.photoPlaceholder, { height: 78 }]} />
              </View>
            </View>
            <Text style={styles.photosLabel}>See all Photos</Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  loader: { marginTop: 80 },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 16, fontWeight: '400', color: '#000', letterSpacing: 1.6 },

  scroll: { paddingBottom: 20 },
  contentPadding: { paddingHorizontal: 25 },

  // ── Map Preview ──
  mapCard: {
    width: SCREEN_W,
    height: 320,
    backgroundColor: '#f3f4f8',
    marginBottom: 25,
    position: 'relative',
  },
  mapFallback: {
    width: SCREEN_W,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapFallbackText: { color: '#9596a0', fontSize: 14 },

  expandBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtn: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    backgroundColor: '#f85057',
    borderRadius: 20,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnActive: { opacity: 0.9 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1.6 },

  // ── Route Info ──
  routeName: {
    fontSize: 25,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1.25,
    marginBottom: 10,
  },

  // ── Tags ──
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#d9f4f3',
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#40c9c4',
  },
  tagText: { fontSize: 10, color: '#777', letterSpacing: 1 },

  // ── Rating row ──
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  ratingMeta: { fontSize: 12, color: '#9596a0', marginLeft: 13, letterSpacing: 1.2, flex: 1 },
  distanceText: { fontSize: 12, color: '#9596a0', letterSpacing: 1.2 },

  // ── Actions ──
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  addReviewBtn: {
    backgroundColor: '#1d1933',
    borderRadius: 20,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  addReviewText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  addPhotoBtn: {
    backgroundColor: '#f3f4f8',
    borderRadius: 20,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  addPhotoText: { color: '#787985', fontSize: 12, fontWeight: '700' },
  bookmarkBtn: {
    width: 35,
    height: 35,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },

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
    backgroundColor: '#43CAC6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // ── Photos ──
  photosSection: { marginTop: 5 },
  photosGrid: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 5,
  },
  photoLarge: { flex: 1.3 },
  photoSmallCol: { flex: 1, gap: 5 },
  photoPlaceholder: {
    backgroundColor: '#f3f4f8',
    borderRadius: 20,
    width: '100%',
  },
  photosLabel: {
    fontSize: 12,
    color: '#9596a0',
    textAlign: 'right',
    letterSpacing: 1.2,
    marginTop: 5,
  },
});
