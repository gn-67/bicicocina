import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type Props = {
  eventDates?: string[]; // ISO "YYYY-MM-DD"
  selectedDate?: string | null; // ISO "YYYY-MM-DD"
  onDayPress?: (iso: string | null) => void;
};

export default function MiniCalendar({ eventDates = [], selectedDate, onDayPress }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const cells = buildGrid(year, month);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const eventDaySet = new Set(
    eventDates
      .filter(d => {
        const dt = new Date(d + 'T12:00:00');
        return dt.getFullYear() === year && dt.getMonth() === month;
      })
      .map(d => new Date(d + 'T12:00:00').getDate())
  );

  const isToday = (day: number | null) =>
    day !== null &&
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate();

  const hasEvent = (day: number | null) =>
    day !== null && eventDaySet.has(day);

  const toISO = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isSelected = (day: number | null) =>
    day !== null && selectedDate === toISO(day);

  const handleDayPress = (day: number) => {
    if (!onDayPress) return;
    const iso = toISO(day);
    onDayPress(selectedDate === iso ? null : iso);
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event Calendar</Text>
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} hitSlop={8}>
            <Ionicons name="chevron-back-outline" size={14} color="#000" />
          </Pressable>
          <View style={styles.monthPill}>
            <Text style={styles.monthText}>{MONTH_NAMES[month]}</Text>
          </View>
          <Pressable onPress={nextMonth} hitSlop={8}>
            <Ionicons name="chevron-forward-outline" size={14} color="#000" />
          </Pressable>
        </View>
      </View>

      <View style={styles.labelsRow}>
        {DAY_LABELS.map(label => (
          <View key={label} style={styles.labelCell}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day, di) => {
              const today_ = isToday(day);
              const event_ = hasEvent(day);
              const selected_ = isSelected(day);
              return (
                <Pressable
                  key={di}
                  style={styles.dayCell}
                  onPress={day !== null ? () => handleDayPress(day) : undefined}
                  disabled={day === null}
                >
                  {day !== null && (
                    <View
                      style={[
                        styles.dayInner,
                        today_ && styles.todayCircle,
                        selected_ && !today_ && styles.selectedCircle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          today_ && styles.todayText,
                          selected_ && !today_ && styles.selectedText,
                        ]}
                      >
                        {day}
                      </Text>
                      {event_ && !today_ && !selected_ && <View style={styles.eventDot} />}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5e4e4',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1.6,
    color: '#000',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthPill: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  monthText: {
    fontSize: 12,
    color: '#303030',
  },
  labelsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  labelCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#616161',
  },
  grid: {
    gap: 0,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: '#1a1a1a',
  },
  selectedCircle: {
    backgroundColor: '#2D6A4F',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#303030',
    textAlign: 'center',
  },
  todayText: {
    color: '#e3e3e3',
  },
  selectedText: {
    color: '#fff',
  },
  eventDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2D6A4F',
  },
});
