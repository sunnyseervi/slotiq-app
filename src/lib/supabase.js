import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  || 'https://plgijiiszmqkuuaiixtz.supabase.co'
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(url, key)
export const SUPABASE_READY = !!key
