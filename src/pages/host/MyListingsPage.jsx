import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import LocationModal from '../../components/modals/LocationModal'
import { useStore } from '../../store/useStore'

export default function MyListingsPage() {
  const navigate = useNavigate()
  const [showLoc, setShowLoc] = useState(false)
  const { listings, updateListing } = useStore()

  // Filter listings simply to simulate host-owned ones (since we don't have proper owner_id matching strictly on mock data)
  // we'll just show all mock listings that have a host_id or are the "My" listings
  // For the sake of the demo, we will use all listings mapped where you can toggle LIVE status
  
  function toggleLive(id, isLive) {
    updateListing(id, { is_live: !isLive })
  }

  return (
    <div className="app-shell">
      <div className="screen-content">
        <TopBar onLocationClick={() => setShowLoc(true)} />

        <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">My Listings</h1>
          <button onClick={() => navigate('/host/listing/new')} className="bg-primary text-white text-xs font-extrabold px-4 py-2 rounded-pill">
            + Add New
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4 pb-24">
          {listings.map(l => (
            <div key={l.id} className="card p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {l.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">{l.name}</div>
                  <div className="text-xs text-muted mt-0.5">{l.sub} · {l.type}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-extrabold ${l.is_live ? 'text-success' : 'text-gray-400'}`}>
                    {l.is_live ? 'LIVE' : 'PAUSED'}
                  </span>
                  <div
                    className={`toggle${l.is_live ? ' on' : ''}`}
                    onClick={() => toggleLive(l.id, l.is_live)}
                  >
                    <div className="toggle-knob" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Today: {l.today_bk || 0} bookings</span>
                <button 
                  onClick={() => navigate(`/host/listing/edit/${l.id}`)}
                  className="border-2 border-primary text-primary text-xs font-extrabold px-4 py-1.5 rounded-pill"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {/* Empty cta */}
          <button
            onClick={() => navigate('/host/listing/new')}
            className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-card text-sm font-bold text-gray-400 hover:border-primary hover:text-primary transition-colors"
          >
            + Add New Listing
          </button>
        </div>
      </div>

      <BottomNav />
      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
