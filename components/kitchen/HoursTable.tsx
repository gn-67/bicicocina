import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DAYS: { key: number; label: string; hours: string }[] = [
  { key: 6, label: 'Saturday', hours: '12:00 PM – 3:00 PM' },
  { key: 0, label: 'Sunday', hours: 'Closed' },
  { key: 1, label: 'Monday', hours: '6:30 PM – 9:00 PM' },
  { key: 2, label: 'Tuesday', hours: '6:30 PM – 9:00 PM' },
  { key: 3, label: 'Wednesday', hours: '6:00 PM – 9:00 PM' },
  { key: 4, label: 'Thursday', hours: '6:00 PM – 9:00 PM' },
  { key: 5, label: 'Friday', hours: 'Closed' },
];

export default function HoursTable() {
  const today = new Date().getDay();

  return (
    <View style={styles.card}>
      {DAYS.map((d, i) => {
        const isToday = d.key === today;
        const isFirst = i === 0;
        return (
          <React.Fragment key={d.key}>
            <View style={styles.row}>
              <Text
                style={[
                  styles.day,
                  isFirst && styles.firstDay,
                  isToday && styles.todayText,
                ]}
              >
                {d.label}
              </Text>
              <Text
                style={[
                  styles.hours,
                  isFirst && styles.firstDay,
                  isToday && styles.todayText,
                ]}
              >
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
    backgroundColor: '#f3f4f8',
    borderRadius: 15,
    padding: 20,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  day: {
    fontSize: 12,
    color: '#787985',
    letterSpacing: 1.2,
  },
  hours: {
    fontSize: 12,
    color: '#787985',
    textAlign: 'right',
    letterSpacing: 1.2,
  },
  firstDay: {
    fontWeight: '700',
    color: '#000',
  },
  todayText: {
    fontWeight: '700',
    color: '#2D6A4F',
  },
  note: {
    fontSize: 10,
    color: '#787985',
    fontStyle: 'italic',
    marginTop: -2,
    lineHeight: 14,
  },
});
