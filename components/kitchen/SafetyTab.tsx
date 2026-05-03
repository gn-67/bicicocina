import React from 'react';
import { StyleSheet, View } from 'react-native';

import LearningCard from './LearningCard';

const SAFETY_ITEMS = [
  {
    title: 'Why Gears Matter',
    description: 'Learn how to use your gears effectively to maintain efficiency and save your knees on any terrain.',
    backgroundColor: '#43cac6',
  },
  {
    title: 'Left Turns',
    description: 'Master the art of safe left turns in traffic, from signaling to positioning yourself in the lane.',
    backgroundColor: '#f85057',
  },
  {
    title: 'Door Zones',
    description: 'Understand the danger of parked cars and how to position yourself to avoid being "doored".',
    backgroundColor: '#d9f4f3',
  },
];

export default function SafetyTab() {
  return (
    <View style={styles.root}>
      {SAFETY_ITEMS.map((item, index) => (
        <LearningCard
          key={index}
          title={item.title}
          description={item.description}
          backgroundColor={item.backgroundColor}
          style={styles.card}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingBottom: 20 },
  card: { marginBottom: 20 },
});
