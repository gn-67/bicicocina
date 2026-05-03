import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
};

export default function ActionButton({ icon, label, onPress }: Props) {
  return (
    <Pressable style={styles.btn} onPress={onPress}>
      <View style={styles.row}>
        <Ionicons name={icon} size={18} color="#000" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    height: 60,
    backgroundColor: '#ececef',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {
    fontSize: 16,
    color: '#000',
    letterSpacing: 1,
  },
});
