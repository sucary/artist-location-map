import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import { getArtists } from '../../services/api';
import type { Artist } from '../../types/artist';
import { getExplodedCoordinates } from '../../utils/mapUtils';
import LocateControl from './LocateMeButton';
import ArtistCluster from './ArtistCluster';

const MapView = () => {
    const defaultCenter: LatLngExpression = [35.6762, 139.6503]; // Tokyo
    const defaultZoom = 4;
    const [artists, setArtists] = useState<Artist[]>([]);
    const [currentZoom, setCurrentZoom] = useState(defaultZoom);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const data = await getArtists();
                setArtists(data);
            } catch (error) {
                console.error('Error fetching artists:', error);
            }
        };

        fetchArtists();
    }, []);

    const explodedArtists = useMemo(() => getExplodedCoordinates(artists, currentZoom), [artists, currentZoom]);

    return (
        <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="h-full w-full"
            zoomControl={false}
        >
            <ZoomHandler onZoomChange={setCurrentZoom} />
            <ZoomControl position="bottomright" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocateControl />
            <ArtistCluster artists={explodedArtists} />
        </MapContainer>
    );
};

// Helper component to listen to zoom events
const ZoomHandler = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
    const map = useMap();
    
    useEffect(() => {
        const handler = () => {
            onZoomChange(map.getZoom());
        };
        
        map.on('zoomend', handler);
        return () => {
            map.off('zoomend', handler);
        };
    }, [map, onZoomChange]);
    
    return null;
};

export default MapView;