import React from 'react'
import { useStore } from '../../store/useStore'

export default function TopBar({ onLocationClick }) {
  const { selectedArea, selectedCity, darkMode, toggleDarkMode, notifications } = useStore()
  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="top-bar">
      <div className="flex items-center justify-between mb-1">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-black text-primary tracking-tight">Slot</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">IQ</span>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg relative hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Notifications"
          >
            🔔
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                {unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Location */}
      <button
        onClick={onLocationClick}
        className="flex items-center gap-1 text-sm"
      >
        <span className="text-primary">📍</span>
        <span className="font-bold text-primary">{selectedArea}</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">&nbsp;{selectedCity}</span>
        <span className="text-gray-400 text-xs">▾</span>
      </button>
    </div>
  )
}
