import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function SavedSpotsPage() {
  const navigate = useNavigate()
  const { currentUser, toggleSavedPlace, listings } = useStore()

  const savedIds = currentUser?.saved_places || []
  const savedListings = listings.filter(l => savedIds.includes(l.id))

  return (
    <div className="app-shell bg-white dark:bg-gray-900">
      <div className="screen-content flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-bold shadow-sm">
            ←
          </button>
          <div className="flex-1">
            <h1 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">Saved Places</h1>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">{savedListings.length} Bookmarked items</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-20 no-scrollbar">
          {savedListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-10">
              <div className="text-6xl mb-4">❤️</div>
              <div className="text-lg font-black text-gray-900 dark:text-white mb-2">Nothing saved yet</div>
              <p className="text-xs text-muted font-bold leading-relaxed">Bookmarking places makes it easy to find them later for quick bookings.</p>
              <button onClick={() => navigate('/')} className="btn-primary mt-6 px-8">Discover Places</button>
            </div>
          ) : (
            savedListings.map(l => (
              <div 
                key={l.id} 
                className="card overflow-hidden cursor-pointer group hover:scale-[1.01] transition-transform duration-300"
                onClick={() => navigate(`/listing/${l.id}`)}
              >
                <div className="h-44 flex items-center justify-center relative overflow-hidden" style={{ background: l.bg || '#F5620F15' }}>
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{l.thumbnail_emoji}</span>
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/30">
                    {l.type}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSavedPlace(l.id); }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30 active:scale-90 transition-transform"
                  >
                    <span className="text-danger leading-none text-xl translate-y-[1px]">❤️</span>
                  </button>
                </div>
                <div className="p-5 flex items-start justify-between gap-3 bg-white dark:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 dark:text-white text-lg mb-1 leading-tight">{l.name}</div>
                    <div className="text-xs text-muted font-bold mb-3 line-clamp-1 opacity-80">{l.address} · {l.area}</div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Book Now</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{l.sub_type}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary text-xl">›</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
