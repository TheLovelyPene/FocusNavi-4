import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with Webpack/Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapComponent() {
    const position: [number, number] = [51.505, -0.09]; // Default to London

    return (
        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '12px', marginTop: '20px' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    FocusNavi v4 <br /> Open Source Maps.
                </Popup>
            </Marker>
        </MapContainer>
    );
}
