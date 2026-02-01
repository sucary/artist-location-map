import L from 'leaflet';
import { CLUSTER_CONFIG } from './clusterConstants';



export interface GridLayoutResult {
  positions: L.Point[];
  collapseOffset: L.Point;
}

/*
  * Generates grid layout positions for a given count of artists.
  */
export const generateGridPositions = (
  count: number,
  spacing: number = CLUSTER_CONFIG.gridSpacing
): GridLayoutResult => {
  const positions: L.Point[] = [];

  if (count === 0) {
    return { positions, collapseOffset: L.point(0, 30) };
  }

  if (count === 1) {
    positions.push(L.point(0, 0));
    return { positions, collapseOffset: L.point(0, 30) };
  }

  // Two artists: horizontal layout
  if (count === 2) {
    positions.push(L.point(-spacing / 2, 0));
    positions.push(L.point(spacing / 2, 0));
    return { positions, collapseOffset: L.point(0, spacing) };
  }

  // More than two: concentric rings
  let placed = 0;
  let maxRadius = 0;

  positions.push(L.point(0, 0));
  placed++;

  // Fill concentric rings
  let ring = 1;
  while (placed < count) {
    const radius = ring * spacing;
    const circumference = 2 * Math.PI * radius;
    const itemsInRing = Math.min(count - placed, Math.max(1, Math.floor(circumference / spacing)));

    const angleStep = (2 * Math.PI) / itemsInRing;
    // Offset each ring slightly for visual
    const ringOffset = (ring % 2) * (angleStep / 2);

    for (let i = 0; i < itemsInRing && placed < count; i++) {
      const angle = i * angleStep + ringOffset - Math.PI / 2;
      positions.push(L.point(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      ));
      placed++;
    }

    maxRadius = radius;
    ring++;
  }

  const collapseOffset = L.point(0, maxRadius + spacing);

  return { positions, collapseOffset };
};

/**
 * Groups markers by city key, keeping same-city artists together.
 */
export const groupMarkersByCity = <T extends L.Marker>(
  markers: T[],
  getArtistData: (marker: T) => { activeLocation?: { city?: string }; originalLocation?: { city?: string } } | undefined
): T[] => {
  const markersByCity = new Map<string, T[]>();

  markers.forEach((marker) => {
    const artistData = getArtistData(marker);
    const cityKey =
      artistData?.activeLocation?.city ||
      artistData?.originalLocation?.city ||
      'Unknown';

    if (!markersByCity.has(cityKey)) {
      markersByCity.set(cityKey, []);
    }
    markersByCity.get(cityKey)!.push(marker);
  });

  // Flatten markers, keeping same-city artists together
  const sortedMarkers: T[] = [];
  markersByCity.forEach((cityMarkers) => {
    sortedMarkers.push(...cityMarkers);
  });

  return sortedMarkers;
};
