import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import MapView from '../../components/MapView';
import PartnerSheet from '../../components/PartnerSheet';
import RouteDetailSheet from '../../components/RouteDetailSheet';
import type { Partner } from '../../data/partners';
import type { Route } from '../../lib/types';

export default function MapScreen() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  return (
    <View style={styles.container}>
      <MapView
        onRouteTap={route => {
          setSelectedPartner(null);
          setSelectedRoute(route);
        }}
        onPartnerTap={partner => {
          setSelectedRoute(null);
          setSelectedPartner(partner);
        }}
      />
      <RouteDetailSheet
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
      />
      <PartnerSheet
        partner={selectedPartner}
        onClose={() => setSelectedPartner(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
