import {
  bbox,
  bboxPolygon,
  booleanIntersects,
  distance,
  length,
  lineString,
  nearestPointOnLine,
  point as turfPoint,
} from '@turf/turf';
import type { RouteScore } from './types';

// ── Scoring weights (edit these live during demo) ─────────────────────────────
// Primary: bike lane coverage (55%) — are you inside protected infrastructure?
export const W_BIKE_LANE = 0.55;
// Secondary: pothole exposure (30%) — saturates at POTHOLE_DENSITY_MAX potholes/mi
export const W_POTHOLE   = 0.30;
// Tertiary: detour ratio (15%) — penalizes routes >50% longer than crow-flies
export const W_DETOUR    = 0.15;

// Class weights — Class 4 protected & Class 1 off-street paths score full credit
const BIKEWAY_CLASS_WEIGHT: Record<number, number> = {
  4: 1.0, // Protected bike lane
  1: 1.0, // Off-street path
  2: 0.7, // Painted lane
  3: 0.4, // Sharrow
};

const POTHOLE_DENSITY_MAX = 5;   // potholes/mile at which pothole score zeroes out
const DETOUR_EXCESS_MAX   = 0.5; // fractional excess beyond which detour score zeroes out
export const HARD_REJECT_DETOUR_RATIO = 1.6; // route > 60% longer than direct → reject

// Buffer distances
const BIKE_LANE_BUFFER_KM = 0.015; // 15 m — consider bikeway "on route"
const POTHOLE_BUFFER_KM   = 0.020; // 20 m — consider pothole "near route"

// ── Main scoring function ─────────────────────────────────────────────────────
// Pure — no side effects. Easy to unit-test.
export function scoreRoute(
  routeGeometry: GeoJSON.LineString,
  bikeways: GeoJSON.FeatureCollection,
  potholes: GeoJSON.FeatureCollection,
  originCoords: [number, number],
  destCoords: [number, number],
): RouteScore {
  const routeFeat = { type: 'Feature' as const, geometry: routeGeometry, properties: {} };
  const routeLengthMi   = length(routeFeat, { units: 'miles' });
  const directDistanceMi = distance(turfPoint(originCoords), turfPoint(destCoords), { units: 'miles' });

  // ── Bike lane coverage ───────────────────────────────────────────────────────
  // Expand bbox by buffer margin to pre-filter candidate bikeways before expensive
  // vertex-level nearestPointOnLine checks.
  const [rMinLng, rMinLat, rMaxLng, rMaxLat] = bbox(routeFeat);
  const margin = BIKE_LANE_BUFFER_KM / 111; // rough deg/km conversion
  const bboxExpanded = bboxPolygon([
    rMinLng - margin, rMinLat - margin,
    rMaxLng + margin, rMaxLat + margin,
  ]);

  let weightedBikeLaneMi = 0;
  for (const feat of bikeways.features) {
    if (feat.geometry?.type !== 'LineString') continue;
    if (!booleanIntersects(feat, bboxExpanded)) continue;

    const classNum = (feat.properties as Record<string, unknown>)?.class as number;
    const weight   = BIKEWAY_CLASS_WEIGHT[classNum] ?? 0.4;

    // Check if any vertex of this bikeway is within BIKE_LANE_BUFFER_KM of the route
    const coords = (feat.geometry as GeoJSON.LineString).coordinates;
    let withinBuffer = false;
    for (const coord of coords) {
      const nearest = nearestPointOnLine(routeGeometry, turfPoint(coord as [number, number]), {
        units: 'kilometers',
      });
      if ((nearest.properties.dist ?? Infinity) < BIKE_LANE_BUFFER_KM) {
        withinBuffer = true;
        break;
      }
    }
    if (withinBuffer) {
      weightedBikeLaneMi += length(feat, { units: 'miles' }) * weight;
    }
  }
  const bikeLaneCoverage = Math.min(weightedBikeLaneMi / routeLengthMi, 1);

  // ── Pothole count near route ─────────────────────────────────────────────────
  // If potholes.json is missing or empty, this remains 0 (perfect pothole score)
  let potholesNearRoute = 0;
  for (const feat of potholes.features) {
    if (feat.geometry?.type !== 'Point') continue;
    const nearest = nearestPointOnLine(
      routeGeometry,
      feat as GeoJSON.Feature<GeoJSON.Point>,
      { units: 'kilometers' },
    );
    if ((nearest.properties.dist ?? Infinity) < POTHOLE_BUFFER_KM) potholesNearRoute++;
  }

  // ── Detour ───────────────────────────────────────────────────────────────────
  const detourRatio = directDistanceMi > 0 ? routeLengthMi / directDistanceMi : 1;
  const detourMi    = Math.max(0, routeLengthMi - directDistanceMi);

  // ── Final score ──────────────────────────────────────────────────────────────
  const potholeDensity = routeLengthMi > 0 ? potholesNearRoute / routeLengthMi : 0;
  const potholeScore   = 1 - Math.min(potholeDensity / POTHOLE_DENSITY_MAX, 1);
  const detourExcess   = Math.max(detourRatio - 1, 0);
  const detourScore    = 1 - Math.min(detourExcess / DETOUR_EXCESS_MAX, 1);

  const score = Math.round(100 * (
    W_BIKE_LANE * bikeLaneCoverage +
    W_POTHOLE   * potholeScore     +
    W_DETOUR    * detourScore
  ));

  // TODO: custom graph-based routing pass — incorporate pothole + bikeway weights
  // directly into the edge costs so we find a safer path, not just score a given one.

  return { score, bikeLaneCoverage, potholesNearRoute, detourMi };
}
