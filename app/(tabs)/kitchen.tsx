import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComingSoonTab from '../../components/kitchen/ComingSoonTab';
import EventsTab from '../../components/kitchen/EventsTab';
import MissionTab from '../../components/kitchen/MissionTab';
import SubtabNav, {
  type KitchenSubtab,
} from '../../components/kitchen/SubtabNav';

const HORIZONTAL_PADDING = 25;

export default function KitchenScreen() {
  const [subtab, setSubtab] = useState<KitchenSubtab>('Mission');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.header}>Bike Kitchen</Text>
        </View>

        <View style={styles.navWrap}>
          <SubtabNav value={subtab} onChange={setSubtab} />
        </View>

        <View style={styles.body}>
          {subtab === 'Mission' && <MissionTab />}
          {subtab === 'Events' && <EventsTab />}
          {subtab === 'Learn' && <ComingSoonTab label="Learn" />}
          {subtab === 'Safety' && <ComingSoonTab label="Safety" />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 60 },
  headerWrap: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 18,
  },
  header: { fontSize: 28, color: '#000' },
  navWrap: { paddingHorizontal: HORIZONTAL_PADDING },
  body: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 28,
  },
});
