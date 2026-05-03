import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const KITCHEN_SUBTABS = ['Mission', 'Events', 'Learn', 'Safety'] as const;
export type KitchenSubtab = (typeof KITCHEN_SUBTABS)[number];

type Props = {
  value: KitchenSubtab;
  onChange: (next: KitchenSubtab) => void;
};

export default function SubtabNav({ value, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {KITCHEN_SUBTABS.map(tab => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.pill, active && styles.pillActive]}
            hitSlop={4}
          >
            <Text style={[styles.text, active && styles.textActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f8',
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: '#eee',
    padding: 4,
    alignSelf: 'stretch',
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#40c9c4',
    borderWidth: 0.5,
    borderColor: '#008883',
  },
  text: {
    fontSize: 12,
    color: '#787985',
    letterSpacing: 1.2,
  },
  textActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
