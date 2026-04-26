/**
 * HostScanPage — Host scans BOOKING QR from customer
 *
 * Flow:
 *  1. Host clicks "Scan Customer QR"
 *  2. App shows simulated QR scanner
 *  3. System reads BOOKING QR → validates booking
 *  4. Host confirms → session starts
 *  5. Option: manually end session from here
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { formatInr } from '../../lib/mockData'
import { handleBookingQRScan } from '../../lib/qrEngine'

export default function HostScanPage() {
  const navigate = useNavigate()
  const { bookings, activateBookingSession, updateBooking } = useStore()

  const [phase, setPhase]     = useState('scan')   // scan | confirm | active | done
  const [scanned, setScanned] = useState(null)     // { booking, action }
  const [error, setError]     = useState('')

  // ── Demo: find an upcoming booking to simulate scanning ──────
  const upcomingBooking = bookings.find(b => b.status === 'upcoming')

  function simulateScan() {
    setError('')
    if (!upcomingBooking) {
      setError('No upcoming bookings found to scan. Ask customer to pre-book first.')
      return
    }
    // Simulate scanning the customer's BOOKING QR
    const demoQR = JSON.stringify({
      type: 'BOOKING',
      booking_id: upcomingBooking.id,
      user_id: upcomingBooking.user_id || 'USR-001',
      expiry_time: new Date(Date.now() + 3600000).toISOString(), // 1hr from now
    })
    const result = handleBookingQRScan({ qr: demoQR, bookings })
    if (result.action === 'ERROR') {
      setError(result.message)
      return
    }
    setScanned(result)
    setPhase('confirm')
  }

  function confirmStart() {
    if (!scanned?.booking) return
    activateBookingSession(scanned.booking.id)
    setPhase('active')
  }

  function endSession() {
    if (!scanned?.booking) return
    updateBooking(scanned.booking.id, { status: 'completed', session_end: new Date().toISOString() })
    setPhase('done')
  }

  const b = scanned?.booking

  return (
    <div className="app-shell">
      <div className="screen-content flex flex-col bg-white dark:bg-gray-900">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => navigate(-1)} className="text-gray-500 font-bold text-lg">←</button>
          <h1 className="font-extrabold text-gray-900 dark:text-white">Scan Customer QR</h1>
        </div>

        {/* ═══ SCAN PHASE ════════════════════════════════════ */}
        {phase === 'scan' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">

            {/* Role clarification */}
            <div className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-center">
              <div className="text-xs font-extrabold text-blue-700 dark:text-blue-400 mb-1">HOST MODE — BOOKING QR ONLY</div>
              <div className="text-xs text-blue-600 dark:text-blue-500">
                Scan the <strong>QR code shown in the customer's app</strong> to verify and start their session.
              </div>
            </div>

            {/* QR viewfinder */}
            <div className="w-56 h-56 border-4 border-blue-500 rounded-2xl flex items-center justify-center relative bg-gray-50 dark:bg-gray-800">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
              <div className="text-center">
                <div className="text-4xl mb-2">🎫</div>
                <div className="text-xs text-muted font-semibold">Awaiting booking QR…</div>
              </div>
            </div>

            {error && (
              <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm font-bold text-red-600 dark:text-red-400 text-center">
                ⚠️ {error}
              </div>
            )}

            <div className="w-full flex flex-col gap-2">
              <div className="text-[10px] text-center text-muted font-semibold uppercase tracking-wide">Demo — Simulate Customer Scan</div>
              <button onClick={simulateScan} className="btn-primary">
                🎫 Scan Customer Booking QR
              </button>
              {!upcomingBooking && (
                <p className="text-xs text-center text-muted">
                  No upcoming bookings exist yet. Ask customer to pre-book a spot first.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ═══ CONFIRM PHASE ═════════════════════════════════ */}
        {phase === 'confirm' && b && (
          <div className="flex-1 p-5">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Booking QR Verified</h2>
              <div className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">Valid booking found</div>
            </div>

            <div className="card p-4 mb-5">
              <div className="text-xs font-extrabold text-muted uppercase tracking-wide mb-3">Booking Details</div>
              {[
                ['Booking ID', b.id],
                ['Venue', b.listing_name],
                ['Date', b.booking_date],
                ['Time', b.start_time],
                ['Pass Type', b.pass_type],
                ['Amount', formatInr(b.amount)],
              ].filter(([, v]) => v).map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm mb-2 last:mb-0">
                  <span className="text-muted">{l}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{v}</span>
                </div>
              ))}
            </div>

            <button onClick={confirmStart} className="btn-primary mb-3">
              ▶ Start Parking Session
            </button>
            <button onClick={() => { setPhase('scan'); setScanned(null) }} className="btn-outline">
              Cancel
            </button>
          </div>
        )}

        {/* ═══ ACTIVE PHASE (session running) ════════════════ */}
        {phase === 'active' && b && (
          <div className="flex-1 flex flex-col items-center justify-center p-5 gap-4">
            <div className="text-5xl">🟢</div>
            <div className="text-center">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Session Active</h2>
              <p className="text-sm text-muted mt-1">{b.listing_name}</p>
            </div>

            <div className="card p-4 w-full">
              {[
                ['Booking ID', b.id],
                ['Date', b.booking_date],
                ['Session started', new Date().toLocaleTimeString()],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm mb-2 last:mb-0">
                  <span className="text-muted">{l}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{v}</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-muted text-center">
              Customer can exit by scanning the Location QR at the gate.<br />
              Or you can manually end the session below.
            </div>

            <button onClick={endSession}
              className="w-full py-4 rounded-2xl bg-red-500 text-white font-extrabold">
              ⏹ End Session Manually
            </button>
          </div>
        )}

        {/* ═══ DONE ═══════════════════════════════════════════ */}
        {phase === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center p-5 text-center gap-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Session Ended</h2>
            <p className="text-sm text-muted">Booking marked as completed.</p>
            <button onClick={() => navigate('/host/dashboard')} className="btn-primary max-w-xs">
              ← Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
