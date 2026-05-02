import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PHONE_LABEL = '(323) NO-CARRO / (323) 662-2776';
const PHONE_TEL = 'tel:13236622776';

export default function HoursWarning() {
  return (
    <Pressable
      onPress={() => Linking.openURL(PHONE_TEL)}
      style={styles.card}
    >
      <Ionicons name="warning-outline" size={20} color="#1d1933" />
      <View style={styles.divider} />
      <Text style={styles.text}>
        All hours are subject to closure should we not have the volunteer power.
        Call ahead at <Text style={styles.phone}>{PHONE_LABEL}</Text> to make
        sure we&apos;re open.
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ececef',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 14,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#1d1933',
    opacity: 0.2,
  },
  text: {
    flex: 1,
    fontSize: 11,
    color: '#000',
    lineHeight: 15,
  },
  phone: {
    textDecorationLine: 'underline',
  },
});
