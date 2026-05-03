import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'Account', type: 'ionicon' },
  { icon: 'bookmark-outline', label: 'Saved', type: 'ionicon' },
  { icon: 'notifications-none', label: 'Notifications', type: 'material' },
  { icon: 'shield-outline', label: 'Safety', type: 'ionicon' },
  { icon: 'help-outline', label: 'Help', type: 'ionicon' },
  { icon: 'info-outline', label: 'About', type: 'material' },
];

export default function MenuScreen() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={15}>
          <Ionicons name="close" size={32} color="#43CAC6" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {MENU_ITEMS.map((item, idx) => (
          <Pressable key={idx} style={styles.menuItem}>
            <View style={styles.itemLeft}>
              {item.type === 'ionicon' ? (
                <Ionicons name={item.icon as any} size={24} color="#787985" />
              ) : (
                <MaterialIcons name={item.icon as any} size={24} color="#787985" />
              )}
              <Text style={styles.itemLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </Pressable>
        ))}

        <View style={styles.divider} />

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#F85057" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  scroll: { paddingHorizontal: 25 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f8',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  itemLabel: { fontSize: 16, color: '#000', fontWeight: '500' },
  divider: { height: 40 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 15,
  },
  logoutText: { fontSize: 16, color: '#F85057', fontWeight: '600' },
});
