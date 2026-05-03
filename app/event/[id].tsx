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
          headerTitleStyle: { fontWeight: '700' },
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: true,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <View style={styles.heroBox}>
          <Ionicons
            name="image-outline"
            size={48}
            color="#bbb"
            style={styles.heroPlaceholderIcon}
          />
        </View>

        {/* Title + bookmark row */}
        <View style={styles.titleRow}>
          <Text style={styles.eventName}>{event.name}</Text>
          <View style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={18} color="#787985" />
          </View>
        </View>

        {/* Time + location */}
        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={13} color="#787985" />
            <Text style={styles.metaText}>{event.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color="#787985" />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        </View>

        {/* Reserve button */}
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

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.descLabel}>Event Description</Text>
          <Text style={styles.descText}>{event.description}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 25, paddingBottom: 48 },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  notFoundText: { fontSize: 16, color: '#787985' },

  heroBox: {
    width: '100%',
    height: 316,
    backgroundColor: '#f3f4f8',
    borderRadius: 24,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderIcon: {
    opacity: 0.4,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventName: {
    fontSize: 25,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  bookmarkBtn: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  metaBlock: {
    gap: 8,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#787985',
  },

  reserveBtn: {
    backgroundColor: '#f85057',
    borderRadius: 20,
    height: 53,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  reserveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.6,
  },

  descSection: { gap: 15 },
  descLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  descText: {
    fontSize: 12,
    color: '#787985',
    lineHeight: 20,
  },
});
