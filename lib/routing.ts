import { distance, point as turfPoint } from '@turf/turf';
import { bikeways, potholes, seedRoutes } from './data';
import { scoreRoute, HARD_REJECT_DETOUR_RATIO } from './scoring';
import type { GeocodeSuggestion, RouteResponse, RouteResult } from './types';

const KITCHEN_COORDS: [number, number] = [-118.2871, 34.0928];
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

// Hard limits
const MAX_DEST_DISTANCE_MI   = 25;    // reject destinations > 25 mi from Kitchen
const KITCHEN_SAME_RADIUS_KM = 0.05;  // < 50 m = "you're already here"
const SEEDED_MATCH_RADIUS_KM = 0.3;   // within 300 m → use seeded route
const ROUTING_TIMEOUT_MS     = 3000;

function milesPerMin(distanceMi: number, durationSec: number): number {
  return durationSec > 0 ? Math.round(distanceMi / (durationSec / 60)) : 0;
}

// ── Seeded route lookup ───────────────────────────────────────────────────────
// Check if any seed route's endpoint is within 300 m of the destination.
function findSeededRoute(destCoords: [number, number]): GeoJSON.Feature | null {
  for (const feat of seedRoutes.features) {
    if (feat.geometry?.type !== 'LineString') continue;
    const coords = (feat.geometry as GeoJSON.LineString).coordinates;
    if (coords.length < 2) continue;
    const endpoint = coords[coords.length - 1] as [number, number];
    const dist = distance(turfPoint(endpoint), turfPoint(destCoords), { units: 'kilometers' });
    if (dist < SEEDED_MATCH_RADIUS_KM) return feat;
  }
  return null;
}

// ── Mapbox Directions API ─────────────────────────────────────────────────────
async function fetchDirections(
  destCoords: [number, number],
  signal: AbortSignal,
): Promise<{ geometry: GeoJSON.LineString; distanceM: number; durationSec: number } | null> {
  const [lng1, lat1] = KITCHEN_COORDS;
  const [lng2, lat2] = destCoords;
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/cycling/` +
    `${lng1},${lat1};${lng2},${lat2}` +
    `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url, { signal });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    routes?: { geometry: GeoJSON.LineString; distance: number; duration: number }[];
  };

  const route = data.routes?.[0];
  if (!route || route.geometry.coordinates.length < 2) return null;
  return { geometry: route.geometry, distanceM: route.distance, durationSec: route.duration };
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function findOrGenerateRoute(
  suggestion: GeocodeSuggestion,
): Promise<RouteResponse> {
  const destCoords = suggestion.center;

  // Guard: already at the Kitchen
  const distToKitchenKm = distance(turfPoint(KITCHEN_COORDS), turfPoint(destCoords), { units: 'kilometers' });
  if (distToKitchenKm < KITCHEN_SAME_RADIUS_KM) {
    return { ok: false, reason: 'already_here', message: "You're already at the Kitchen!" };
  }

  // Guard: destination too far (> 25 miles)
  const directMi = distance(turfPoint(KITCHEN_COORDS), turfPoint(destCoords), { units: 'miles' });
  if (directMi > MAX_DEST_DISTANCE_MI) {
    return {
      ok: false,
      reason: 'too_far',
      message: `That's ${Math.round(directMi)} miles away — try somewhere closer to the Kitchen.`,
    };
  }

  // 1. Check seeded routes first
  const seeded = findSeededRoute(destCoords);
  if (seeded) {
    const geometry = seeded.geometry as GeoJSON.LineString;
    const distanceMi = (seeded.properties as Record<string, unknown>)?.length_mi as number
      ?? distance(turfPoint(KITCHEN_COORDS), turfPoint(destCoords), { units: 'miles' }) * 1.2;
    const score = scoreRoute(geometry, bikeways, potholes, KITCHEN_COORDS, destCoords);

    const result: RouteResult = {
      destination: suggestion.name,
      destCoords,
      geometry,
      distanceMi,
      durationMin: Math.round(distanceMi / 10 * 60), // 10 mph avg
      score,
      source: 'seeded',
    };
    return { ok: true, result };
  }

  // 2. Call Mapbox Directions with a 3-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ROUTING_TIMEOUT_MS);

  try {
    const dirs = await fetchDirections(destCoords, controller.signal);
    clearTimeout(timeoutId);

    if (!dirs) {
      return { ok: false, reason: 'no_route', message: "We couldn't find a safe route there yet — try a closer destination." };
    }

    const distanceMi = dirs.distanceM / 1609.34;
    const durationMin = Math.round(dirs.durationSec / 60);
    const score = scoreRoute(dirs.geometry, bikeways, potholes, KITCHEN_COORDS, destCoords);

    // Hard reject: route is > 60% longer than direct distance
    const detourRatio = directMi > 0 ? distanceMi / directMi : 1;
    if (detourRatio > HARD_REJECT_DETOUR_RATIO) {
      return {
        ok: false,
        reason: 'hard_reject',
        message: "The only route we found is too indirect — try a closer or different destination.",
      };
    }

    const result: RouteResult = {
      destination: suggestion.name,
      destCoords,
      geometry: dirs.geometry,
      distanceMi,
      durationMin,
      score,
      source: 'generated',
    };
    return { ok: true, result };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const isNetwork = err instanceof TypeError && err.message.includes('Network');
    if (isAbort || isNetwork) {
      return {
        ok: false,
        reason: 'no_network',
        message: 'Connect to the internet to search for routes.',
      };
    }
    return { ok: false, reason: 'api_error', message: "Couldn't reach the routing service — try again." };
  }
}
