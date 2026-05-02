import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Route } from '../../lib/types';
import AvatarStack from './AvatarStack';
import DistanceBadge from './DistanceBadge';

type Props = {
  route: Route;
  onPress?: (route: Route) => void;
  width: number;
};

export default function ActiveRouteCard({ route, onPress, width }: Props) {
  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {route.name}
        </Text>
        <DistanceBadge label={route.distance_label} />
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color="#0d3b3a" />
        <Text style={styles.metaText}>{route.start_label}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color="#0d3b3a" />
        <Text style={styles.metaText} numberOfLines={1}>
          {route.start_location} to {route.end_location}
        </Text>
      </View>

      <View style={styles.tagRow}>
        {route.tags.slice(0, 3).map(tag => (
          <View key={tag} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.attendeeRow}>
          <AvatarStack avatars={route.attendee_avatars} />
          <Text style={styles.attendeeText}>+ {route.attendee_count} Going</Text>
        </View>
        <Pressable
          style={styles.viewBtn}
          onPress={() => onPress?.(route)}
          hitSlop={6}
        >
          <Text style={styles.viewBtnText}>View Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#7BD7DC',
    borderRadius: 15,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontSize: 22, fontWeight: '800', color: '#000', flex: 1, marginRight: 12 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaText: { fontSize: 12, color: '#0d3b3a' },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  tagPill: {
    backgroundColor: '#b3fffc',
    borderColor: '#008883',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: { fontSize: 10, color: '#008883', letterSpacing: 1 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attendeeText: { fontSize: 12, color: '#000' },
  viewBtn: {
    backgroundColor: '#1d1933',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
