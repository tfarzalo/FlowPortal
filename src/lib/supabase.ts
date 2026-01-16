import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
// Optimized timeout for balance between speed and reliability
export const SUPABASE_TIMEOUT_MS = Number(import.meta.env.VITE_SUPABASE_TIMEOUT_MS) || 8000
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const resolvedSupabaseUrl = supabaseUrl
export const hasSupabaseAnonKey = Boolean(supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
}

// Custom fetch with timeout and keep-alive
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS)
  
  return fetch(url, {
    ...options,
    signal: controller.signal,
    keepalive: true,
  }).finally(() => clearTimeout(timeoutId))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'flowportal-client',
      'Connection': 'keep-alive',
    },
    fetch: customFetch,
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
