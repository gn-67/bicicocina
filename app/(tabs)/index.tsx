import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import ActiveRouteCard from '../../components/explore/ActiveRouteCard';
import ExploreHeader from '../../components/explore/ExploreHeader';
import FilterChips, {
  FILTER_OPTIONS,
  type FilterOption,
} from '../../components/explore/FilterChips';
import RecommendedRouteCard from '../../components/explore/RecommendedRouteCard';
import { getActiveRoutes, getRecommendedRoutes } from '../../lib/routes';
import type { Route } from '../../lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 25;
const ACTIVE_CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const ACTIVE_CARD_GAP = 12;

export default function ExploreScreen() {
  const [filter, setFilter] = useState<FilterOption>('All');

  const activeRoutes = useMemo(() => getActiveRoutes(), []);
  const recommended = useMemo(() => getRecommendedRoutes(filter), [filter]);

  const handleViewRoute = (route: Route) => {
    router.push(`/route/${route.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ExploreHeader />

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitleInline}>Active Routes</Text>
            <View style={styles.liveDot} />
          </View>
          {activeRoutes.length === 0 ? (
            <Text style={styles.empty}>No routes starting soon nearby.</Text>
          ) : (
            <FlatList
              horizontal
              data={activeRoutes}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ActiveRouteCard
                  route={item}
                  width={ACTIVE_CARD_WIDTH}
                  onPress={handleViewRoute}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeList}
              ItemSeparatorComponent={() => (
                <View style={{ width: ACTIVE_CARD_GAP }} />
              )}
              snapToInterval={ACTIVE_CARD_WIDTH + ACTIVE_CARD_GAP}
              decelerationRate="fast"
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitleInline}>Easy Routes for You</Text>
          </View>
          <View style={styles.chipsWrap}>
            <FilterChips value={filter} onChange={setFilter} />
          </View>

          <View style={styles.recList}>
            {recommended.length === 0 ? (
              <Text style={styles.empty}>No routes match this filter.</Text>
            ) : (
              recommended.map(r => (
                <RecommendedRouteCard
                  key={r.id}
                  route={r}
                  onPress={handleViewRoute}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: 28 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 8,
    marginBottom: 14,
  },
  sectionTitleInline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  activeList: { paddingHorizontal: HORIZONTAL_PADDING },
  chipsWrap: {
    paddingLeft: HORIZONTAL_PADDING,
  },
  recList: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 16,
    gap: 14,
  },
  empty: {
    paddingHorizontal: HORIZONTAL_PADDING,
    color: '#9596a0',
    fontSize: 14,
  },
});
