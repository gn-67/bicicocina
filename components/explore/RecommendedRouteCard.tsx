import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Route } from '../../lib/types';
import DistanceBadge from './DistanceBadge';

type Props = {
  route: Route;
  onPress?: (route: Route) => void;
};

function StarRow({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Ionicons
        key={i}
        name={i < full ? 'star' : 'star-outline'}
        size={12}
        color="#40c9c4"
      />
    );
  }
  return <View style={styles.starRow}>{stars}</View>;
}

export default function RecommendedRouteCard({ route, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(route)}>
      <Image source={{ uri: route.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.name} numberOfLines={1}>
              {route.name}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingNum}>{route.rating.toFixed(1)}</Text>
              <StarRow rating={route.rating} />
            </View>
          </View>
          <DistanceBadge label={route.distance_label} />
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={11} color="#9596a0" />
          <Text style={styles.metaText}>{route.start_label}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={11} color="#9596a0" />
          <Text style={styles.metaText} numberOfLines={1}>
            {route.start_location} to {route.end_location}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 122,
    width: '100%',
  },
  image: {
    width: '33%',
    height: '100%',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: '#d9d9d9',
  },
  content: {
    flex: 1,
    backgroundColor: '#f3f4f8',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleCol: { flex: 1, marginRight: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#000' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingNum: { fontSize: 12, color: '#9596a0' },
  starRow: { flexDirection: 'row', gap: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaText: { fontSize: 12, color: '#9596a0' },
});
