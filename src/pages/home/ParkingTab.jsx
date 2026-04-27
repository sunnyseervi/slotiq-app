import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { MOCK_LISTINGS, VEHICLE_TYPES, FIXED_PRICING, formatInr } from '../../lib/mockData'
import MapWidget from '../../components/MapWidget'

const PASS_TYPES = [
  { id: 'hourly',  label: 'Hourly',  save: '', hint: '' },
  { id: 'daily',   label: 'Daily',   save: 'Daily Cap', hint: '' },
  { id: 'weekly',  label: 'Weekly',  save: 'Save 35%', hint: '' },
  { id: 'monthly', label: 'Monthly', save: 'Best Value', hint: '' },
]

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2-lat1) * (Math.PI/180)
  const dLon = (lon2-lon1) * (Math.PI/180)
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
  return Number((R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))).toFixed(1))
}

export default function ParkingTab() {
  const navigate = useNavigate()
  const { listings: storeListings, savedSpots, toggleSavedSpot, selectedArea, setLocation, ads } = useStore()
  const [passType,  setPassType]  = useState('hourly')
  const [query,     setQuery]     = useState('')
  const [showFilter, setShowFilter] = useState(false)
  
  // Filter state
  const [maxDist,  setMaxDist]  = useState(10)
  const [selectedVehicle, setSelectedVehicle] = useState('car')
  const [sortBy,   setSortBy]   = useState('Nearest')
  const [selectedAmenities, setSelectedAmenities] = useState([])

  const AVAILABLE_AMENITIES = ['CCTV', 'EV Charging', 'Security', 'Open Ground', 'Gated', 'Valet']

  // Geolocation
  const [userLocation, setUserLocation] = useState({ lat: 12.9352, lng: 77.6245 }) // Default to Koramangala
  const [isLocating, setIsLocating] = useState(true)

  useEffect(() => {
    if (selectedArea !== 'Current Location') {
      // If user manually selected an area, don't auto-locate and overwrite it.
      setIsLocating(false)
      return
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
          setIsLocating(false)
        },
        (error) => {
          console.warn('Geolocation failed or denied, using default:', error.message)
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      setIsLocating(false)
    }
  }, [])

  const listings = useMemo(() => {
    let all = storeListings.filter(l => l.type === 'parking' && (l.is_live || l.status === 'active')).map(l => {
      // Calculate dynamic distance based on actual user location (only if using GPS)
      if (l.lat && l.lng && userLocation && selectedArea === 'Current Location') {
        return { ...l, distance_km: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, l.lat, l.lng) }
      }
      return l
    })
    
    // Area Filter (Manual Selection from Top Bar)
    if (selectedArea && selectedArea !== 'Current Location') {
      all = all.filter(l => l.area === selectedArea)
    }

    // Search
    if (query) {
      const q = query.toLowerCase()
      all = all.filter(l => l.name?.toLowerCase().includes(q) || l.area?.toLowerCase().includes(q))
    }

    // Vehicle compatibility and distance filter
    // If a listing has no distance_km yet (new admin listing), include it by default
    all = all.filter(l => l.distance_km == null || l.distance_km <= maxDist)
    
    // For now, mock the logic that larger vehicles (truck/bus) can't enter basements
    if (['truck', 'bus'].includes(selectedVehicle)) {
      all = all.filter(l => l.sub_type !== 'basement')
    }
    
    // Amenities filter
    if (selectedAmenities.length > 0) {
      all = all.filter(l => {
        // If listing doesn't have features array, we assume it doesn't match
        if (!l.features || !Array.isArray(l.features)) return false;
        // Check if all selected amenities are present in the listing's features
        return selectedAmenities.every(amenity => 
          l.features.some(f => f.toLowerCase().includes(amenity.toLowerCase()))
        );
      })
    }
    
    // Sorting: Nearest, Cheapest, Rating
    if (sortBy === 'Nearest') {
      all.sort((a, b) => a.distance_km - b.distance_km)
    } else if (sortBy === 'Cheapest') {
      // Sort by fixed pricing using base hourly rate as standard metric
      const rateA = FIXED_PRICING[selectedVehicle]?.hourly || 0;
      const rateB = FIXED_PRICING[selectedVehicle]?.hourly || 0;
      // Since global pricing is same, this might not reorder them unless we have specific pricing overrides per listing
      // We'll fall back to distance if prices are same
      all.sort((a, b) => (a.price_override || rateA) - (b.price_override || rateB) || a.distance_km - b.distance_km)
    } else if (sortBy === 'Rating') {
      all.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    return all
  }, [storeListings, query, maxDist, selectedVehicle, sortBy, userLocation, selectedArea, selectedAmenities])

  // Center the map smartly
  const mapCenter = useMemo(() => {
    if (selectedArea !== 'Current Location' && listings.length > 0) {
      // If manually selected an area, jump map to the first result in that area
      return { lat: listings[0].lat, lng: listings[0].lng }
    }
    return userLocation
  }, [selectedArea, listings, userLocation])

  function getPrice() {
    const rates = FIXED_PRICING[selectedVehicle] || FIXED_PRICING.car
    if (passType === 'hourly')  return `₹${rates.hourly}`
    if (passType === 'daily')   return `₹${rates.daily}`
    if (passType === 'weekly')  return `₹${rates.weekly}`
    if (passType === 'monthly') return `₹${rates.monthly}`
    return `₹${rates.hourly}`
  }
  
  function getPriceSuffix() {
    if (passType === 'hourly')  return '/hr'
    if (passType === 'daily')   return '/day cap'
    if (passType === 'weekly')  return '/wk'
    if (passType === 'monthly') return '/mo'
    return '/hr'
  }

  return (
    <div className="pb-6">
      {/* Scan & Park Banner */}
      <div className="mx-4 mt-3 bg-navy rounded-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">📷</div>
        <div className="flex-1">
          <div className="text-white font-extrabold text-sm">Scan &amp; Park</div>
          <div className="text-white/55 text-xs">Scan host QR → park → pay on exit</div>
        </div>
        <button onClick={() => navigate('/scan')} className="bg-primary text-white text-xs font-extrabold px-3 py-2 rounded-pill flex-shrink-0">
          INSTANT
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 px-4 mt-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-pill px-4 py-2.5">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search parking in Bengaluru..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 font-semibold"
          />
          {query && <button onClick={() => setQuery('')} className="text-gray-400 text-xs">✕</button>}
        </div>
        <button 
          onClick={() => setShowFilter(true)}
          className={`text-xs font-extrabold px-4 py-2.5 rounded-pill transition-all ${maxDist < 10 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}
        >
          FILTER {maxDist < 10 && ' •'}
        </button>
      </div>

      {/* Advertisement Banner (Home) */}
      {ads?.home?.active && ads.home.url && (
        <div className="px-4 mt-3">
          <a 
            href={ads.home.link} 
            target="_blank" 
            rel="noreferrer"
            className="block w-full h-24 rounded-2xl overflow-hidden shadow-sm transition-transform active:scale-95 relative border border-gray-100 dark:border-gray-800 bg-gray-100"
          >
            <div className="absolute top-2 right-2 bg-black/60 text-[8px] text-white/90 px-1.5 py-0.5 rounded uppercase tracking-widest z-10 backdrop-blur-sm">Ad</div>
            {ads.home.url.match(/\.(mp4|webm|mov)$/i) ? (
              <video src={ads.home.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={ads.home.url} alt="Advertisement" className="w-full h-full object-cover" />
            )}
          </a>
        </div>
      )}

      {/* Map Widget */}
      <div className="mx-4 mt-3 h-48 sm:h-64 rounded-2xl relative z-0 overflow-hidden shadow-card border-2 border-gray-100 dark:border-gray-800">
        {isLocating && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-2">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Locating you...</span>
          </div>
        )}
        <MapWidget 
          center={mapCenter}
          onMarkerClick={(id) => navigate(`/listing/${id}`)}
          locations={listings.map(l => ({
            id: l.id,
            name: l.name,
            address: l.area,
            price: getPrice().replace('₹', ''),
            lat: l.lat,
            lng: l.lng,
          }))}
        />
      </div>

      {/* Vehicle Selection (Icons Only) */}
      <div className="mt-5 px-6">
        <div className="flex justify-between items-end">
          {VEHICLE_TYPES.map(v => {
            const isSelected = selectedVehicle === v.value;
            return (
              <button
                key={v.value}
                onClick={() => setSelectedVehicle(v.value)}
                className={`flex flex-col items-center justify-center transition-all duration-300 ${
                  isSelected ? 'scale-125 opacity-100' : 'scale-95 opacity-40 grayscale hover:opacity-70 hover:scale-100'
                }`}
              >
                <span className={`text-[36px] leading-none transition-transform inline-block ${isSelected ? 'animate-drive' : ''}`}>
                  {v.emoji}
                </span>
                <span className={`text-[10px] uppercase tracking-widest mt-2 transition-all ${
                  isSelected ? 'font-black text-primary' : 'font-extrabold text-gray-500'
                }`}>
                  {v.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pass Type Pills */}
      <div className="flex gap-2 px-4 mt-2 overflow-x-auto no-scrollbar pb-1">
        {PASS_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => setPassType(pt.id)}
            className={`flex-shrink-0 p-3 rounded-card border-2 min-w-[90px] text-left transition-all relative overflow-hidden ${
              passType === pt.id
                ? 'border-primary bg-orange-50 dark:bg-orange-950'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            <div className={`text-sm font-extrabold ${passType === pt.id ? 'text-primary' : 'text-gray-800 dark:text-white'}`}>{pt.label}</div>
            <div className="text-[12px] text-gray-600 dark:text-gray-300 font-bold mt-0.5">
              ₹{FIXED_PRICING[selectedVehicle][pt.id]}
            </div>
            {pt.save && (
              <div className={`text-[10px] font-extrabold mt-1 ${pt.save === 'Best Value' ? 'text-white bg-green-500 px-2 py-0.5 rounded inline-block' : 'text-hgreen'}`}>
                {pt.save}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mx-4 mt-3 grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-600">
        {[['24+','Nearby'],['₹30','From'],['0.3km','Closest']].map(([v,l]) => (
          <div key={l} className="py-3 text-center">
            <div className="text-base font-black text-primary">{v}</div>
            <div className="text-[11px] text-gray-400 font-semibold">{l}</div>
          </div>
        ))}
      </div>

      {/* Listings */}
      <div className="flex items-center justify-between px-4 mt-4 mb-2">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">⚡ Top Picks in Bengaluru</h3>
        <button className="text-primary text-sm font-bold">See all →</button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {listings.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-semibold">No results for "{query}"</div>
        ) : listings.map(l => (
          <div
            key={l.id}
            className="card p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate(`/listing/${l.id}`)}
          >
            <div className="flex gap-3 mb-3">
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 relative">
                {l.thumbnail_emoji}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleSavedSpot(l.id); }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <span className="text-xs">{savedSpots.includes(l.id) ? '❤️' : '🤍'}</span>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{l.name}</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                  <span>⭐ {l.rating || '4.8'}</span>
                  <span>·</span>
                  <span>{l.distance_km != null ? l.distance_km : '—'}km away</span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize">{l.sub_type || l.subType || 'parking'}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-hgreen">
                  <div className="w-2 h-2 bg-hgreen rounded-full" />
                  {l.available_slots ?? l.total_slots ?? '—'} slots available
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-black text-gray-900 dark:text-white">{getPrice()}</span>
                <span className="text-xs text-gray-400 font-semibold">{getPriceSuffix()}</span>
              </div>
              <button
                className="bg-primary text-white text-xs font-extrabold px-4 py-2.5 rounded-pill shadow-md shadow-orange-500/20"
                onClick={e => { e.stopPropagation(); navigate(`/book/${l.id}?v=${selectedVehicle}`) }}
              >
                Book Now →
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Filter Modal */}
      {showFilter && (
        <div className="modal-overlay" onClick={() => setShowFilter(false)}>
          <div className="modal-sheet p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Filters</h3>
              <button onClick={() => { setMaxDist(10); setVType('all'); setSortBy('Nearest'); setSelectedAmenities([]); }} className="text-xs font-bold text-primary">Reset All</button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-muted uppercase tracking-widest">Distance Radius</label>
                  <span className="text-sm font-black text-primary">{maxDist} km</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5"
                  value={maxDist} onChange={e => setMaxDist(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-black text-muted uppercase tracking-widest block mb-3">Sort By</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Nearest', 'Cheapest', 'Rating'].map(t => (
                    <button
                      key={t}
                      onClick={() => setSortBy(t)}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 capitalize text-center transition-all ${
                        sortBy === t ? 'border-primary bg-primary text-white' : 'border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-muted uppercase tracking-widest block mb-3">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_AMENITIES.map(a => {
                    const isActive = selectedAmenities.includes(a);
                    return (
                      <button 
                        key={a} 
                        onClick={() => {
                          if (isActive) {
                            setSelectedAmenities(selectedAmenities.filter(item => item !== a))
                          } else {
                            setSelectedAmenities([...selectedAmenities, a])
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${
                          isActive 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowFilter(false)}
              className="btn-primary mt-8 w-full"
            >
              Show {listings.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
