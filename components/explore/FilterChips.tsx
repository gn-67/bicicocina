import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FILTER_OPTIONS = [
  'All',
  'Beginner Friendly',
  'Bike Paths',
  'Scenic',
  'Day',
  'Night',
  'LA River',
  'Short',
  'Medium',
  'Long',
] as const;
export type FilterOption = (typeof FILTER_OPTIONS)[number];

type Props = {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  onFilterPress?: () => void;
};

export default function FilterChips({ value, onChange, onFilterPress }: Props) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.iconBtn} onPress={onFilterPress} hitSlop={6}>
        <Ionicons name="options-outline" size={16} color="#1d1933" />
      </Pressable>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {FILTER_OPTIONS.map(opt => {
          const active = opt === value;
          return (
            <Pressable
              key={opt}
              style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
              onPress={() => onChange(opt)}
            >
              <Text style={active ? styles.chipTextActive : styles.chipTextIdle}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { gap: 8, paddingRight: 25 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: '#1d1933' },
  chipIdle: {
    backgroundColor: '#f3f4f8',
    borderColor: '#d3d4db',
    borderWidth: 0.5,
  },
  chipTextActive: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chipTextIdle: { color: '#787985', fontSize: 12 },
});
