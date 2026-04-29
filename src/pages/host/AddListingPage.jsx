import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import LocationModal from '../../components/modals/LocationModal'
import { LOCATIONS } from '../../lib/constants'

const PARKING_SUBTYPES = ['Basement','Open','Covered','Mall']
const SPORTS_SUBTYPES  = ['Football','Badminton','Cricket','Basketball','Tennis']
const AMENITY_LIST     = ['CCTV 24/7','EV Charging','Wheelchair Access','Security Guard','Covered Parking','Valet Available','Washrooms','WiFi','Floodlights','Changing Rooms','Parking']

export default function AddListingPage() {
  const navigate  = useNavigate()
  const [showLoc, setShowLoc] = useState(false)
  const [step,    setStep]    = useState(1)
  const [type,    setType]    = useState(null) // 'parking' | 'sports'

  // Step 2 fields
  // Step 2 fields
  const [name,     setName]     = useState('')
  const [address,  setAddress]  = useState('')
  const [exactLoc, setExactLoc] = useState('')
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [area,     setArea]     = useState('Koramangala')
  const [subType,  setSubType]  = useState('')
  const [hours,    setHours]    = useState('24/7')
  const [phone,    setPhone]    = useState('')
  const [photos,   setPhotos]   = useState([])

  // Vehicle Selection & Slots
  const [vSettings, setVSettings] = useState({
    bike:  { enabled: false, slots: '', prices: { hour: { active: true, val: '' }, day: { active: true, val: '' }, week: { active: true, val: '' }, month: { active: true, val: '' } } },
    car:   { enabled: false, slots: '', prices: { hour: { active: true, val: '' }, day: { active: true, val: '' }, week: { active: true, val: '' }, month: { active: true, val: '' } } },
    truck: { enabled: false, slots: '', prices: { hour: { active: true, val: '' }, day: { active: true, val: '' }, week: { active: true, val: '' }, month: { active: true, val: '' } } },
    bus:   { enabled: false, slots: '', prices: { hour: { active: true, val: '' }, day: { active: true, val: '' }, week: { active: true, val: '' }, month: { active: true, val: '' } } },
  })

  // Step 3 pricing (for sports only)
  const [basePrice, setBasePrice] = useState('')
  const [peakStart, setPeakStart] = useState('18')
  const [peakEnd,   setPeakEnd]   = useState('22')
  const [peakPrice, setPeakPrice] = useState('')
  const [surge,     setSurge]     = useState('0')

  // Step 4
  const [amenities, setAmenities] = useState([])
  const [done,      setDone]      = useState(false)

  function toggleAmenity(a) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function updateVSetting(type, field, val) {
    setVSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: val }
    }))
  }

  function updateVPrice(type, tier, field, val) {
    setVSettings(prev => ({
      ...prev,
      [type]: { 
        ...prev[type], 
        prices: {
          ...prev[type].prices,
          [tier]: { ...prev[type].prices[tier], [field]: val }
        }
      }
    }))
  }

  if (done) return (
    <div className="app-shell">
      <div className="screen-content flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-6 text-center">
        <div className="animate-scaleIn text-7xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Listing is Live!</h1>
        <p className="text-sm text-muted mb-6">Your listing is now visible to customers</p>
        <button onClick={() => navigate('/host/listings')} className="btn-primary max-w-xs">View My Listings →</button>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="screen-content bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => step > 1 ? setStep(s => s-1) : navigate(-1)} className="text-gray-500 font-bold">←</button>
          <h1 className="font-extrabold text-gray-900 dark:text-white">
            {['','Select Type','Property Details','Pricing & Spaces','Amenities'][step]}
          </h1>
          <div className="ml-auto text-xs font-bold text-primary">Step {step}/4</div>
        </div>
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div className="progress-bar" style={{ width: `${(step/4)*100}%` }} />
        </div>

        <div className="p-4">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">What are you listing?</h2>
              <div className="flex flex-col gap-4">
                {[
                  { id:'parking', emoji:'🅿️', label:'Parking Space', sub:'List your parking spot, driveway or lot' },
                  { id:'sports',  emoji:'🏟️', label:'Sports Venue',  sub:'List your ground, court or arena' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setType(opt.id); setStep(2) }}
                    className={`p-5 border-2 rounded-2xl flex items-center gap-4 text-left transition-all ${type===opt.id ? 'border-primary bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-600'}`}
                  >
                    <span className="text-4xl">{opt.emoji}</span>
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-white">{opt.label}</div>
                      <div className="text-sm text-muted mt-1">{opt.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Property Information</h2>

              {[
                { label:'Name of Property', value:name, setter:setName, placeholder:'e.g. Prestige Tech Park Basement' },
                { label:'Area',            value:area, setter:setArea, isSelect: true, options: LOCATIONS.areas['Bengaluru'] },
                { label:'Exact Address',    value:address, setter:setAddress, placeholder:'Door no, Street name...' },
                { label:'Google Maps Link', value:googleMapsLink, setter:setGoogleMapsLink, placeholder:'Paste Google Maps URL' },
                { label:'Exact Coordinates', value:exactLoc, setter:setExactLoc, placeholder:'e.g. 12.9340, 77.6205 (Optional)' },
                { label:'Open Hours',       value:hours, setter:setHours, placeholder:'e.g. 24/7 or 6AM–10PM' },
                { label:'Phone Number',     value:phone, setter:setPhone, placeholder:'+91 XXXXX XXXXX', type:'tel' },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1.5">{f.label}</p>
                  {f.isSelect ? (
                    <select value={f.value} onChange={e => f.setter(e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary dark:bg-gray-800 dark:text-white transition-colors">
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={f.value}
                      onChange={e => f.setter(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary dark:bg-gray-800 dark:text-white transition-colors"
                    />
                  )}
                </div>
              ))}
              
              {/* Photo Upload */}
              <div>
                <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1.5">Property Pictures</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => setPhotos(Array.from(e.target.files))}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-600"
                />
                <p className="text-xs text-muted mt-1">{photos.length} files selected</p>
              </div>

              {/* Sub-type */}
              <div>
                <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-1.5">
                  {type === 'parking' ? 'Parking Category' : 'Sport Category'}
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

              <button onClick={() => setStep(3)} disabled={!name || !subType} className="btn-primary mt-2">Continue to Pricing →</button>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Space &amp; Pricing</h2>

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
                  <p className="text-sm text-muted mb-4">Set slot counts and pricing for each vehicle type. Turn off any tier you don't offer.</p>
                  
                  {['bike', 'car', 'truck', 'bus'].map(v => (
                    <div key={v} className={`p-4 border-2 rounded-2xl mb-3 transition-all ${vSettings[v].enabled ? 'border-primary bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-600'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{v==='bike'?'🛵':v==='car'?'🚗':v==='truck'?'🚛':'🚌'}</span>
                          <span className="font-extrabold text-gray-900 dark:text-white capitalize">{v === 'bike' ? '2 Wheeler' : v === 'car' ? '4 Wheeler' : v}</span>
                        </div>
                        <div className={`toggle${vSettings[v].enabled ? ' on' : ''}`} onClick={() => updateVSetting(v, 'enabled', !vSettings[v].enabled)}>
                          <div className="toggle-knob" />
                        </div>
                      </div>

                      {vSettings[v].enabled && (
                        <div className="animate-fadeIn">
                          <div className="mb-4">
                            <p className="text-[10px] font-black text-muted uppercase mb-1">Total Slots for this type</p>
                            <input 
                              type="number" value={vSettings[v].slots} onChange={e => updateVSetting(v, 'slots', e.target.value)}
                              placeholder="e.g. 50" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-primary"
                            />
                          </div>

                          <div className="space-y-3">
                            {['hour', 'day', 'week', 'month'].map(tier => (
                              <div key={tier} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${vSettings[v].prices[tier].active ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                                  onClick={() => updateVPrice(v, tier, 'active', !vSettings[v].prices[tier].active)}>
                                  {tier[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-bold text-muted capitalize">{tier}ly Price</p>
                                  {vSettings[v].prices[tier].active ? (
                                    <input 
                                      type="number" value={vSettings[v].prices[tier].val} onChange={e => updateVPrice(v, tier, 'val', e.target.value)}
                                      placeholder={`₹ ${tier}ly`} className="w-full bg-transparent border-none text-sm font-bold p-0 outline-none dark:text-white"
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">Tier Disabled</span>
                                  )}
                                </div>
                                <div className={`toggle mini ${vSettings[v].prices[tier].active ? ' on' : ''}`} onClick={() => updateVPrice(v, tier, 'active', !vSettings[v].prices[tier].active)}>
                                  <div className="toggle-knob" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              <button onClick={() => setStep(4)} className="btn-primary mt-2">Continue to Amenities →</button>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Amenities &amp; Review</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {AMENITY_LIST.map(a => (
                  <button key={a} onClick={() => toggleAmenity(a)}
                    className={`px-3 py-2 rounded-pill border-2 text-xs font-bold transition-all ${amenities.includes(a) ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                    {amenities.includes(a) ? '✓ ' : ''}{a}
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="card p-4 mb-6">
                <div className="text-xs text-muted uppercase font-extrabold tracking-wide mb-2">Review Summary</div>
                <div className="font-extrabold text-gray-900 dark:text-white mb-1">{name || 'Listing Name'}</div>
                <div className="text-xs text-muted mb-3">📍 {area} · {address}</div>
                
                <div className="space-y-3">
                  {Object.entries(vSettings).filter(([_, s]) => s.enabled).map(([v, s]) => (
                    <div key={v} className="border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="capitalize font-black text-sm text-gray-900 dark:text-white">{v === 'bike' ? '2 Wheeler' : v === 'car' ? '4 Wheeler' : v}</span>
                        <span className="text-primary font-bold text-xs">{s.slots} Slots Available</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(s.prices).filter(([_, p]) => p.active && p.val).map(([tier, p]) => (
                          <span key={tier} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-bold text-muted">
                            {tier[0].toUpperCase()}: ₹{p.val}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setDone(true)} className="btn-primary">
                🚀 Upload ({photos.length} files) and Go Live!
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
