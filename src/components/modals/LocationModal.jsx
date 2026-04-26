import React, { useState } from 'react'
import { useStore } from '../../store/useStore'
import { LOCATIONS } from '../../lib/mockData'

export default function LocationModal({ onClose }) {
  const { selectedCity, selectedArea, setLocation, activeLocations } = useStore()
  const [city, setCity] = useState(selectedCity)
  const [search, setSearch] = useState('')

  // Filter available cities based on admin settings
  const availableCities = LOCATIONS.cities.filter(c => activeLocations?.cities?.[c])
  
  // Auto-switch city if the currently selected city is disabled
  React.useEffect(() => {
    if (!availableCities.includes(city) && availableCities.length > 0) {
      setCity(availableCities[0])
    }
  }, [availableCities, city])

  const areas = (LOCATIONS.areas[city] || []).filter(a => {
    // Check if area matches search AND is active in admin settings
    const matchesSearch = a.toLowerCase().includes(search.toLowerCase())
    const isActive = activeLocations?.areas?.[city]?.[a]
    return matchesSearch && isActive
  })

  function handleArea(area) {
    setLocation(city, area)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet p-5" onClick={e => e.stopPropagation()}>
        {/* Handle bar */}
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Change Location</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">✕</button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2.5 mb-4">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search area or city..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>

        {/* City pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          {availableCities.length === 0 && <span className="text-sm text-gray-500">No active cities available.</span>}
          {availableCities.map(c => (
            <button
              key={c}
              onClick={() => { setCity(c); setSearch('') }}
              className={`flex-shrink-0 px-4 py-2 rounded-pill text-sm font-bold transition-all border-2 ${
                city === c
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Areas */}
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
          Areas in {city}
        </p>

        <button
          onClick={() => handleArea('Current Location')}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-card border-2 text-sm font-bold transition-all mb-3 ${
            selectedArea === 'Current Location' && selectedCity === city
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary'
          }`}
        >
          <span className="text-lg">📍</span> Use GPS (Current Location)
        </button>

        <div className="grid grid-cols-2 gap-2.5 pb-4">
          {areas.length === 0 && <span className="text-sm text-gray-500 col-span-2">No active areas found in {city}.</span>}
          {areas.map(a => (
            <button
              key={a}
              onClick={() => handleArea(a)}
              className={`flex items-center gap-2 p-3 rounded-card border-2 text-sm font-bold text-left transition-all ${
                selectedArea === a && selectedCity === city
                  ? 'border-primary bg-orange-50 dark:bg-orange-950 text-primary'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary'
              }`}
            >
              <span className="text-primary">📍</span> {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
