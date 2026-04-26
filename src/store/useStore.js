import { create } from 'zustand'
import { MOCK_USER, MOCK_NOTIFICATIONS, MOCK_VEHICLES, MOCK_BOOKINGS, MOCK_LISTINGS } from '../lib/mockData'

const stored = (() => {
  try { return JSON.parse(localStorage.getItem('slotiq_state') || '{}') } catch { return {} }
})()

export const useStore = create((set, get) => ({
  // Auth
  isLoggedIn:    stored.isLoggedIn || false,
  currentUser:   stored.currentUser || null,

  // Mode: 'customer' | 'host'
  currentMode:   stored.currentMode || 'customer',

  // Location
  selectedCity:  stored.selectedCity  || 'Bengaluru',
  selectedArea:  stored.selectedArea  || 'Koramangala',

  // Active booking (Scan & Park)
  activeBooking: null,

  // Notifications
  notifications: MOCK_NOTIFICATIONS,

  // Dark mode
  darkMode: stored.darkMode || false,

  // Search query
  searchQuery: '',

  // Home tab
  homeTab: 'parking',

  // ── BUSINESS DATA ────────────────────────────────────
  users:      stored.users || [
    { ...MOCK_USER, status: 'active' }
  ],
  vehicles:   stored.vehicles || [],
  listings:   stored.listings || [],
  bookings:   stored.bookings || [],
  savedSpots: stored.savedSpots || [],
  
  // ── ADMIN SETTINGS ──────────────────────────────────
  sections: stored.sections || {
    parking: true,
    sports: true,
    discovery: true
  },

  // ── ACTIONS ──────────────────────────────────────────

  login(user) {
    const u = user || MOCK_USER
    set({ isLoggedIn: true, currentUser: u, currentMode: u.mode || 'customer' })
    get()._persist()
  },

  logout() {
    localStorage.removeItem('slotiq_state')
    set({ isLoggedIn: false, currentUser: null, currentMode: 'customer' })
  },

  // USER MANAGEMENT
  addUser(user) {
    set(s => ({ users: [...s.users, { ...user, id: 'u-' + Date.now() }] }))
    get()._persist()
  },

  removeUser(id) {
    set(s => ({ users: s.users.filter(u => u.id !== id) }))
    get()._persist()
  },

  updateUser(id, data) {
    set(s => ({ users: s.users.map(u => u.id === id ? { ...u, ...data } : u) }))
    get()._persist()
  },

  setMode(mode) {
    set(s => ({
      currentMode: mode,
      currentUser: s.currentUser ? { ...s.currentUser, mode } : s.currentUser
    }))
    get()._persist()
  },

  setLocation(city, area) {
    set({ selectedCity: city, selectedArea: area })
    get()._persist()
  },

  toggleDarkMode() {
    const next = !get().darkMode
    set({ darkMode: next })
    document.documentElement.classList.toggle('dark', next)
    get()._persist()
  },

  setSearchQuery(q) { set({ searchQuery: q }) },

  setHomeTab(tab) { set({ homeTab: tab }) },

  markNotificationsRead() {
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, is_read: true }))
    }))
  },

  setActiveBooking(booking) { set({ activeBooking: booking }) },

  updateUserField(field, value) {
    set(s => ({
      currentUser: s.currentUser ? { ...s.currentUser, [field]: value } : s.currentUser
    }))
    get()._persist()
  },

  addVehicle(vehicle) {
    set(s => ({ vehicles: [...s.vehicles, { ...vehicle, id: 'v_'+Date.now() }] }))
    get()._persist()
  },

  // ADMIN ACTIONS
  addListing(listing) {
    set(s => ({ 
      listings: [{ 
        ...listing, 
        id: 'l-' + Date.now(), 
        revenue: 0, 
        bookings: 0,
        status: 'active' 
      }, ...s.listings] 
    }))
    get()._persist()
  },

  removeListing(id) {
    set(s => ({ listings: s.listings.filter(l => l.id !== id) }))
    get()._persist()
  },

  updateListing(id, data) {
    set(s => ({ listings: s.listings.map(l => l.id === id ? { ...l, ...data } : l) }))
    get()._persist()
  },

  updateBooking(id, data) {
    set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, ...data } : b) }))
    get()._persist()
  },

  reorderListing(id, direction) {
    set(s => {
      const index = s.listings.findIndex(l => l.id === id)
      if (index === -1) return s
      const newListings = [...s.listings]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newListings.length) return s
      const [moved] = newListings.splice(index, 1)
      newListings.splice(targetIndex, 0, moved)
      return { listings: newListings }
    })
    get()._persist()
  },

  toggleSection(section) {
    set(s => ({ sections: { ...s.sections, [section]: !s.sections[section] } }))
    get()._persist()
  },

  toggleSavedSpot(id) {
    set(s => {
      const isSaved = s.savedSpots.includes(id)
      return { savedSpots: isSaved ? s.savedSpots.filter(x => x !== id) : [...s.savedSpots, id] }
    })
    get()._persist()
  },

  cancelBooking(id) {
    const booking = get().bookings.find(b => b.id === id)
    if (!booking) return
    const cancellableTypes = ['daily', 'weekly', 'monthly']
    if (!cancellableTypes.includes(booking.pass_type)) {
      alert("Only Daily, Weekly, and Monthly passes are eligible for cancellation.")
      return
    }
    const startTimeStr = `${booking.booking_date}T${booking.start_time}`
    const start = new Date(startTimeStr)
    const now = new Date()
    const diffHours = (start - now) / (1000 * 60 * 60)
    if (diffHours < 24) {
      alert("Cancellations must be requested at least 24 hours before the booking start time.")
      return
    }
    set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b) }))
    get()._persist()
    alert("Booking cancelled successfully. Refund will be processed in 3-5 business days.")
  },

  unreadCount() {
    return get().notifications.filter(n => !n.is_read).length
  },

  getAdminStats() {
    const { listings, users } = get()
    const totalRevenue = listings.reduce((acc, l) => acc + (l.revenue || 0), 0)
    const totalBookings = listings.reduce((acc, l) => acc + (l.bookings || 0), 0)
    const activePlaces = listings.filter(l => l.status === 'active' || !l.status).length
    const totalUsers = users.length
    return { totalRevenue, totalBookings, activePlaces, totalUsers }
  },

  _persist() {
    const { isLoggedIn, currentUser, currentMode, selectedCity, selectedArea, darkMode, vehicles, listings, bookings, savedSpots, sections, users } = get()
    localStorage.setItem('slotiq_state', JSON.stringify({
      isLoggedIn, currentUser, currentMode, selectedCity, selectedArea, darkMode, vehicles, listings, bookings, savedSpots, sections, users
    }))
  },
}))
