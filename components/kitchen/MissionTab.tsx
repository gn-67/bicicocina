import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import ActionButton from './ActionButton';
import HoursTable from './HoursTable';
import HoursWarning from './HoursWarning';

const DONATE_URL = 'https://bicyclekitchen.org/support-us/donate/';
const VOLUNTEER_URL = 'https://bicyclekitchen.org/support-us/volunteer/';

const MISSION_BODY =
  'Our mission is to promote the bicycle as a fun, safe, and accessible form of transportation, to foster healthy urban communities, and to provide a welcoming space to learn about building, maintaining, and riding bicycles.';

export default function MissionTab() {
  return (
    <View style={styles.root}>
      <View style={styles.actionsRow}>
        <ActionButton
          icon="heart-outline"
          label="Donate"
          onPress={() => Linking.openURL(DONATE_URL)}
        />
        <ActionButton
          icon="hand-left-outline"
          label="Volunteer"
          onPress={() => Linking.openURL(VOLUNTEER_URL)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.body}>{MISSION_BODY}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hours of Operation</Text>
        <HoursWarning />
        <HoursTable />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 28 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  section: { gap: 14 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  body: {
    fontSize: 13,
    color: '#000',
    lineHeight: 20,
    letterSpacing: 0.4,
  },
});
