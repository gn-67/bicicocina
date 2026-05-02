import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [history, setHistory] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchProfileData();
  }, [user]);

  async function fetchProfileData() {
    setLoading(true);
    try {
      const [historyRes, savedRes, reflectionsRes] = await Promise.all([
        supabase
          .from('ride_history')
          .select('*, routes(name)')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(20),
        supabase
          .from('saved_routes')
          .select('*, routes(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      setHistory(historyRes.data || []);
      setSavedRoutes(savedRes.data || []);
      setReflections(reflectionsRes.data || []);
    } catch (e) {
      // silently handle — data just won't show
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.signInPrompt}>Sign in to see your ride history and saved routes.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.email}>{user.email}</Text>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color="#2D6A4F" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Ride History</Text>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View>
                  <Text style={styles.routeName}>{item.routes?.name || 'Free Ride'}</Text>
                  {item.distance != null && (
                    <Text style={styles.stat}>{item.distance} mi · {item.calories || 0} cal</Text>
                  )}
                </View>
                <Text style={styles.date}>
                  {new Date(item.started_at).toLocaleDateString()}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No rides yet</Text>}
            scrollEnabled={false}
          />

          {savedRoutes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Saved Routes</Text>
              {savedRoutes.map((s) => (
                <View key={s.id} style={styles.savedItem}>
                  <Text style={styles.routeName}>{s.routes?.name}</Text>
                </View>
              ))}
            </>
          )}

          {reflections.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Reflections</Text>
              {reflections.map((r) => (
                <View key={r.id} style={styles.reflectionItem}>
                  <Text style={styles.reflectionText}>{r.text}</Text>
                  <Text style={styles.date}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#1B4332' },
  email: { paddingHorizontal: 16, fontSize: 14, color: '#666', marginBottom: 8 },
  signInPrompt: { padding: 16, fontSize: 16, color: '#666' },
  signOutButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  signOutText: { color: '#666', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', paddingHorizontal: 16, paddingTop: 8, color: '#2D6A4F' },
  list: { padding: 16 },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  routeName: { fontSize: 16, color: '#333' },
  stat: { fontSize: 12, color: '#888', marginTop: 2 },
  date: { fontSize: 14, color: '#888' },
  empty: { color: '#888', textAlign: 'center' },
  savedItem: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reflectionItem: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reflectionText: { fontSize: 14, color: '#333', marginBottom: 4 },
  loader: { marginTop: 40 },
});
