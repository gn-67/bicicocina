import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

const EMOTICONS = [
  { emoji: '😠', color: '#EF4444' },
  { emoji: '😟', color: '#F97316' },
  { emoji: '😐', color: '#FACC15' },
  { emoji: '🙂', color: '#84CC16' },
  { emoji: '😁', color: '#22C55E' },
];

const TAGS = [
  'Group Friendly',
  'Nature',
  'Well Lit',
  'Scenic',
  'Beginner Friendly',
  'Low Traffic',
  'Ocean View',
];

export default function RideSummaryScreen() {
  const { id, name } = useLocalSearchParams();
  const [enjoyment, setEnjoyment] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState(0.2); // 0 to 1
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Review Your Ride</Text>

        {/* Location Card */}
        <View style={styles.card}>
          <View style={styles.locationLabelRow}>
            <Ionicons name="location-sharp" size={14} color="#6F6F6F" />
            <Text style={styles.locationLabel}>Location</Text>
          </View>
          <Text style={styles.locationName}>{name || 'Gayley Avenue - Westwood Avenue'}</Text>
        </View>

        {/* Enjoyment Rating */}
        <View style={styles.card}>
          <Text style={styles.question}>How much did you enjoy your ride?</Text>
          <View style={styles.emojiRow}>
            {EMOTICONS.map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => setEnjoyment(idx)}
                style={[
                  styles.emojiBtn,
                  { backgroundColor: item.color + (enjoyment === idx ? 'AA' : '33') },
                  enjoyment === idx && styles.emojiBtnActive,
                ]}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.labelRow}>
            <Text style={styles.subLabel}>I didn't like it</Text>
            <Text style={styles.subLabel}>I loved it!</Text>
          </View>
        </View>

        {/* Difficulty Slider */}
        <View style={styles.card}>
          <Text style={styles.question}>How difficult was the route?</Text>
          <View style={styles.sliderContainer}>
            <LinearGradient
              colors={['#A1EAA3', '#FFF9A5', '#ED8B8B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sliderTrack}
            >
              <View style={styles.sliderTickRow}>
                <View style={styles.sliderTick} />
                <View style={styles.sliderTick} />
                <View style={styles.sliderTick} />
              </View>
            </LinearGradient>
            <Pressable 
                style={[styles.sliderThumb, { left: `${difficulty * 100}%` }]}
                onPress={() => setDifficulty(Math.random())}
            />
          </View>
          <View style={styles.labelRow}>
            <Text style={styles.subLabel}>Easy</Text>
            <Text style={styles.subLabel}>Difficult</Text>
          </View>
        </View>

        {/* Tag Selection */}
        <View style={styles.card}>
          <Text style={styles.question}>Choose Tags</Text>
          <View style={styles.tagsGrid}>
            {TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagActive,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Links */}
        <Pressable style={styles.actionRow}>
          <View style={styles.actionLeft}>
            <Ionicons name="camera-outline" size={20} color="#787985" />
            <Text style={styles.actionText}>Add Photos</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#787985" />
        </Pressable>

        <Pressable style={styles.actionRow}>
          <View style={styles.actionLeft}>
            <MaterialIcons name="report-problem" size={20} color="#787985" />
            <Text style={styles.actionText}>Report</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#787985" />
        </Pressable>

        {/* Submit Button */}
        <Pressable 
          style={styles.submitBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.submitBtnText}>Submit</Text>
        </Pressable>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 25, paddingTop: 10 },
  header: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#f3f4f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  locationLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  locationLabel: { fontSize: 12, color: '#6F6F6F', letterSpacing: 1.2 },
  locationName: { fontSize: 16, fontWeight: '700', color: '#6F6F6F', letterSpacing: 1.6 },
  question: { fontSize: 12, color: '#6F6F6F', letterSpacing: 1.2, marginBottom: 15 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiBtnActive: { borderWidth: 2, borderColor: '#fff' },
  emoji: { fontSize: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  subLabel: { fontSize: 12, color: '#909090', letterSpacing: 1.2 },
  
  sliderContainer: {
    marginVertical: 10,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 25,
    borderRadius: 12.5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTickRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
  },
  sliderTick: {
    width: 1,
    height: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  sliderThumb: {
    position: 'absolute',
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginLeft: -19.5,
  },

  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#d3d4db',
  },
  tagActive: { backgroundColor: '#43CAC6', borderColor: '#43CAC6' },
  tagText: { fontSize: 12, color: '#787985' },
  tagTextActive: { color: '#fff', fontWeight: '700' },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f8',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 15,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  actionText: { fontSize: 12, color: '#787985', letterSpacing: 1.2 },

  submitBtn: {
    backgroundColor: '#f85057',
    borderRadius: 20,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1.6 },
});
