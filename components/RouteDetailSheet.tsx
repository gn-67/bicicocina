import React, { useEffect, useMemo, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import DistanceBadge from './explore/DistanceBadge';
import type { Route } from '../lib/types';

type Props = {
  route: Route | null;
  onClose: () => void;
};

const SLIDER_W = 142;

function DifficultySlider({ difficulty }: { difficulty: number }) {
  const fillW = difficulty * SLIDER_W;
  return (
    <View style={styles.sliderWrap}>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: fillW }]} />
        <View style={[styles.sliderThumb, { left: fillW }]} />
      </View>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>Easy</Text>
        <Text style={styles.sliderLabel}>Moderate</Text>
      </View>
    </View>
  );
}

export default function RouteDetailSheet({ route, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['52%', '75%'], []);

  useEffect(() => {
    if (route) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
  }, [route]);

  // Same formula as RecommendedRouteCard
  const difficulty = route
    ? 0.1 + 0.05 * Math.min(route.length_mi, 15) * (5.5 - route.rating)
    : 0;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        {route && (
          <>
            {/* Hero image */}
            {route.image ? (
              <Image
                source={{ uri: route.image }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.heroImage, styles.heroPlaceholder]} />
            )}

            {/* Header: name + distance + close */}
            <View style={styles.headerRow}>
              <View style={styles.titleCol}>
                <Text style={styles.name} numberOfLines={1}>{route.name}</Text>
              </View>
              <DistanceBadge label={route.distance_label} />
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#9596a0" />
              </Pressable>
            </View>

            {/* Tags */}
            {route.tags?.length > 0 && (
              <View style={styles.tagsRow}>
                {route.tags.slice(0, 3).map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Meta rows */}
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color="#9596a0" />
              <Text style={styles.metaText}>{route.start_label}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color="#9596a0" />
              <Text style={styles.metaText} numberOfLines={1}>
                {route.start_location} to {route.end_location}
              </Text>
            </View>

            {/* Difficulty */}
            <DifficultySlider difficulty={Math.min(Math.max(difficulty, 0), 1)} />

            {/* View Route */}
            <Pressable
              style={styles.viewBtn}
              onPress={() => {
                onClose();
                router.push(`/route/${route.id}` as any);
              }}
            >
              <Text style={styles.viewBtnText}>View Route</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </Pressable>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    marginBottom: 4,
  },
  heroPlaceholder: {
    backgroundColor: '#f3f4f8',
  },
  sheet: { backgroundColor: '#fff', borderRadius: 20 },
  handle: { backgroundColor: '#d1d5db', width: 36 },
  content: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 24, gap: 10 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleCol: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#000' },
  closeBtn: { marginLeft: 4 },

  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: '#d9f4f3',
    borderWidth: 1,
    borderColor: '#40c9c4',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: { fontSize: 10, color: '#0d6e6a', letterSpacing: 1 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 12, color: '#9596a0', flex: 1 },

  sliderWrap: { marginTop: 2, width: SLIDER_W },
  sliderTrack: {
    height: 9,
    backgroundColor: '#ddd',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#b4b5bd',
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#40c9c4',
  },
  sliderThumb: {
    position: 'absolute',
    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginLeft: -7,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderLabel: { fontSize: 10, color: '#9596a0', letterSpacing: 1 },

  viewBtn: {
    marginTop: 4,
    backgroundColor: '#1d1933',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
});
