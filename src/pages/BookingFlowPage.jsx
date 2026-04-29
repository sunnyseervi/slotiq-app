import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { VEHICLE_TYPES } from '../lib/constants'
import { formatInr, randomCode, calcBookingCost } from '../lib/utils'

const TIME_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']

function fmt12(t) {
  const [h,m] = t.split(':').map(Number)
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`
}

export default function BookingFlowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, addVehicle, addBooking, listings: storeListings } = useStore()
  const vehicles = currentUser?.vehicles || []
  
  const listing = storeListings.find(l => l.id === id)
  const isParking = listing?.type === 'parking'
  const sportsPr  = listing?.pricing?.sports

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const queryVehicle = searchParams.get('v') || 'car'

  const [step,       setStep]       = useState(1)
  const [passType,   setPassType]   = useState('hourly')
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0])
  const [startTime,  setStartTime]  = useState('10:00')
  const [duration,   setDuration]   = useState(1)
  const [vehicleId,  setVehicleId]  = useState('')
  const [showAddVal, setShowAddVal] = useState(false)
  const [newVeh,     setNewVeh]     = useState({ type: 'car', plate_number: '', nickname: '', rc_picture: null })
  const [confirmed,  setConfirmed]  = useState(false)
  const [confCode,   setConfCode]   = useState('')

  if (!listing) return <div className="app-shell"><div className="screen-content flex items-center justify-center text-gray-400">Listing not found</div></div>

  useEffect(() => {
    if (!isParking) return
    const matchingVeh = vehicles.find(v => v.type === queryVehicle)
    if (matchingVeh) {
      setVehicleId(matchingVeh.id)
      setShowAddVal(false)
    } else {
      setVehicleId('')
      setNewVeh(prev => ({ ...prev, type: queryVehicle, rc_picture: null }))
      setShowAddVal(true)
    }
  }, [vehicles, queryVehicle, isParking])

  const selectedVehicle = vehicles.find(v => v.id === vehicleId)
  const bookingVehicleType = selectedVehicle?.type || queryVehicle

  const pricing = isParking
    ? MOCK_PARKING_PRICING.find(p => p.listing_id === id && p.vehicle_type === bookingVehicleType)
    : sportsPr

  const cost = calcBookingCost({ listing, pricing, passType, hours: duration, vehicleType: bookingVehicleType })
  const today = new Date().toISOString().split('T')[0]

  function confirmPay() {
    const code = randomCode()
    setConfCode(code)

    addBooking({
      listing_name: listing.name,
      listing_id: listing.id,
      booking_date: date,
      start_time: startTime,
      pass_type: isParking ? passType : 'hourly',
      status: 'upcoming',
      amount: cost.total,
      duration: duration,
      vehicle_id: vehicleId,
      conf_code: code,
      type: listing.type
    })

    setConfirmed(true)
  }

  function goBookings() { navigate('/bookings') }

  if (confirmed) return (
    <div className="app-shell">
      <div className="screen-content flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-6 text-center">
        <div className="animate-scaleIn text-7xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
        <p className="text-sm text-muted mb-6">Your spot is secured</p>

        <div className="bg-primary/10 rounded-3xl p-6 mb-6 w-full">
          <p className="text-xs text-muted mb-1 font-bold uppercase tracking-widest">Confirmation Code</p>
          <div className="text-4xl font-black text-primary tracking-[0.3em]">{confCode}</div>
          <p className="text-[10px] text-primary font-black mt-3 uppercase text-center bg-white dark:bg-gray-800 py-2 rounded-xl">Pay {formatInr(cost.total)} on arrival</p>
        </div>

        <div className="card p-5 w-full mb-6 text-left border-2 border-primary/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💵</span>
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Payment on Arrival</span>
          </div>
          <p className="text-[10px] text-muted mb-1 font-black uppercase tracking-widest">Venue</p>
          <p className="font-black text-gray-900 dark:text-white mb-4 text-lg">{listing.name}</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted font-bold">Date</span>
            <span className="font-black text-gray-800 dark:text-gray-200">{date}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted font-bold">Time</span>
            <span className="font-black text-gray-800 dark:text-gray-200">{fmt12(startTime)}{duration > 0 ? ` · ${duration}hr` : ''}</span>
          </div>
          <div className="flex justify-between text-sm mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
            <span className="font-black text-gray-900 dark:text-white uppercase tracking-widest">Total to Pay</span>
            <span className="font-black text-primary text-xl">{formatInr(cost.total)}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={goBookings} className="btn-primary flex-1 py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">My Bookings</button>
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${listing.lat},${listing.lng}`,'_blank')}
            className="btn-outline flex-1 py-4 text-xs font-black uppercase tracking-widest"
          >
            🧭 Navigate
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="screen-content bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => step > 1 ? setStep(s => s-1) : navigate(-1)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold shadow-sm">←</button>
          <div className="flex-1">
            <h1 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">{listing.name}</h1>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">{isParking ? 'Parking Pass' : 'Sports Booking'}</p>
          </div>
          <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full">Step {step}/3</div>
        </div>

        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step/3)*100}%` }} />
        </div>

        <div className="p-4">
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 uppercase tracking-tight">Select Schedule</h2>

              <div className="flex gap-4 bg-gray-50 dark:bg-gray-800 rounded-3xl p-4 mb-6 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <span className="text-4xl">{listing.thumbnail_emoji}</span>
                <div className="flex-1">
                  <div className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{listing.name}</div>
                  <div className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">{listing.sub_type} · {listing.area}</div>
                </div>
              </div>

              {isParking && (
                <div className="mb-6">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Pass Type</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['hourly','daily','weekly','monthly'].map(pt => (
                      <button key={pt} onClick={() => setPassType(pt)}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${passType===pt ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800'}`}>
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Date</p>
                  <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                    className="w-full border-2 border-transparent bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-black outline-none focus:border-primary dark:text-white transition-all shadow-inner"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Arrival Time</p>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full border-2 border-transparent bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-black outline-none focus:border-primary dark:text-white transition-all shadow-inner"
                  />
                </div>
              </div>

              {passType === 'hourly' && (
                <div className="mb-6">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Duration</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[1,2,3,4,6,8,12].map(h => (
                      <button key={h} onClick={() => setDuration(h)}
                        className={`flex-shrink-0 w-14 py-3 rounded-2xl text-xs font-black transition-all border-2 ${duration===h ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800'}`}>
                        {h}hr
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isParking && (
                <div className="mb-8">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Vehicle</p>
                  
                  {showAddVal ? (
                    <div className="p-5 border-2 border-primary/20 rounded-3xl bg-primary/5 animate-scaleIn">
                      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                        {VEHICLE_TYPES.map(v => (
                          <button
                            key={v.value} onClick={() => setNewVeh({...newVeh, type: v.value})}
                            className={`flex-shrink-0 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${newVeh.type === v.value ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white'}`}
                          >
                            {v.emoji} {v.label}
                          </button>
                        ))}
                      </div>
                      <input 
                        value={newVeh.plate_number} onChange={e => setNewVeh({...newVeh, plate_number: e.target.value.toUpperCase()})}
                        placeholder="Plate Number (e.g. KA 01 AB 1234)" className="w-full mb-3 px-4 py-3 text-sm font-bold border-2 border-transparent bg-white dark:bg-gray-800 rounded-xl outline-none focus:border-primary shadow-sm"
                      />
                      <input 
                        value={newVeh.nickname} onChange={e => setNewVeh({...newVeh, nickname: e.target.value})}
                        placeholder="Nickname (e.g. My Honda)" className="w-full mb-4 px-4 py-3 text-sm font-bold border-2 border-transparent bg-white dark:bg-gray-800 rounded-xl outline-none focus:border-primary shadow-sm"
                      />
                      <div className="flex gap-3">
                        <button onClick={() => setShowAddVal(false)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-2 border-gray-200 dark:border-gray-700 rounded-xl dark:text-white">Cancel</button>
                        <button onClick={() => {
                          if (!newVeh.plate_number) return alert('Plate number required')
                          addVehicle(newVeh)
                          setShowAddVal(false)
                          setNewVeh({ type: 'car', plate_number: '', nickname: '', rc_picture: null })
                        }} className="flex-[2] py-3 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-primary/20">Add Vehicle</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {vehicles.map(v => (
                        <button key={v.id} onClick={() => setVehicleId(v.id)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${vehicleId===v.id ? 'border-primary bg-primary/5 text-primary shadow-md shadow-primary/10' : 'border-gray-100 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800'}`}>
                          {v.type === 'car' ? '🚗' : '🛵'} {v.nickname || 'Vehicle'} · {v.plate_number}
                        </button>
                      ))}
                      <button onClick={() => setShowAddVal(true)} className="px-4 py-3 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        + Add Vehicle
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => {
                  if (isParking && !vehicleId) return alert('Select a vehicle first')
                  if (!currentUser?.phone || currentUser.phone.length !== 10) {
                    alert('Please complete your profile with a valid 10-digit phone number to book.')
                    navigate('/profile')
                  } else {
                    setStep(2)
                  }
                }} 
                className="btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30"
              >
                Continue to Summary →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 uppercase tracking-tight">Booking Summary</h2>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-5 mb-6 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <div className="font-black text-gray-900 dark:text-white mb-4 text-base uppercase tracking-tight">{listing.name}</div>
                <div className="space-y-3">
                  {[
                    ['Date', date],
                    ['Time', `${fmt12(startTime)}${duration ? ` · ${duration}hr` : ''}`],
                    isParking && selectedVehicle ? ['Vehicle', `${selectedVehicle.nickname} (${selectedVehicle.plate_number})`] : null,
                    isParking ? ['Pass Type', passType.toUpperCase()] : null,
                  ].filter(Boolean).map(([l,v]) => (
                    <div key={l} className="flex justify-between text-xs">
                      <span className="text-muted font-bold uppercase tracking-wider">{l}</span>
                      <span className="font-black text-gray-800 dark:text-gray-200">{v}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-5 pt-5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted font-bold">Base Amount</span>
                    <span className="font-black text-gray-700 dark:text-gray-200">{formatInr(cost.base)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted font-bold">Platform Fee</span>
                    <span className="font-black text-gray-700 dark:text-gray-200">{formatInr(cost.platform)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted font-bold">GST (18%)</span>
                    <span className="font-black text-gray-700 dark:text-gray-200">{formatInr(cost.gst)}</span>
                  </div>

                  {cost.appliedCap && (
                    <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-2xl text-[10px] font-black uppercase tracking-wider mt-2 flex items-center gap-2 border border-green-500/20">
                      <span>✨</span>
                      <span>Smart Pricing: {cost.appliedCap} cap applied!</span>
                    </div>
                  )}

                  <div className="flex justify-between mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-black text-gray-900 dark:text-white uppercase tracking-widest">Total Amount</span>
                    <span className="font-black text-primary text-2xl">{formatInr(cost.total)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-4 rounded-3xl text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/20 leading-relaxed">
                ℹ️ 15-min grace period included. Overstays are charged at standard rates.
              </div>

              <div className="mb-8">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Payment Method</p>
                <div className="p-5 border-2 border-primary bg-primary/5 rounded-3xl flex items-center gap-4 shadow-md shadow-primary/5">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-3xl shadow-sm">💵</div>
                  <div className="flex-1">
                    <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Cash on Arrival</div>
                    <div className="text-[10px] text-muted font-bold mt-0.5">Pay at the venue counter</div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>

              <button onClick={confirmPay} className="btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30">
                Confirm & Secure Spot →
              </button>
            </div>
          )}
        </div>

        <div className="h-20" />
      </div>
    </div>
  )
}
