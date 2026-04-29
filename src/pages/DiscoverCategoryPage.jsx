import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function DiscoverCategoryPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { listings } = useStore()

  const places = useMemo(() => {
    return listings.filter(p => p.type === 'discover' && p.category?.toLowerCase() === category?.toLowerCase())
  }, [category, listings])

  return (
    <div className="app-shell bg-white dark:bg-gray-900">
      <div className="screen-content flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-bold">
            ←
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-gray-900 dark:text-white capitalize">{category} Places</h1>
            <p className="text-xs text-muted">{places.length} verified locations</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20">
          {places.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No {category} found in your area.</div>
          ) : places.map(p => (
            <div key={p.id} className="card overflow-hidden">
              <div className="h-40 flex items-center justify-center relative" style={{ background: p.bg }}>
                <span className="text-6xl">{p.emoji}</span>
                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30">
                  {p.category}
                </div>
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-gray-900 dark:text-white text-base mb-1">{p.name}</div>
                  <div className="text-xs text-muted mb-2 line-clamp-2 leading-relaxed">{p.address}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md">
                      ⭐ {p.rating}
                    </span>
                    {p.is_open
                      ? <span className="text-[10px] font-extrabold text-hgreen bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 px-2 py-1 rounded-md uppercase tracking-wider">Open Now</span>
                      : <span className="text-[10px] font-extrabold text-danger bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-2 py-1 rounded-md uppercase tracking-wider">Closed</span>
                    }
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg hover:bg-primary hover:text-white transition-colors">
                    📍
                  </button>
                  <button className="w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    ❤️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
