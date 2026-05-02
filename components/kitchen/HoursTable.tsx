import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DAYS: { key: number; label: string; hours: string }[] = [
  { key: 1, label: 'Monday', hours: '6:30 PM – 9:00 PM' },
  { key: 2, label: 'Tuesday', hours: '6:30 PM – 9:00 PM' },
  { key: 3, label: 'Wednesday', hours: '6:00 PM – 9:00 PM' },
  { key: 4, label: 'Thursday', hours: '6:00 PM – 9:00 PM' },
  { key: 5, label: 'Friday', hours: 'Closed' },
  { key: 6, label: 'Saturday', hours: '12:00 PM – 3:00 PM' },
  { key: 0, label: 'Sunday', hours: 'Closed' },
];

export default function HoursTable() {
  const today = new Date().getDay();

  return (
    <View style={styles.card}>
      {DAYS.map(d => {
        const isToday = d.key === today;
        return (
          <React.Fragment key={d.key}>
            <View style={styles.row}>
              <Text style={[styles.day, isToday && styles.todayText]}>
                {d.label}
              </Text>
              <Text style={[styles.hours, isToday && styles.todayText]}>
                {d.hours}
              </Text>
            </View>
            {d.key === 4 && (
              <Text style={styles.note}>
                Reserved for Femme, Trans, Women, and Non-Binary riders.
              </Text>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ececef',
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  day: {
    fontSize: 13,
    color: '#000',
    letterSpacing: 0.6,
  },
  hours: {
    fontSize: 13,
    color: '#000',
    textAlign: 'right',
    letterSpacing: 0.6,
  },
  todayText: { fontWeight: '700' },
  note: {
    fontSize: 10,
    color: '#52525b',
    fontStyle: 'italic',
    marginTop: -2,
    lineHeight: 14,
  },
});
