import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import './App.css';
import { deleteArtist, type SearchResult } from './services/api';
import MapView from './components/Map/MapView';
import ArtistForm from './components/ArtistForm';
import AddArtistButton from './components/Map/buttons/AddArtistButton';
import { AccountButton } from './components/Auth/AccountButton';
import { ApprovalPending } from './components/Auth/ApprovalPending';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { BackendStatus } from './components/BackendStatus';
import { useAuth } from './context/AuthContext';
import type { Artist, SelectionMode } from './types/artist';

function App() {
    const queryClient = useQueryClient();
    const { user, profile } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminDashboard, setShowAdminDashboard] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
    const [selectionMode, setSelectionMode] = useState<SelectionMode | null>(null);
    const [pendingLocationResult, setPendingLocationResult] = useState<SearchResult | null | undefined>(undefined);

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

    const handleEditArtist = (artist: Artist) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        setEditingArtist(artist);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingArtist(null);
        setSelectionMode(null);
    };

    const handleDeleteArtist = async (artist: Artist) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!window.confirm(`Delete "${artist.name}"?`)) {
            return;
        }

        try {
            await deleteArtist(artist.id);
            await queryClient.invalidateQueries({ queryKey: ['artists'] });
        } catch (error) {
            console.error('Failed to delete artist:', error);
            alert('Failed to delete artist. Please try again.');
        }
    };

    const handleAddArtistClick = () => {
        if (!user) {
            setShowAuthModal(true);
        } else {
            setShowForm(true);
        }
    };

    /*
        TODO
            - Make shadowing consistent (shadow-xl/30 vs shadow-md)
            - Add a proper locate icon instead of "X"


    */

    return (
        <div className="h-screen w-screen flex flex-col">
            <BackendStatus />

            <AccountButton
                showAuthModal={showAuthModal}
                onOpenAuthModal={() => setShowAuthModal(true)}
                onCloseAuthModal={() => setShowAuthModal(false)}
                onOpenAdminDashboard={() => setShowAdminDashboard(true)}
            />

            {user && profile && !profile.isApproved && <ApprovalPending />}

            {!showForm && user && profile?.isApproved && (
                <AddArtistButton onClick={handleAddArtistClick} />
            )}
            {showForm && (
                <ArtistForm
                    key={editingArtist?.id ?? 'new'}
                    initialData={editingArtist ?? undefined}
                    onCancel={handleCloseForm}
                    onRequestSelection={handleStartSelection}
                    pendingLocationResult={pendingLocationResult}
                    onConsumePendingResult={handleConsumeResult}
                />
            )}
            {showAdminDashboard && (
                <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
            )}
            <MapView
                selectionMode={selectionMode}
                onLocationPick={handleLocationPick}
                onEditArtist={handleEditArtist}
                onDeleteArtist={handleDeleteArtist}
                onEmptyClick={showForm ? handleCloseForm : undefined}
            />
        </div>
    );
};

export default App;
