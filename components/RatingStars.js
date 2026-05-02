import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RatingStars({ rating = 0 }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < fullStars) return <Ionicons key={i} name="star" size={16} color="#F4A261" />;
        if (i === fullStars && hasHalf) return <Ionicons key={i} name="star-half" size={16} color="#F4A261" />;
        return <Ionicons key={i} name="star-outline" size={16} color="#ccc" />;
      })}
      <Text style={styles.text}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  text: { marginLeft: 4, fontSize: 13, color: '#666' },
});
