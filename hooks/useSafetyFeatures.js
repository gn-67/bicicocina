import { useEffect, useRef, useCallback, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { KITCHEN_ADDRESS } from '../lib/constants';

const SHAKE_THRESHOLD = 2.5;
const CANCEL_DELAY_MS = 10000;

export function useSafetyFeatures({ enabled = false } = {}) {
  const [shakeDetected, setShakeDetected] = useState(false);
  const cancelTimerRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Shake detection → 911 with 10s cancel window
  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(200);
    subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > SHAKE_THRESHOLD) {
        triggerEmergency();
      }
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
      }
    };
  }, [enabled]);

  function triggerEmergency() {
    if (shakeDetected) return; // already triggered
    setShakeDetected(true);

    Alert.alert(
      'Emergency Call',
      'Calling 911 in 10 seconds. Tap Cancel to stop.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
            setShakeDetected(false);
          },
        },
      ],
      { cancelable: false }
    );

    cancelTimerRef.current = setTimeout(() => {
      Linking.openURL('tel:911');
      setShakeDetected(false);
    }, CANCEL_DELAY_MS);
  }

  // Panic button → navigate to Bicycle Kitchen
  const routeToKitchen = useCallback(() => {
    const encoded = encodeURIComponent(KITCHEN_ADDRESS);
    const url = Platform.select({
      ios: `maps://?daddr=${encoded}`,
      android: `google.navigation:q=${encoded}&mode=b`,
      default: `https://maps.google.com/maps?daddr=${encoded}`,
    });
    Linking.openURL(url);
  }, []);

  return { shakeDetected, routeToKitchen };
}
