import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const STORAGE_KEY = '@bici:locationEnabled';

/**
 * User-controlled location toggle with persisted preference.
 *
 * - `enabled`  — whether the user has opted in to location sharing.
 * - `toggle()` — turns sharing on (requesting permission if needed)
 *                or off (stops use in-app; OS permission stays granted).
 * - `loading`  — true while reading the stored preference on mount.
 */
export function useLocationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      setEnabled(val === 'true');
      setLoading(false);
    });
  }, []);

  const toggle = useCallback(async () => {
    if (enabled) {
      // Turning OFF — update preference; OS permission remains but app stops using it
      await AsyncStorage.setItem(STORAGE_KEY, 'false');
      setEnabled(false);
    } else {
      // Turning ON — check / request OS permission first
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status === 'granted') {
        await AsyncStorage.setItem(STORAGE_KEY, 'true');
        setEnabled(true);
      } else if (status === 'undetermined') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus === 'granted') {
          await AsyncStorage.setItem(STORAGE_KEY, 'true');
          setEnabled(true);
        } else {
          Alert.alert(
            'Location access needed',
            'Enable location in your device settings so Bici can show your position on routes.',
            [
              { text: 'Not now', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
        }
      } else {
        // Previously denied — must go to Settings
        Alert.alert(
          'Location turned off',
          'To share your location, go to Settings → Privacy → Location Services and allow Bici.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
    }
  }, [enabled]);

  return { enabled, loading, toggle };
}
