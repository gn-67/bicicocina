import curatedRoutesData from '../data/curated-routes.json';
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

// ── Explore route list ────────────────────────────────────────────────────────
// Shows: the Bicycle Kitchen Loop anchor (from routes.json) first, then all
// curated routes (from curated-routes.json) sorted shortest-first.
// Filters on top using the same tag system as getRecommendedRoutes.
export function getExploreRoutes(filterTag: string = 'All'): Route[] {
  const allRoutes = getAllRoutes();
  const curatedFC = curatedRoutesData as GeoJSON.FeatureCollection;
  const curatedRoutes: Route[] = curatedFC.features.map(
    f => f.properties as unknown as Route,
  );

  // 1. Locate the Kitchen Loop anchor from routes.json
  const lower = (s: string) => s.toLowerCase();
  let kitchenLoop: Route | undefined;

  // Try exact canonical id first
  kitchenLoop = allRoutes.find(r => r.id === 'rt-bicycle-kitchen-loop');

  if (!kitchenLoop) {
    // Name fallback: both "bicycle" and "kitchen" in routes.json
    kitchenLoop = allRoutes.find(
      r => lower(r.name).includes('bicycle') && lower(r.name).includes('kitchen'),
    );
    if (kitchenLoop) {
      console.warn(
        `[Explore] 'rt-bicycle-kitchen-loop' not found; name fallback matched '${kitchenLoop.name}' (${kitchenLoop.id})`,
      );
    }
  }

  if (!kitchenLoop) {
    // Direct id fallback — rt-kitchen-loop is the actual Kitchen loop in routes.json
    kitchenLoop = allRoutes.find(r => r.id === 'rt-kitchen-loop');
    if (kitchenLoop) {
      console.warn(
        `[Explore] 'rt-kitchen-loop' not found and name fallback failed; ` +
        `using direct fallback 'rt-kitchen-loop' ("${kitchenLoop.name}")`,
      );
    } else {
      console.warn(
        '[Explore] Kitchen Loop not found by any method. Showing curated routes only.',
      );
    }
  }

  // 2. Curated routes from routes.json (none today, but future-proof)
  const curatedFromMain = allRoutes.filter(
    r => (r as unknown as Record<string, unknown>).curated === true,
  );

  // 3. Merge: anchor first, then all curated sorted by length_mi asc
  const anchors: Route[] = kitchenLoop ? [kitchenLoop] : [];
  const anchorId = kitchenLoop?.id;

  const curatedSorted = [...curatedRoutes, ...curatedFromMain]
    .filter(r => r.id !== anchorId) // don't double-add if anchor appears in curated
    .sort((a, b) => (a.length_mi ?? 0) - (b.length_mi ?? 0));

  const merged = [...anchors, ...curatedSorted];

  if (merged.length === 0) {
    console.warn('[Explore] No routes to display on Explore page.');
    return [];
  }

  // Log incomplete features so card component isn't silently broken
  for (const r of merged) {
    const missing = [
      !r.name && 'name',
      r.length_mi == null && 'length_mi',
      !r.image && 'image',
    ].filter(Boolean);
    if (missing.length) {
      console.warn(`[Explore] Route ${r.id} missing fields: ${missing.join(', ')}`);
    }
  }

  // 4. Apply filter tag on top (same logic as getRecommendedRoutes)
  if (filterTag === 'All') return merged;
  return merged.filter(r => r.tags?.includes(filterTag));
}
