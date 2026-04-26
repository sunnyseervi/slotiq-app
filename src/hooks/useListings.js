import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useListings(filters = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchListings()

    // Listen for real-time changes
    const channel = supabase
      .channel('public:listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, payload => {
        if (payload.eventType === 'INSERT') {
          // Only add if it's live or if we are the host. For simplicity broadly adding and letting UI filter.
          setListings(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setListings(prev => prev.map(l => l.id === payload.new.id ? payload.new : l))
        } else if (payload.eventType === 'DELETE') {
          setListings(prev => prev.filter(l => l.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filters?.type, filters?.host_id])

  async function fetchListings() {
    setLoading(true)
    let query = supabase.from('listings').select('*')

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.host_id) {
      query = query.eq('host_id', filters.host_id)
    }
    if (filters?.is_live !== undefined) {
      query = query.eq('is_live', filters.is_live)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      setError(error)
      console.error('Error fetching listings:', error)
    } else {
      setListings(data || [])
    }
    setLoading(false)
  }

  async function addListing(listingData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Must be logged in to create listings.")

    const { data, error } = await supabase
      .from('listings')
      .insert([{ ...listingData, host_id: user.id }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async function updateListing(id, updates) {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  async function deleteListing(id) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  }

  return { listings, loading, error, addListing, updateListing, deleteListing, refetch: fetchListings }
}
