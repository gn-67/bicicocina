import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import RatingStars from '../../components/RatingStars';
import { useRoutes } from '../../hooks/useRoutes';
import { useRatings } from '../../hooks/useRatings';
import { useRideTracking } from '../../hooks/useRideTracking';
import { useAuth } from '../../hooks/useAuth';

const RATING_CATEGORIES = ['safety', 'lighting', 'beginner', 'scenic', 'surface'];

function CategoryRatingInput({ label, value, onChange }) {
  return (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryLabel}>{label}</Text>
      <View style={styles.categoryStars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)}>
            <Text style={[styles.starButton, n <= value && styles.starButtonActive]}>
              {n <= value ? '\u2605' : '\u2606'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { fetchRouteById } = useRoutes();
  const { ratings, fetchRatings, fetchUserRating, userRating, submitRating } = useRatings(id);
  const { isRiding, startRide, endRide, stats } = useRideTracking();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    safety: 0, lighting: 0, beginner: 0, scenic: 0, surface: 0, reviewText: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [routeData] = await Promise.all([
        fetchRouteById(id),
        fetchRatings(),
        fetchUserRating(),
      ]);
      setRoute(routeData);
    } catch (e) {
      // route not found — keep null
    } finally {
      setLoading(false);
    }
  }

  async function handleStartRide() {
    try {
      await startRide(id);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function handleEndRide() {
    const summary = await endRide();
    if (summary) {
      Alert.alert(
        'Ride Complete',
        `Distance: ${summary.distance} mi\nDuration: ${summary.durationMin} min\nCalories: ${summary.calories}\nElevation: ${summary.elevation} ft`
      );
    }
  }

  async function handleSubmitRating() {
    const incomplete = RATING_CATEGORIES.some((c) => ratingForm[c] === 0);
    if (incomplete) {
      Alert.alert('Rate all categories', 'Please rate each category before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await submitRating(ratingForm);
      setShowRatingForm(false);
      setRatingForm({ safety: 0, lighting: 0, beginner: 0, scenic: 0, surface: 0, reviewText: '' });
      loadData();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  if (!route) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.text}>Route not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{route.name}</Text>
      {route.description && <Text style={styles.description}>{route.description}</Text>}

      <View style={styles.metaRow}>
        {route.distance != null && <Text style={styles.metaText}>{route.distance} mi</Text>}
        {route.elevation != null && <Text style={styles.metaText}>{route.elevation} ft gain</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Rating</Text>
        <RatingStars rating={route.rating} />
        <Text style={styles.reviewCount}>{route.reviewCount} review{route.reviewCount !== 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {ratings.length === 0 ? (
          <Text style={styles.text}>No reviews yet — be the first!</Text>
        ) : (
          ratings.map((r) => (
            <View key={r.id} style={styles.reviewItem}>
              <Text style={styles.reviewAuthor}>{r.profiles?.display_name || 'Anonymous'}</Text>
              <View style={styles.reviewScores}>
                {RATING_CATEGORIES.map((c) => (
                  <Text key={c} style={styles.reviewScore}>{c}: {r[c]}/5</Text>
                ))}
              </View>
              {r.review_text ? <Text style={styles.reviewText}>{r.review_text}</Text> : null}
            </View>
          ))
        )}
      </View>

      {user && !userRating && !showRatingForm && (
        <Pressable style={styles.secondaryButton} onPress={() => setShowRatingForm(true)}>
          <Text style={styles.secondaryButtonText}>Rate This Route</Text>
        </Pressable>
      )}

      {showRatingForm && (
        <View style={styles.ratingForm}>
          <Text style={styles.sectionTitle}>Your Rating</Text>
          {RATING_CATEGORIES.map((cat) => (
            <CategoryRatingInput
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              value={ratingForm[cat]}
              onChange={(v) => setRatingForm((prev) => ({ ...prev, [cat]: v }))}
            />
          ))}
          <TextInput
            style={styles.textInput}
            placeholder="Write a review (optional)"
            multiline
            value={ratingForm.reviewText}
            onChangeText={(t) => setRatingForm((prev) => ({ ...prev, reviewText: t }))}
          />
          <Pressable
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmitRating}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
          </Pressable>
        </View>
      )}

      {stats && (
        <View style={styles.statsSummary}>
          <Text style={styles.sectionTitle}>Last Ride Summary</Text>
          <Text style={styles.statText}>Distance: {stats.distance} mi</Text>
          <Text style={styles.statText}>Duration: {stats.durationMin} min</Text>
          <Text style={styles.statText}>Calories: {stats.calories}</Text>
          <Text style={styles.statText}>Elevation: {stats.elevation} ft</Text>
        </View>
      )}

      <Pressable
        style={[styles.button, isRiding && styles.buttonDanger]}
        onPress={isRiding ? handleEndRide : handleStartRide}
      >
        <Text style={styles.buttonText}>{isRiding ? 'End Ride' : 'Start Ride'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4332', marginBottom: 4 },
  description: { fontSize: 14, color: '#666', marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaText: { fontSize: 14, color: '#52796F', fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2D6A4F', marginBottom: 8 },
  text: { fontSize: 14, color: '#666' },
  reviewCount: { fontSize: 12, color: '#888', marginTop: 4 },
  reviewItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reviewAuthor: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  reviewScores: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  reviewScore: { fontSize: 12, color: '#666', backgroundColor: '#F0F7F4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  reviewText: { fontSize: 14, color: '#444', marginTop: 4 },
  ratingForm: { marginBottom: 24, padding: 12, backgroundColor: '#F0F7F4', borderRadius: 12 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
  categoryStars: { flexDirection: 'row', gap: 4 },
  starButton: { fontSize: 24, color: '#ccc' },
  starButtonActive: { color: '#F4A261' },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2D6A4F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDanger: { backgroundColor: '#c0392b' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2D6A4F',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: { color: '#2D6A4F', fontSize: 16, fontWeight: '500' },
  statsSummary: { marginBottom: 16, padding: 12, backgroundColor: '#F0F7F4', borderRadius: 12 },
  statText: { fontSize: 14, color: '#333', marginBottom: 4 },
});
