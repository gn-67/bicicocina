import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { label: string };

export default function ComingSoonTab({ label }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.body}>Coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#000' },
  body: { fontSize: 13, color: '#787985' },
});
