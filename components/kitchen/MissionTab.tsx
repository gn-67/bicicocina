import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HoursTable from './HoursTable';
import HoursWarning from './HoursWarning';

const DONATE_URL = 'https://bicyclekitchen.org/support-us/donate/';
const VOLUNTEER_URL = 'https://bicyclekitchen.org/support-us/volunteer/';

const KITCHEN_PHOTO = 'https://www.figma.com/api/mcp/asset/ff5af827-e9ee-4284-863b-407db7073e11';

const PARTNER_LOGOS = [
  'https://www.figma.com/api/mcp/asset/4b270d21-754f-428d-939c-931fe83bd71d',
  'https://www.figma.com/api/mcp/asset/8370c6e1-e664-4535-84a2-2f3ed9de58f4',
  'https://www.figma.com/api/mcp/asset/5f7cea1e-6eab-4697-8a46-7220d1b9425c',
  'https://www.figma.com/api/mcp/asset/b96cc5ce-494b-4d3b-a60d-4908e9c87af4',
];

const MISSION_BODY =
  'Our mission is to promote the bicycle as a fun, safe, and accessible form of transportation, to foster healthy urban communities, and to provide a welcoming space to learn about building, maintaining, and riding bicycles.';

export default function MissionTab() {
  return (
    <View style={styles.root}>
      {/* Action Cards */}
      <View style={styles.actionSection}>
        <Pressable style={styles.actionCard} onPress={() => Linking.openURL(DONATE_URL)}>
          <Image 
            source={{ uri: 'https://www.figma.com/api/mcp/asset/1cd65eec-f070-409b-8d43-6e8a3da5176c' }} 
            style={styles.actionBg} 
          />
          <View style={styles.actionOverlay} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Donate to our 20th Anniversary Fundraiser!</Text>
            <View style={styles.actionBtn}>
               <Ionicons name="heart" size={14} color="white" />
               <Text style={styles.actionBtnText}>Donate</Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => Linking.openURL(VOLUNTEER_URL)}>
          <Image 
            source={{ uri: 'https://www.figma.com/api/mcp/asset/a8d16f69-965c-4b55-b489-f51086f58b57' }} 
            style={styles.actionBg} 
          />
          <View style={styles.actionOverlay} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Come volunteer with us!</Text>
            <View style={styles.actionBtn}>
               <Ionicons name="people" size={14} color="white" />
               <Text style={styles.actionBtnText}>Volunteer</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Our Mission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <View style={styles.missionCard}>
          <Image
            source={{ uri: KITCHEN_PHOTO }}
            style={styles.missionPhoto}
            resizeMode="cover"
          />
          <Text style={styles.missionText}>{MISSION_BODY}</Text>
        </View>
      </View>

      {/* Hours Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hours of Operation</Text>
        <HoursWarning />
        <HoursTable />
      </View>

      {/* Who Are We (Moved to bottom) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Who Are We</Text>
        <View style={styles.partnerRow}>
          {PARTNER_LOGOS.map((uri, idx) => (
            <View key={idx} style={styles.partnerCircle}>
               <Image source={{ uri }} style={styles.partnerLogo} resizeMode="contain" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 40 },
  section: { gap: 15 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  actionSection: { gap: 20 },
  actionCard: {
    height: 152,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  actionBg: { ...StyleSheet.absoluteFillObject },
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  actionContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    width: '60%',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d1933',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 30,
    alignSelf: 'flex-start',
    gap: 5,
  },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  missionCard: {
    backgroundColor: '#f3f4f8',
    borderRadius: 16,
    padding: 20,
    gap: 18,
  },
  missionPhoto: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    backgroundColor: '#d9d9d9',
  },
  missionText: {
    fontSize: 12,
    color: '#787985',
    letterSpacing: 1.2,
    lineHeight: 18,
  },

  partnerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  partnerCircle: {
    width: 95,
    height: 93,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d3d4db',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  partnerLogo: {
    width: '70%',
    height: '70%',
  },
});
