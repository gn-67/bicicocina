import rawSeedRoutes from '../data/routes.json';
import type { Pothole } from './types';

// Loaded once at module init — Metro caches the JSON object; no duplication across imports.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rawPotholes = require('../data/potholes.json');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rawBikeways = require('../data/bikelanes-la.json');

// ── Sanitize LA311 potholes ───────────────────────────────────────────────────
// geometry is null in the source; real coords are string properties.
function sanitizePotholes(raw: unknown): GeoJSON.FeatureCollection {
  const rawFc = raw as { features?: unknown[] };
  let dropped = 0;
  const features: GeoJSON.Feature[] = [];

  for (const f of rawFc?.features ?? []) {
    const feat = f as { properties?: Record<string, unknown> };
    const p = feat.properties ?? {};

    if (p['type'] !== 'Street Pavement Issues') { dropped++; continue; }

    const lat = parseFloat(p['geolocation__latitude__s'] as string);
    const lng = parseFloat(p['geolocation__longitude__s'] as string);
    if (!isFinite(lat) || !isFinite(lng)) { dropped++; continue; }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) { dropped++; continue; }

    const cd = p['createddate'] as string | undefined;
    if (!cd || isNaN(Date.parse(cd))) { dropped++; continue; }

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        casenumber: (p['casenumber'] as string) ?? '',
        status: (p['status'] as string) ?? '',
        createddate: cd,
        address: (p['locator_gis_returned_address'] as string | undefined) ?? undefined,
      } satisfies Pothole,
    });
  }

  console.log(`[potholes] ${features.length} valid, ${dropped} dropped`);
  return { type: 'FeatureCollection', features };
}

export const potholes: GeoJSON.FeatureCollection = sanitizePotholes(rawPotholes);
export const bikeways: GeoJSON.FeatureCollection = rawBikeways as GeoJSON.FeatureCollection;
export const seedRoutes: GeoJSON.FeatureCollection = rawSeedRoutes as GeoJSON.FeatureCollection;
