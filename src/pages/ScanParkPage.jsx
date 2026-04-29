/**
 * ScanParkPage — Customer Walk-In QR Flow
 *
 * LOCATION QR handles BOTH entry and exit.
 * If no active session → entry (start)
 * If active session exists → exit (end + price + pay)
 *
 * Phases: idle → confirm_vehicle → active → payment → done
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { useStore } from '../store/useStore'
import { formatInr } from '../lib/utils'
import { calculateFromTimes } from '../lib/pricingEngine'
import { makeLocationQR, handleLocationScan } from '../lib/qrEngine'
import { Html5QrcodeScanner } from 'html5-qrcode'

// ── Rates (in future, come from listing) ──────────────────────
const RATES  = { hourly: 20, daily: 200 }
const CONFIG = { gracePeriodMins: 10, minChargeMins: 30, minChargePrice: 20 }

// ── Simulated location QR content ────────────────────────────
const DEMO_LOCATION_QR = makeLocationQR({ location_id: 'LOC-DEMO-01', spot_id: 'S12' })
const DEMO_LOCATION_NAME = 'Downtown Parking Hub · S12'

function fmtDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map(x => String(x).padStart(2, '0')).join(':')
}

function fmtHuman(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h === 0 && m === 0) return 'Just started'
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

export default function ScanParkPage() {
  const navigate = useNavigate()
  const {
    vehicles,
    activeSession,
    startSession,
    endSession,
    bookings,
    activateBookingSession
  } = useStore()

  const activePrebooking = bookings.find(b => b.status === 'active')
  const hasActiveSession = !!activeSession || !!activePrebooking

  // ── Phase management ──────────────────────────────────────
  // 'scan_entry'   — show QR scanner (entry)
  // 'pick_vehicle' — select which vehicle before starting
  // 'active'       — session running, live timer
  // 'scan_exit'    — show QR scanner (exit)
  // 'payment'      — show final bill
  const [phase, setPhase] = useState(() => hasActiveSession ? 'active' : 'scan_entry')

  // ── Live timer ────────────────────────────────────────────
  const [elapsed, setElapsed]     = useState(0)
  const [pricing, setPricing]     = useState(null)
  const startTimeRef              = useRef(null)
  const timerRef                  = useRef(null)
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '')
  const [finalPricing, setFinalPricing] = useState(null)

  // ── Restore running session on mount ─────────────────────
  useEffect(() => {
    if (activeSession?.status === 'active') {
      startTimeRef.current = new Date(activeSession.start_time)
      setPhase('active')
    } else if (activePrebooking) {
      startTimeRef.current = new Date(activePrebooking.session_start || activePrebooking.start_time)
      setPhase('active')
    }
  }, [])

  // ── Recalculate price ──────────────────────────────────────
  const recalculate = useCallback((elapsedSecs) => {
    const start = startTimeRef.current || new Date()
    const result = calculateFromTimes({
      startTime: start,
      endTime: new Date(start.getTime() + elapsedSecs * 1000),
      rates: RATES,
      config: CONFIG,
    })
    setPricing(result)
    return result
  }, [])

  // ── Live ticker ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'active') return
    // Sync elapsed with real session start
    if (activeSession?.start_time && startTimeRef.current) {
      const alreadyElapsed = Math.floor(
        (Date.now() - new Date(activeSession.start_time).getTime()) / 1000
      )
      setElapsed(alreadyElapsed)
      recalculate(alreadyElapsed)
    }
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1
        recalculate(next)
        return next
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // ── Real Camera Scanner ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'scan_entry' && phase !== 'scan_exit') return

    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [0] // Camera only
    })

    scanner.render(
      (decodedText) => {
        scanner.clear()
        handleScan(decodedText)
      },
      (error) => {
        // Just log errors, don't alert as it happens every frame if no QR
      }
    )

    return () => {
      scanner.clear().catch(e => console.warn('Scanner cleanup failed', e))
    }
  }, [phase])

  // ── Demo fast-forward ──────────────────────────────────────
  function fastForward(hours) {
    setElapsed(prev => {
      const next = prev + hours * 3600
      recalculate(next)
      return next
    })
  }

  // ─────────────────────────────────────────────────────────
  // SCAN HANDLER — LOCATION QR (entry & exit)
  // Called both from "scan_entry" and "scan_exit" phases
  // ─────────────────────────────────────────────────────────
  function handleScan(rawQR) {
    const upcomingBookings = bookings.filter(b => b.status === 'upcoming')
    const result = handleLocationScan({ qr: rawQR, hasActiveSession, upcomingBookings })

    if (result.action === 'ERROR') {
      alert('QR Error: ' + result.message)
      return
    }

    if (result.action === 'ACTIVATE_PREBOOK') {
      activateBookingSession(result.bookingId)
      startTimeRef.current = new Date()
      setPhase('active')
      alert('Pre-booking activated automatically!')
      return
    }

    if (result.action === 'START_WALKIN') {
      // Show vehicle picker before actually starting
      setPhase('pick_vehicle')
    }

    if (result.action === 'END_SESSION') {
      // End session immediately
      doEndSession()
    }
  }

  function confirmStartSession() {
    if (!vehicleId) { alert('Please select a vehicle first'); return }
    startTimeRef.current = new Date()
    startSession({
      locationId: 'LOC-DEMO-01',
      spotId: 'S12',
      vehicleId,
      locationName: DEMO_LOCATION_NAME,
    })
    setElapsed(0)
    setPhase('active')
  }

  function doEndSession() {
    clearInterval(timerRef.current)
    const start = startTimeRef.current || (activeSession ? new Date(activeSession.start_time) : (activePrebooking ? new Date(activePrebooking.session_start || activePrebooking.start_time) : new Date()))
    const endTime = new Date()
    const result = calculateFromTimes({
      startTime: start,
      endTime,
      rates: RATES,
      config: CONFIG,
    })
    const platformFee = 10
    const gst = Math.round((result.totalCost + platformFee) * 0.18)
    const grand = result.totalCost + platformFee + gst
    setFinalPricing({ ...result, platformFee, gst, grandTotal: grand })
    setPhase('payment')
  }

  function confirmPayment() {
    if (activePrebooking) {
      // Update the prebooking
      useStore.getState().completeBookingSession({ 
        bookingId: activePrebooking.id, 
        pricingResult: finalPricing, 
        grandTotal: finalPricing?.grandTotal || 0 
      })
    } else {
      endSession({ pricingResult: finalPricing, grandTotal: finalPricing?.grandTotal || 0 })
    }
    navigate('/bookings')
  }

  const selectedVehicle = vehicles.find(v => v.id === (vehicleId || activeSession?.vehicle_id))
  const bd = finalPricing?.breakdown || {}

  // ════════════════════════════════════════════════════════
  return (
    <div className="app-shell">
      <div className="screen-content flex flex-col bg-white dark:bg-gray-900">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <button onClick={() => navigate(-1)} className="text-gray-500 font-bold text-lg">←</button>
          <h1 className="font-extrabold text-gray-900 dark:text-white flex-1">
            {phase === 'active' ? '🟢 Parking Active' : phase === 'payment' ? '🧾 Session Complete' : '📷 Scan & Park'}
          </h1>
          {phase === 'active' && (
            <span className="text-[10px] font-extrabold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>

        {/* ══ PHASE: SCAN ENTRY ══════════════════════════════ */}
        {(phase === 'scan_entry' || phase === 'scan_exit') && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">

            {phase === 'scan_exit' && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 w-full rounded-xl p-3 text-center">
                <div className="text-sm font-extrabold text-orange-700 dark:text-orange-400">
                  Scan the parking QR code to exit and get your bill
                </div>
              </div>
            )}

            {/* Real Camera viewfinder */}
            <div className="relative w-full max-w-[320px] aspect-square overflow-hidden rounded-3xl border-4 border-primary shadow-2xl bg-black">
              <div id="reader" className="w-full h-full"></div>
              
              {/* Overlay guides */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl m-4" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl m-4" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl m-4" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl m-4" />
                
                {/* Scanning line animation */}
                <div className="absolute inset-x-8 h-0.5 bg-primary/80 blur-[1px] animate-scan" style={{ top: '50%' }} />
              </div>
            </div>

            <p className="text-sm text-muted text-center">
              Point camera at the <strong>Parking Location QR</strong> at the gate or spot
            </p>

            {/* Demo simulate scan button */}
            <div className="w-full flex flex-col gap-2">
              <div className="text-[10px] text-center text-muted font-semibold uppercase tracking-wide">Demo — Simulate Scan</div>
              <button
                onClick={() => handleScan(DEMO_LOCATION_QR)}
                className="btn-primary"
              >
                📷 {phase === 'scan_exit' ? 'Simulate Exit Scan' : 'Simulate Entry Scan'}
              </button>
              {phase === 'scan_exit' && (
                <button onClick={() => setPhase('active')} className="btn-outline text-sm">
                  ← Back to Session
                </button>
              )}
            </div>

            {/* Pricing info */}
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-muted">Rate</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">₹{RATES.hourly}/hr</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-muted">Daily max</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">₹{RATES.daily}/day</span>
              </div>
              <div className="text-green-700 dark:text-green-400 font-bold text-center mt-1.5">
                🛡️ You will never pay more than ₹{RATES.daily}/day
              </div>
            </div>
          </div>
        )}

        {/* ══ PHASE: PICK VEHICLE ════════════════════════════ */}
        {phase === 'pick_vehicle' && (
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">QR Detected</h2>
              <p className="text-sm text-muted mt-1">{DEMO_LOCATION_NAME}</p>
            </div>

            {/* Pricing banner */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-5 text-xs font-bold text-green-700 dark:text-green-400 text-center">
              🛡️ Smart cap active — max ₹{RATES.daily}/day · ₹{RATES.hourly}/hr
            </div>

            <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2">Select Your Vehicle</p>

            {vehicles.length === 0 ? (
              <div className="text-sm text-red-500 font-bold border border-red-200 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
                ⚠️ No vehicles found. Add a vehicle in Profile first.
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-5">
                {vehicles.map(v => (
                  <button key={v.id} onClick={() => setVehicleId(v.id)}
                    className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all ${
                      vehicleId === v.id ? 'border-primary bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-600'
                    }`}>
                    <span className="text-2xl">{v.type === 'car' ? '🚗' : '🛵'}</span>
                    <div className="text-left">
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{v.nickname || 'My Vehicle'}</div>
                      <div className="text-xs text-muted font-bold">{v.plate_number}</div>
                    </div>
                    {vehicleId === v.id && <span className="ml-auto text-primary font-black">✓</span>}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={confirmStartSession}
              disabled={!vehicleId}
              className={`btn-primary ${!vehicleId ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              🚗 Start Parking Session
            </button>
          </div>
        )}

        {/* ══ PHASE: ACTIVE SESSION ══════════════════════════ */}
        {phase === 'active' && (
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">

            {/* Location + vehicle pill */}
            <div className="text-center">
              <div className="text-sm text-muted">Parked at</div>
              <div className="font-extrabold text-gray-900 dark:text-white">{activeSession?.location_name || DEMO_LOCATION_NAME}</div>
              {selectedVehicle && (
                <div className="text-xs text-muted mt-0.5">
                  {selectedVehicle.type === 'car' ? '🚗' : '🛵'} {selectedVehicle.nickname} · {selectedVehicle.plate_number}
                </div>
              )}
            </div>

            {/* Live cost card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 relative">

              {/* Fast-forward (demo only) */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => fastForward(1)}
                  className="bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400 px-2 py-1 rounded">+1hr</button>
                <button onClick={() => fastForward(24)}
                  className="bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400 px-2 py-1 rounded">+24hr</button>
              </div>

              {/* Timer */}
              <div className="text-center mb-3">
                <div className="text-5xl font-black text-gray-900 dark:text-white font-mono tracking-wider">
                  {fmtDuration(elapsed)}
                </div>
                <div className="text-xs text-muted mt-1">{fmtHuman(elapsed)}</div>
              </div>

              {/* Cost */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 text-center">
                <div className="text-4xl font-black text-primary">{formatInr(pricing?.totalCost ?? 0)}</div>
                <div className="text-xs text-muted mt-0.5">Current charge (excl. fees)</div>
              </div>

              {/* Status message */}
              {pricing && (
                <div className={`mt-3 text-xs font-bold text-center px-3 py-2 rounded-lg ${
                  pricing.appliedCap === 'grace' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : pricing.appliedCap ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                }`}>
                  {(pricing.appliedCap === 'daily' || pricing.appliedCap === 'multi-day') && '🛡️ '}
                  {pricing.message}
                </div>
              )}

              {/* Breakdown */}
              {pricing && (pricing.breakdown?.fullDays > 0 || pricing.breakdown?.remainingHours > 0) && (
                <div className="mt-3 bg-white dark:bg-gray-700/50 rounded-xl p-3 text-xs">
                  <div className="text-[10px] font-extrabold text-muted uppercase tracking-wide mb-2">Breakdown</div>
                  {pricing.breakdown.fullDays > 0 && (
                    <div className="flex justify-between mb-1">
                      <span className="text-muted">{pricing.breakdown.fullDays} day{pricing.breakdown.fullDays > 1 ? 's' : ''}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{formatInr(pricing.breakdown.dayCost)}</span>
                    </div>
                  )}
                  {pricing.breakdown.remainingHours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted">{pricing.breakdown.remainingHours} hr extra</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{formatInr(pricing.breakdown.remainingCost)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Protection note */}
            <div className="text-[11px] text-center text-gray-400 dark:text-gray-500">
              🔒 Daily cap ₹{RATES.daily} — you will never overpay
            </div>

            {/* Exit buttons */}
            <div className="flex flex-col gap-2">
              <button onClick={() => setPhase('scan_exit')}
                className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-extrabold text-base transition-colors">
                📷 Scan Exit QR to End Parking
              </button>
              <button onClick={doEndSession}
                className="w-full py-3 rounded-2xl border-2 border-red-400 text-red-500 font-extrabold text-sm">
                ⏹ End Without Scan (Manual Exit)
              </button>
            </div>
          </div>
        )}

        {/* ══ PHASE: PAYMENT SUMMARY ═════════════════════════ */}
        {phase === 'payment' && finalPricing && (
          <div className="flex-1 p-5 overflow-y-auto">

            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🧾</div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Session Complete</h2>
              <p className="text-sm text-muted">{activeSession?.location_name || DEMO_LOCATION_NAME}</p>
            </div>

            {/* Cap banner */}
            {finalPricing.appliedCap && finalPricing.appliedCap !== 'grace' && finalPricing.appliedCap !== 'minimum' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 flex items-start gap-2">
                <span className="text-lg">🛡️</span>
                <div>
                  <div className="text-xs font-extrabold text-green-700 dark:text-green-400">Smart Pricing Protected</div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-0.5">{finalPricing.message}</div>
                </div>
              </div>
            )}

            {/* Bill card */}
            <div className="card p-4 mb-4">
              <div className="text-xs font-extrabold text-muted uppercase tracking-wide mb-3">Bill Breakdown</div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Duration</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{fmtHuman(elapsed)}</span>
              </div>

              {bd.fullDays > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">{bd.fullDays} day{bd.fullDays > 1 ? 's' : ''} × ₹{RATES.daily}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{formatInr(bd.dayCost)}</span>
                </div>
              )}
              {bd.remainingHours > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">
                    {bd.remainingHours} hr
                    {bd.remainingCost < bd.remainingHours * RATES.hourly ? ' (capped)' : ` × ₹${RATES.hourly}`}
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{formatInr(bd.remainingCost)}</span>
                </div>
              )}
              {bd.fullDays === 0 && bd.remainingHours === 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Parking charge</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{formatInr(finalPricing.totalCost)}</span>
                </div>
              )}

              <div className="border-t border-dashed border-gray-200 dark:border-gray-600 my-2" />
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Platform fee</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{formatInr(finalPricing.platformFee)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">GST 18%</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{formatInr(finalPricing.gst)}</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between">
                <span className="font-extrabold text-gray-900 dark:text-white">Grand Total</span>
                <span className="font-extrabold text-primary text-xl">{formatInr(finalPricing.grandTotal)}</span>
              </div>
            </div>

            {selectedVehicle && (
              <div className="text-xs text-muted mb-4">
                🚗 {selectedVehicle.nickname} · {selectedVehicle.plate_number}
              </div>
            )}

            <button onClick={confirmPayment} className="btn-primary mb-3 py-4 text-base">
              💳 Pay {formatInr(finalPricing.grandTotal)} &amp; Finish
            </button>
            <button onClick={() => navigate('/')} className="btn-outline">Back to Home</button>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scan {
            0%, 100% { transform: translateY(-120px); opacity: 0; }
            50% { transform: translateY(120px); opacity: 1; }
          }
          .animate-scan {
            animation: scan 3s linear infinite;
          }

          #reader {
            border: none !important;
            background: black !important;
          }
          #reader video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 20px !important;
          }
          #reader__dashboard_section_csr button {
            background: #F5620F !important;
            color: white !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 12px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            margin: 15px 0 !important;
            box-shadow: 0 4px 12px rgba(245, 98, 15, 0.3) !important;
          }
          #reader__status_span {
            display: none !important;
          }
          #reader__scan_region {
            background: transparent !important;
          }
        `}} />
      </div>
    </div>
  )
}
