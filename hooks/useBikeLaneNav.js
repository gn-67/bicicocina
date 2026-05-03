import { useState, useRef, useCallback } from 'react';
import * as turf from '@turf/turf';
import bikelanes from '../data/bikelanes-la.json';

const LANE_NAMES = { 1: 'protected bike path', 2: 'bike lane', 3: 'bike route', 4: 'cycle track' };
const BUFFER_DEG = 0.003; // ~300m bounding-box pre-filter
const ON_LANE_M = 20;
const APPROACHING_M = 300;
const COOLDOWN_MS = 20000;
const M_TO_FT = 3.28084;

// Pre-compute bboxes once at module load to avoid recalculating on every GPS update
const featureBboxes = bikelanes.features.map((f) => turf.bbox(f));

function distToFeatureM(feature, userPoint) {
  const { type, coordinates } = feature.geometry;
  if (type === 'LineString') {
    return turf.nearestPointOnLine(feature, userPoint, { units: 'meters' }).properties.dist;
  }
  if (type === 'MultiLineString') {
    let minDist = Infinity;
    for (const coords of coordinates) {
      const dist = turf.nearestPointOnLine(turf.lineString(coords), userPoint, { units: 'meters' }).properties.dist;
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  }
  return Infinity;
}

function findClosest(coords) {
  const { latitude: lat, longitude: lng } = coords;
  const userPoint = turf.point([lng, lat]);

  let closestDist = Infinity;
  let closestFeature = null;

  bikelanes.features.forEach((feature, i) => {
    const [minLng, minLat, maxLng, maxLat] = featureBboxes[i];
    // Bounding-box pre-filter: skip features outside the buffer
    if (lng < minLng - BUFFER_DEG || lng > maxLng + BUFFER_DEG ||
        lat < minLat - BUFFER_DEG || lat > maxLat + BUFFER_DEG) {
      return;
    }
    const dist = distToFeatureM(feature, userPoint);
    if (dist < closestDist) {
      closestDist = dist;
      closestFeature = feature;
    }
  });

  return { dist: closestDist, feature: closestFeature };
}

export function useBikeLaneNav({ speak }) {
  const [bannerText, setBannerText] = useState(null);
  const [laneStatus, setLaneStatus] = useState('off_lane');
  const laneStatusRef = useRef('off_lane');
  const lastAnnouncedRef = useRef(0);

  const checkPosition = useCallback((coords) => {
    const { dist, feature } = findClosest(coords);

    let newStatus;
    if (dist <= ON_LANE_M) newStatus = 'on_lane';
    else if (dist <= APPROACHING_M) newStatus = 'approaching';
    else newStatus = 'off_lane';

    const prevStatus = laneStatusRef.current;
    const isTransition = newStatus !== prevStatus;
    const now = Date.now();
    const cooldownPassed = now - lastAnnouncedRef.current >= COOLDOWN_MS;
    const isOnLaneRepeat = newStatus === 'on_lane' && cooldownPassed;

    if (!isTransition && !isOnLaneRepeat) return;

    laneStatusRef.current = newStatus;
    setLaneStatus(newStatus);

    if (newStatus === 'on_lane' && cooldownPassed) {
      const laneName = LANE_NAMES[feature?.properties?.class] ?? 'bike lane';
      const rawName = feature?.properties?.name?.trim() ?? '';
      const displayName = rawName ? rawName : laneName;
      setBannerText(`On ${displayName}`);
      speak('Entering bike lane');
      lastAnnouncedRef.current = now;
    } else if (newStatus === 'approaching' && isTransition && cooldownPassed) {
      const feet = Math.round(dist * M_TO_FT);
      const msg = `Bike lane ahead in ${feet} feet`;
      setBannerText(msg);
      speak(msg);
      lastAnnouncedRef.current = now;
    } else if (newStatus === 'off_lane') {
      if (prevStatus === 'on_lane' && cooldownPassed) {
        speak('Bike lane ending. Stay alert.');
        lastAnnouncedRef.current = now;
      }
      setBannerText(null);
    }
  }, [speak]);

  const getStartMessage = useCallback((coords) => {
    const { dist } = findClosest(coords);
    if (dist <= ON_LANE_M) {
      return "Starting ride. You're on a bike lane.";
    }
    if (dist < Infinity) {
      const feet = Math.round(dist * M_TO_FT);
      return `Starting ride. Bike lane in ${feet} feet.`;
    }
    return 'Starting ride.';
  }, []);

  return { checkPosition, getStartMessage, bannerText, laneStatus };
}
