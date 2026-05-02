import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { KITCHEN_EVENTS } from '../../data/events';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = KITCHEN_EVENTS.find(e => e.id === id);

  if (!event) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: 'Event' }} />
        <Text style={styles.notFoundText}>Event not found.</Text>
      </View>
    );
  }

  const date = new Date(event.dateISO + 'T12:00:00');
  const fullDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Event',
          headerBackTitle: 'Back',
          headerTintColor: '#000',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: true,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBox} />

        <Text style={styles.eventName}>{event.name}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color="#555" />
          <Text style={styles.metaText}>{event.time}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color="#555" />
          <Text style={styles.metaText}>{event.location}</Text>
        </View>

        <Pressable
          style={styles.reserveBtn}
          onPress={() =>
            Alert.alert(
              'Reserved!',
              `You're signed up for ${event.name} on ${fullDate}.`
            )
          }
        >
          <Text style={styles.reserveBtnText}>Reserve</Text>
        </Pressable>

        <View style={styles.descSection}>
          <Text style={styles.descLabel}>Event Description</Text>
          <Text style={styles.descText}>{event.description}</Text>
        </View>

        <View style={styles.tagsSection}>
          {event.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 28, paddingBottom: 48 },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  notFoundText: { fontSize: 16, color: '#888' },

  heroBox: {
    width: '100%',
    height: 316,
    backgroundColor: '#d9d9d9',
    borderRadius: 20,
    marginBottom: 24,
  },

  eventName: {
    fontSize: 30,
    fontWeight: '400',
    color: '#000',
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#000',
  },

  reserveBtn: {
    backgroundColor: '#d9d9d9',
    borderRadius: 54,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 28,
  },
  reserveBtnText: {
    fontSize: 14,
    letterSpacing: 1.2,
    color: '#000',
  },

  descSection: { gap: 12, marginBottom: 20 },
  descLabel: {
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#000',
    fontWeight: '500',
  },
  descText: {
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#000',
    lineHeight: 20,
  },

  tagsSection: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e1e1e1',
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 11,
    color: '#777',
    letterSpacing: 1,
  },
});
