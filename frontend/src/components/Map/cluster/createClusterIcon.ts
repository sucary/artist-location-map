import L from 'leaflet';
import { CLUSTER_CONFIG } from './clusterConstants';

// Generates the visual cluster icons.

interface ClusterIconOptions {
  map: L.Map;
}


const calculateGeometricBounds = (markers: L.Marker[]) => {
  let minLat = Infinity,
    maxLat = -Infinity;
  let minLng = Infinity,
    maxLng = -Infinity;

  markers.forEach((marker) => {
    const pos = marker.getLatLng();
    minLat = Math.min(minLat, pos.lat);
    maxLat = Math.max(maxLat, pos.lat);
    minLng = Math.min(minLng, pos.lng);
    maxLng = Math.max(maxLng, pos.lng);
  });

  return {
    center: L.latLng((minLat + maxLat) / 2, (minLng + maxLng) / 2),
    bounds: { minLat, maxLat, minLng, maxLng },
  };
};

const generateHueFromCoordinates = (latLng: L.LatLng): number => {
  return Math.abs((latLng.lat * 100 + latLng.lng * 100) % 360);
};

export const createClusterIconFactory = ({ map }: ClusterIconOptions) => {
  return (cluster: L.MarkerCluster): L.DivIcon => {
    const count = cluster.getChildCount();
    const childMarkers = cluster.getAllChildMarkers() as L.Marker[];

    const weightedLatLng = cluster.getLatLng();
    const weightedPixel = map.latLngToLayerPoint(weightedLatLng);

    const { center: geometricLatLng } = calculateGeometricBounds(childMarkers);
    const geometricPixel = map.latLngToLayerPoint(geometricLatLng);

    // Calculate size: max distance from geometric center to any marker
    let maxDistance = 0;
    childMarkers.forEach((marker) => {
      const markerPixel = map.latLngToLayerPoint(marker.getLatLng());
      const distance = geometricPixel.distanceTo(markerPixel);
      maxDistance = Math.max(maxDistance, distance);
    });

    const size = Math.min(
      CLUSTER_CONFIG.maxClusterSize,
      Math.max(CLUSTER_CONFIG.minClusterSize, maxDistance * 2 + 20)
    );

    // Offset: shift towards geometric center using CSS transform
    let offsetX = geometricPixel.x - weightedPixel.x;
    let offsetY = geometricPixel.y - weightedPixel.y;

    // Clamp to prevent wild shifts (max based on size)
    const maxOffset = size * CLUSTER_CONFIG.maxOffsetRatio;
    offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
    offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));

    // Color using geometric center as seed
    const hue = generateHueFromCoordinates(geometricLatLng);
    const color = `hsla(${hue}, 70%, 50%, 0.4)`;
    const borderColor = `hsla(${hue}, 70%, 40%, 0.6)`;

    const fontSize = Math.max(12, Math.min(28, size / 5));

    return L.divIcon({
      html: `<div class="flex items-center justify-center rounded-full font-bold border-2 shadow-lg cursor-pointer text-white" style="width: ${size}px; height: ${size}px; background: ${color}; border-color: ${borderColor}; font-size: ${fontSize}px; transform: translate(${offsetX}px, ${offsetY}px);">${count}</div>`,
      className: 'custom-cluster-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };
};
