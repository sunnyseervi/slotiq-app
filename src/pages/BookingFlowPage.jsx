import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MOCK_LISTINGS, MOCK_PARKING_PRICING, MOCK_SPORTS_PRICING, MOCK_BOOKINGS, formatInr, randomCode, calcBookingCost } from '../lib/mockData'

const TIME_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']

function fmt12(t) {
  const [h,m] = t.split(':').map(Number)
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`
}

export default function BookingFlowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, vehicles, addVehicle, listings: storeListings } = useStore()
  const listing = storeListings.find(l => l.id === id) || MOCK_LISTINGS.find(l => l.id === id)
  const isParking = listing?.type === 'parking'
  const sportsPr  = MOCK_SPORTS_PRICING.find(p => p.listing_id === id)

  const [step,       setStep]       = useState(1)
  const [passType,   setPassType]   = useState('hourly')
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0])
  const [startTime,  setStartTime]  = useState('10:00')
  const [duration,   setDuration]   = useState(1)
  const [vehicleId,  setVehicleId]  = useState(vehicles[0]?.id || '')
  const [payment,    setPayment]    = useState('upi')
  const [showAddVal, setShowAddVal] = useState(false)
  const [newVeh,     setNewVeh]     = useState({ type: 'car', plate_number: '', nickname: '' })
  const [confirmed,  setConfirmed]  = useState(false)
  const [confCode,   setConfCode]   = useState('')

  if (!listing) return <div className="app-shell"><div className="screen-content flex items-center justify-center text-gray-400">Listing not found</div></div>

  const selectedVehicle = vehicles.find(v => v.id === vehicleId)
  const pricing = isParking
    ? MOCK_PARKING_PRICING.find(p => p.listing_id === id && p.vehicle_type === (selectedVehicle?.type || 'car'))
    : sportsPr

  const cost = calcBookingCost({ listing, pricing, passType, hours: duration, vehicleType: selectedVehicle?.type })

  const today = new Date().toISOString().split('T')[0]

  function confirmPay() {
    const code = randomCode()
    setConfCode(code)
    setConfirmed(true)
  }

  function goBookings() { navigate('/bookings') }

  // ── STEP 3: Confirmation ─────────────────────────────────────────────────
  if (confirmed) return (
    <div className="app-shell">
      <div className="screen-content flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-6 text-center">
        <div className="animate-scaleIn text-7xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
        <p className="text-sm text-muted mb-6">Your spot is secured</p>

        <div className="bg-primary/10 rounded-2xl p-4 mb-6 w-full">
          <p className="text-xs text-muted mb-1">Confirmation Code</p>
          <div className="text-3xl font-black text-primary tracking-[0.3em]">{confCode}</div>
          <p className="text-[10px] text-primary font-bold mt-2 uppercase text-center">Pay ₹{cost.total} at the counter on arrival</p>
        </div>

        <div className="card p-4 w-full mb-6 text-left border-2 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💵</span>
            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Payment on Arrival</span>
          </div>
          <p className="text-xs text-muted mb-1">Venue</p>
          <p className="font-extrabold text-gray-900 dark:text-white mb-3">{listing.name}</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Date</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{date}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted">Time</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{fmt12(startTime)}{duration > 0 ? ` · ${duration}hr` : ''}</span>
          </div>
          <div className="flex justify-between text-sm mt-1 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            <span className="font-bold text-gray-900 dark:text-white">Amount to Pay</span>
            <span className="font-extrabold text-primary text-base">{formatInr(cost.total)}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={goBookings} className="btn-primary flex-1">View Bookings</button>
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${listing.lat},${listing.lng}`,'_blank')}
            className="btn-outline flex-1"
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
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => step > 1 ? setStep(s => s-1) : navigate(-1)} className="text-gray-500 font-bold">←</button>
          <div className="flex-1">
            <h1 className="font-extrabold text-gray-900 dark:text-white text-sm">{listing.name}</h1>
            <p className="text-xs text-muted">{isParking ? 'Parking Booking' : 'Sports Booking'}</p>
          </div>
          <div className="text-xs font-bold text-primary">Step {step}/3</div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div className="progress-bar" style={{ width: `${(step/3)*100}%` }} />
        </div>

        <div className="p-4">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Select Date &amp; Time</h2>

              {/* Listing summary */}
              <div className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-card p-3 mb-4">
                <span className="text-3xl">{listing.thumbnail_emoji}</span>
                <div>
                  <div className="font-extrabold text-sm text-gray-900 dark:text-white">{listing.name}</div>
                  <div className="text-xs text-muted capitalize">{listing.sub_type} · {listing.area}</div>
                </div>
              </div>

              {/* Pass type (parking only) */}
              {isParking && (
                <div className="mb-4">
                  <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Pass Type</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['hourly','daily','weekly','monthly'].map(pt => (
                      <button key={pt} onClick={() => setPassType(pt)}
                        className={`flex-shrink-0 px-4 py-2 rounded-pill border-2 text-xs font-extrabold capitalize transition-all ${passType===pt ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="mb-4">
                <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Date</p>
                <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary dark:bg-gray-800 dark:text-white transition-colors"
                />
              </div>

              {/* Time slots (sports) / time picker (parking) */}
              {!isParking ? (
                <div className="mb-4">
                  <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Time Slot</p>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button key={t} onClick={() => setStartTime(t)}
                        className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${startTime===t ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                        {fmt12(t)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Arrival Time</p>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary dark:bg-gray-800 dark:text-white mb-3"
                  />
                  {passType === 'hourly' && (
                    <>
                      <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Duration</p>
                      <div className="flex gap-2">
                        {[1,2,3,4,6,8,12].map(h => (
                          <button key={h} onClick={() => setDuration(h)}
                            className={`flex-shrink-0 w-12 py-2 rounded-xl text-xs font-bold border-2 transition-all ${duration===h ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                            {h}hr
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Duration (sports) */}
              {!isParking && (
                <div className="mb-4">
                  <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Duration</p>
                  <div className="flex gap-2">
                    {[1,2,3].map(h => (
                      <button key={h} onClick={() => setDuration(h)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${duration===h ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                        {h} hr
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicle (parking) */}
              {isParking && (
                <div className="mb-6">
                  <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Vehicle</p>
                  
                  {showAddVal ? (
                    <div className="p-4 border-2 border-primary rounded-xl bg-primary/5">
                      <div className="flex gap-2 mb-3">
                        {['car', 'bike'].map(type => (
                          <button
                            key={type} onClick={() => setNewVeh({...newVeh, type})}
                            className={`flex-1 py-1.5 text-xs font-bold capitalize rounded border ${newVeh.type === type ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`}
                          >
                            {type === 'car' ? '🚗 Car' : '🛵 Bike'}
                          </button>
                        ))}
                      </div>
                      <input 
                        value={newVeh.plate_number} onChange={e => setNewVeh({...newVeh, plate_number: e.target.value})}
                        placeholder="Plate Number" className="w-full mb-2 px-3 py-2 text-sm border rounded outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                      <input 
                        value={newVeh.nickname} onChange={e => setNewVeh({...newVeh, nickname: e.target.value})}
                        placeholder="Nickname (Optional)" className="w-full mb-3 px-3 py-2 text-sm border rounded outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddVal(false)} className="flex-1 py-2 text-xs font-bold border rounded dark:text-white dark:border-gray-600">Cancel</button>
                        <button onClick={() => {
                          if (!newVeh.plate_number) return alert('Plate number is required')
                          addVehicle(newVeh)
                          setShowAddVal(false)
                          setNewVeh({ type: 'car', plate_number: '', nickname: '' })
                          // It will automatically select because we didn't wire the exact ID, but let's assume user clicks it.
                        }} className="flex-[2] py-2 text-xs font-bold bg-primary text-white rounded">Add</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {vehicles.length === 0 && <span className="text-xs text-muted">No vehicles added yet.</span>}
                      {vehicles.map(v => (
                        <button key={v.id} onClick={() => setVehicleId(v.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-pill border-2 text-xs font-bold transition-all ${vehicleId===v.id ? 'border-primary bg-orange-50 dark:bg-orange-950 text-primary' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                          {v.type === 'car' ? '🚗' : '🛵'} {v.nickname || 'Unknown'} · {v.plate_number?.toUpperCase()}
                          {v.is_default && <span className="text-warning text-[10px]">★</span>}
                        </button>
                      ))}
                      <button onClick={() => setShowAddVal(true)} className="px-3 py-2 rounded-pill border-2 border-dashed border-gray-300 dark:border-gray-500 text-xs font-bold text-gray-400">
                        + Add Vehicle
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => {
                  if (!currentUser?.phone) navigate('/auth/complete-profile', { state: { returnTo: `/book/${id}` } })
                  else setStep(2)
                }} 
                className="btn-primary"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Price Summary</h2>

              {/* Order summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-card p-4 mb-4">
                <div className="font-extrabold text-gray-900 dark:text-white mb-3">{listing.name}</div>
                {[
                  ['Date', date],
                  ['Time', `${fmt12(startTime)}${duration ? ` · ${duration}hr` : ''}`],
                  isParking && selectedVehicle ? ['Vehicle', `${selectedVehicle.nickname} (${selectedVehicle.plate_number})`] : null,
                  isParking ? ['Pass Type', passType.charAt(0).toUpperCase() + passType.slice(1)] : null,
                ].filter(Boolean).map(([l,v]) => (
                  <div key={l} className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted">{l}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{v}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
                  {[
                    ['Base Cost', formatInr(cost.base)],
                    ['Platform Fee', formatInr(cost.platform)],
                    ['GST (18%)', formatInr(cost.gst)],
                  ].map(([l,v]) => (
                    <div key={l} className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted">{l}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-extrabold text-gray-900 dark:text-white">Total</span>
                    <span className="font-extrabold text-primary text-lg">{formatInr(cost.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="mb-6">
                <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-3">Payment Method</p>
                <div className="payment-opt selected p-4 border-2 border-primary bg-primary/5 rounded-2xl">
                  <span className="text-3xl">💵</span>
                  <div className="flex-1">
                    <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Cash on Arrival</div>
                    <div className="text-xs text-muted">Go to the booking area and pay in cash</div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-muted leading-tight">
                  * By clicking confirm, you agree to show the confirmation code at the counter and pay the exact amount.
                </p>
              </div>

              <button onClick={confirmPay} className="btn-primary py-4 text-base">
                Confirm Booking →
              </button>
            </div>
          )}
        </div>

        <div className="h-20" />
      </div>
    </div>
  )
}
