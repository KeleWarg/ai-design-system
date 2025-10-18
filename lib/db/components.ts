import { createClient } from '@/lib/supabase'
import type { Component } from '@/lib/supabase'

// Client-side database functions for components
// These use the authenticated user's session

export async function getComponents(): Promise<Component[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching components:', error)
    throw error
  }

  return data || []
}

export async function getComponent(slug: string): Promise<Component | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching component:', error)
    return null
  }

  return data
}

export async function getComponentById(id: string): Promise<Component | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching component:', error)
    return null
  }

  return data
}

export async function createComponent(component: Partial<Component>): Promise<Component> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('components')
    .insert([component])
    .select()
    .single()

  if (error) {
    console.error('Error creating component:', error)
    throw error
  }

  return data
}

export async function updateComponent(id: string, updates: Partial<Component>): Promise<Component> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('components')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating component:', error)
    throw error
  }

  return data
}

export async function deleteComponent(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting component:', error)
    throw error
  }
}
