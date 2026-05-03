import React from 'react';
import { StyleSheet, View } from 'react-native';

import LearningCard from './LearningCard';

const LEARN_ITEMS = [
  {
    title: 'Bike Anatomy',
    description: 'Learn the parts of a bike and discover the importance of every piece!',
    backgroundColor: '#43cac6',
  },
  {
    title: 'How to Ride a Bike',
    description: 'Learn step by step on how to ride a bike!',
    backgroundColor: '#f85057',
  },
  {
    title: 'Hand Signals',
    description: 'Explore the parts of a bike and understand how each component works together to keep you moving.',
    backgroundColor: '#d9f4f3',
  },
];

export default function LearnTab() {
  return (
    <View style={styles.root}>
      {LEARN_ITEMS.map((item, index) => (
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
