import { Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';

const FILTERS = ['All', 'Scenic', 'Quickest-but-safe', 'Beginner', 'Bike Lane Only'];

export default function FilterBar({ onFilterChange }) {
  const [active, setActive] = useState('All');

  function handlePress(filter) {
    setActive(filter);
    if (onFilterChange) onFilterChange(filter);
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {FILTERS.map((filter) => (
        <Pressable
          key={filter}
          style={[styles.chip, active === filter && styles.chipActive]}
          onPress={() => handlePress(filter)}
        >
          <Text style={[styles.chipText, active === filter && styles.chipTextActive]}>
            {filter}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#2D6A4F' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff' },
});
