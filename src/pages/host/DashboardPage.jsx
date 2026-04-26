import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import LocationModal from '../../components/modals/LocationModal'
import { useStore } from '../../store/useStore'
import { MOCK_HOST_SCHEDULE, formatInr } from '../../lib/mockData'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser, updateBooking }  = useStore()
  const [showLoc,        setShowLoc]      = useState(false)
  const [expandedRow,    setExpandedRow]  = useState(null)

  const name = currentUser?.name?.split(' ')[0] || 'Sunil'

  const handleMarkPaid = (e, index) => {
    e.stopPropagation()
    // In a real app, we'd use the booking ID. For mock, we just update the local state or store.
    // Since MOCK_HOST_SCHEDULE is a constant, we'll just alert for now or update store if we can map it.
    window.alert('Cash payment confirmed for this booking!')
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
          <p className="text-white/65 text-xs font-semibold mb-1">Total Earnings (Cash + App)</p>
          <p className="text-white text-4xl font-black mb-4">₹12,450</p>
          <div className="flex">
            {[
              ['47','Bookings/month'],
              ['2','Active listings'],
              ['100%','COD Payment'],
            ].map(([v,l], i, arr) => (
              <div key={l} className={`flex-1 ${i < arr.length-1 ? 'border-r border-white/25 pr-3 mr-3' : ''}`}>
                <div className="text-white font-extrabold text-base">{v}</div>
                <div className="text-white/60 text-[10px] font-semibold mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Listing */}
        <div className="px-4 mt-3">
          <button
            onClick={() => navigate('/host/listing/new')}
            className="btn-primary"
          >
            + ADD NEW LISTING
          </button>
        </div>

        {/* Today's Schedule */}
        <div className="flex items-center justify-between px-4 mt-4 mb-2">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Today's Schedule</h2>
          <span className="text-primary text-sm font-bold">{MOCK_HOST_SCHEDULE.length} bookings</span>
        </div>

        <div className="flex flex-col gap-2 px-4">
          {MOCK_HOST_SCHEDULE.map((s, i) => (
            <div key={i} className="card p-4 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
              <div className="flex items-center gap-3">
                <div className="text-primary font-extrabold text-sm min-w-[60px]">{s.time}</div>
                <div className="flex-1">
                  <div className="font-extrabold text-sm text-gray-900 dark:text-white">{s.customer_name}</div>
                  <div className="text-xs text-muted">{s.vehicle}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-gray-900 dark:text-white">{formatInr(s.amount)}</div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      s.status === 'confirmed'
                        ? 'bg-green-100 dark:bg-green-950 text-hgreen'
                        : 'bg-orange-100 dark:bg-orange-950 text-primary'
                    }`}>{s.status}</span>
                    <button 
                      onClick={(e) => handleMarkPaid(e, i)}
                      className="text-[9px] font-black text-hgreen border border-hgreen px-1.5 py-0.5 rounded uppercase hover:bg-hgreen hover:text-white transition-colors"
                    >
                      Confirm Cash
                    </button>
                  </div>
                </div>
              </div>
              {expandedRow === i && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 animate-fadeIn text-xs text-muted">
                  <div className="flex justify-between mb-1">
                    <span>Listing</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">KickZone Football Ground</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Source</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">App Booking</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="h-24" />
      </div>

      <BottomNav />

      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
