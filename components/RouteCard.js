import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import RatingStars from './RatingStars';

export default function RouteCard({ route }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/route/${route.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{route.name}</Text>
        <Text style={styles.tag}>{route.tag}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.distance}>{route.distance}</Text>
        <RatingStars rating={route.rating} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F7F4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#1B4332' },
  tag: { fontSize: 12, color: '#52796F', backgroundColor: '#D8F3DC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  details: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distance: { fontSize: 14, color: '#666' },
});
