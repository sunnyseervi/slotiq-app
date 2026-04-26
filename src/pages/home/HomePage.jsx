import React, { useState } from 'react'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import LocationModal from '../../components/modals/LocationModal'
import ParkingTab from './ParkingTab'
import SportsTab from './SportsTab'
import DiscoverTab from './DiscoverTab'
import { useStore } from '../../store/useStore'

const TABS = [
  { id: 'parking',  label: 'Parking',  icon: '🅿️' },
  { id: 'sports',   label: 'Sports',   icon: '🏃' },
  { id: 'discover', label: 'Discover', icon: '🔍' },
]

export default function HomePage() {
  const { homeTab, setHomeTab, sections } = useStore()
  const [showLoc, setShowLoc] = useState(false)

  // Filter tabs based on admin settings
  const activeTabs = TABS.filter(tab => {
    if (tab.id === 'parking') return sections.parking
    if (tab.id === 'sports') return sections.sports
    if (tab.id === 'discover') return sections.discovery
    return true
  })

  // Ensure current tab is valid
  React.useEffect(() => {
    if (activeTabs.length > 0 && !activeTabs.find(t => t.id === homeTab)) {
      setHomeTab(activeTabs[0].id)
    }
  }, [sections, activeTabs, homeTab, setHomeTab])

  return (
    <div className="app-shell">
      <div className="screen-content">
        <TopBar onLocationClick={() => setShowLoc(true)} />

        {/* Category tabs */}
        <div className="flex gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          {activeTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setHomeTab(tab.id)}
              className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-pill text-sm font-bold border-2 transition-all ${
                homeTab === tab.id
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          {activeTabs.length === 0 && (
            <div className="text-xs font-bold text-muted p-2">All services are currently offline for maintenance.</div>
          )}
        </div>

        {homeTab === 'parking'  && sections.parking && <ParkingTab />}
        {homeTab === 'sports'   && sections.sports && <SportsTab />}
        {homeTab === 'discover' && sections.discovery && <DiscoverTab />}
      </div>

      <BottomNav />

      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
