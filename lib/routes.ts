import routesData from '../data/routes.json';
import type { Route } from './types';

export function getAllRoutes(): Route[] {
  const fc = routesData as GeoJSON.FeatureCollection;
  return fc.features.map(f => f.properties as unknown as Route);
}

export function getActiveRoutes(): Route[] {
  return getAllRoutes().filter(r => r.is_active);
}

export function getRecommendedRoutes(filterTag: string = 'All'): Route[] {
  const all = getAllRoutes().filter(r => r.beginner_friendly);
  if (filterTag === 'All') return all;
  return all.filter(r => r.tags.includes(filterTag));
}
