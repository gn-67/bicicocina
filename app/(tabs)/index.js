import { useState } from 'react';
import { Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterBar from '../../components/FilterBar';
import RouteCard from '../../components/RouteCard';
import { useRoutes } from '../../hooks/useRoutes';

export default function ExploreScreen() {
  const [filter, setFilter] = useState('All');
  const { routes, loading, error } = useRoutes(filter);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Explore Routes</Text>
      <FilterBar onFilterChange={setFilter} />
      {loading ? (
        <ActivityIndicator size="large" color="#2D6A4F" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RouteCard route={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No routes found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#1B4332' },
  list: { paddingHorizontal: 16 },
  loader: { marginTop: 40 },
  error: { padding: 16, color: 'red', textAlign: 'center' },
  empty: { padding: 16, color: '#888', textAlign: 'center' },
});
