import { createClient } from '@/lib/supabase'
import type { Theme } from '@/lib/supabase'

// Client-side database functions for themes
// These use the authenticated user's session

export async function getThemes(): Promise<Theme[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching themes:', error)
    throw error
  }

  return data || []
}

export async function getActiveTheme(): Promise<Theme | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No active theme found
      return null
    }
    console.error('Error fetching active theme:', error)
    throw error
  }

  return data
}

export async function getThemeById(id: string): Promise<Theme | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching theme:', error)
    return null
  }

  return data
}

export async function createTheme(theme: Partial<Theme>): Promise<Theme> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .insert([theme])
    .select()
    .single()

  if (error) {
    console.error('Error creating theme:', error)
    throw error
  }

  return data
}

export async function updateTheme(id: string, updates: Partial<Theme>): Promise<Theme> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating theme:', error)
    throw error
  }

  return data
}

export async function deleteTheme(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting theme:', error)
    throw error
  }
}

export async function setActiveTheme(id: string): Promise<void> {
  const supabase = createClient()
  // First, deactivate all themes
  const { error: deactivateError } = await supabase
    .from('themes')
    .update({ is_active: false })
    .neq('id', id)

  if (deactivateError) {
    console.error('Error deactivating themes:', deactivateError)
    throw deactivateError
  }

  // Then activate the selected theme
  const { error: activateError } = await supabase
    .from('themes')
    .update({ is_active: true })
    .eq('id', id)

  if (activateError) {
    console.error('Error activating theme:', activateError)
    throw activateError
  }
}

// Alias for backward compatibility
export const getTheme = getThemeById
