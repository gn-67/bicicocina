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
      {/* Left: teal date section */}
      <View style={styles.dateSection}>
        <Text style={styles.dayName}>{dayName}</Text>
        <Text style={styles.dateNum}>{dayNum}</Text>
        <Text style={styles.dateMonth}>{monthName}</Text>
      </View>

      {/* Right: content section */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleCol}>
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
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={18} color="#c0c0c0" />
          </View>
        </View>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={11} color="#9596a0" />
            <Text style={styles.metaText} numberOfLines={1}>{event.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={11} color="#9596a0" />
            <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 127,
    borderRadius: 16,
    overflow: 'hidden',
  },

  dateSection: {
    width: 114,
    alignSelf: 'stretch',
    backgroundColor: '#40c9c4',
    paddingHorizontal: 16,
    paddingTop: 21,
    justifyContent: 'flex-start',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  dateNum: {
    fontSize: 25,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2.5,
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: 25,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2.5,
    lineHeight: 28,
  },

  content: {
    flex: 1,
    backgroundColor: '#f3f4f8',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleCol: {
    flex: 1,
    gap: 4,
    marginRight: 8,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#d9f4f3',
    borderWidth: 1,
    borderColor: '#40c9c4',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    color: '#777',
    letterSpacing: 1,
  },
  avatarCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  metaBlock: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#9596a0',
    flex: 1,
  },
});
