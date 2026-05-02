import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { label: string };

export default function DistanceBadge({ label }: Props) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ff5a4d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
