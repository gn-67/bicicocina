import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLocation } from './useLocation';
import { DEMO_USER_ID } from '../lib/constants';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useRideTracking() {
  const { startTracking, stopTracking } = useLocation();
  const [rideId, setRideId] = useState(null);
  const [isRiding, setIsRiding] = useState(false);
  const [stats, setStats] = useState(null);
  const pointsRef = useRef([]);
  const startTimeRef = useRef(null);

  const startRide = useCallback(async (routeId) => {
    // Create ride_history entry
    const { data, error } = await supabase
      .from('ride_history')
      .insert({
        user_id: DEMO_USER_ID,
        route_id: routeId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    setRideId(data.id);
    setIsRiding(true);
    pointsRef.current = [];
    startTimeRef.current = Date.now();

    // Start continuous location tracking
    await startTracking((coords) => {
      pointsRef.current.push({
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude,
        timestamp: Date.now(),
      });
    });

    return data.id;
  }, [startTracking]);

  const endRide = useCallback(async () => {
    stopTracking();
    setIsRiding(false);

    const points = pointsRef.current;
    if (!rideId || points.length < 2) {
      setRideId(null);
      return null;
    }

    // Compute distance
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += haversineDistance(
        points[i - 1].latitude,
        points[i - 1].longitude,
        points[i].latitude,
        points[i].longitude
      );
    }

    // Compute elevation gain
    let elevationGain = 0;
    for (let i = 1; i < points.length; i++) {
      const diff = (points[i].altitude || 0) - (points[i - 1].altitude || 0);
      if (diff > 0) elevationGain += diff;
    }
    // Convert meters to feet
    elevationGain = elevationGain * 3.281;

    // Compute pace and duration
    const durationMs = Date.now() - startTimeRef.current;
    const durationMin = durationMs / 60000;
    const pace = totalDistance > 0 ? durationMin / totalDistance : 0;

    // Rough calorie estimate (cycling ~40 cal/mile avg)
    const calories = Math.round(totalDistance * 40);

    const summary = {
      distance: Math.round(totalDistance * 100) / 100,
      pace: Math.round(pace * 10) / 10,
      elevation: Math.round(elevationGain),
      calories,
      durationMin: Math.round(durationMin),
    };

    // Update ride_history
    await supabase
      .from('ride_history')
      .update({
        completed_at: new Date().toISOString(),
        distance: summary.distance,
        pace: summary.pace,
        elevation: summary.elevation,
        calories: summary.calories,
      })
      .eq('id', rideId);

    setStats(summary);
    setRideId(null);
    return summary;
  }, [rideId, stopTracking]);

  // Group ride: broadcast position to ride_participants
  const broadcastPosition = useCallback(async (activeRideId, coords) => {
    await supabase
      .from('ride_participants')
      .upsert(
        {
          ride_id: activeRideId,
          user_id: DEMO_USER_ID,
          current_lat: coords.latitude,
          current_lng: coords.longitude,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'ride_id,user_id' }
      );
  }, []);

  // Subscribe to co-rider positions
  const subscribeToRiders = useCallback((activeRideId, onUpdate) => {
    const channel = supabase
      .channel(`ride-${activeRideId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_participants',
          filter: `ride_id=eq.${activeRideId}`,
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    rideId,
    isRiding,
    stats,
    startRide,
    endRide,
    broadcastPosition,
    subscribeToRiders,
  };
}
