import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Lazy initialization for client
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export const getSupabase = () => {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗')
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return _supabaseAdmin
}

// For backwards compatibility - client only
// Use getSupabase() function instead to avoid build-time initialization
let _cachedSupabase: SupabaseClient | null = null
export const supabase = typeof window !== 'undefined'
  ? (_cachedSupabase || (_cachedSupabase = getSupabase()))
  : (null as unknown as SupabaseClient)

// Server-side only - do NOT use in client components
// Only call getSupabaseAdmin() in API routes or server components
export const supabaseAdmin = (null as unknown as SupabaseClient)

// Types
export type Theme = {
  id: string
  name: string
  value: string
  colors: Record<string, string>
  typography?: Record<string, unknown>
  spacing?: Record<string, unknown>
  effects?: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Component = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  code: string
  props: Record<string, unknown>
  variants: Record<string, unknown>
  prompts: Record<string, unknown>
  examples: unknown[]
  installation: Record<string, unknown>
  created_at: string
  updated_at: string
}


