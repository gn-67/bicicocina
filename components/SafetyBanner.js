import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SafetyBanner() {
  return (
    <View style={styles.banner}>
      <Ionicons name="shield-checkmark-outline" size={20} color="#D00000" />
      <Text style={styles.text}>Always wear a helmet. Stay visible. Ride predictably.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  text: { flex: 1, fontSize: 13, color: '#664D03' },
});
