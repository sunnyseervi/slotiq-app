import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import LocationModal from '../../components/modals/LocationModal'
import { useStore } from '../../store/useStore'
import { formatInr } from '../../lib/mockData'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser, bookings, updateBooking } = useStore()
  const [showLoc, setShowLoc] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)

  const name = currentUser?.name?.split(' ')[0] || 'Host'

  // Real bookings: active or upcoming ones for host view
  const activeBookings   = bookings.filter(b => b.status === 'active')
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming')
  const recentBookings   = bookings.filter(b => b.status === 'completed').slice(0, 5)
  const totalRevenue     = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.amount || 0), 0)

  function handleMarkPaid(e, id) {
    e.stopPropagation()
    updateBooking(id, { status: 'completed', paid: true })
    alert('Cash payment confirmed!')
  }

  return (
    <div className="app-shell">
      <div className="screen-content">
        <TopBar onLocationClick={() => setShowLoc(true)} />

        {/* Greeting */}
        <div className="bg-white dark:bg-gray-800 px-4 pt-4 pb-3">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Hello, {name}! 👋</h1>
          <p className="text-sm text-muted">Host Dashboard</p>
        </div>

        {/* Earnings Card */}
        <div className="mx-4 mt-3 bg-hgreen rounded-2xl p-5">
          <p className="text-white/65 text-xs font-semibold mb-1">Total Revenue (Completed Sessions)</p>
          <p className="text-white text-4xl font-black mb-4">{formatInr(totalRevenue)}</p>
          <div className="flex">
            {[
              [activeBookings.length, 'Active now'],
              [upcomingBookings.length, 'Upcoming'],
              [bookings.filter(b => b.status === 'completed').length, 'Completed'],
            ].map(([v, l], i, arr) => (
              <div key={l} className={`flex-1 ${i < arr.length - 1 ? 'border-r border-white/25 pr-3 mr-3' : ''}`}>
                <div className="text-white font-extrabold text-base">{v}</div>
                <div className="text-white/60 text-[10px] font-semibold mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 mt-3 flex gap-3">
          <button
            onClick={() => navigate('/host/scan')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-sm transition-colors">
            🎫 Scan Customer QR
          </button>
          <button
            onClick={() => navigate('/host/listing/new')}
            className="flex-1 btn-primary text-sm">
            + Add Listing
          </button>
        </div>

        {/* Active Sessions */}
        {activeBookings.length > 0 && (
          <>
            <div className="flex items-center justify-between px-4 mt-4 mb-2">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                Active Sessions
              </h2>
              <span className="text-green-600 text-sm font-bold">{activeBookings.length} live</span>
            </div>
            <div className="flex flex-col gap-2 px-4">
              {activeBookings.map(b => (
                <div key={b.id} className="card p-4 border-l-4 border-green-500">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🟢</div>
                    <div className="flex-1">
                      <div className="font-extrabold text-sm text-gray-900 dark:text-white">{b.listing_name}</div>
                      <div className="text-xs text-muted">Started {b.session_start ? new Date(b.session_start).toLocaleTimeString() : b.start_time}</div>
                    </div>
                    <button onClick={e => handleMarkPaid(e, b.id)}
                      className="text-xs font-extrabold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg">
                      End
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Today's Upcoming */}
        <div className="flex items-center justify-between px-4 mt-4 mb-2">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Upcoming Bookings</h2>
          <span className="text-primary text-sm font-bold">{upcomingBookings.length} bookings</span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted">
            No upcoming bookings. Customers can pre-book your listings.
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-4">
            {upcomingBookings.map((s, i) => (
              <div key={s.id} className="card p-4 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                <div className="flex items-center gap-3">
                  <div className="text-primary font-extrabold text-sm min-w-[60px]">{s.start_time}</div>
                  <div className="flex-1">
                    <div className="font-extrabold text-sm text-gray-900 dark:text-white">{s.listing_name}</div>
                    <div className="text-xs text-muted">{s.pass_type} · {s.booking_date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-gray-900 dark:text-white">{formatInr(s.amount)}</div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950 text-hgreen">
                      confirmed
                    </span>
                  </div>
                </div>
                {expandedRow === i && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 animate-fadeIn text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-muted">Booking ID</span>
                      <span className="font-bold text-gray-700 dark:text-gray-200 font-mono">{s.id}</span>
                    </div>
                    <button onClick={() => navigate('/host/scan')}
                      className="mt-2 w-full py-2 text-xs font-extrabold bg-blue-600 text-white rounded-lg">
                      🎫 Scan This Customer's QR
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="h-24" />
      </div>

      <BottomNav />

      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
