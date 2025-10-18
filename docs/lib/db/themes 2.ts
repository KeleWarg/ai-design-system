import { getSupabase, getSupabaseAdmin, type Theme } from '../supabase'

export async function getThemes(): Promise<Theme[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getActiveTheme(): Promise<Theme | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

export async function getTheme(id: string): Promise<Theme | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createTheme(theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>): Promise<Theme> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('themes')
    .insert(theme)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTheme(id: string, theme: Partial<Theme>): Promise<Theme> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('themes')
    .update({ ...theme, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTheme(id: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('themes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function setActiveTheme(id: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()
  // Deactivate all themes
  await supabaseAdmin
    .from('themes')
    .update({ is_active: false })
    .neq('id', id)

  // Activate selected theme
  await supabaseAdmin
    .from('themes')
    .update({ is_active: true })
    .eq('id', id)
}


