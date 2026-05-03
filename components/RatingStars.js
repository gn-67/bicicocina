import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RatingStars({ rating = 0 }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < fullStars) return <Ionicons key={i} name="star" size={16} color="#43CAC6" />;
        if (i === fullStars && hasHalf) return <Ionicons key={i} name="star-half" size={16} color="#43CAC6" />;
        return <Ionicons key={i} name="star-outline" size={16} color="#ccc" />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
