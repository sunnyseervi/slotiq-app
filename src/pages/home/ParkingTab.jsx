import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { MOCK_LISTINGS, MOCK_PARKING_PRICING, formatInr } from '../../lib/mockData'
import MapWidget from '../../components/MapWidget'

const PASS_TYPES = [
  { id: 'hourly',  label: 'Hourly',  price: '₹15–₹150/hr',   save: '', hint: '' },
  { id: 'daily',   label: 'Daily',   price: '₹65–₹1,150/d',  save: 'Save 20%', hint: '' },
  { id: 'weekly',  label: 'Weekly',  price: '₹325–₹6K/wk',   save: 'Save 35%', hint: '' },
  { id: 'monthly', label: 'Monthly', price: '₹1K–₹18K/mo',   save: 'Save 50%', hint: '' },
]

export default function ParkingTab() {
  const navigate = useNavigate()
  const { listings: storeListings, savedSpots, toggleSavedSpot } = useStore()
  const [passType,  setPassType]  = useState('hourly')
  const [query,     setQuery]     = useState('')
  const [showFilter, setShowFilter] = useState(false)
  
  // Filter state
  const [maxPrice, setMaxPrice] = useState(500)
  const [maxDist,  setMaxDist]  = useState(10)
  const [vType,    setVType]    = useState('all')

  const listings = useMemo(() => {
    let all = storeListings.filter(l => l.type === 'parking' && l.is_live)
    
    // Search
    if (query) {
      const q = query.toLowerCase()
      all = all.filter(l => l.name?.toLowerCase().includes(q) || l.area?.toLowerCase().includes(q))
    }

    // Advanced Filters
    all = all.filter(l => l.distance_km <= maxDist)
    all = all.filter(l => l.sub_type.toLowerCase() === vType || vType === 'all')
    
    return all
  }, [storeListings, query, maxDist, vType])

  function getPrice(listing) {
    const pr = MOCK_PARKING_PRICING.find(p => p.listing_id === listing.id && p.vehicle_type === 'car')
    if (!pr) return '₹30'
    if (passType === 'hourly')  return `₹${pr.hourly_min}`
    if (passType === 'daily')   return `₹${pr.daily_min}`
    if (passType === 'weekly')  return pr.weekly_min ? `₹${pr.weekly_min}` : '₹—'
    if (passType === 'monthly') return `₹${pr.monthly_min}`
    return `₹${pr.hourly_min}`
  }
  function getPriceSuffix() {
    if (passType === 'hourly')  return '/hr'
    if (passType === 'daily')   return '/day'
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
          className={`text-xs font-extrabold px-4 py-2.5 rounded-pill transition-all ${maxDist < 10 || vType !== 'car' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
        >
          FILTER {(maxDist < 10 || vType !== 'car') && ' •'}
        </button>
      </div>

      {/* Map Widget */}
      <div className="mx-4 mt-3 h-48 sm:h-64 rounded-2xl relative z-0 overflow-hidden shadow-card">
        <MapWidget 
          locations={listings.map(l => ({
            name: l.name,
            address: l.area,
            price: getPrice(l).replace('₹', ''),
            lat: l.lat || (12.9352 + (Math.random() * 0.02 - 0.01)), // Fallback to near Koramangala
            lng: l.lng || (77.6245 + (Math.random() * 0.02 - 0.01)),
          }))}
        />
      </div>

      {/* Pass Type Pills */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto no-scrollbar pb-1">
        {PASS_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => setPassType(pt.id)}
            className={`flex-shrink-0 p-3 rounded-card border-2 min-w-[80px] text-left transition-all ${
              passType === pt.id
                ? 'border-primary bg-orange-50 dark:bg-orange-950'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            <div className={`text-sm font-extrabold ${passType === pt.id ? 'text-primary' : 'text-gray-800 dark:text-white'}`}>{pt.label}</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{pt.price}</div>
            {pt.save && <div className="text-[10px] font-extrabold text-hgreen mt-1">{pt.save}</div>}
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
                  <span>⭐ {l.rating}</span>
                  <span>·</span>
                  <span>{l.distance_km}km away</span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize">{l.sub_type}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-hgreen">
                  <div className="w-2 h-2 bg-hgreen rounded-full" />
                  {l.available_slots} slots available
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-black text-gray-900 dark:text-white">{getPrice(l)}</span>
                <span className="text-xs text-gray-400 font-semibold">{getPriceSuffix()}</span>
              </div>
              <button
                className="bg-primary text-white text-xs font-extrabold px-4 py-2.5 rounded-pill"
                onClick={e => { e.stopPropagation(); navigate(`/listing/${l.id}`) }}
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
              <button onClick={() => { setMaxDist(10); setVType('all'); }} className="text-xs font-bold text-primary">Reset All</button>
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
                <label className="text-xs font-black text-muted uppercase tracking-widest block mb-3">Space Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'basement', 'open', 'covered'].map(t => (
                    <button
                      key={t} onClick={() => setVType(t)}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all capitalize ${vType === t ? 'border-primary bg-primary text-white' : 'border-gray-100 dark:border-gray-700 dark:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-muted uppercase tracking-widest block mb-3">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {['CCTV', 'EV Charging', 'Security'].map(a => (
                    <button key={a} className="px-3 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold text-gray-500">
                      {a}
                    </button>
                  ))}
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
