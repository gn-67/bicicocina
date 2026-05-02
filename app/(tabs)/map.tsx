import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import MapView from '../../components/MapView';
import RouteDetailSheet from '../../components/RouteDetailSheet';
import type { Route } from '../../lib/types';

export default function MapScreen() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  return (
    <View style={styles.container}>
      <MapView onRouteTap={setSelectedRoute} />
      <RouteDetailSheet
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
