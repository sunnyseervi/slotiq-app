import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function SavedSpotsPage() {
  const navigate = useNavigate()
  const { savedSpots, toggleSavedSpot, listings } = useStore()

  const savedListings = listings.filter(l => savedSpots.includes(l.id))

  return (
    <div className="app-shell bg-white dark:bg-gray-900">
      <div className="screen-content flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-bold">
            ←
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-gray-900 dark:text-white">Saved Spots & Venues</h1>
            <p className="text-xs text-muted">{savedListings.length} bookmarked places</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20">
          {savedListings.length === 0 ? (
            <div className="text-center text-gray-400 py-10">You haven't saved any spots yet!</div>
          ) : savedListings.map(l => (
            <div 
              key={l.id} 
              className="card overflow-hidden cursor-pointer"
              onClick={() => navigate(`/listing/${l.id}`)}
            >
              <div className="h-40 flex items-center justify-center relative" style={{ background: l.bg || '#F5620F20' }}>
                <span className="text-6xl">{l.thumbnail_emoji}</span>
                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-gray-900 dark:text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30 hidden dark:block">
                  {l.type}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleSavedSpot(l.id); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm"
                >
                  <span className="text-danger leading-none text-lg translate-y-[1px]">❤️</span>
                </button>
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-gray-900 dark:text-white text-base mb-1">{l.name}</div>
                  <div className="text-xs text-muted mb-2 line-clamp-2 leading-relaxed">{l.address} · {l.area}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
