import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PHONE_LABEL = '(323) NO-CARRO / (323) 662-2776';
const PHONE_TEL = 'tel:13236622776';

export default function HoursWarning() {
  return (
    <Pressable onPress={() => Linking.openURL(PHONE_TEL)} style={styles.card}>
      <Ionicons name="warning-outline" size={22} color="#f85057" />
      <Text style={styles.text}>
        All hours are subject to closure should we not have the Cook power.{' '}
        Please call us in advance at{' '}
        <Text style={styles.phone}>{PHONE_LABEL}</Text> to be sure we're open.
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 80, 87, 0.1)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 10,
    color: '#787985',
    lineHeight: 15,
  },
  phone: {
    color: '#f85057',
  },
});
