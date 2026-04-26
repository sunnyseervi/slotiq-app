import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MOCK_VEHICLES, formatInr } from '../lib/mockData'

export default function ScanParkPage() {
  const navigate = useNavigate()
  const { currentUser, setActiveBooking } = useStore()

  const [phase, setPhase] = useState('scanning') // scanning | confirm | active | payment
  const [hostName, setHostName] = useState('')
  const [vehicleId, setVehicleId] = useState(MOCK_VEHICLES[0]?.id)
  const [seconds, setSeconds] = useState(0)
  const [cost, setCost] = useState(0)
  const timerRef = useRef(null)

  const RATE_PER_MIN = 0.5 // ₹0.5/min = ₹30/hr

  // Simulate QR scan after 2s
  useEffect(() => {
    if (phase !== 'scanning') return
    const id = setTimeout(() => {
      setHostName("Sunil's Parking")
      setPhase('confirm')
    }, 2000)
    return () => clearTimeout(id)
  }, [phase])

  // Live timer
  useEffect(() => {
    if (phase !== 'active') return
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        const next = s + 1
        setCost(Math.round(next * RATE_PER_MIN))
        return next
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  function startSession() {
    setPhase('active')
    setActiveBooking({ hostName, vehicleId, startTime: new Date() })
  }

  function endSession() {
    clearInterval(timerRef.current)
    setPhase('payment')
  }

  function fmt(s) {
    const h = Math.floor(s/3600)
    const m = Math.floor((s%3600)/60)
    const sec = s%60
    return [h,m,sec].map(x => String(x).padStart(2,'0')).join(':')
  }

  return (
    <div className="app-shell">
      <div className="screen-content flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => navigate(-1)} className="text-gray-500 font-bold">←</button>
          <h1 className="font-extrabold text-gray-900 dark:text-white">Scan &amp; Park</h1>
        </div>

        {/* Scanning */}
        {phase === 'scanning' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-52 h-52 border-4 border-primary rounded-2xl flex items-center justify-center mb-8 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
              <div className="text-center">
                <div className="text-5xl mb-2">📷</div>
                <div className="text-xs text-muted font-semibold">Scanning…</div>
                <div className="mt-2 flex justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce mx-0.5" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce mx-0.5" style={{animationDelay:'0.15s'}} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce mx-0.5" style={{animationDelay:'0.3s'}} />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Point camera at host QR</h2>
            <p className="text-sm text-muted">Demo: auto-scanning in 2 seconds…</p>
          </div>
        )}

        {/* Confirm */}
        {phase === 'confirm' && (
          <div className="flex-1 p-6">
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">QR Scanned!</h2>
                <p className="text-sm text-muted mt-1">Starting session at</p>
                <p className="text-primary font-extrabold text-lg">{hostName}</p>
              </div>

              <div className="mb-5">
                <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Select Vehicle</p>
                <div className="flex flex-col gap-2">
                  {MOCK_VEHICLES.map(v => (
                    <button key={v.id} onClick={() => setVehicleId(v.id)}
                      className={`flex items-center gap-3 p-3 border-2 rounded-card transition-all ${vehicleId===v.id ? 'border-primary bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-600'}`}>
                      <span className="text-2xl">{v.type==='car'?'🚗':'🛵'}</span>
                      <div className="text-left">
                        <div className="font-bold text-sm text-gray-900 dark:text-white">{v.nickname}</div>
                        <div className="text-xs text-muted font-bold tracking-widest">{v.plate_number}</div>
                      </div>
                      {vehicleId===v.id && <span className="ml-auto text-primary">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-card p-3 mb-6 text-xs text-muted">
                💡 Rate: ₹30/hr · Pay on exit based on actual time
              </div>

              <button onClick={startSession} className="btn-primary">
                🚗 Start Parking Session
              </button>
            </div>
          </div>
        )}

        {/* Active Session */}
        {phase === 'active' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-5xl mb-4">🚗</div>
            <div className="text-sm text-muted mb-1">You're parked at</div>
            <div className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">{hostName}</div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 w-full mb-6">
              <div className="text-4xl font-black text-gray-900 dark:text-white tracking-wider mb-2 font-mono">
                {fmt(seconds)}
              </div>
              <div className="text-sm text-muted">Duration</div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-3xl font-black text-primary">{formatInr(cost)}</div>
                <div className="text-xs text-muted mt-1">Running cost (₹30/hr)</div>
              </div>
            </div>

            <button onClick={endSession} className="btn-danger w-full">
              ⏹ End Session &amp; Pay
            </button>
          </div>
        )}

        {/* Payment */}
        {phase === 'payment' && (
          <div className="flex-1 p-6">
            <div className="animate-fadeIn text-center">
              <div className="text-5xl mb-4">🧾</div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Session Summary</h2>

              <div className="card p-4 text-left mb-6">
                {[
                  ['Venue',    hostName],
                  ['Duration', fmt(seconds)],
                  ['Amount',   formatInr(cost)],
                  ['Platform', '₹10'],
                  ['GST 18%',  formatInr(Math.round((cost+10)*0.18))],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-sm mb-2 last:mb-0">
                    <span className="text-muted">{l}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{v}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3 flex justify-between">
                  <span className="font-extrabold text-gray-900 dark:text-white">Total</span>
                  <span className="font-extrabold text-primary text-lg">
                    {formatInr(cost + 10 + Math.round((cost+10)*0.18))}
                  </span>
                </div>
              </div>

              <button onClick={() => { setActiveBooking(null); navigate('/bookings') }} className="btn-primary mb-3">
                💳 Pay &amp; End Session
              </button>
              <button onClick={() => navigate('/')} className="btn-outline">Back to Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
