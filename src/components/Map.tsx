'use client';

import { FC, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSearchParams } from 'next/navigation';

// Import the marker icon and shadow images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Define the type for the user object
interface User {
    id: number;
    name: string;
    lat: number;
    long: number;
}

// Define the props for the Map component
interface MapProps {
    users: User[];
}

// Helper component to fit map bounds based on user locations
const MapView: FC<{ users: User[], center?: [number, number] }> = ({ users, center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, 13); // Center map on the provided lat/lng
        } else if (users.length > 0) {
            const bounds = L.latLngBounds(users.map(user => [user.lat, user.long]));
            map.fitBounds(bounds);
        }
    }, [map, users, center]);

    return null;
};

// Create a custom icon for the marker
const customIcon = L.icon({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
    iconSize: [25, 41], // size of the icon
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
    shadowSize: [41, 41] // size of the shadow
});

const MapComponent: FC<MapProps> = ({ users }) => {
    const [isClient, setIsClient] = useState(false);
    const searchParams = useSearchParams();

    // Get lat and lng from URL query parameters
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const center = !isNaN(lat) && !isNaN(lng) ? [lat, lng] as [number, number] : undefined;

    useEffect(() => {
        setIsClient(true); // Component is mounted on the client
    }, []);

    if (!isClient) return null; // Ensure no rendering happens on the server

    return (
        <MapContainer center={center || [51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {users.map((user) => (
                <Marker
                    key={user.id}
                    position={[user.lat, user.long]}
                    icon={customIcon} // Use custom icon here
                >
                    <Popup>
                        {user.name}&apos;s location<br />
                        Latitude: {user.lat}<br />
                        Longitude: {user.long}
                    </Popup>
                </Marker>
            ))}
            {/* If center is provided, add a marker for the URL-specified location */}
            {center && (
                <Marker position={center} icon={customIcon}>
                    <Popup>
                        Centered Location<br />
                        Latitude: {center[0]}<br />
                        Longitude: {center[1]}
                    </Popup>
                </Marker>
            )}
            <MapView users={users} center={center} />
        </MapContainer>
    );
};

export default MapComponent;
