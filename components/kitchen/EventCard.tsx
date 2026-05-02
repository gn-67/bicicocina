import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { KitchenEvent } from '../../data/events';

type Props = {
  event: KitchenEvent;
};

export default function EventCard({ event }: Props) {
  const router = useRouter();

  const date = new Date(event.dateISO + 'T12:00:00');
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/event/${event.id}` as any)}
    >
      <View style={styles.dateSection}>
        <Text style={styles.dayName}>{dayName}</Text>
        <Text style={styles.dateNum}>{dayNum}</Text>
        <Text style={styles.dateMonth}>{monthName}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <View style={styles.avatarPlaceholder} />

        <Text style={styles.eventName} numberOfLines={1}>
          {event.name}
        </Text>

        <View style={styles.tagsRow}>
          {event.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={11} color="#555" />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.time}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={11} color="#555" />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#d9d9d9',
    borderRadius: 20,
    flexDirection: 'row',
    height: 136,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dateSection: {
    width: 72,
    alignItems: 'flex-start',
  },
  dayName: {
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#000',
    marginBottom: 6,
  },
  dateNum: {
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: '#000',
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: '#000',
    lineHeight: 28,
  },
  divider: {
    width: 1,
    height: 100,
    backgroundColor: '#aaa',
    marginHorizontal: 14,
  },
  content: {
    flex: 1,
  },
  avatarPlaceholder: {
    position: 'absolute',
    top: -4,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#bbb',
  },
  eventName: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000',
    marginBottom: 4,
    paddingRight: 38,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: '#e1e1e1',
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    color: '#777',
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#000',
    flex: 1,
  },
});
