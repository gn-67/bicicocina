import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterBar from '../../components/FilterBar';
import RouteCard from '../../components/RouteCard';

const MOCK_ROUTES = [
  { id: '1', name: 'LA River Path', distance: '5.2 mi', rating: 4.5, tag: 'Scenic' },
  { id: '2', name: 'Venice Beach Boardwalk', distance: '3.8 mi', rating: 4.2, tag: 'Quickest-but-safe' },
  { id: '3', name: 'Griffith Park Loop', distance: '7.1 mi', rating: 4.8, tag: 'Scenic' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Explore Routes</Text>
      <FilterBar />
      <FlatList
        data={MOCK_ROUTES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RouteCard route={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#1B4332' },
  list: { paddingHorizontal: 16 },
});
