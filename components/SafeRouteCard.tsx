import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type { RouteResult } from '../lib/types';

type Props = {
  result: RouteResult | null;
  onClose: () => void;
  onTryDifferent: () => void;
};

function scoreColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#f97316';
}

export default function SafeRouteCard({ result, onClose, onTryDifferent }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['22%', '52%'], []);

  useEffect(() => {
    if (result) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
  }, [result]);

  const color = result ? scoreColor(result.score.score) : '#22c55e';
  const coveragePct = result ? Math.round(result.score.bikeLaneCoverage * 100) : 0;
  const detourMiStr = result ? result.score.detourMi.toFixed(1) : '0.0';

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        {result && (
          <>
            {/* Header row */}
            <View style={styles.headerRow}>
              <View style={styles.titleCol}>
                <Text style={styles.destination} numberOfLines={1}>
                  {result.destination}
                </Text>
                <Text style={styles.meta}>
                  {result.distanceMi.toFixed(1)} mi · ~{result.durationMin} min
                </Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: color }]}>
                <Text style={styles.scoreNum}>{result.score.score}</Text>
              </View>
            </View>

            {result.source === 'seeded' && (
              <View style={styles.seededBadge}>
                <Text style={styles.seededText}>Community route</Text>
              </View>
            )}

            {/* Breakdown */}
            <View style={styles.breakdown}>
              <Text style={styles.breakdownRow}>
                🚲 Bike lane coverage: {coveragePct}%
              </Text>
              <Text style={styles.breakdownRow}>
                ⚠ Potholes near route: {result.score.potholesNearRoute}
              </Text>
              <Text style={styles.breakdownRow}>
                ↗ Detour: +{detourMiStr} mi vs direct
              </Text>
            </View>

            {/* Start Ride */}
            <Pressable
              style={styles.startBtn}
              onPress={() => console.log('[SafeRoute] Start Ride tapped')}
            >
              <Text style={styles.startBtnText}>Start Ride</Text>
            </Pressable>

            {/* Try different */}
            <Pressable onPress={onTryDifferent} style={styles.tryLink}>
              <Text style={styles.tryLinkText}>Try a different destination</Text>
            </Pressable>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: '#fff', borderRadius: 20 },
  handle: { backgroundColor: '#d1d5db', width: 36 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleCol: { flex: 1, marginRight: 12 },
  destination: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 2 },
  meta: { fontSize: 13, color: '#6b7280' },

  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: { fontSize: 18, fontWeight: '800', color: '#fff' },

  seededBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d9f4f3',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  seededText: { fontSize: 10, color: '#0d6e6a', letterSpacing: 0.5 },

  breakdown: { gap: 6, marginBottom: 18 },
  breakdownRow: { fontSize: 13, color: '#374151' },

  startBtn: {
    backgroundColor: '#1d1933',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  startBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 1 },

  tryLink: { alignItems: 'center' },
  tryLinkText: { fontSize: 13, color: '#40c9c4', textDecorationLine: 'underline' },
});
