import { useState, useEffect } from 'react';
import './App.css';
import { checkHealth, type SearchResult } from './services/api';
import MapView from './components/Map/MapView';
import ArtistForm from './components/ArtistForm';
import AddArtistButton from './components/Map/buttons/AddArtistButton';
import type { SelectionMode } from './types/artist';

function App() {
    const [status, setStatus] = useState<string>('Checking connection...');
    const [showForm, setShowForm] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode | null>(null);
    const [pendingLocationResult, setPendingLocationResult] = useState<SearchResult | null | undefined>(undefined);

    useEffect(() => {
        let mounted = true;

        const verifyConnection = async () => {
            try {
                const data = await checkHealth();
                if (mounted) 
                    {setStatus(data.message);
                }
            } catch (error) {
                if (mounted) {
                    setStatus('Connection failed. Is the backend running?');
                    console.error(error);
                }
            }
        };

        verifyConnection();

        return () => {
            mounted = false;
        };
    }, []);

    const handleStartSelection = (targetField: 'originalLocation' | 'activeLocation') => {
        setSelectionMode({ active: true, targetField });
    };

    const handleLocationPick = (result: SearchResult | null) => {
        setPendingLocationResult(result);
        setSelectionMode(null);
    };

    const handleConsumeResult = () => {
        setPendingLocationResult(undefined);
    };

    /*
        TODO
            - Make shadowing consistent (shadow-xl/30 vs shadow-md)
            - Add a proper locate icon instead of "X"


    */

    return (
        <div className="h-screen w-screen flex flex-col">
            <div className="absolute top-2 left-2 z-[1000] bg-white p-2 rounded-md shadow-md">
                <div className="text-xs">
                    Backend: <span className={`font-bold ${status.includes('running') ? 'text-green-600' : 'text-red-600'}`}>
                        {status}
                    </span>
                </div>
            </div>
            {!showForm && <AddArtistButton onClick={() => setShowForm(true)} />}
            {showForm && (
                <ArtistForm
                    onCancel={() => {
                        setShowForm(false);
                        setSelectionMode(null);
                    }}
                    onRequestSelection={handleStartSelection}
                    pendingLocationResult={pendingLocationResult}
                    onConsumePendingResult={handleConsumeResult}
                />
            )}
            <MapView
                selectionMode={selectionMode}
                onLocationPick={handleLocationPick}
            />
        </div>
    );
};

export default App;
