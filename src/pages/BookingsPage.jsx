import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'
import TopBar from '../components/layout/TopBar'
import BottomNav from '../components/layout/BottomNav'
import LocationModal from '../components/modals/LocationModal'
import { useStore } from '../store/useStore'
import { formatInr, formatDate, formatTime } from '../lib/mockData'
import { makeBookingQR } from '../lib/qrEngine'

const FILTER_TABS = ['All', 'Upcoming', 'Active', 'Done', 'Cancelled']

const STATUS_CFG = {
  upcoming:  { label: '✓ Confirmed', cls: 'badge-confirmed' },
  active:    { label: '● Active',    cls: 'badge-active' },
  done:      { label: 'Done',        cls: 'badge-done' },
  completed: { label: 'Completed',   cls: 'badge-done' },
  cancelled: { label: 'Cancelled',   cls: 'badge-cancelled' },
}

export default function BookingsPage() {
  const navigate = useNavigate()
  const { bookings, cancelBooking, currentUser } = useStore()
  const [filter, setFilter]   = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [showLoc, setShowLoc] = useState(false)
  const [showQR, setShowQR]   = useState(null) // booking id

  const filtered = bookings.filter(b =>
    filter === 'All' ? true :
    filter === 'Done' ? (b.status === 'done' || b.status === 'completed') :
    b.status === filter.toLowerCase()
  )

  return (
    <div className="app-shell">
      <div className="screen-content">
        <TopBar onLocationClick={() => setShowLoc(true)} />

        <div className="bg-white dark:bg-gray-800 px-4 pt-4 pb-2">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">My Bookings</h1>
          <p className="text-xs text-muted">{bookings.length} total bookings</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
          {FILTER_TABS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-pill border-2 text-xs font-extrabold transition-all ${
                filter === f
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">No bookings yet</h2>
            <p className="text-sm text-muted mb-6">Start exploring to book your first spot!</p>
            <button onClick={() => navigate('/')} className="btn-primary max-w-xs">Find Parking →</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4 pb-24">
            {filtered.map(b => {
              const s = STATUS_CFG[b.status] || STATUS_CFG.upcoming
              const isExp = expanded === b.id
              const canShowQR = b.status === 'upcoming' || b.status === 'active'
              const isShowingQR = showQR === b.id

              // Generate BOOKING QR payload
              const qrPayload = makeBookingQR({
                booking_id: b.id,
                user_id: currentUser?.id || 'USR-001',
                expiry_time: new Date(Date.now() + 86400000).toISOString(),
              })

              return (
                <div key={b.id} className="card overflow-hidden">
                  <div className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => setExpanded(isExp ? null : b.id)}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      b.type === 'sports' ? 'bg-blue-50 dark:bg-blue-950' : 'bg-orange-50 dark:bg-orange-950'
                    }`}>
                      {b.listing_emoji || (b.pass_type === 'Walk-In' ? '🚗' : '📍')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                        {b.listing_name}
                      </div>
                      <div className="text-xs text-muted flex items-center gap-1">
                        📅 {formatDate(b.booking_date)} · {b.start_time} {b.duration ? `(${b.duration}hr)` : ''}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-extrabold text-primary mb-1.5">
                        {formatInr(b.amount || b.total_cost)}
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExp && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 animate-fadeIn">

                      {/* Booking QR — shown to host for verification */}
                      {canShowQR && (
                        <div className="mb-3">
                          <button
                            onClick={() => setShowQR(isShowingQR ? null : b.id)}
                            className={`w-full py-2 text-xs font-extrabold rounded-xl border-2 transition-all ${
                              isShowingQR
                                ? 'border-primary bg-primary text-white'
                                : 'border-primary text-primary'
                            }`}
                          >
                            {isShowingQR ? '▲ Hide Booking QR' : '🎫 Show Booking QR (for Host Scan)'}
                          </button>

                          {isShowingQR && (
                            <div className="mt-3 flex flex-col items-center gap-2 bg-white dark:bg-gray-100 p-4 rounded-xl border border-gray-200">
                              <QRCode value={qrPayload} size={160} />
                              <div className="text-[10px] text-gray-500 font-bold text-center">
                                Show this QR to the host for entry verification
                              </div>
                              <div className="text-[9px] text-gray-400 font-mono text-center break-all px-2">
                                ID: {b.id}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Conf code */}
                      {(b.conf_code || b.confirmation_code) && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-muted">Confirmation Code</span>
                          <span className="font-extrabold text-primary tracking-widest text-sm">
                            {b.conf_code || b.confirmation_code}
                          </span>
                        </div>
                      )}

                      {/* Vehicle */}
                      {(b.vehicle_plate || b.vehicle_id) && (
                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <span className="text-muted">Vehicle</span>
                          <span className="font-bold text-gray-700 dark:text-gray-200">
                            🚗 {b.vehicle_plate || 'Confirmed'}
                          </span>
                        </div>
                      )}

                      {/* Smart pricing cap badge */}
                      {b.applied_cap && b.applied_cap !== 'grace' && b.applied_cap !== 'minimum' && (
                        <div className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 p-1.5 rounded mb-3 text-center">
                          🛡️ Smart pricing cap applied on this booking
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button className="btn-outline flex-1 text-xs py-2">🧭 Navigate</button>
                        {b.status === 'upcoming' && (
                          <button
                            onClick={() => cancelBooking(b.id)}
                            className="flex-1 text-xs py-2 rounded-pill border-2 border-danger text-danger font-extrabold"
                          >
                            Cancel
                          </button>
                        )}
                        {b.status === 'active' && (
                          <button
                            onClick={() => navigate('/scan')}
                            className="flex-1 text-xs py-2 rounded-pill border-2 border-primary text-primary font-extrabold"
                          >
                            📷 Scan to Exit
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
