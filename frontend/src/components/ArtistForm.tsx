import { useState } from 'react';
import { ChevronDownIcon, ArrowDownIcon, EditIcon } from './Icons/FormIcons';
import { HomeIcon, MusicIcon, YoutubeIcon, InstagramIcon, XIcon } from './Icons/SocialIcons';
import { LocationSearch } from './LocationSearch';
import { createArtist, updateArtist } from '../services/api';
import type { SearchResult } from '../services/api';
import type { Artist } from '../types/artist';

interface ArtistFormProps {
    initialData?: Artist;
    onSubmit?: (data: Partial<Artist>) => void;
    onCancel?: () => void;
}

const extractLocationData = (result: SearchResult) => {
    const coordinates = result.center || { lat: result.lat, lng: result.lng };
    const address = (result as any).address || {};
    let city = result.name || address.city || address.locality || address.town || address.village || '';
    let province = result.province || address.province || address.state || '';
    const country = result.country || address.country || '';

    // If province is empty or is an ISO code (like JP-13), extract from displayName
    if (!province || province.match(/^[A-Z]{2}-\d+$/)) {
        const parts = result.displayName.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            for (let i = parts.length - 2; i >= 0; i--) {
                const part = parts[i];
                if (!part.match(/^\d/) && !part.match(/\d{3,}/)) {
                    province = part;
                    break;
                }
            }
            if (!province) {
                province = parts[parts.length - 2];
            }
        }
    }
    if (!city && province) city = province;
    if (city && !province) province = city;

    return {
        city,
        province,
        country,
        coordinates,
        displayName: result.displayName,
        osmId: result.osmId,
        osmType: result.osmType
    };
};

const ArtistForm = ({ initialData, onSubmit, onCancel }: ArtistFormProps) => {
    const [isSocialExpanded, setIsSocialExpanded] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Artist>>(initialData || {
        name: 'New Artist',
        profilePicture: '',
        originalLocation: { city: '', province: '', coordinates: { lat: 0, lng: 0 } },
        activeLocation: { city: '', province: '', coordinates: { lat: 0, lng: 0 } },
        socialLinks: {}
    });

    const copyOriginalToActive = () => {
        setFormData(prev => ({
            ...prev,
            activeLocation: prev.originalLocation
        }));
    };

    const handleLocationSelect = (result: SearchResult, locationType: 'originalLocation' | 'activeLocation') => {
        console.log(`${locationType} selected:`, result);
        setFormData(prev => ({
            ...prev,
            [locationType]: extractLocationData(result)
        }));
        setError(null);
    };

    const getIconColor = (value?: string) => {
        return value ? "text-[#FA2D48]" : "text-gray-400";
    };

    const validateForm = (): string | null => {
        if (!formData.name || formData.name.trim() === '' || formData.name === 'New Artist') {
            return 'Artist name is required';
        }

        // Validate original location
        if (!formData.originalLocation?.coordinates ||
            (formData.originalLocation.coordinates.lat === 0 && formData.originalLocation.coordinates.lng === 0)) {
            return 'Original location is required';
        }

        // Validate active location
        if (!formData.activeLocation?.coordinates ||
            (formData.activeLocation.coordinates.lat === 0 && formData.activeLocation.coordinates.lng === 0)) {
            return 'Active location is required';
        }

        return null;
    };

    const handleSave = async () => {
        setError(null);

        console.log('Form data before validation:', formData);

        const validationError = validateForm();
        if (validationError) {
            console.log('Validation failed:', validationError);
            setError(validationError);
            return;
        }

        setIsSaving(true);

        try {
            console.log('Sending data to API:', formData);
            let savedArtist: Artist;

            if (initialData?.id) {
                savedArtist = await updateArtist(initialData.id, formData);
            } else {
                savedArtist = await createArtist(formData);
            }

            console.log('Artist saved successfully:', savedArtist);

            if (onSubmit) {
                onSubmit(savedArtist);
            }

            if (onCancel) {
                onCancel();
            }
        } catch (err: any) {
            console.error('Error saving artist:', err);
            let errorMessage = 'Failed to save artist. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="absolute top-28 right-4 z-[1000] w-80 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-8rem)] font-sans">
            <div className="overflow-y-auto flex-1">
                {/* Header */}
                <div className="relative w-full h-32 bg-gray-200 bg-cover bg-center"
                     style={{ backgroundImage: formData.profilePicture ? `url(${formData.profilePicture})` : undefined }}
                >
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                    
                    {/* Avatar */}
                    <div className="absolute -bottom-8 left-4 w-20 h-20 rounded-full border-4 border-white bg-gray-300 overflow-hidden z-10 shadow-md group/avatar cursor-pointer"
                    >
                         <img
                            src={formData.profilePicture || 'https://via.placeholder.com/150'}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <EditIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="absolute bottom-2 left-28 right-4 z-10">
                        {isEditingName ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                onBlur={() => setIsEditingName(false)}
                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                className="w-full bg-transparent border-b-2 border-white/80 text-lg font-bold text-white outline-none placeholder-white/50 drop-shadow-md p-0 m-0 leading-tight"
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                                autoFocus
                                maxLength={22}
                            />
                        ) : (
                            <h2
                                onClick={() => setIsEditingName(true)}
                                className="text-lg font-bold text-white drop-shadow-md hover:text-gray-100 whitespace-nowrap overflow-hidden p-0 m-0 leading-tight border-b-2 border-transparent cursor-pointer"
                                title={formData.name}
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                            >
                                {formData.name && formData.name.length > 22 ? `${formData.name.substring(0, 22)}...` : formData.name}
                            </h2>
                        )}
                    </div>
                </div>

                {/* Spacing for avatar */}
                <div className="mt-10 px-4 flex flex-col gap-4">
                    
                    {/* Locations */}
                    <div className="space-y-4">
                        <LocationSearch
                            displayValue={formData.originalLocation?.displayName || (formData.originalLocation?.city && formData.originalLocation?.country ? `${formData.originalLocation.city}, ${formData.originalLocation.country}` : '')}
                            onChange={(result) => handleLocationSelect(result, 'originalLocation')}
                            onManualPin={() => {/* TODO: Enable map picking mode */}}
                            placeholder="Search original location"
                            label="ORIGINAL LOCATION"
                        />

                        <div className="flex justify-center -my-2 relative z-10">
                            <button
                                onClick={copyOriginalToActive}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-500 p-1.5 rounded-full transition-colors border border-gray-200 cursor-pointer"
                                title="Copy Original to Active"
                            >
                                <ArrowDownIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <LocationSearch
                            displayValue={formData.activeLocation?.displayName || (formData.activeLocation?.city && formData.activeLocation?.country ? `${formData.activeLocation.city}, ${formData.activeLocation.country}` : '')}
                            onChange={(result) => handleLocationSelect(result, 'activeLocation')}
                            onManualPin={() => {/* TODO: Enable map picking mode */}}
                            placeholder="Search active location"
                            label="ACTIVE LOCATION"
                        />
                    </div>

                    {/* Social Media */}
                    <div className="border-t border-gray-100 pt-0 mt-0">
                        <button
                            onClick={() => setIsSocialExpanded(!isSocialExpanded)}
                            className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-none px-4 -mx-4 transition-colors"
                            style={{ width: 'calc(100% + 2rem)' }}
                        >
                            <span className='font-semibold text-gray-700'>Social Media</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isSocialExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isSocialExpanded && (
                            <div className="mt-2 flex flex-col gap-3 px-0 animate-in slide-in-from-top-2 duration-200">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Website URL"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#FA2D48] focus:ring-1 focus:ring-inset focus:ring-[#FA2D48]"
                                        value={formData.socialLinks?.website || ''}
                                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, website: e.target.value}})}
                                    />
                                    <HomeIcon className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${getIconColor(formData.socialLinks?.website)}`} />
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Instagram URL"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#FA2D48] focus:ring-1 focus:ring-inset focus:ring-[#FA2D48]"
                                        value={formData.socialLinks?.instagram || ''}
                                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})}
                                    />
                                    <InstagramIcon className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${getIconColor(formData.socialLinks?.instagram)}`} />
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Twitter/X URL"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#FA2D48] focus:ring-1 focus:ring-inset focus:ring-[#FA2D48]"
                                        value={formData.socialLinks?.twitter || ''}
                                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
                                    />
                                    <XIcon className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${getIconColor(formData.socialLinks?.twitter)}`} />
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Apple Music URL"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#FA2D48] focus:ring-1 focus:ring-inset focus:ring-[#FA2D48]"
                                        value={formData.socialLinks?.appleMusic || ''}
                                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, appleMusic: e.target.value}})}
                                    />
                                    <MusicIcon className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${getIconColor(formData.socialLinks?.appleMusic)}`} />
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="YouTube URL"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#FA2D48] focus:ring-1 focus:ring-inset focus:ring-[#FA2D48]"
                                        value={formData.socialLinks?.youtube || ''}
                                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, youtube: e.target.value}})}
                                    />
                                    <YoutubeIcon className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${getIconColor(formData.socialLinks?.youtube)}`} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer*/}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                {error && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {error}
                    </div>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-[#FA2D48] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#FA2D48] border border-transparent rounded-md hover:bg-[#E11D38] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArtistForm;