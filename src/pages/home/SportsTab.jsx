import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'


const SPORT_FILTERS = [
  { id: 'all',        label: 'All',        emoji: '⚡' },
  { id: 'football',   label: 'Football',   emoji: '⚽' },
  { id: 'cricket',    label: 'Cricket',    emoji: '🏏' },
  { id: 'badminton',  label: 'Badminton',  emoji: '🏸' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'tennis',     label: 'Tennis',     emoji: '🎾' },
]

const DAY_FILTERS = [
  { id: 'today',   label: 'Today' },
  { id: 'tomorrow',label: 'Tomorrow' },
  { id: 'weekend', label: 'This Weekend' },
]

export default function SportsTab() {
  const navigate   = useNavigate()
  const { listings: storeListings } = useStore()
  const [sport, setSport] = useState('all')
  const [day,   setDay]   = useState('today')
  const [query, setQuery] = useState('')

  const listings = useMemo(() => {
    let all = storeListings.filter(l => l.type === 'sports' && (l.is_live || l.status === 'active'))
    if (sport !== 'all') all = all.filter(l => (l.sub_type || l.subType) === sport)
    if (query) {
      const q = query.toLowerCase()
      all = all.filter(l => l.name.toLowerCase().includes(q) || l.area.toLowerCase().includes(q))
    }
    return all
  }, [sport, query, storeListings])

  function getPrice(l) {
    return l.pricing?.base_rate_per_hour || l.base_rate_per_hour || 500
  }

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="mx-4 mt-3 bg-primary rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/8 rounded-full -translate-y-1/3 translate-x-1/3" />
        <h2 className="text-white text-xl font-black mb-2">Book Your Game,<br/>Own The Court</h2>
        <div className="text-2xl tracking-widest">⚽ 🏏 🎾 🏸</div>
      </div>

      {/* Search */}
      <div className="flex gap-2 px-4 mt-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-pill px-4 py-2.5">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search sports venues..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 font-semibold"
          />
          {query && <button onClick={() => setQuery('')} className="text-gray-400 text-xs">✕</button>}
        </div>
        <button className="bg-primary text-white text-xs font-extrabold px-4 py-2.5 rounded-pill">FILTER</button>
      </div>

      {/* Sport filter chips */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto no-scrollbar pb-1">
        {SPORT_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setSport(f.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-pill border-2 text-xs font-bold transition-all ${
              sport === f.id
                ? 'bg-primary border-primary text-white'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Day filter */}
      <div className="flex gap-2 px-4 mt-2 pb-3 border-b border-gray-100 dark:border-gray-700">
        {DAY_FILTERS.map(d => (
          <button
            key={d.id}
            onClick={() => setDay(d.id)}
            className={`px-4 py-1.5 rounded-pill text-xs font-bold transition-all ${
              day === d.id
                ? 'bg-orange-50 dark:bg-orange-950 text-primary'
                : 'text-gray-400'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Listing cards */}
      <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
        {listings.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-semibold">
            {query ? `No results for "${query}"` : 'No venues available'}
          </div>
        ) : listings.map(l => (
          <div
            key={l.id}
            className="card p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate(`/listing/${l.id}`)}
          >
            <div className="flex gap-3 mb-3">
              <div className="w-14 h-14 bg-pink-50 dark:bg-pink-950 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                {l.thumbnail_emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{l.name}</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span>⭐ {l.rating || '4.8'}</span>
                  <span>·</span>
                  <span>{l.distance_km != null ? l.distance_km : '—'}km</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-hgreen">
                  <div className="w-2 h-2 bg-hgreen rounded-full" />
                  {(l.available_slots ?? l.total_slots ?? '—')} slots {day}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-black text-gray-900 dark:text-white">
                  ₹{(getPrice(l)).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400 font-semibold">/hr</span>
                {l.pricing?.weekend_surge_pct > 0 && day === 'weekend' && (
                  <span className="ml-2 text-[10px] bg-warning/20 text-warning font-extrabold px-2 py-0.5 rounded-full">
                    +{l.pricing.weekend_surge_pct}% wknd
                  </span>
                )}
              </div>
              <button
                className="bg-primary text-white text-xs font-extrabold px-4 py-2.5 rounded-pill"
                onClick={e => { e.stopPropagation(); navigate(`/listing/${l.id}`) }}
              >
                Book Slot →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
