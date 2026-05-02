import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import RatingStars from '../../components/RatingStars';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Route #{id}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating</Text>
        <RatingStars rating={4.5} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <Text style={styles.text}>No reviews yet — be the first!</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.text}>No photos yet</Text>
      </View>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Start Ride</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4332', marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2D6A4F', marginBottom: 8 },
  text: { fontSize: 14, color: '#666' },
  button: {
    backgroundColor: '#2D6A4F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
