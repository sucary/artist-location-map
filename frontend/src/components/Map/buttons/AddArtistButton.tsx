import { PlusIcon } from '../../Icons/FormIcons';

interface AddArtistButtonProps {
    onClick: () => void;
}

const AddArtistButton = ({ onClick }: AddArtistButtonProps) => {
    return (
        <div className="absolute top-28 right-2 z-[1000]">
            <button
                onClick={onClick}
                className="bg-white p-3 rounded-full shadow-xl hover:bg-gray-100 transition-colors text-gray-700"
                title="Add New Artist"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default AddArtistButton;