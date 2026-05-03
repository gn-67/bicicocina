import React, { useEffect, useMemo, useRef } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

import type { Partner } from '../data/partners';

type Props = {
  partner: Partner | null;
  onClose: () => void;
};

function openDirections(partner: Partner) {
  const { coordinates, address } = partner;
  const [lng, lat] = coordinates;
  const label = encodeURIComponent(partner.name);

  // Try native maps first, fall back to Google Maps web
  const iosUrl = `maps:0,0?q=${label}@${lat},${lng}`;
  const androidUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&destination_place_id=${label}`;

  const nativeUrl = Platform.OS === 'ios' ? iosUrl : androidUrl;

  Linking.canOpenURL(nativeUrl)
    .then(supported => Linking.openURL(supported ? nativeUrl : webUrl))
    .catch(() => Linking.openURL(webUrl));
}

export default function PartnerSheet({ partner, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  useEffect(() => {
    if (partner) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [partner]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
    >
      <BottomSheetView style={styles.content}>
        {partner ? (
          <>
            <View style={styles.header}>
              <Text style={styles.pin}>📍</Text>
              <Text style={styles.name}>{partner.name}</Text>
            </View>

            <Text style={styles.address}>{partner.address}</Text>
            <Text style={styles.description}>{partner.description}</Text>

            {partner.website ? (
              <Text
                style={styles.website}
                onPress={() => Linking.openURL(partner.website!)}
              >
                {partner.website.replace('https://', '')}
              </Text>
            ) : null}

            <Pressable
              style={styles.directionsBtn}
              onPress={() => openDirections(partner)}
            >
              <Text style={styles.directionsBtnText}>Get Directions</Text>
            </Pressable>
          </>
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  pin: {
    fontSize: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  address: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 10,
  },
  website: {
    fontSize: 13,
    color: '#3b82f6',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  directionsBtn: {
    backgroundColor: '#1d1933',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  directionsBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
