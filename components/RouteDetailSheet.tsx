import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

import type { Route } from '../lib/types';

type Props = {
  route: Route | null;
  onClose: () => void;
};

export default function RouteDetailSheet({ route, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '60%'], []);

  useEffect(() => {
    if (route) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [route]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
    >
      <BottomSheetView style={styles.content}>
        {route ? (
          <>
            <Text style={styles.name}>{route.name}</Text>
            <Text style={styles.line}>Length: {route.length_mi} mi</Text>
            <Text style={styles.line}>Rating: {route.rating}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </>
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  name: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  line: { fontSize: 15, marginBottom: 6 },
  closeBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  closeBtnText: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
});
