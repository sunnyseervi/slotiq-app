import { create } from 'zustand'
import { MOCK_USER, MOCK_NOTIFICATIONS, MOCK_VEHICLES, MOCK_BOOKINGS, MOCK_LISTINGS } from '../lib/mockData'
import { supabase } from '../lib/supabase'

const stored = (() => {
  try { return JSON.parse(localStorage.getItem('slotiq_state') || '{}') } catch { return {} }
})()

export const useStore = create((set, get) => ({
  // Auth
  isLoggedIn:    stored.isLoggedIn !== undefined ? stored.isLoggedIn : true,
  currentUser:   stored.currentUser || MOCK_USER,

  // Mode: 'customer' | 'host'
  currentMode:   stored.currentMode || 'customer',

  // Location
  selectedCity:  stored.selectedCity  || 'Bengaluru',
  selectedArea:  stored.selectedArea  || 'Current Location',

  // Active booking (Scan & Park) - legacy
  activeBooking: null,

  // Active walk-in/scan session (one per user at a time)
  // { id, location_id, spot_id, vehicle_id, start_time, status: 'active' }
  activeSession: stored.activeSession || null,

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
  
  systemConfig: stored.systemConfig || { platformFee: 10, gstRate: 18, maintenanceMsg: '' },
  
  activeLocations: stored.activeLocations || {
    cities: {
      Bengaluru: true,
      Mumbai: false,
      Delhi: false,
      Hyderabad: false,
      Pune: false
    },
    areas: {
      Bengaluru: {
        'Koramangala': true, 'Indiranagar': true, 'Whitefield': true, 'HSR Layout': true, 'MG Road': true,
        'Marathahalli': true, 'Electronic City': true, 'Jayanagar': true, 'JP Nagar': true, 'BTM Layout': true,
        'Bellandur': true, 'Malleshwaram': true, 'Rajajinagar': true, 'Banashankari': true, 'Hebbal': true,
        'Yelahanka': true, 'Kengeri': true, 'KR Puram': true, 'Banaswadi': true, 'Yeshwanthpur': true,
        'Basavanagudi': true, 'Frazer Town': true, 'RT Nagar': true, 'Vidyaranyapura': true, 'Sanjaynagar': true,
        'Kammanahalli': true, 'Mahadevapura': true, 'Domlur': true, 'CV Raman Nagar': true, 'Sahakarnagar': true,
        'Sarjapur Road': true, 'Outer Ring Road': true, 'Kalyan Nagar': true, 'Malleswaram': true, 'Basaveshwaranagar': true,
        'Jalahalli': true, 'Peenya': true, 'Dasarahalli': true, 'Nagarbhavi': true, 'Vijayanagar': true
      },
      Mumbai:     { 'Andheri': true, 'Bandra': true, 'Powai': true, 'Juhu': true, 'Dadar': true, 'Worli': true, 'Kurla': true, 'Thane': true },
      Delhi:      { 'Connaught Place': true, 'Lajpat Nagar': true, 'Karol Bagh': true, 'Dwarka': true, 'Rohini': true, 'Saket': true, 'Vasant Kunj': true, 'Nehru Place': true },
      Hyderabad:  { 'Banjara Hills': true, 'Jubilee Hills': true, 'Hitech City': true, 'Gachibowli': true, 'Kondapur': true, 'Madhapur': true, 'Secunderabad': true, 'Begumpet': true },
      Pune:       { 'Shivajinagar': true, 'Koregaon Park': true, 'Viman Nagar': true, 'Baner': true, 'Hinjewadi': true, 'Kalyani Nagar': true, 'Wakad': true, 'Aundh': true },
    }
  },

  ads: stored.ads || {
    home: { active: true, type: 'image', url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', link: 'https://slotiq.in/offers' },
    listing: { active: true, type: 'image', url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80', link: 'https://slotiq.in/carwash' }
  },

  // ── ACTIONS ──────────────────────────────────────────

  _persist() {
    const { users, listings, bookings, activeSession, selectedCity, selectedArea, darkMode, sections, systemConfig, activeLocations, ads, vehicles } = get()
    localStorage.setItem('slotiq_state', JSON.stringify({ users, listings, bookings, activeSession, selectedCity, selectedArea, darkMode, sections, systemConfig, activeLocations, ads, vehicles }))
  },

  // ── HYDRATION & SYNC ──────────────────────────────────
  async initStore() {
    const user = get().currentUser
    if (!user) return

    // Fetch Listings
    const { data: listings } = await supabase.from('listings').select('*')
    if (listings) set({ listings })

    // Fetch Bookings (for current user)
    const { data: bookings } = await supabase.from('bookings').select('*').eq('customer_id', user.id)
    if (bookings) set({ bookings })

    // Fetch Vehicles
    const { data: vehicles } = await supabase.from('vehicles').select('*').eq('user_id', user.id)
    if (vehicles) set({ vehicles })
  },

  async login(user) {
    const u = user || MOCK_USER
    set({ isLoggedIn: true, currentUser: u, currentMode: u.mode || 'customer' })
    get()._persist()
    await get().initStore()
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

  // ── SESSION MANAGEMENT ────────────────────────────────
  // Rule: one active session per user at a time
  async startSession({ locationId, spotId, vehicleId, locationName }) {
    const user = get().currentUser
    if (!user) return

    const sessionId = 's-' + Date.now().toString(36)
    const session = {
      id: sessionId,
      location_id: locationId,
      spot_id: spotId || null,
      location_name: locationName || locationId,
      vehicle_id: vehicleId,
      start_time: new Date().toISOString(),
      status: 'active',
    }

    // Persist to Supabase if we have a table, otherwise use local
    // For now, keep activeSession in local state/localStorage for speed, 
    // but we can also store it in a 'sessions' table if needed.
    set({ activeSession: session })
    get()._persist()
    return session
  },

  endSession({ pricingResult, grandTotal }) {
    const session = get().activeSession
    if (!session) return
    const endTime = new Date().toISOString()
    const startTime = new Date(session.start_time)
    const durationMins = Math.round((new Date(endTime) - startTime) / 60000)

    const completedBooking = {
      id: 'b-' + Date.now().toString(36),
      listing_name: session.location_name,
      location_id: session.location_id,
      booking_date: new Date().toISOString().split('T')[0],
      start_time: session.start_time.substring(11, 16),
      end_time: endTime.substring(11, 16),
      pass_type: 'Walk-In',
      status: 'completed',
      amount: grandTotal,
      durationMins,
      vehicle_id: session.vehicle_id,
      applied_cap: pricingResult?.appliedCap || null,
      pricing_breakdown: pricingResult?.breakdown || null,
    }

    set(s => ({
      activeSession: null,
      activeBooking: null,
      bookings: [completedBooking, ...s.bookings],
    }))
    get()._persist()
    return completedBooking
  },

  // Host activates a pre-booking by booking ID
  activateBookingSession(bookingId) {
    set(s => ({
      bookings: s.bookings.map(b =>
        b.id === bookingId
          ? { ...b, status: 'active', session_start: new Date().toISOString() }
          : b
      ),
    }))
    get()._persist()
  },

  // Host or customer ends a pre-booking session
  completeBookingSession({ bookingId, pricingResult, grandTotal }) {
    set(s => ({
      bookings: s.bookings.map(b =>
        b.id === bookingId
          ? { ...b, status: 'completed', session_end: new Date().toISOString(), amount: grandTotal }
          : b
      ),
    }))
    get()._persist()
  },

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
  async addListing(listing) {
    const user = get().currentUser
    const newListing = { 
      ...listing, 
      host_id: user?.id || 'u-sunil-001',
      is_live: true 
    }

    const { data, error } = await supabase.from('listings').insert([newListing]).select()
    
    if (data) {
      set(s => ({ listings: [data[0], ...s.listings] }))
      get()._persist()
    }
    if (error) alert("Error adding listing: " + error.message)
  },

  async removeListing(id) {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (!error) {
      set(s => ({ listings: s.listings.filter(l => l.id !== id) }))
      get()._persist()
    } else {
      alert("Error removing listing: " + error.message)
    }
  },

  async updateListing(id, data) {
    const { error } = await supabase.from('listings').update(data).eq('id', id)
    if (!error) {
      set(s => ({ listings: s.listings.map(l => l.id === id ? { ...l, ...data } : l) }))
      get()._persist()
    } else {
      alert("Error updating listing: " + error.message)
    }
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

  toggleCity(city) {
    set(s => ({
      activeLocations: {
        ...s.activeLocations,
        cities: { ...s.activeLocations.cities, [city]: !s.activeLocations.cities[city] }
      }
    }))
    get()._persist()
  },

  toggleArea(city, area) {
    set(s => ({
      activeLocations: {
        ...s.activeLocations,
        areas: {
          ...s.activeLocations.areas,
          [city]: {
            ...s.activeLocations.areas[city],
            [area]: !s.activeLocations.areas[city][area]
          }
        }
      }
    }))
    get()._persist()
  },

  updateAd(placement, data) {
    set(s => ({
      ads: {
        ...s.ads,
        [placement]: { ...s.ads[placement], ...data }
      }
    }))
    get()._persist()
  },

  updateSystemConfig(key, value) {
    set(s => ({
      systemConfig: { ...s.systemConfig, [key]: value }
    }))
    get()._persist()
  },

  toggleSavedSpot(id) {
    set(s => {
      const isSaved = s.savedSpots.includes(id)
      return { savedSpots: isSaved ? s.savedSpots.filter(x => x !== id) : [...s.savedSpots, id] }
    })
    get()._persist()
  },

  async addBooking(booking) {
    const user = get().currentUser
    if (!user) return

    const newBooking = {
      ...booking,
      customer_id: user.id,
      status: 'confirmed'
    }

    const { data, error } = await supabase.from('bookings').insert([newBooking]).select()

    if (data) {
      set(s => ({ bookings: [data[0], ...s.bookings] }))
      get()._persist()
    }
    if (error) alert("Error creating booking: " + error.message)
  },

  async addVehicle(vehicle) {
    const user = get().currentUser
    if (!user) return

    const newVehicle = { ...vehicle, user_id: user.id }
    const { data, error } = await supabase.from('vehicles').insert([newVehicle]).select()

    if (data) {
      set(s => ({ vehicles: [data[0], ...s.vehicles] }))
      get()._persist()
    }
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
    const { isLoggedIn, currentUser, currentMode, selectedCity, selectedArea, darkMode, vehicles, listings, bookings, savedSpots, sections, users, activeLocations, ads, systemConfig, activeSession } = get()
    localStorage.setItem('slotiq_state', JSON.stringify({
      isLoggedIn, currentUser, currentMode, selectedCity, selectedArea, darkMode, vehicles, listings, bookings, savedSpots, sections, users, activeLocations, ads, systemConfig, activeSession
    }))
  },
}))

// Cross-tab synchronization
window.addEventListener('storage', (e) => {
  if (e.key === 'slotiq_state' && e.newValue) {
    try {
      useStore.setState(JSON.parse(e.newValue))
    } catch (err) {}
  }
})
