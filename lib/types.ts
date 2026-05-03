export type BikewayClass = 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4';

export type BikewayProperties = {
  BIKEWAY_TYPE: BikewayClass;
};

export type Pothole = {
  casenumber: string;
  status: string;
  createddate: string;
  address?: string;
};

export type GeocodeSuggestion = {
  id: string;
  name: string;
  placeName: string;
  center: [number, number]; // [lng, lat]
};

export type RouteScore = {
  score: number;             // 0–100
  bikeLaneCoverage: number;  // 0–1
  potholesNearRoute: number; // count
  detourMi: number;          // extra miles vs direct
};

export type RouteResult = {
  destination: string;
  destCoords: [number, number]; // [lng, lat]
  geometry: GeoJSON.LineString;
  distanceMi: number;
  durationMin: number;
  score: RouteScore;
  source: 'seeded' | 'generated';
};

export type RouteResponse =
  | { ok: true; result: RouteResult }
  | { ok: false; reason: 'already_here' | 'too_far' | 'no_route' | 'hard_reject' | 'no_network' | 'api_error'; message: string };

export type Route = {
  id: string;
  name: string;
  created_by: string;
  length_mi: number;
  rating: number;
  beginner_friendly: boolean;
  tags: string[];
  active_riders: number;
  image: string;
  start_label: string;
  start_location: string;
  end_location: string;
  distance_label: string;
  attendee_count: number;
  attendee_avatars: string[];
  is_active: boolean;
};
