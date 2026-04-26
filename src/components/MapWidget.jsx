import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icons for Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Simple Leaflet map widget for displaying locations
export default function MapWidget({ locations = [], center = [12.9352, 77.6245] }) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full rounded-2xl shadow-card"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, i) => (
          loc.lat && loc.lng ? (
            <Marker key={i} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="font-extrabold text-gray-900">{loc.name}</div>
                <div className="text-xs text-muted">{loc.address}</div>
                <div className="text-sm font-bold text-primary mt-1">₹{loc.price}/hr</div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  )
}
