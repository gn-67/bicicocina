import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useRoutes(filter = 'All') {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('routes_with_ratings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'All') {
        query = query.contains('tags', [filter]);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setRoutes(
        (data || []).map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          distance: r.distance ? `${r.distance} mi` : null,
          elevation: r.elevation,
          coordinates: r.coordinates,
          tags: r.tags || [],
          tag: r.tags?.[0] || '',
          rating: parseFloat(r.avg_rating) || 0,
          reviewCount: parseInt(r.review_count, 10) || 0,
          createdBy: r.created_by,
        }))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  async function searchRoutes(query) {
    setLoading(true);
    try {
      const { data, error: searchError } = await supabase
        .from('routes_with_ratings')
        .select('*')
        .ilike('name', `%${query}%`);

      if (searchError) throw searchError;

      setRoutes(
        (data || []).map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          distance: r.distance ? `${r.distance} mi` : null,
          tag: r.tags?.[0] || '',
          rating: parseFloat(r.avg_rating) || 0,
          reviewCount: parseInt(r.review_count, 10) || 0,
        }))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRouteById(id) {
    const { data, error: fetchError } = await supabase
      .from('routes_with_ratings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    return {
      ...data,
      rating: parseFloat(data.avg_rating) || 0,
      reviewCount: parseInt(data.review_count, 10) || 0,
    };
  }

  async function createRoute({ name, description, distance, elevation, coordinates, tags }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to create a route');

    const { data, error: insertError } = await supabase
      .from('routes')
      .insert({
        name,
        description,
        distance,
        elevation,
        coordinates,
        tags,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    fetchRoutes();
    return data;
  }

  return { routes, loading, error, searchRoutes, fetchRouteById, createRoute, refresh: fetchRoutes };
}
