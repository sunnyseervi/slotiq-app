import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import BottomNav from '../components/layout/BottomNav'
import LocationModal from '../components/modals/LocationModal'
import { useStore } from '../store/useStore'
import { VEHICLE_TYPES } from '../lib/mockData'

function SettingsRow({ icon, label, value, badge, danger, toggle, toggleOn, onToggle, onClick, chevron = true }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-700 last:border-0 ${onClick ? 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-700' : ''} transition-colors`}
      onClick={onClick}
    >
      <span className="text-xl w-6 text-center flex-shrink-0">{icon}</span>
      <span className={`flex-1 text-sm font-bold ${danger ? 'text-danger' : 'text-gray-800 dark:text-white'}`}>{label}</span>
      {value  && <span className="text-xs font-bold text-muted">{value}</span>}
      {badge  && (
        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">{badge}</div>
      )}
      {toggle && (
        <div className={`toggle${toggleOn ? ' on' : ''}`} onClick={e => { e.stopPropagation(); onToggle && onToggle() }}>
          <div className="toggle-knob" />
        </div>
      )}
      {chevron && !toggle && <span className="text-gray-300 dark:text-gray-500 text-sm">›</span>}
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { currentUser, currentMode, setMode, logout, darkMode, toggleDarkMode, notifications, vehicles, addVehicle, savedSpots, bookings } = useStore()
  const [showLoc, setShowLoc] = useState(false)
  const [showVehicles, setShowVehicles] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showNotifs,   setShowNotifs]   = useState(false)
  
  const [newVehicle, setNewVehicle] = useState({ type: 'car', nickname: '', plate_number: '', rc_picture: null })

  const bkCount = bookings.length
  const savedCount = savedSpots.length
  const isHost = currentMode === 'host'

  function handleAddVehicle(e) {
    e.preventDefault()
    if (!newVehicle.rc_picture) return alert('RC Picture is required')
    addVehicle(newVehicle)
    setShowAddVehicle(false)
    setNewVehicle({ type: 'car', nickname: '', plate_number: '', rc_picture: null })
  }

  function handleModeSwitch() {
    const next = isHost ? 'customer' : 'host'
    setMode(next)
    navigate(next === 'host' ? '/host/dashboard' : '/')
  }

  return (
    <div className="app-shell">
      <div className="screen-content">
        <TopBar onLocationClick={() => setShowLoc(true)} />

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 px-4 py-5 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
            style={{ background: currentUser?.avatar_color || '#F5620F' }}>
            {currentUser?.avatar_initial || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-gray-900 dark:text-white text-lg">{currentUser?.name || 'Sunil Seervi'}</div>
            <div className="text-sm text-muted">{currentUser?.phone || '+91 92575 90511'}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 text-xs font-extrabold px-2.5 py-0.5 rounded-full">⭐ Member</span>
              <span className="text-xs text-muted font-semibold">{bkCount} Bookings</span>
            </div>
          </div>
        </div>

        {/* Mode Switch Banner */}
        <div className="px-4 py-3">
          <button
            onClick={handleModeSwitch}
            className={`w-full ${isHost ? 'bg-hgreen' : 'bg-primary'} rounded-card p-4 flex items-center justify-between text-white active:opacity-90 transition-opacity`}
          >
            <div>
              <div className="font-extrabold text-sm">Switch to {isHost ? 'Customer' : 'Host'} Mode</div>
              <div className="text-xs text-white/75 mt-0.5">
                {isHost ? 'Back to booking mode' : 'List your parking or sports venue'}
              </div>
            </div>
            <span className="text-2xl font-thin">›</span>
          </button>
        </div>

        {/* Settings Sections */}
        <div className="px-4 space-y-3 pb-24">
          {/* Account */}
          <div className="card overflow-hidden">
            <SettingsRow icon="🚗" label="My Vehicles"     badge={vehicles.length} onClick={() => setShowVehicles(true)} />
            <SettingsRow icon="❤️" label="Saved Spots"     badge={savedCount} onClick={() => navigate('/saved')} />
          </div>

          {/* Preferences */}
          <div className="card overflow-hidden">
            <SettingsRow icon="🔔" label="Notifications" badge={notifications.filter(n=>!n.is_read).length || undefined} onClick={() => setShowNotifs(true)} />
            <SettingsRow icon="🌙" label="Dark Mode" value={darkMode ? 'ON' : 'OFF'} toggle toggleOn={darkMode} onToggle={toggleDarkMode} />
            <SettingsRow icon="🌐" label="Language"   value="EN" onClick={() => {}} />
          </div>

          {/* Support */}
          <div className="card overflow-hidden">
            <SettingsRow icon="❓" label="Help & Support" onClick={() => navigate('/helpdesk')} />
            <SettingsRow icon="📜" label="Terms & Privacy" onClick={() => {}} />
            <SettingsRow icon="🚪" label="Logout" danger onClick={() => { logout(); navigate('/auth/login', { replace: true }) }} />
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Vehicles Modal */}
      {showVehicles && (
        <div className="modal-overlay" onClick={() => setShowVehicles(false)}>
          <div className="modal-sheet p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">My Vehicles</h3>
              <button onClick={() => setShowVehicles(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-sm">✕</button>
            </div>
            {vehicles.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-600 rounded-card mb-2">
                <span className="text-2xl">{v.type === 'car' ? '🚗' : '🛵'}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900 dark:text-white">{v.nickname || 'Unknown'}</div>
                  <div className="text-xs text-muted font-bold tracking-widest">{v.plate_number?.toUpperCase()}</div>
                </div>
                {v.is_default && <span className="text-warning text-sm">★ Default</span>}
              </div>
            ))}
            
            {!showAddVehicle ? (
              <button 
                onClick={() => setShowAddVehicle(true)} 
                className="btn-primary mt-3"
              >
                + Add Vehicle
              </button>
            ) : (
              <form onSubmit={handleAddVehicle} className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                <h4 className="text-sm font-bold mb-3 text-gray-800 dark:text-gray-200">New Vehicle</h4>
                
                <label className="block text-xs font-bold text-gray-500 mb-1">Vehicle Type</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {VEHICLE_TYPES.map(v => (
                    <button
                      key={v.value} type="button"
                      onClick={() => setNewVehicle({...newVehicle, type: v.value})}
                      className={`flex-1 min-w-[30%] py-2 rounded-lg text-sm font-bold capitalize border ${newVehicle.type === v.value ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white border-gray-200 dark:border-gray-600'}`}
                    >
                      {v.emoji} {v.label}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-bold text-gray-500 mb-1">Plate Number</label>
                <input 
                  required
                  value={newVehicle.plate_number} onChange={e => setNewVehicle({...newVehicle, plate_number: e.target.value})}
                  className="w-full mb-3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-primary"
                  placeholder="e.g. KA 01 AB 1234"
                />

                <label className="block text-xs font-bold text-gray-500 mb-1">Nickname (Optional)</label>
                <input 
                  value={newVehicle.nickname} onChange={e => setNewVehicle({...newVehicle, nickname: e.target.value})}
                  className="w-full mb-4 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-primary"
                  placeholder="e.g. My Honda City"
                />

                <label className="block text-xs font-bold text-gray-500 mb-1">RC Picture (Required)</label>
                <input 
                  type="file" accept="image/*" required
                  onChange={e => setNewVehicle({...newVehicle, rc_picture: e.target.files[0]})}
                  className="w-full mb-4 text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-primary hover:file:bg-orange-100"
                />

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddVehicle(false)} className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white text-sm font-bold">Cancel</button>
                  <button type="submit" className="flex-[2] py-2 rounded-lg bg-primary text-white text-sm font-bold">Save Vehicle</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifs && (
        <div className="modal-overlay" onClick={() => setShowNotifs(false)}>
          <div className="modal-sheet p-5" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Notifications</h3>
              <button onClick={() => setShowNotifs(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 text-sm flex items-center justify-center">✕</button>
            </div>
            {notifications.map(n => (
              <div key={n.id} className={`flex gap-3 p-3 rounded-xl mb-2 ${n.is_read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-orange-50 dark:bg-orange-950'}`}>
                <span className="text-xl">
                  {n.type === 'booking_confirmed' ? '🎉' : n.type === 'session_reminder' ? '⏰' : n.type === 'host_booking' ? '💰' : n.type === 'payout' ? '🏦' : '📣'}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-extrabold text-gray-900 dark:text-white">{n.title}</div>
                  <div className="text-xs text-muted mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{n.created_at}</div>
                </div>
                {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
