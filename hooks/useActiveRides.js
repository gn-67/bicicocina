import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useActiveRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveRides = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('active_rides')
        .select('*, routes(name), profiles(display_name)')
        .in('status', ['upcoming', 'in_progress'])
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;
      setRides(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRides();

    // Real-time subscription to ride status changes
    const channel = supabase
      .channel('active-rides')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_rides',
        },
        () => {
          fetchActiveRides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveRides]);

  async function createActiveRide(routeId, startTime, meetingPoint) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in');

    const { data, error: insertError } = await supabase
      .from('active_rides')
      .insert({
        route_id: routeId,
        leader_id: user.id,
        start_time: startTime,
        meeting_point: meetingPoint,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return data;
  }

  async function joinRide(rideId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in');

    const { data, error: insertError } = await supabase
      .from('ride_participants')
      .insert({
        ride_id: rideId,
        user_id: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return data;
  }

  return { rides, loading, error, fetchActiveRides, createActiveRide, joinRide };
}
