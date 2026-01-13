import L from 'leaflet';
import type { Artist } from '../types/artist';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Initialize default marker icon
const DefaultMarker = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultMarker;

// Turn an artist profile into a Leaflet div icon
export const createArtistMarker = (artist: Artist) => {
  const imageUrl = artist.profilePicture || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=150&h=150';
  const iconHtml = `
    <div class="relative w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gray-200 group">
      <img 
        src="${imageUrl}" 
        class="w-full h-full object-cover"
        alt="${artist.name}"
      />
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-artist-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

export const getExplodedCoordinates = (artists: Artist[], zoomLevel: number = 13) => {
    // Explode overlapping coordinates based on zoom level
    // formula: baseOffset / (2 ^ (currentZoom - baseZoom))
    
    const baseZoom = 13;
    const baseOffset = 0.0002;
    const scaleFactor = Math.pow(2, zoomLevel - baseZoom);
    const offset = baseOffset / scaleFactor;

    const grouped: Record<string, Artist[]> = {};
  
    // Group artists by exact location
    artists.forEach(a => {
      const key = `${a.activeLocation.coordinates.lat},${a.activeLocation.coordinates.lng}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
    });
  
    // Apply offsets
    return Object.values(grouped).flatMap(group => {
      if (group.length === 1) return group;
  
      return group.map((artist, index) => {
        const angle = (index / group.length) * 2 * Math.PI;
        return {
          ...artist,
          activeLocation: {
            ...artist.activeLocation,
            coordinates: {
              lat: artist.activeLocation.coordinates.lat + Math.cos(angle) * offset,
              lng: artist.activeLocation.coordinates.lng + Math.sin(angle) * offset,
            }
          }
        };
      });
    });
  };