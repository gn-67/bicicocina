import { useRef, useCallback } from 'react';
import * as Speech from 'expo-speech';

export function useVoiceNav() {
  const isSpeakingRef = useRef(false);

  const speak = useCallback((text) => {
    if (isSpeakingRef.current) {
      Speech.stop();
    }
    isSpeakingRef.current = true;
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.9,
      onDone: () => { isSpeakingRef.current = false; },
      onError: () => { isSpeakingRef.current = false; },
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    isSpeakingRef.current = false;
  }, []);

  // Announce a turn direction
  const announceTurn = useCallback((direction, streetName) => {
    const text = streetName
      ? `In 100 feet, turn ${direction} onto ${streetName}`
      : `In 100 feet, turn ${direction}`;
    speak(text);
  }, [speak]);

  // Announce bike lane transitions
  const announceBikeLane = useCallback((entering) => {
    speak(entering ? 'Entering bike lane' : 'Bike lane ending. Stay alert.');
  }, [speak]);

  // Announce arrival
  const announceArrival = useCallback(() => {
    speak('You have arrived at your destination.');
  }, [speak]);

  // Generic checkpoint announcement
  const announceCheckpoint = useCallback((message) => {
    speak(message);
  }, [speak]);

  return { speak, stop, announceTurn, announceBikeLane, announceArrival, announceCheckpoint };
}
