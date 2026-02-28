import L from 'leaflet';
import { CLUSTER_CONFIG } from './clusterConstants';



export interface GridLayoutResult {
  positions: L.Point[];
  collapseOffset: L.Point;
}

/**
 * Generate positions that preserve the geographic layout of markers
 * relative to their cluster center, scaled to fit a readable pixel radius.
 */
export const generateGeoPositions = (
  markers: L.Marker[],
  clusterCenter: L.LatLng,
  map: L.Map,
  minSpacing: number = CLUSTER_CONFIG.gridSpacing
): GridLayoutResult => {
  if (markers.length === 0) {
    return { positions: [], collapseOffset: L.point(0, 30) };
  }

  if (markers.length === 1) {
    return { positions: [L.point(0, 0)], collapseOffset: L.point(0, 30) };
  }

  const centerPixel = map.latLngToLayerPoint(clusterCenter);

  // Get each marker's pixel offset from the cluster center
  const rawOffsets = markers.map((marker) => {
    const markerPixel = map.latLngToLayerPoint(marker.getLatLng());
    return L.point(markerPixel.x - centerPixel.x, markerPixel.y - centerPixel.y);
  });

  // Find the max distance from center
  const maxDist = Math.max(...rawOffsets.map((p) => Math.sqrt(p.x * p.x + p.y * p.y)), 1);
  
  const targetRadius = Math.max(minSpacing * 1.5, markers.length * minSpacing * 0.4);
  const scale = targetRadius / maxDist;

  // Scale the offsets
  const positions = rawOffsets.map((offset) => L.point(offset.x * scale, offset.y * scale));

  // Enforce minimum spacing too avoid markers overlap
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[j].x - positions[i].x;
      const dy = positions[j].y - positions[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minSpacing && dist > 0) {
        const nudge = (minSpacing - dist) / 2;
        const nx = (dx / dist) * nudge;
        const ny = (dy / dist) * nudge;
        positions[j] = L.point(positions[j].x + nx, positions[j].y + ny);
        positions[i] = L.point(positions[i].x - nx, positions[i].y - ny);
      }
    }
  }

  const finalMaxDist = Math.max(...positions.map((p) => Math.sqrt(p.x * p.x + p.y * p.y)));

  return { positions, collapseOffset: L.point(0, finalMaxDist + minSpacing) };
};
