import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MapView from '../../components/MapView';
import RouteDetailSheet from '../../components/RouteDetailSheet';
import SafeRouteCard from '../../components/SafeRouteCard';
import SearchBar from '../../components/SearchBar';
import { debounce, geocodeQuery } from '../../lib/geocoding';
import { findOrGenerateRoute } from '../../lib/routing';
import type { GeocodeSuggestion, Route, RouteResult } from '../../lib/types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

export default function MapScreen() {
  // Community route sheet (tapping existing route lines)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Search state
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Safe route state
  const [safeRoute, setSafeRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Abort controller ref for geocoding
  const geocodeAbort = useRef<AbortController | null>(null);

  // Debounced geocode — recreated once (stable ref not needed; function is recreated on each render
  // but debounce state lives in the closure — wrap in useCallback to stabilise)
  const debouncedGeocode = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) { setSuggestions([]); setLoadingSuggestions(false); return; }
      geocodeAbort.current?.abort();
      geocodeAbort.current = new AbortController();
      try {
        const results = await geocodeQuery(query, MAPBOX_TOKEN, geocodeAbort.current.signal);
        setSuggestions(results);
      } catch {
        // AbortError = user typed again; silently ignore
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setLoadingSuggestions(true);
    debouncedGeocode(text);
  };

  const handleSelectSuggestion = async (s: GeocodeSuggestion) => {
    setSearchExpanded(false);
    setSuggestions([]);
    setSearchQuery(s.name);
    setRouteError(null);
    setRouteLoading(true);
    setSelectedRoute(null); // hide community route sheet while routing

    const response = await findOrGenerateRoute(s);
    setRouteLoading(false);

    if (response.ok) {
      setSafeRoute(response.result);
    } else {
      setRouteError(response.message);
      setSafeRoute(null);
    }
  };

  const handleCollapse = () => {
    setSearchExpanded(false);
    setSuggestions([]);
    geocodeAbort.current?.abort();
  };

  const handleCloseRoute = () => {
    setSafeRoute(null);
    setSearchQuery('');
    setRouteError(null);
  };

  const handleTryDifferent = () => {
    setSafeRoute(null);
    setRouteError(null);
    setSearchQuery('');
    setSuggestions([]);
    setSearchExpanded(true);
  };

  return (
    <View style={styles.container}>
      <MapView
        onRouteTap={safeRoute ? undefined : setSelectedRoute}
        safeRoute={safeRoute}
      />

      {/* Community route detail sheet — hidden while safe route is active */}
      {!safeRoute && (
        <RouteDetailSheet
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}

      {/* Safe route summary card */}
      <SafeRouteCard
        result={safeRoute}
        onClose={handleCloseRoute}
        onTryDifferent={handleTryDifferent}
      />

      {/* Tap-away overlay when search is expanded */}
      {searchExpanded && (
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleCollapse} />
      )}

      {/* Search bar — floats over the map */}
      <SafeAreaView style={styles.searchArea} edges={['top']} pointerEvents="box-none">
        <SearchBar
          expanded={searchExpanded}
          value={searchQuery}
          suggestions={suggestions}
          loadingSuggestions={loadingSuggestions}
          onExpand={() => setSearchExpanded(true)}
          onCollapse={handleCollapse}
          onChangeText={handleSearchChange}
          onSelectSuggestion={handleSelectSuggestion}
        />

        {/* Routing spinner */}
        {routeLoading && (
          <View style={styles.routingBanner}>
            <ActivityIndicator size="small" color="#40c9c4" />
            <Text style={styles.routingText}>Finding safest route…</Text>
          </View>
        )}

        {/* Error banner */}
        {routeError && !routeLoading && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{routeError}</Text>
            <Pressable onPress={() => setRouteError(null)} hitSlop={8}>
              <Text style={styles.errorClose}>×</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 21,
    paddingTop: 10,
    gap: 8,
    zIndex: 10,
  },
  routingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  routingText: { fontSize: 12, color: '#374151', letterSpacing: 0.5 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#f85057',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  errorText: { flex: 1, fontSize: 12, color: '#f85057', letterSpacing: 0.3 },
  errorClose: { fontSize: 18, color: '#f85057', marginLeft: 8 },
});
