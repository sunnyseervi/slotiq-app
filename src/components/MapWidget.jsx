import React, { useMemo } from 'react'
import { GoogleMap, useLoadScript, OverlayView } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%'
}

// Minimal Map Style to look modern and clean
const mapStyle = [
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  }
]

export default function MapWidget({ locations = [], center = [12.9352, 77.6245], onMarkerClick }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBTpZwa5puATRDd76l9jla0cY6FCmBMtEE'
  })

  // Format center (handle array format if passed from old leaflet implementation)
  const centerPos = Array.isArray(center) ? { lat: center[0], lng: center[1] } : center

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: false,
    clickableIcons: false,
    styles: mapStyle
  }), [])

  if (!isLoaded) return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center animate-pulse">
      <span className="text-xs text-gray-500 font-extrabold uppercase tracking-widest">Loading Maps...</span>
    </div>
  )

  return (
    <div className="w-full h-full relative z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centerPos}
        zoom={13}
        options={mapOptions}
      >
        {locations.map((loc, i) => (
          loc.lat && loc.lng ? (
            <OverlayView
              key={i}
              position={{ lat: loc.lat, lng: loc.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div 
                className="cursor-pointer transition-transform hover:scale-110 active:scale-95 flex flex-col items-center"
                style={{
                  transform: 'translate(-50%, -100%)', // Anchor to bottom center
                }}
                onClick={() => onMarkerClick && onMarkerClick(loc.id)}
              >
                <div 
                  className="bg-primary text-white font-black px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center justify-center relative z-10"
                  style={{ fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  ₹{loc.price}
                </div>
                {/* SVG Pin Point */}
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="-mt-[2px] drop-shadow-md relative z-0">
                  <path d="M0 0L7 8L14 0H0Z" fill="white" />
                  <path d="M3 0L7 5L11 0H3Z" fill="#F5620F" />
                </svg>
              </div>
            </OverlayView>
          ) : null
        ))}
      </GoogleMap>
    </div>
  )
}
