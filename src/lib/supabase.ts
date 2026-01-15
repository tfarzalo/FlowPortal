import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const SUPABASE_TIMEOUT_MS = Number(import.meta.env.VITE_SUPABASE_TIMEOUT_MS) || 20000
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const resolvedSupabaseUrl = supabaseUrl
export const hasSupabaseAnonKey = Boolean(supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
