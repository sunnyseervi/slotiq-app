import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'

export function useVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = useStore(s => s.user)

  useEffect(() => {
    if (!user?.id) {
      setVehicles([])
      setLoading(false)
      return
    }
    
    // Initial fetch
    fetchVehicles()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles', filter: `user_id=eq.${user.id}` }, payload => {
        if (payload.eventType === 'INSERT') {
          setVehicles(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setVehicles(prev => prev.map(v => v.id === payload.new.id ? payload.new : v))
        } else if (payload.eventType === 'DELETE') {
          setVehicles(prev => prev.filter(v => v.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  async function fetchVehicles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      setError(error)
      console.error('Error fetching vehicles:', error)
    } else {
      setVehicles(data || [])
    }
    setLoading(false)
  }

  async function addVehicle(vehicleData) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{ ...vehicleData, user_id: user.id }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async function updateVehicle(id, updates) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  async function deleteVehicle(id) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      
    if (error) throw error
  }

  return { vehicles, loading, error, addVehicle, updateVehicle, deleteVehicle, refetch: fetchVehicles }
}
