import type { SearchResult } from '../services/api';

export interface LocationSearchState {
    query: string | null;
    results: SearchResult[];
    isOpen: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    source: 'local' | 'nominatim' | 'cache';
    hasMore: boolean;
    clickedCoords: { lat: number; lng: number } | null;
}

export type LocationSearchAction =
    | { type: 'SET_QUERY'; query: string | null }
    | { type: 'SEARCH_START'; isMore: boolean }
    | { type: 'SEARCH_SUCCESS'; results: SearchResult[]; source: 'local' | 'nominatim' | 'cache'; hasMore: boolean }
    | { type: 'SEARCH_ERROR'; error: string }
    | { type: 'SEARCH_CANCEL' }
    | { type: 'SET_CLICKED_COORDS'; coords: { lat: number; lng: number } | null }
    | { type: 'OPEN_DROPDOWN' }
    | { type: 'CLOSE_DROPDOWN' }
    | { type: 'CLEAR_RESULTS' }
    | { type: 'RESET_QUERY' };

export const initialState: LocationSearchState = {
    query: null,
    results: [],
    isOpen: false,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    source: 'local',
    hasMore: false,
    clickedCoords: null,
};

export function locationSearchReducer(
    state: LocationSearchState,
    action: LocationSearchAction
): LocationSearchState {
    switch (action.type) {
        case 'SET_QUERY':
            return { ...state, query: action.query };

        case 'SEARCH_START':
            return {
                ...state,
                isLoading: !action.isMore,
                isLoadingMore: action.isMore,
                error: null,
            };

        case 'SEARCH_SUCCESS':
            return {
                ...state,
                results: action.results,
                source: action.source,
                hasMore: action.hasMore,
                isOpen: true,
                isLoading: false,
                isLoadingMore: false,
            };

        case 'SEARCH_ERROR':
            return {
                ...state,
                error: action.error,
                isLoading: false,
                isLoadingMore: false,
            };

        case 'SEARCH_CANCEL':
            return {
                ...state,
                isLoading: false,
                isLoadingMore: false,
            };

        case 'SET_CLICKED_COORDS':
            return { ...state, clickedCoords: action.coords };

        case 'OPEN_DROPDOWN':
            return { ...state, isOpen: true };

        case 'CLOSE_DROPDOWN':
            return { ...state, isOpen: false };

        case 'CLEAR_RESULTS':
            return { ...state, results: [], isOpen: false, error: null };

        case 'RESET_QUERY':
            return { ...state, query: null, isOpen: false, clickedCoords: null };

        default:
            return state;
    }
}
