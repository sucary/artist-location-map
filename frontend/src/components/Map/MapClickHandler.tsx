import { useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { reverseGeocode, type SearchResult } from '../../services/api';

interface MapClickHandlerProps {
    onLocationPick: ((result: SearchResult | null) => void) | null;
}

const MapClickHandler = ({ onLocationPick }: MapClickHandlerProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const map = useMap();

    // Add/remove class to map container for cursor styling
    useEffect(() => {
        const container = map.getContainer();
        container.classList.add('location-selection-mode');

        return () => {
            container.classList.remove('location-selection-mode');
        };
    }, [map]);

    useMapEvents({
        click: async (e) => {
            if (isLoading) return; // Prevent rapid clicks

            // Check if the click originated from a Leaflet control or button
            const target = (e.originalEvent as any)?.target;
            if (target) {
                // Check if click was on a control or its children
                const isControl = target.closest('.leaflet-control') ||
                                 target.closest('.leaflet-bar') ||
                                 target.closest('button') ||
                                 target.closest('a.leaflet-control');

                if (isControl) {
                    return; // Ignore clicks on controls
                }
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await reverseGeocode(e.latlng.lat, e.latlng.lng, true);
                // Override center with the exact clicked coordinates for manual selection
                if (result && onLocationPick) {
                    result.center = { lat: e.latlng.lat, lng: e.latlng.lng };
                    onLocationPick(result);
                }
            } catch (err: any) {
                const status = err.response?.status;
                const message = status === 404
                    ? 'Unable to find a city at this location. Try clicking on land.'
                    : status === 429
                    ? 'Too many requests. Please wait a moment.'
                    : 'Failed to geocode location. Please try again.';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        }
    });

    return (
        <>
            {/* Top banner with instructions */}
            <div className="absolute top-0 left-0 right-0 z-[999] bg-[#FA2D48] text-white px-4 py-3 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm font-medium">
                            Click anywhere on the map to select a location
                        </p>
                    </div>
                    <button
                        onClick={() => onLocationPick?.(null)}
                        className="px-4 py-1.5 text-sm bg-white text-[#FA2D48] hover:bg-gray-100 rounded-md font-medium transition-colors"
                        style={{ cursor: 'default' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Subtle map overlay */}
            <div className="absolute inset-0 bg-black/5 z-[998] pointer-events-none" />

            {/* Loading spinner */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/20 z-[1000] flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin h-6 w-6 border-3 border-[#FA2D48] border-t-transparent rounded-full" />
                            <p className="text-sm font-medium text-gray-700">Finding location...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error toast */}
            {error && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1001] bg-red-50 border-2 border-red-200 rounded-lg p-4 shadow-xl max-w-md animate-slide-down">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                                style={{ cursor: 'default' }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for crosshair cursor and animations */}
            <style>{`
                /* Apply crosshair to entire map in selection mode */
                .leaflet-container.location-selection-mode,
                .leaflet-container.location-selection-mode .leaflet-pane,
                .leaflet-container.location-selection-mode .leaflet-tile-pane,
                .leaflet-container.location-selection-mode .leaflet-overlay-pane,
                .leaflet-container.location-selection-mode .leaflet-marker-pane,
                .leaflet-container.location-selection-mode .leaflet-tile,
                .leaflet-container.location-selection-mode .leaflet-map-pane,
                .leaflet-container.location-selection-mode .leaflet-proxy,
                .leaflet-container.location-selection-mode .leaflet-grab,
                .leaflet-container.location-selection-mode .leaflet-interactive {
                    cursor: crosshair !important;
                }
                /* Override for buttons - must come after and use higher specificity */
                .location-selection-mode button,
                .leaflet-container.location-selection-mode button,
                .leaflet-container.location-selection-mode .leaflet-control button,
                .leaflet-container.location-selection-mode .leaflet-control a,
                .leaflet-container.location-selection-mode .leaflet-bar a {
                    cursor: default !important;
                }
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default MapClickHandler;
