import { supabase, supabaseAdmin, type Component } from '../supabase'

export async function getComponents(): Promise<Component[]> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getComponent(slug: string): Promise<Component | null> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) return null
  return data
}

export async function getComponentById(id: string): Promise<Component | null> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createComponent(component: Omit<Component, 'id' | 'created_at' | 'updated_at'>): Promise<Component> {
  const { data, error } = await supabaseAdmin
    .from('components')
    .insert(component)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateComponent(id: string, component: Partial<Component>): Promise<Component> {
  const { data, error } = await supabaseAdmin
    .from('components')
    .update({ ...component, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteComponent(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('components')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}


