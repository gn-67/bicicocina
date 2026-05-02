import { useState, useEffect } from 'react';

const MOCK_ROUTES = [
  { id: '1', name: 'LA River Path', distance: '5.2 mi', rating: 4.5, tag: 'Scenic' },
  { id: '2', name: 'Venice Beach Boardwalk', distance: '3.8 mi', rating: 4.2, tag: 'Quickest-but-safe' },
  { id: '3', name: 'Griffith Park Loop', distance: '7.1 mi', rating: 4.8, tag: 'Scenic' },
];

export function useRoutes(filter = 'All') {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with Supabase query
    const filtered = filter === 'All'
      ? MOCK_ROUTES
      : MOCK_ROUTES.filter((r) => r.tag === filter);
    setRoutes(filtered);
    setLoading(false);
  }, [filter]);

  return { routes, loading };
}
