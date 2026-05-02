import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useRatings(routeId) {
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRatings = useCallback(async () => {
    if (!routeId) return;
    setLoading(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('ratings')
        .select('*, profiles(display_name)')
        .eq('route_id', routeId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRatings(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  const fetchUserRating = useCallback(async () => {
    if (!routeId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: fetchError } = await supabase
      .from('ratings')
      .select('*')
      .eq('route_id', routeId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      return;
    }
    setUserRating(data);
  }, [routeId]);

  async function submitRating({ safety, lighting, beginner, scenic, surface, reviewText }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to rate');

    const { data, error: insertError } = await supabase
      .from('ratings')
      .upsert(
        {
          route_id: routeId,
          user_id: user.id,
          safety,
          lighting,
          beginner,
          scenic,
          surface,
          review_text: reviewText,
        },
        { onConflict: 'route_id,user_id' }
      )
      .select()
      .single();

    if (insertError) throw insertError;

    setUserRating(data);
    fetchRatings();
    return data;
  }

  return { ratings, userRating, loading, error, fetchRatings, fetchUserRating, submitRating };
}
