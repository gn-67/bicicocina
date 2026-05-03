import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useLocationToggle } from '../../hooks/useLocationToggle';

const { width: SCREEN_W } = Dimensions.get('window');

// Mock data based on Figma
const MOCK_USER = {
  name: 'Joe Bruin',
  ridesCompleted: 2,
  friends: 8,
  rank: 'Beginner Biker',
  avatar: 'https://www.figma.com/api/mcp/asset/f6563f2a-2712-4887-9b34-c6fd4dbdce91',
};

const PHOTO_GALLERY = [
  'https://www.figma.com/api/mcp/asset/1dca8d8f-20c6-45a1-a80f-ec5a455553a7',
  'https://www.figma.com/api/mcp/asset/082f0ec3-4985-4600-b5b3-e409251fce8b',
  'https://www.figma.com/api/mcp/asset/7bde035a-fa08-4ea5-9c25-9159f7697699',
  'https://www.figma.com/api/mcp/asset/9be353bf-0913-4381-ad36-c74295485aa5',
  'https://www.figma.com/api/mcp/asset/b2b40199-ad8b-41c1-8730-96a0feef5c6d',
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enabled: locationEnabled, toggle: toggleLocation } = useLocationToggle();

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
      const { data } = await supabase
        .from('ride_history')
        .select('*, routes(name, image, length_mi)')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1);

      setHistory(data || []);
    } catch (e) {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerWrap}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.contentPadding}>
          <Text style={styles.signInPrompt}>Sign in to see your profile.</Text>
          <Pressable style={styles.submitBtn} onPress={() => router.push('/auth')}>
            <Text style={styles.submitBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const latestRide = history[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Title and Settings */}
        <View style={styles.headerWrap}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            {/* Location toggle */}
            <Pressable
              onPress={toggleLocation}
              style={[styles.iconBtn, locationEnabled && styles.iconBtnActive]}
              hitSlop={8}
            >
              <Ionicons
                name={locationEnabled ? 'location' : 'location-outline'}
                size={18}
                color={locationEnabled ? '#fff' : '#9ca3af'}
              />
            </Pressable>
            {/* Menu / waffle */}
            <Pressable onPress={() => router.push('/menu')} hitSlop={8}>
              <Ionicons name="menu" size={32} color="black" />
            </Pressable>
          </View>
        </View>

        {/* User Info Header */}
        <View style={styles.userInfoRow}>
          <Image source={{ uri: MOCK_USER.avatar }} style={styles.avatar} />
          <View style={styles.userStatsCol}>
            <Text style={styles.userName}>{MOCK_USER.name}</Text>
            <Text style={styles.ridesCompletedText}>{MOCK_USER.ridesCompleted} Rides Completed</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg} />
              <View style={[styles.progressBarFill, { width: '65%' }]} />
            </View>
            <View style={styles.badgesRow}>
              <View style={styles.statItem}>
                <Text style={statVal}>{MOCK_USER.friends}</Text>
                <Text style={statLab}>Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Image 
                  source={{ uri: 'https://www.figma.com/api/mcp/asset/f5ad9c9a-2021-4288-970c-e8b4816116fa' }} 
                  style={styles.rankIcon} 
                />
                <Text style={statLab}>{MOCK_USER.rank}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Recently Completed Section */}
        <Text style={styles.sectionTitle}>Recently Completed</Text>
        
        <View style={styles.recentRideCard}>
          <View style={styles.cardHeader}>
             <Ionicons name="chevron-back" size={20} color="black" />
             <Text style={styles.cardDate}>Today (5/2)</Text>
          </View>

          <View style={styles.rideInfoBox}>
            <Image 
              source={{ uri: latestRide?.routes?.image || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=70' }} 
              style={styles.rideImage} 
            />
            <View style={styles.rideDetailCol}>
              <View style={styles.rideNameRow}>
                <Text style={styles.rideName}>{latestRide?.routes?.name || 'Gayley Ave Loop'}</Text>
                <View style={styles.distBadge}>
                  <Text style={styles.distBadgeText}>5k</Text>
                </View>
              </View>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(n => <Ionicons key={n} name="star" size={12} color="#43cac6" />)}
              </View>
              <Text style={styles.rideMeta}>
                {latestRide?.distance || '3.45'} mi - 234 ft - About 1 hour
              </Text>
              <Text style={styles.rideLocation}>location start - end</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>5.67</Text>
              <Text style={styles.statLabel}>Distance(mi)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>00:37:21</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuItemText}>My Ride History</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>

        <View style={styles.divider} />

        {/* Create Route Section */}
        <View style={styles.createRouteCard}>
          <View style={styles.createRouteContent}>
            <Text style={styles.createRouteTitle}>Create Route</Text>
            <Text style={styles.createRouteDesc}>
              Create your own biking route. I really like biking and it is very fun to do with the family.
            </Text>
          </View>
          <Image 
            source={{ uri: 'https://www.figma.com/api/mcp/asset/064f51d9-2ce5-4f89-acaa-50eeac76a725' }} 
            style={styles.createRouteArt} 
          />
          <View style={styles.plusCircle}>
            <Ionicons name="add" size={32} color="white" />
          </View>
        </View>

        <Pressable style={styles.menuItem}>
          <Text style={styles.menuItemText}>Created Routes</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>

        <View style={styles.divider} />

        {/* Photo Gallery Section */}
        <Text style={styles.sectionTitle}>Photo Gallery</Text>
        <View style={styles.photoGrid}>
          {PHOTO_GALLERY.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.galleryImg} />
          ))}
          <View style={[styles.galleryImg, styles.morePhotos]}>
            <Text style={styles.morePhotosText}>+ 23</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 20 },
  contentPadding: { paddingHorizontal: 25 },
  
  headerWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 30, fontWeight: '700', color: '#000' },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  iconBtnActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  
  userInfoRow: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingVertical: 10,
    gap: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: '#eee',
  },
  userStatsCol: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 4 },
  ridesCompletedText: { fontSize: 11, color: '#b0b0b0', marginBottom: 8 },
  progressContainer: {
    height: 10,
    width: 122,
    borderRadius: 8,
    backgroundColor: '#d3d4db',
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBarBg: { ...StyleSheet.absoluteFillObject },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f85057',
    borderRadius: 8,
  },
  badgesRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  statItem: { alignItems: 'center' },
  rankIcon: { width: 32, height: 32, marginBottom: 2 },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 25,
    marginVertical: 25,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 25,
    marginBottom: 15,
  },

  recentRideCard: {
    marginHorizontal: 25,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ececec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  cardDate: { fontSize: 16, color: '#000' },
  
  rideInfoBox: {
    backgroundColor: '#f3f4f8',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 15,
  },
  rideImage: { width: 94, height: 92 },
  rideDetailCol: { flex: 1, padding: 8, paddingLeft: 12 },
  rideNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rideName: { fontSize: 13, fontWeight: '700', color: '#000' },
  distBadge: {
    backgroundColor: '#f85057',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  starsRow: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  rideMeta: { fontSize: 10, color: '#787985' },
  rideLocation: { fontSize: 10, color: '#787985', marginTop: 2 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  statBox: { alignItems: 'flex-start' },
  statValue: { fontSize: 12, fontWeight: '700', color: '#000' },
  statLabel: { fontSize: 12, color: '#000' },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 25,
    paddingHorizontal: 20,
    height: 49,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  menuItemText: { fontSize: 16, color: '#000' },

  createRouteCard: {
    marginHorizontal: 25,
    height: 184,
    borderRadius: 24,
    backgroundColor: '#9fe4e1',
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  createRouteContent: { flex: 1, padding: 25, zIndex: 2 },
  createRouteTitle: { fontSize: 30, fontWeight: '700', color: '#000', marginBottom: 10 },
  createRouteDesc: { fontSize: 12, color: '#000', lineHeight: 20, width: '80%' },
  createRouteArt: {
    position: 'absolute',
    bottom: -40,
    right: -30,
    width: 214,
    height: 214,
    opacity: 0.85,
  },
  plusCircle: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#f85057',
    width: 47,
    height: 47,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },

  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 25,
  },
  galleryImg: {
    width: (SCREEN_W - 70) / 3,
    height: 107,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  morePhotos: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  signInPrompt: { fontSize: 16, color: '#666', marginVertical: 40, textAlign: 'center' },
  submitBtn: {
    backgroundColor: '#f85057',
    borderRadius: 20,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loader: { marginTop: 40 },
});

const statVal = { fontSize: 20, color: '#000' };
const statLab = { fontSize: 11, color: '#b0b0b0' };
