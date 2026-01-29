import { useMap } from 'react-leaflet';

// The locate-me button

const LocateMeButton = () => {
    const map = useMap();

    const handleLocate = () => {
        map.locate({ setView: true, maxZoom: 15});
    };
    
    return (
    <div className="absolute bottom-25 right-2 z-[1000]">
        <button
            onClick={handleLocate}
            className="bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-xl/30 hover:bg-gray-100 transition-colors"
            style={{ cursor: 'default' }}
            title="Locate Me"
        >
            <div style={{ cursor: 'default' }}>X</div>
        </button>
    </div>
    );
}

export default LocateMeButton;