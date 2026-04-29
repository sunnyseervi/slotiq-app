import { create } from 'zustand'
import { api } from '../services/api'

export const useStore = create((set, get) => ({
  // Auth State
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  isLoading: false,
  error: null,

  // Business Data
  listings: [],
  bookings: [],
  
  // UI State
  homeTab: 'parking',
  darkMode: false,
  selectedCity: 'Bengaluru',
  selectedArea: 'Koramangala',

  // ACTIONS

  // Auth Actions
  initAuth: async () => {
    set({ isLoading: true })
    try {
      const profile = await api.getCurrentUser()
      if (profile) {
        set({ 
          user: profile, 
          isLoggedIn: true, 
          isAdmin: profile.role === 'admin' 
        })
      }
    } catch (error) {
      console.error('Auth Init Error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      await api.signIn(email, password)
      const profile = await api.getCurrentUser()
      set({ 
        user: profile, 
        isLoggedIn: true, 
        isAdmin: profile.role === 'admin' 
      })
      return true
    } catch (error) {
      set({ error: error.message })
      alert('Login failed: ' + error.message)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  signUp: async (email, password, metadata) => {
    set({ isLoading: true, error: null })
    try {
      await api.signUp(email, password, metadata)
      alert('Signup successful! Please check your email for verification.')
      return true
    } catch (error) {
      set({ error: error.message })
      alert('Signup failed: ' + error.message)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await api.signOut()
      set({ user: null, isLoggedIn: false, isAdmin: false, listings: [], bookings: [] })
    } catch (error) {
      console.error('Logout Error:', error)
    }
  },

  // Data Actions
  fetchListings: async () => {
    set({ isLoading: true })
    try {
      const listings = await api.getListings()
      set({ listings })
    } catch (error) {
      console.error('Fetch Listings Error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchBookings: async () => {
    set({ isLoading: true })
    try {
      const bookings = get().isAdmin ? await api.getAllBookings() : await api.getMyBookings()
      set({ bookings })
    } catch (error) {
      console.error('Fetch Bookings Error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addBooking: async (bookingData) => {
    set({ isLoading: true })
    try {
      await api.createBooking(bookingData)
      await get().fetchBookings()
      alert('Booking successful!')
      return true
    } catch (error) {
      alert('Booking failed: ' + error.message)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  // UI Actions
  setHomeTab: (tab) => set({ homeTab: tab }),
  toggleDarkMode: () => {
    const next = !get().darkMode
    set({ darkMode: next })
    document.documentElement.classList.toggle('dark', next)
  },
  setLocation: (city, area) => set({ selectedCity: city, selectedArea: area }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}))
