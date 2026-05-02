import { View, Text, StyleSheet } from 'react-native';

export default function MapViewComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map View</Text>
      <Text style={styles.subtext}>Partner: build your map here!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' },
  text: { fontSize: 20, fontWeight: '600', color: '#2D6A4F' },
  subtext: { fontSize: 14, color: '#666', marginTop: 8 },
});
