import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { KITCHEN_EVENTS } from '../../data/events';
import EventCard from './EventCard';
import MiniCalendar from './MiniCalendar';

const eventDates = KITCHEN_EVENTS.map(e => e.dateISO);

export default function EventsTab() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const displayed = KITCHEN_EVENTS.filter(e => {
    const eventDate = new Date(e.dateISO + 'T12:00:00');
    if (selectedDate) return e.dateISO === selectedDate;
    return eventDate >= today;
  });

  return (
    <View style={styles.root}>
      <MiniCalendar
        eventDates={eventDates}
        selectedDate={selectedDate}
        onDayPress={setSelectedDate}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedDate ? 'Events' : 'Upcoming Events'}
        </Text>
        {displayed.length === 0 ? (
          <Text style={styles.empty}>
            {selectedDate
              ? 'No events on this day.'
              : 'No upcoming events — check back soon.'}
          </Text>
        ) : (
          <View style={styles.list}>
            {displayed.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 28 },
  section: { gap: 14 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  list: { gap: 14 },
  empty: {
    fontSize: 14,
    color: '#888',
  },
});
