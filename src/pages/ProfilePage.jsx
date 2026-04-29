import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import BottomNav from '../components/layout/BottomNav'
import LocationModal from '../components/modals/LocationModal'
import { useStore } from '../store/useStore'
import { VEHICLE_TYPES } from '../lib/constants'
import { supabase } from '../lib/supabase'

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
  const {
    currentUser, currentMode, setMode, logout, darkMode, toggleDarkMode,
    notifications, bookings, updateUser, addVehicle, updateVehicle, deleteVehicle
  } = useStore()

  const [showLoc,        setShowLoc]        = useState(false)
  const [showVehicles,   setShowVehicles]   = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showNotifs,     setShowNotifs]     = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)

  const [newVehicle, setNewVehicle] = useState({ type: 'car', nickname: '', plate_number: '', rc_picture: null })

  // Local editable profile state
  const [editForm, setEditForm] = useState({
    name:    currentUser?.name || '',
    phone:   currentUser?.phone || '',
    profile_image: currentUser?.profile_image || '',
  })

  const vehicles = currentUser?.vehicles || []
  const savedCount = (currentUser?.saved_places || []).length
  const bkCount    = bookings.length
  const isHost     = currentUser?.role === 'host'
  const isGuest    = currentUser?.id?.startsWith('guest_')
  const displayName = currentUser?.name || 'Guest User'

  function handleAddVehicle(e) {
    e.preventDefault()
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, newVehicle)
    } else {
      addVehicle(newVehicle)
    }
    setShowAddVehicle(false)
    setEditingVehicle(null)
    setNewVehicle({ type: 'car', nickname: '', plate_number: '', rc_picture: null })
  }

  function handleEditVehicle(v) {
    setEditingVehicle(v)
    setNewVehicle({ ...v })
    setShowAddVehicle(true)
  }

  async function handleSaveProfile(e) {
    e.preventDefault()

    const cleanPhone = editForm.phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      alert('Mobile number must be exactly 10 digits.')
      return
    }

    const updates = {
      name: editForm.name,
      phone: cleanPhone,
      profile_image: editForm.profile_image
    }

    updateUser(updates)

    if (!isGuest) {
      const { error } = await supabase.from('users').update({
        name: updates.name,
        phone: '+91' + updates.phone,
        profile_image: updates.profile_image
      }).eq('id', currentUser.id)
      
      if (error) {
        console.error("Profile Sync Error:", error)
      }
    }

    setShowEditProfile(false)
  }

  async function handleModeSwitch() {
    const next = isHost ? 'user' : 'host'
    setMode(next)
    
    if (!isGuest) {
      await supabase.from('users').update({ role: next }).eq('id', currentUser.id)
    }

    if (next === 'host') {
      navigate('/host/dashboard', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="app-shell">
      <div className="screen-content">
        <TopBar onLocationClick={() => setShowLoc(true)} />

        {/* Profile Header */}
        <div
          className="bg-white dark:bg-gray-800 px-4 py-6 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
          onClick={() => setShowEditProfile(true)}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black flex-shrink-0 overflow-hidden bg-primary"
          >
            {currentUser?.profile_image ? (
              <img src={currentUser.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{displayName[0]?.toUpperCase() || '👤'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-gray-900 dark:text-white text-lg">{displayName}</div>
            {currentUser?.phone
              ? <div className="text-sm text-muted font-bold">+91 {currentUser.phone}</div>
              : <div className="text-sm text-primary font-bold">Tap to complete profile →</div>
            }
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">⭐ Elite Member</span>
              <span className="text-[10px] text-muted font-extrabold uppercase tracking-wider">{bkCount} Bookings</span>
            </div>
          </div>
          <span className="text-gray-300 dark:text-gray-500 text-lg">›</span>
        </div>

        {/* Mode Switch Banner */}
        <div className="px-4 py-3">
          <button
            onClick={handleModeSwitch}
            className={`w-full ${isHost ? 'bg-hgreen' : 'bg-primary'} rounded-3xl p-4 flex items-center justify-between text-white active:opacity-90 shadow-lg shadow-primary/20 transition-all`}
          >
            <div className="text-left">
              <div className="font-black text-sm uppercase tracking-tight">Switch to {isHost ? 'Booking' : 'Host'} Mode</div>
              <div className="text-[10px] text-white/80 font-bold mt-0.5">
                {isHost ? 'Looking for a spot? Switch back!' : 'Earn extra by listing your space'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              {isHost ? '🚗' : '🏠'}
            </div>
          </button>
        </div>

        {/* Settings Sections */}
        <div className="px-4 space-y-4 pb-28">
          {/* Account */}
          <div className="card overflow-hidden">
            <div className="px-4 pt-3 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manage Account</div>
            <SettingsRow icon="🚗" label="Vehicles"  badge={vehicles.length || undefined} onClick={() => setShowVehicles(true)} />
            <SettingsRow icon="❤️" label="Saved Places"  badge={savedCount || undefined}      onClick={() => navigate('/saved')} />
            <SettingsRow icon="📋" label="My Bookings"  badge={bkCount || undefined}          onClick={() => navigate('/bookings')} />
          </div>

          {/* App Settings */}
          <div className="card overflow-hidden">
            <div className="px-4 pt-3 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferences</div>
            <SettingsRow icon="🔔" label="Notifications" badge={notifications.filter(n=>!n.is_read).length || undefined} onClick={() => setShowNotifs(true)} />
            <SettingsRow icon="🌙" label="Dark Mode" value={darkMode ? 'Dark' : 'Light'} toggle toggleOn={darkMode} onToggle={toggleDarkMode} />
            <SettingsRow icon="🌐" label="Language"   value="English" onClick={() => {}} />
          </div>

          {/* support & Legal */}
          <div className="card overflow-hidden">
            <div className="px-4 pt-3 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Support & Legal</div>
            <SettingsRow icon="❓" label="Help & Support" onClick={() => navigate('/helpdesk')} />
            <SettingsRow icon="📜" label="Terms & Conditions" onClick={() => alert('Terms & Conditions coming soon!')} />
            <SettingsRow icon="🚪" label="Logout" danger onClick={() => { if(window.confirm('Are you sure you want to logout?')) { logout(); navigate('/', { replace: true }) } }} />
          </div>
          
          <div className="text-center py-4">
            <div className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">SlotIQ v2.0.4 Premium</div>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* ── Edit Profile Sheet ── */}
      {showEditProfile && (
        <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="modal-sheet p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Profile Info</h3>
              <button onClick={() => setShowEditProfile(false)} className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl">
                  {editForm.profile_image ? (
                    <img src={editForm.profile_image} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                  <input
                    type="file" accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0]
                      if(file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setEditForm({ ...editForm, profile_image: reader.result })
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="mt-2 text-[10px] font-black text-primary uppercase tracking-wider">Change Photo</div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text" required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Sunil Seervi"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mobile Number (Required)</label>
                <div className="flex gap-3">
                  <div className="px-4 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl text-sm font-black text-gray-500">+91</div>
                  <input
                    type="tel" required maxLength={10}
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="9876543210"
                    className="flex-1 px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-black uppercase tracking-wider">Cancel</button>
                <button type="submit" className="flex-[2] py-4 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/20">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Vehicles Sheet ── */}
      {showVehicles && (
        <div className="modal-overlay" onClick={() => setShowVehicles(false)}>
          <div className="modal-sheet p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">My Garage</h3>
              <button onClick={() => setShowVehicles(false)} className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>

            <div className="space-y-3 mb-6">
              {vehicles.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🚗</div>
                  <div className="text-sm font-bold text-gray-400">No vehicles added yet</div>
                </div>
              )}
              {vehicles.map(v => {
                const vType = VEHICLE_TYPES.find(t => t.value === v.type)
                return (
                  <div key={v.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-transparent hover:border-primary/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center text-2xl shadow-sm">
                      {vType?.emoji || '🚗'}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-gray-900 dark:text-white text-sm">{v.nickname || vType?.label || 'Vehicle'}</div>
                      <div className="text-[10px] text-muted font-black tracking-widest uppercase">{v.plate_number}</div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditVehicle(v)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs">✎</button>
                      <button onClick={() => { if(window.confirm('Delete this vehicle?')) deleteVehicle(v.id) }} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs">✕</button>
                    </div>
                  </div>
                )
              })}
            </div>

            {!showAddVehicle ? (
              <button onClick={() => setShowAddVehicle(true)} className="btn-primary py-4 text-sm font-black uppercase tracking-wider">+ Add New Vehicle</button>
            ) : (
              <form onSubmit={handleAddVehicle} className="animate-slideUp p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-primary/20 space-y-4">
                <div className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-tight">{editingVehicle ? 'Edit Vehicle' : 'New Vehicle'}</div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Type</label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {VEHICLE_TYPES.map(v => (
                      <button key={v.value} type="button"
                        onClick={() => setNewVehicle({...newVehicle, type: v.value})}
                        className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all border-2 ${newVehicle.type === v.value ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-500'}`}
                      >
                        {v.emoji} {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Plate No.</label>
                    <input required value={newVehicle.plate_number}
                      onChange={e => setNewVehicle({...newVehicle, plate_number: e.target.value.toUpperCase()})}
                      placeholder="KA 01 AB 1234"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nickname</label>
                    <input value={newVehicle.nickname}
                      onChange={e => setNewVehicle({...newVehicle, nickname: e.target.value})}
                      placeholder="My Ride"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">RC Picture</label>
                  <input type="file" accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0]
                      if(file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setNewVehicle({...newVehicle, rc_picture: reader.result})
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full text-[10px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowAddVehicle(false); setEditingVehicle(null) }} className="flex-1 py-3 rounded-2xl bg-white dark:bg-gray-700 text-gray-500 text-xs font-black uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="flex-[2] py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20">{editingVehicle ? 'Update' : 'Add'} Vehicle</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Notifications Sheet ── */}
      {showNotifs && (
        <div className="modal-overlay" onClick={() => setShowNotifs(false)}>
          <div className="modal-sheet p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Alerts</h3>
              <button onClick={() => setShowNotifs(false)} className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 flex items-center justify-center">✕</button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
              {notifications.length === 0 && <div className="text-center text-sm text-muted py-10 font-bold">No updates yet</div>}
              {notifications.map(n => (
                <div key={n.id} className={`flex gap-4 p-4 rounded-3xl ${n.is_read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-orange-50 dark:bg-orange-950/30'}`}>
                  <span className="text-2xl">
                    {n.type === 'booking_confirmed' ? '🎉' : n.type === 'session_reminder' ? '⏰' : n.type === 'host_booking' ? '💰' : '📣'}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-black text-gray-900 dark:text-white">{n.title}</div>
                    <div className="text-[11px] text-muted font-bold mt-0.5 leading-relaxed">{n.body}</div>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
