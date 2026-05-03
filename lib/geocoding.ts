import type { GeocodeSuggestion } from './types';

const KITCHEN_LNG = -118.2871;
const KITCHEN_LAT = 34.0928;
// Bounding box roughly covering LA County [W, S, E, N]
const LA_BBOX = '-118.944,33.703,-117.646,34.823';

export async function geocodeQuery(
  query: string,
  token: string,
  signal?: AbortSignal,
): Promise<GeocodeSuggestion[]> {
  if (!query.trim()) return [];
  const encoded = encodeURIComponent(query.trim());
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
    `?proximity=${KITCHEN_LNG},${KITCHEN_LAT}` +
    `&bbox=${LA_BBOX}` +
    `&country=us` +
    `&types=address,poi,neighborhood,place` +
    `&limit=5` +
    `&access_token=${token}`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
  const data = (await res.json()) as { features?: Record<string, unknown>[] };

  return (data.features ?? []).map(f => ({
    id: f.id as string,
    name: f.text as string,
    placeName: f.place_name as string,
    center: f.center as [number, number],
  }));
}

export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  ms: number,
): (...args: T) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
