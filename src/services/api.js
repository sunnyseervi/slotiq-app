import { supabase } from './supabase'

export const api = {
  // Auth
  async signUp(email, password, metadata) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return profile
  },

  // Listings
  async getListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async createListing(listingData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('listings')
      .insert([{ ...listingData, host_id: user.id }])
      .select()
    if (error) throw error
    return data[0]
  },

  async updateListing(id, listingData) {
    const { data, error } = await supabase
      .from('listings')
      .update(listingData)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async deleteListing(id) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Bookings
  async getMyBookings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('bookings')
      .select('*, listings(name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, listings(name), users(full_name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async createBooking(bookingData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('bookings')
      .insert([{ ...bookingData, customer_id: user.id }])
      .select()
    if (error) throw error
    return data[0]
  }
}
