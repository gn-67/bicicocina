import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import type { Route } from '../../lib/types';
import DistanceBadge from './DistanceBadge';

type Props = {
  route: Route;
  onPress?: (route: Route) => void;
};

function DifficultySlider({ difficulty = 0.3 }: { difficulty?: number }) {
  return (
    <View style={styles.difficultyContainer}>
      <View style={styles.sliderTrackBg}>
         <LinearGradient
            colors={['#A1EAA3', '#0DAE2B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.sliderFill, { width: `${difficulty * 100}%` }]}
          />
          <View style={[styles.sliderThumb, { left: `${difficulty * 100}%` }]} />
      </View>
      <View style={styles.difficultyLabels}>
        <Text style={styles.difficultyLabelText}>Easy</Text>
        <Text style={styles.difficultyLabelText}>Moderate</Text>
      </View>
    </View>
  );
}

export default function RecommendedRouteCard({ route, onPress }: Props) {
  // Use a heuristic for difficulty based on rating/length since it's not in the type yet
  // Lower rating or longer route -> higher difficulty for the visual mock
  const difficulty = 0.1 + (0.05 * Math.min(route.length_mi, 15) * (5.5 - route.rating));

  return (
    <Pressable style={styles.card} onPress={() => onPress?.(route)}>
      <Image source={{ uri: route.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.name} numberOfLines={1}>
              {route.name}
            </Text>
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

        <View style={styles.difficultyWrap}>
          <DifficultySlider difficulty={difficulty} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 135,
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
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleCol: { flex: 1, marginRight: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#000' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaText: { fontSize: 12, color: '#9596a0' },
  
  difficultyWrap: {
    marginTop: 8,
  },
  difficultyContainer: {
    width: 142,
  },
  sliderTrackBg: {
    height: 9,
    backgroundColor: '#ddd',
    borderRadius: 10,
    position: 'relative',
    borderWidth: 0.5,
    borderColor: '#b4b5bd',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 10,
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
  difficultyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  difficultyLabelText: {
    fontSize: 10,
    color: '#9596a0',
    letterSpacing: 1,
  },
});
