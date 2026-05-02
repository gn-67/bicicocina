import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_HISTORY = [
  { id: '1', name: 'LA River Path', date: '2025-04-28' },
  { id: '2', name: 'Venice Beach Boardwalk', date: '2025-04-25' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.sectionTitle}>Ride History</Text>
      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.routeName}>{item.name}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#1B4332' },
  sectionTitle: { fontSize: 18, fontWeight: '600', paddingHorizontal: 16, color: '#2D6A4F' },
  list: { padding: 16 },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  routeName: { fontSize: 16, color: '#333' },
  date: { fontSize: 14, color: '#888' },
});
