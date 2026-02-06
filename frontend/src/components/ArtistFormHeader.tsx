import { useState } from 'react';
import { EditIcon } from './Icons/FormIcons';
import { MAX_NAME_LENGTH } from '../constants/artist';

type HoverTarget = 'name' | 'avatar' | null;

interface ArtistFormHeaderProps {
    name: string;
    avatarUrl?: string;
    profileUrl?: string;
    isUploading: boolean;
    onAvatarClick: () => void;
    onProfileClick: () => void;
    onNameChange: (name: string) => void;
}

const ArtistFormHeader = ({
    name,
    avatarUrl,
    profileUrl,
    isUploading,
    onAvatarClick,
    onProfileClick,
    onNameChange,
}: ArtistFormHeaderProps) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [hoverTarget, setHoverTarget] = useState<HoverTarget>(null);

    const displayName = name.length > MAX_NAME_LENGTH
        ? `${name.substring(0, MAX_NAME_LENGTH)}...`
        : name;

    const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'New Artist')}&size=150&background=e5e7eb&color=9ca3af`;

    return (
        <div
            className="relative w-full h-32 bg-gray-200 bg-cover bg-center group/profile cursor-pointer"
            style={{ backgroundImage: profileUrl ? `url(${profileUrl})` : undefined }}
            onClick={onProfileClick}
        >
            {/* Hover overlay */}
            <div className={`absolute inset-0 bg-black/10 transition-colors flex items-center justify-center ${!hoverTarget ? 'group-hover/profile:bg-black/30' : ''}`}>
                <EditIcon className={`w-6 h-6 text-white transition-opacity ${!hoverTarget ? 'opacity-0 group-hover/profile:opacity-100' : 'opacity-0'}`} />
            </div>

            {/* Avatar */}
            <div
                className="absolute -bottom-8 left-4 w-20 h-20 rounded-full border-4 border-white bg-gray-300 overflow-hidden z-10 shadow-md group/avatar cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onAvatarClick(); }}
                onMouseEnter={() => setHoverTarget('avatar')}
                onMouseLeave={() => setHoverTarget(null)}
            >
                {isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <>
                        <img
                            src={avatarUrl || placeholderUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <EditIcon className="w-6 h-6 text-white" />
                        </div>
                    </>
                )}
            </div>

            {/* Name */}
            <div
                className="absolute bottom-2 left-28 right-4 z-10"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoverTarget('name')}
                onMouseLeave={() => setHoverTarget(null)}
            >
                {isEditingName ? (
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                        className="w-full bg-transparent border-b-2 border-white/80 text-lg font-bold text-white outline-none placeholder-white/50 text-shadow-overlay p-0 m-0 leading-tight"
                        autoFocus
                        maxLength={MAX_NAME_LENGTH}
                    />
                ) : (
                    <h2
                        onClick={() => setIsEditingName(true)}
                        className="text-lg font-bold text-white text-shadow-overlay hover:text-gray-100 whitespace-nowrap overflow-hidden p-0 m-0 leading-tight border-b-2 border-transparent cursor-pointer"
                        title={name}
                    >
                        {displayName}
                    </h2>
                )}
            </div>
        </div>
    );
};

export default ArtistFormHeader;
