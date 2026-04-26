import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_DISCOVER } from '../../lib/mockData'

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurants', count: 20, emoji: '🍽️', badge: 'Open',      badgeCls: 'bg-green-100 text-green-700' },
  { id: 'cafe',       label: 'Cafes',       count: 20, emoji: '☕',  badge: 'Open',      badgeCls: 'bg-green-100 text-green-700' },
  { id: 'bar',        label: 'Bars & Pubs', count: 20, emoji: '🍺',  badge: 'Nightlife', badgeCls: 'bg-purple-100 text-purple-700' },
  { id: 'mall',       label: 'Malls',       count: 15, emoji: '🛍️',  badge: 'Open',      badgeCls: 'bg-green-100 text-green-700' },
]

const UTILS = [
  { id: 'EV',       label: 'EV Charging', emoji: '⚡', count: 18 },
  { id: 'petrol',   label: 'Petrol',      emoji: '⛽', count: 15 },
  { id: 'washroom', label: 'Washrooms',   emoji: '🚻', count: 15 },
  { id: 'ATM',      label: 'ATMs',        emoji: '🏧', count: 16 },
]

export default function DiscoverTab() {
  const navigate = useNavigate()
  const [query,  setQuery]  = useState('')
  const [filter, setFilter] = useState('all')

  const places = useMemo(() => {
    let all = MOCK_DISCOVER
    if (filter !== 'all') all = all.filter(p => p.category === filter)
    if (query) {
      const q = query.toLowerCase()
      all = all.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }
    return all
  }, [filter, query])

  return (
    <div className="pb-6">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-pill px-4 py-2.5 mb-3">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search restaurants, malls, ATMs..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 font-semibold"
          />
          {query && <button onClick={() => setQuery('')} className="text-gray-400 text-xs">✕</button>}
        </div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Bengaluru Discovery</h2>
        <p className="text-xs text-muted">139+ verified places · Reviews · Navigation</p>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-2 bg-navy rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-5xl opacity-30">🌆</div>
        <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">One City Interface</div>
        <div className="text-white text-base font-extrabold leading-snug">
          Restaurants · Cafes · Bars<br/>Malls · ATMs · EV · Petrol · Washrooms
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-3">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => navigate(`/discover/${c.id}`)}
            className={`card p-3 flex items-center gap-3 text-left active:scale-[0.97] transition-all`}
          >
            <span className="text-3xl">{c.emoji}</span>
            <div>
              <div className="text-sm font-extrabold text-gray-900 dark:text-white">{c.label}</div>
              <div className="text-xs text-muted">{c.count} places</div>
              <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${c.badgeCls}`}>
                {c.badge}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Utilities */}
      <div className="flex gap-3 px-4 mt-3 overflow-x-auto no-scrollbar pb-1">
        {UTILS.map(u => (
          <button
            key={u.id}
            onClick={() => navigate(`/discover/${u.id}`)}
            className={`flex-shrink-0 card p-3 text-center min-w-[68px] active:scale-[0.97] transition-all`}
          >
            <div className="text-2xl">{u.emoji}</div>
            <div className="text-[10px] font-extrabold text-gray-700 dark:text-gray-200 mt-1">{u.label}</div>
            <div className="text-[10px] text-muted">{u.count}</div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mx-4 mt-3 bg-navy rounded-card flex justify-around p-4">
        {[['139+','Places'],['⭐ 4.4','Avg Rating'],['24/7','Always On']].map(([v,l]) => (
          <div key={l} className="text-center">
            <div className="text-white font-extrabold text-base">{v}</div>
            <div className="text-white/50 text-[10px] font-semibold">{l}</div>
          </div>
        ))}
      </div>

      {/* Places List */}
      <div className="flex items-center justify-between px-4 mt-4 mb-2">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
          {filter === 'all' ? '⭐ Top Rated Today' : `${CATEGORIES.find(c=>c.id===filter)?.label || filter} near you`}
        </h3>
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} className="text-xs text-primary font-bold">Clear</button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {places.map(p => (
          <div key={p.id} className="card overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
            {/* Photo area */}
            <div className="h-40 flex items-center justify-center relative" style={{ background: p.bg }}>
              <span className="text-6xl">{p.emoji}</span>
              <div className="absolute top-3 left-3 bg-primary text-white text-[11px] font-extrabold px-3 py-1 rounded-full capitalize">
                {p.category}
              </div>
            </div>
            <div className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-gray-900 dark:text-white text-sm mb-0.5">{p.name}</div>
                <div className="text-xs text-muted mb-1.5 line-clamp-1">{p.address}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    ⭐ {p.rating}
                    <span className="text-gray-400 ml-1">({(p.review_count/1000).toFixed(1)}K reviews)</span>
                  </span>
                  {p.is_open
                    ? <span className="text-[10px] font-extrabold text-hgreen bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-full">Open</span>
                    : <span className="text-[10px] font-extrabold text-danger bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">Closed</span>
                  }
                </div>
              </div>
              <button className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                🧭
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
