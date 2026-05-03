import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import HoursTable from './HoursTable';
import HoursWarning from './HoursWarning';

const DONATE_URL = 'https://bicyclekitchen.org/support-us/donate/';
const VOLUNTEER_URL = 'https://bicyclekitchen.org/support-us/volunteer/';

// Real photo of the Bicycle Kitchen (replace with a local asset when available)
const KITCHEN_PHOTO =
  'https://www.figma.com/api/mcp/asset/051b852e-da1a-4296-b927-e913079f9d4f';

const MISSION_BODY =
  'Our mission is to promote the bicycle as a fun, safe, and accessible form of transportation, to foster healthy urban communities, and to provide a welcoming space to learn about building, maintaining, and riding bicycles.';

export default function MissionTab() {
  return (
    <View style={styles.root}>
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionCard, styles.donateCard]}
          onPress={() => Linking.openURL(DONATE_URL)}
        >
          <Text style={styles.actionLabel}>Donate</Text>
        </Pressable>
        <Pressable
          style={[styles.actionCard, styles.volunteerCard]}
          onPress={() => Linking.openURL(VOLUNTEER_URL)}
        >
          <Text style={styles.actionLabel}>Volunteer</Text>
        </Pressable>
      </View>

      <View style={styles.missionCard}>
        <Image
          source={{ uri: KITCHEN_PHOTO }}
          style={styles.missionPhoto}
          resizeMode="cover"
        />
        <View style={styles.missionBody}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>{MISSION_BODY}</Text>
        </View>
      </View>

      <View style={styles.hoursSection}>
        <Text style={styles.sectionTitle}>Hours of Operation</Text>
        <HoursWarning />
        <HoursTable />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 40 },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    height: 149,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  donateCard: { backgroundColor: '#d9f4f3' },
  volunteerCard: { backgroundColor: '#feedee' },
  actionLabel: {
    fontSize: 16,
    color: '#000',
    letterSpacing: 1.6,
    textAlign: 'center',
  },

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
  missionBody: { gap: 15 },
  missionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  missionText: {
    fontSize: 12,
    color: '#787985',
    letterSpacing: 1.2,
    lineHeight: 18,
  },

  hoursSection: { gap: 15 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
});
