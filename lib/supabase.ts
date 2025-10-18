import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type UserRole = 'admin' | 'editor'

export type User = {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

// Client-side Supabase client for use in Client Components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client for use in Server Components and API Routes
export async function createServerSupabaseClient() {
  // Import cookies only when this function is called (server-side only)
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Get current authenticated user with role
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()
  
  if (error || !data) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data as User
}

// Legacy admin client for migrations (use sparingly)
export function getSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
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
