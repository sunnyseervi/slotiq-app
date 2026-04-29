import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import LocationModal from '../../components/modals/LocationModal'
import { LOCATIONS } from '../../lib/constants'
import { useStore } from '../../store/useStore'

const PARKING_SUBTYPES = ['Basement','Open','Covered','Mall']
const SPORTS_SUBTYPES  = ['Football','Badminton','Cricket','Basketball','Tennis']
const AMENITY_LIST     = ['CCTV 24/7','EV Charging','Wheelchair Access','Security Guard','Covered Parking','Valet Available','Washrooms','WiFi','Floodlights','Changing Rooms','Parking']

export default function EditListingPage() {
  const { id } = useParams()
  const navigate  = useNavigate()
  const { listings, updateListing } = useStore()
  
  const listing = listings.find(l => l.id === id)
  
  const [showLoc, setShowLoc] = useState(false)
  const [step,    setStep]    = useState(2) // Skip type selection
  const [type,    setType]    = useState(listing?.type || 'parking')

  // Step 2 fields
  const [name,     setName]     = useState(listing?.name || '')
  const [address,  setAddress]  = useState(listing?.address || '')
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [area,     setArea]     = useState(listing?.area || 'Koramangala')
  const [subType,  setSubType]  = useState(listing?.sub_type || '')
  const [slots,    setSlots]    = useState(listing?.slots?.toString() || '')
  const [hours,    setHours]    = useState(listing?.hours || '24/7')
  const [phone,    setPhone]    = useState('')
  const [photos,   setPhotos]   = useState([])

  // Step 3 pricing (Simplification for UI)
  const [basePrice, setBasePrice] = useState('')
  const [peakStart, setPeakStart] = useState('18')
  const [peakEnd,   setPeakEnd]   = useState('22')
  const [peakPrice, setPeakPrice] = useState('')
  const [surge,     setSurge]     = useState('0')
  const [carHMin,   setCarHMin]   = useState('')
  const [carHMax,   setCarHMax]   = useState('')

  // Step 4
  const [amenities, setAmenities] = useState(listing?.amenities || [])
  const [done,      setDone]      = useState(false)

  if (!listing && !done) {
    return <div className="p-8 text-center bg-gray-900 text-white h-screen">Listing not found</div>
  }

  function toggleAmenity(a) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function saveChanges() {
    updateListing(id, {
      name,
      address,
      area,
      sub_type: subType,
      slots: Number(slots) || 0,
      hours,
      amenities
    })
    setDone(true)
  }

  if (done) return (
    <div className="app-shell">
      <div className="screen-content flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-6 text-center">
        <div className="animate-scaleIn text-7xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Edits Saved!</h1>
        <p className="text-sm text-muted mb-6">Your listing has been updated globally.</p>
        <button onClick={() => navigate('/host/listings')} className="btn-primary max-w-xs">Back to My Listings</button>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="screen-content bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => step > 2 ? setStep(s => s-1) : navigate(-1)} className="text-gray-500 font-bold">←</button>
          <h1 className="font-extrabold text-gray-900 dark:text-white">
            {['','','Edit Info','Edit Pricing','Edit Amenities'][step]}
          </h1>
          <div className="ml-auto text-xs font-bold text-primary">Step {step - 1}/3</div>
        </div>
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div className="progress-bar" style={{ width: `${((step-1)/3)*100}%` }} />
        </div>

        <div className="p-4">

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Basic Information</h2>

              {[
                { label:'Listing Name', value:name, setter:setName, placeholder:'e.g. My Koramangala Parking' },
                { label:'Address',      value:address, setter:setAddress, placeholder:'Street address' },
                { label:'Google Maps Link', value:googleMapsLink, setter:setGoogleMapsLink, placeholder:'Paste Google Maps URL here' },
                { label:'Phone Number', value:phone, setter:setPhone, placeholder:'+91 XXXXX XXXXX', type:'tel' },
                { label:'Open Hours',   value:hours, setter:setHours, placeholder:'e.g. 24/7 or 6AM–10PM' },
                { label:'Total Slots',  value:slots, setter:setSlots, placeholder:'e.g. 50', type:'number' },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1.5">{f.label}</p>
                  <input
                    type={f.type || 'text'}
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary dark:bg-gray-800 dark:text-white transition-colors"
                  />
                </div>
              ))}
              
              <div>
                <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1.5">Area</p>
                <select value={area} onChange={e => setArea(e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary dark:bg-gray-800 dark:text-white">
                  {(LOCATIONS.areas['Bengaluru']||[]).map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1.5">
                  {type === 'parking' ? 'Parking Type' : 'Sport Type'}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(type === 'parking' ? PARKING_SUBTYPES : SPORTS_SUBTYPES).map(s => (
                    <button key={s} onClick={() => setSubType(s)}
                      className={`px-3 py-2 rounded-pill border-2 text-xs font-bold transition-all ${subType===s ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(3)} disabled={!name || !subType} className="btn-primary mt-2">Continue →</button>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Edit Pricing</h2>

              {type === 'sports' ? (
                <>
                  {[
                    { label:'Base Price (₹/hr)',   value:basePrice, setter:setBasePrice },
                    { label:'Peak Price (₹/hr)',   value:peakPrice, setter:setPeakPrice },
                    { label:'Peak Start Hour (24h)',value:peakStart, setter:setPeakStart },
                    { label:'Peak End Hour (24h)',  value:peakEnd,   setter:setPeakEnd },
                    { label:'Weekend Surge %',     value:surge,     setter:setSurge },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1.5">{f.label}</p>
                      <input type="number" value={f.value} onChange={e => f.setter(e.target.value)} placeholder="0"
                        className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted">Car prices (set range for min–max)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label:'Hourly Min', value:carHMin, setter:setCarHMin },
                      { label:'Hourly Max', value:carHMax, setter:setCarHMax },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-xs font-extrabold text-muted mb-1.5">{f.label}</p>
                        <input type="number" value={f.value} onChange={e => f.setter(e.target.value)} placeholder="₹"
                          className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-3 py-3 text-sm font-semibold outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button onClick={() => setStep(4)} className="btn-primary mt-2">Continue →</button>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Amenities &amp; Save</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {AMENITY_LIST.map(a => (
                  <button key={a} onClick={() => toggleAmenity(a)}
                    className={`px-3 py-2 rounded-pill border-2 text-xs font-bold transition-all ${amenities.includes(a) ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                    {amenities.includes(a) ? '✓ ' : ''}{a}
                  </button>
                ))}
              </div>

              <div className="card p-4 mb-6">
                <div className="text-xs text-muted uppercase font-extrabold tracking-wide mb-2">Review Changes</div>
                <div className="font-extrabold text-gray-900 dark:text-white mb-1">{name || 'Listing Name'}</div>
                <div className="text-xs text-muted mb-1">📍 {address || 'Address'} · {area}</div>
                <div className="text-xs text-muted">{subType} · {slots || '?'} slots · {hours}</div>
              </div>

              <button onClick={saveChanges} className="btn-primary">
                💾 Save Changes Instantly
              </button>
            </div>
          )}
        </div>
        <div className="h-20" />
      </div>
      <BottomNav />
      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
