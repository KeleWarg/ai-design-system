import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from './supabase'

export async function verifyPassword(password: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('admin_config')
    .select('password_hash')
    .single()

  if (error || !data) {
    console.error('Error fetching admin config:', error)
    return false
  }

  return bcrypt.compare(password, data.password_hash)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}


