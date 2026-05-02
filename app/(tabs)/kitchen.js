import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafetyBanner from '../../components/SafetyBanner';
import { KITCHEN_ADDRESS } from '../../lib/constants';

export default function KitchenScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>La Bicicocina</Text>
        <Text style={styles.subtitle}>The Bicycle Kitchen</Text>

        <SafetyBanner />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Us</Text>
          <Text style={styles.text}>{KITCHEN_ADDRESS}</Text>
          <Text style={styles.text}>Open hours: Wed–Sun, 11am–7pm</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learn</Text>
          <Text style={styles.text}>Safety videos — coming soon</Text>
          <Text style={styles.text}>Bike anatomy — coming soon</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Involved</Text>
          <Text style={styles.text}>Volunteer signup — coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1B4332' },
  subtitle: { fontSize: 16, color: '#52796F', marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2D6A4F', marginBottom: 8 },
  text: { fontSize: 14, color: '#333', marginBottom: 4 },
});
