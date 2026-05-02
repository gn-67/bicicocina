import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  greeting?: string;
  onNotifyPress?: () => void;
};

export default function ExploreHeader({
  greeting = 'Hi, Joe!',
  onNotifyPress,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.title}>Explore Bike Routes</Text>
      </View>
      <Pressable style={styles.bell} onPress={onNotifyPress} hitSlop={8}>
        <Ionicons name="notifications-outline" size={18} color="#1d1933" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: 8,
  },
  textCol: { flex: 1 },
  greeting: { fontSize: 16, color: '#000' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginTop: 2,
  },
  bell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
